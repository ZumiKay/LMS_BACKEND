import { Request, Response } from "express";
import {
  CustomReqType,
  LoginType,
  ROLE,
  Role,
  Usertype,
} from "../../Types/AuthenticationType";
import { generateToken, HashPassword } from "../../Utilities/Security";
import User from "../../models/user.model";
import { Op } from "sequelize";
import ErrorCode from "../../Utilities/ErrorCode";
import Usersession from "../../models/usersession.model";
import bcrypt from "bcryptjs";
import { GenerateRandomCode, getDateWithOffset } from "../../Utilities/Helper";
import { SendEmail } from "../../config/email";

interface RegisterType extends Usertype {
  html: string;
}
export default async function RegisterUser(req: Request, res: Response) {
  try {
    const {
      firstname,
      lastname,
      studentID,
      departmentID,
      date_of_birth,
      phone_number,
      email,
      html,
      role,
    } = req.body as RegisterType;

    // Validate required fields
    if (!firstname || !lastname || !email || !role || !studentID) {
      return res.status(400).json({ error: "Required fields are missing" });
    }
    const password = GenerateRandomCode(8);
    const hashedpass = HashPassword(password);

    const isUser = await User.findOne({ where: { email: email } });

    if (isUser) {
      return res.status(400).json({ message: "User Exist" });
    }

    await User.create({
      firstname,
      lastname,
      studentID: studentID as string,
      departmentID: departmentID as number,
      role: role,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
      phone_number: phone_number || null,
      email,
      password: hashedpass,
    });

    //Send Email
    await SendEmail(
      email,
      "Login Information",
      html.replace(":code:", password)
    );

    return res.status(200).json({ message: "User Created" });
  } catch (error) {
    console.log("Register Student", error);
    return res.status(500).json(ErrorCode("Error Server 500"));
  }
}

export async function Login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as LoginType;

    if (!email || !password) {
      return res.status(400).json({ message: "Not Allowed", error: 0 });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [{ email }, { studentID: email }],
      },
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(404).json({
        message: "Wrong Email or Password",
        error: ErrorCode("Unauthenticated"),
      });
    }

    const TokenPayload = {
      id: user.id,
      studentID: user.studentID,
      role: user.role,
    };
    const accessTokenExpire = 10 * 60; // 10 minutes
    const refreshTokenExpire = 2 * 60 * 60; // 2 hours

    const AccessToken = generateToken(
      TokenPayload,
      process.env.JWT_SECRET as string,
      accessTokenExpire
    );
    const RefreshToken = generateToken(
      TokenPayload,
      process.env.REFRESH_JWT_SECRET as string,
      refreshTokenExpire
    );

    // Save login session
    await Usersession.create({
      session_id: RefreshToken,
      userId: user.id,
      expiredAt: getDateWithOffset(refreshTokenExpire),
    });

    const cookieOptions = {
      httpOnly: true,
      sameSite: "none" as const,
      secure: process.env.NODE_ENV === "production",
    };

    res.cookie(process.env.ACCESSTOKEN_COOKIENAME as string, AccessToken, {
      ...cookieOptions,
      maxAge: accessTokenExpire * 1000,
    });
    res.cookie(process.env.REFRESHTOKEN_COOKIENAME as string, RefreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenExpire * 1000,
    });

    return res.status(200).json({ message: "Logged In" });
  } catch (error) {
    console.error("Login User Error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function SignOut(req: CustomReqType, res: Response) {
  try {
    const refershtoken =
      req.cookies[process.env.REFRESHTOKEN_COOKIENAME as string];
    if (!refershtoken || !req.user) {
      return res.status(400).json({
        message: "Invalid Parameter",
        status: ErrorCode("Bad Request"),
      });
    }
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Unauthorized",
        status: ErrorCode("Unauthenticated"),
      });
    }

    await Usersession.destroy({
      where: {
        [Op.and]: [{ userId: user.id, session_id: refershtoken }],
      },
    });

    res.clearCookie(process.env.ACCESSTOKEN_COOKIENAME as string);
    res.clearCookie(process.env.REFRESHTOKEN_COOKIENAME as string);

    return res.status(200).json({ message: "Signed Out" });
  } catch (error) {
    console.log("Signout", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

//Token Functions

export async function RefreshToken(req: CustomReqType, res: Response) {
  try {
    const token = req.cookies[process.env.REFRESHTOKEN_COOKIENAME as string];

    if (!token) {
      return res.status(401).json({ status: ErrorCode("Unauthenticated") });
    }

    const isValid = await Usersession.findOne({
      where: {
        session_id: token,
      },
      include: [
        {
          model: User,
          attributes: {
            include: ["id", "studentID", "role"],
          },
        },
      ],
    });

    if (!isValid) {
      return res.status(401).json({ status: ErrorCode("Unauthenticated") });
    }
    const accessTokenExpire = 10 * 60; //10 minute

    const newToken = generateToken(
      {
        id: isValid.userId,
        studentID: isValid.user.studentID,
        role: isValid.user.role,
      },
      process.env.JWT_SECRET as string,
      accessTokenExpire
    );

    res.cookie(process.env.ACCESSTOKEN_COOKIENAME as string, newToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: accessTokenExpire * 1000,
    });

    return res.status(200).json({ message: "Refreshed Token" });
  } catch (error) {
    console.log("Refresh Token", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function SeedAdmin() {
  try {
    const isAdmin = await User.findOne({ where: { role: ROLE.LIBRARIAN } });

    if (isAdmin) {
      console.log("Admin Exist");
      return;
    }

    const data = {
      firstname: "Test",
      lastname: "Librarian",
      role: ROLE.LIBRARIAN,
      studentID: "00000001",
      email: "workzumi@gmail.com",
      password: HashPassword("Kkzumi@001"),
    };
    await User.create({ ...data });
    console.log("Seeded");
  } catch (error) {
    console.log("Seed Admin", error);
    return;
  }
}

export async function GetUserSession(req: CustomReqType, res: Response) {
  try {
    const user = req.user;

    const userinfo = await User.findByPk(user.id, {
      attributes: { exclude: ["password"] },
    });

    if (!userinfo) {
      return res.status(401).json({ status: ErrorCode("Unauthenticated") });
    }

    return res.status(200).json({ data: req.user });
  } catch (error) {
    console.log("Check Usersession", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

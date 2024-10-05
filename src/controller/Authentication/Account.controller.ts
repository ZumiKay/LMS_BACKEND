import { Request, Response } from "express";
import {
  CustomReqType,
  LoginType,
  Role,
  Usertype,
} from "../../Types/AuthenticationType";
import { generateToken, HashPassword } from "../../Utilities/Security";
import User from "../../models/user.model";
import { Op } from "sequelize";
import ErrorCode from "../../Utilities/ErrorCode";
import Usersession from "../../models/usersession.model";
import bcrypt from "bcryptjs";
import { getDateWithOffset } from "../../Utilities/Helper";
import { SendEmail } from "../../config/email";

interface RegisterType extends Usertype {
  html: string;
}
export default async function RegisterUser(
  req: Request,
  res: Response,
  role: Role
) {
  try {
    const {
      firstname,
      lastname,
      studentID,
      departmentID,
      date_of_birth,
      phone_number,
      email,
      password,
      html,
    } = req.body as RegisterType;

    // Validate required fields
    if (!firstname || !lastname || !email || !password || !role || studentID) {
      return res.status(400).json({ error: "Required fields are missing" });
    }
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
    await SendEmail(email, "Login Information", html);

    return res.status(200).json({ message: "Student Created" });
  } catch (error) {
    console.log("Register Student", error);
    return res.status(500).json(ErrorCode("Error Server 500"));
  }
}

export async function Login(req: Request, res: Response) {
  try {
    const data = req.body as LoginType;

    if ((!data.email && !data.id) || !data.password)
      return res.status(400).json({ message: "Not Allowed", error: 0 });

    const user = await User.findOne({
      where: {
        [Op.or]: [
          {
            email: data.email,
          },
          data.id ? { studentID: data.id } : {},
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "Wrong Email or Password",
        error: ErrorCode("Unauthenticated"),
      });
    }

    const isUser = bcrypt.compareSync(data.password, user.password);

    if (!isUser) {
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

    const accessTokenExpire = 15 * 60; // 15min
    const refreshTokenExpire = 60 * 60; // 1hr

    const AccessToken = generateToken(
      { id: user.id, uid: user.studentID, role: user.role },
      process.env.JWT_SECRET as string,
      accessTokenExpire
    );
    const RefreshToken = generateToken(
      TokenPayload,
      process.env.REFRESH_JWT_SECRET as string,
      refreshTokenExpire
    );

    //Save Login Session
    await Usersession.create({
      session_id: RefreshToken,
      userId: user.id,
      expiredAt: getDateWithOffset(refreshTokenExpire),
    });

    //Removed Expired Session
    await Usersession.destroy({
      where: {
        expiredAt: {
          [Op.lte]: new Date(),
        },
      },
    });

    res.cookie(process.env.ACCESSTOKEN_COOKIENAME, AccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshTokenExpire,
    });
    res.cookie(process.env.REFRESHTOKEN_COOKIENAME, RefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: refreshTokenExpire,
    });

    return res.status(200).json({ message: "Logging In" });
  } catch (error) {
    console.log("Login User", error);
    return res
      .status(500)
      .json({ message: "Error Occured", error: ErrorCode("Error Server 500") });
  }
}

export async function SignOut(req: CustomReqType, res: Response) {
  try {
    const data: Pick<Usertype, "access_token" | "refresh_token"> = req.body;
    if (!data.access_token || !data.refresh_token || !req.user) {
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
        [Op.and]: [{ userId: user.id, session_id: data.refresh_token }],
      },
    });

    res.clearCookie(process.env.ACCESSTOKEN_COOKIENAME);
    res.clearCookie(process.env.REFRESHTOKEN_COOKIENAME);

    return res.status(204);
  } catch (error) {
    console.log("Signout", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

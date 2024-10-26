import { Request, Response } from "express";
import ErrorCode from "../../Utilities/ErrorCode";
import {
  CustomReqType,
  EditUserType,
  ResetPasswordType,
  ROLE,
  Usertype,
} from "../../Types/AuthenticationType";
import User from "../../models/user.model";
import Department from "../../models/department.model";
import bcrypt from "bcryptjs";
import { HashPassword } from "../../Utilities/Security";
import { SendEmail } from "../../config/email";
import { GenerateRandomCode } from "../../Utilities/Helper";
import BorrowBook from "../../models/borrowbook.model";
import LibraryEntry from "../../models/libraryentry.model";
import Usersession from "../../models/usersession.model";
import { Op } from "sequelize";

export async function GetUserInfo(req: CustomReqType, res: Response) {
  try {
    const param = req.query;

    const user = await User.findOne({
      where: { id: param?.id ? parseInt(param.id as string) : req.user.id },
      include: [{ model: Department, as: "department" }],
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });

    if (!user) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    const res_data: Usertype = {
      ...(user as Usertype),
    };

    return res.status(200).json({ data: res_data });
  } catch (error) {
    console.log("Get User Info", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditUserInfo(req: CustomReqType, res: Response) {
  try {
    const editdata = req.body as EditUserType;

    const user = await User.findByPk(editdata.id);

    if (!user || !editdata.password) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    const confirmpassword = bcrypt.compareSync(
      editdata.password,
      user.password
    );

    if (!confirmpassword)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const role = req.user.role;

    //update user information

    if (
      editdata.edittype === "Password" &&
      editdata.password &&
      editdata.newpassword
    ) {
      const isPassword = bcrypt.compareSync(editdata.password, user.password);

      if (!isPassword)
        res.status(400).json({
          message: "Wrong Password",
          status: ErrorCode("Bad Request"),
        });

      const hashednewPassword = HashPassword(editdata.newpassword);

      await User.update(
        { password: hashednewPassword },
        { where: { id: req.user.id } }
      );
    }
    if (role === "LIBRARIAN") {
      if (editdata.edittype === "AdminName") {
        await User.update(
          { firstname: editdata.firstname, lastname: editdata.lastname },
          { where: { id: req.user.id } }
        );
      }
      if (editdata.edittype === "Email")
        await User.update(
          { email: editdata.email },
          { where: { id: editdata.studentID } }
        );
      if (editdata.edittype === "ID")
        await User.update(
          { studentID: editdata.studentID },
          { where: { studentID: editdata.studentID } }
        );
    } else if (role === "STUDENT") {
      if (editdata.edittype === "Name")
        await User.update(
          { firstname: editdata.firstname, lastname: editdata.lastname },
          { where: { id: req.user.id } }
        );
    }

    return res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.log("Edit User", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteUser(req: CustomReqType, res: Response) {
  try {
    const role = req.user.role;

    if (role === ROLE.LIBRARIAN)
      return res.status(403).json({
        message: "Can't Delete Admin Account",
        status: ErrorCode("No Access"),
      });

    await BorrowBook.destroy({ where: { userId: req.user.id } });
    await LibraryEntry.destroy({ where: { userId: req.user.id } });
    await Usersession.destroy({ where: { userId: req.user.id } });
    await User.destroy({ where: { id: req.user.id } });

    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    console.log("Delete User", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteMultipleUser(req: Request, res: Response) {
  try {
    const { uid }: { uid: number[] } = req.body;

    await BorrowBook.destroy({ where: { userId: { [Op.in]: uid } } });
    await LibraryEntry.destroy({ where: { userId: { [Op.in]: uid } } });
    await Usersession.destroy({ where: { userId: { [Op.in]: uid } } });
    await User.destroy({ where: { id: { [Op.in]: uid } } });

    return res.status(200);
  } catch (error) {
    console.log("Delete Multiple User", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function ForgotPassword(req: Request, res: Response) {
  try {
    const { type, email, code, html, password } = req.body as ResetPasswordType;

    if (!email) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    switch (type) {
      case "Request":
        let generatedCode: string;
        let isCodeUnique = false;

        do {
          generatedCode = GenerateRandomCode(6);
          const existingCode = await User.findOne({
            where: { code: generatedCode },
          });
          if (!existingCode) isCodeUnique = true;
        } while (!isCodeUnique);

        await SendEmail(
          email,
          "Reset Password",
          html.replace("{code}", generatedCode)
        );
        break;

      case "Verify":
        const validCode = await User.findOne({ where: { code } });

        if (!validCode) {
          return res
            .status(403)
            .json({ message: "Wrong Code", status: ErrorCode("No Access") });
        }
        break;

      case "Change":
        if (!password) {
          return res.status(400).json({ status: ErrorCode("Bad Request") });
        }

        const hashedPassword = HashPassword(password);
        await User.update(
          { password: hashedPassword },
          { where: { id: user.id } }
        );
        break;

      default:
        return res.status(403).json({ status: ErrorCode("No Access") });
    }

    return res.status(200).json({ status: "Success" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

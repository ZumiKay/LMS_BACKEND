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
import { PasswordValidate } from "../../middleware/UserValidate";
import sequelize from "../../config/database";
import Faculty from "../../models/faculty.model";

export async function GetUserInfo(req: CustomReqType, res: Response) {
  try {
    const param = req.query;
    const user = await User.findOne({
      where: { id: param?.id ? Number(param.id) : req.user.id },
      include: [{ model: Department, as: "department", include: [Faculty] }],
      attributes: {
        exclude: ["password"],
      },
    });

    if (!user) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    return res.status(200).json({ data: user });
  } catch (error) {
    console.log("Get User Info", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditUserInfo_Admin(req: Request, res: Response) {
  try {
    const data: Usertype = req.body;

    const updateUser = await User.update(
      { ...data },
      { where: { id: data.id } }
    );

    if (updateUser[0] === 0)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    return res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.log("Edit User Admin", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditUserInfo(req: CustomReqType, res: Response) {
  try {
    const editdata = req.body as EditUserType;

    const user = await User.findByPk(editdata.id ?? req.user.id);

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

    if (editdata.edittype === "other") {
      await User.update(
        {
          date_of_birth: editdata.dateofbirth,
          phone_number: editdata.phonenumber,
        },
        {
          where: {
            id: editdata.id ?? req.user.id,
          },
        }
      );
      return res.status(200).json({ message: "Update Successfully" });
    }

    if (
      editdata.edittype === "Password" &&
      editdata.password &&
      editdata.newpassword
    ) {
      const isPassword = bcrypt.compareSync(editdata.password, user.password);
      const isValid = PasswordValidate(editdata.newpassword);

      if (isValid.errors.length !== 0) {
        return res.status(400).json({ message: isValid.errors.join("\n") });
      }

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

      const refreshToken =
        req.cookies[process.env.REFRESHTOKEN_COOKIENAME as string];

      await Usersession.destroy({
        where: {
          [Op.and]: [
            {
              id: req.user.id,
            },
            { session_id: { [Op.not]: refreshToken } },
          ],
        },
      });
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
  const { uid }: { uid: number[] } = req.body;

  try {
    // Start a transaction
    await sequelize.transaction(async (transaction) => {
      // Perform all deletions within the transaction
      await BorrowBook.destroy({
        where: { userId: { [Op.in]: uid } },
        transaction,
      });
      await LibraryEntry.destroy({
        where: { userId: { [Op.in]: uid } },
        transaction,
      });
      await Usersession.destroy({
        where: { userId: { [Op.in]: uid } },
        transaction,
      });
      await User.destroy({ where: { id: { [Op.in]: uid } }, transaction });
    });

    // Send a success response
    return res.status(200).json({ status: "success" });
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
          html.replace(":code:", generatedCode)
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

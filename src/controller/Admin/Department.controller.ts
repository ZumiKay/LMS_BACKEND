import { Response, Request } from "express";
import Department from "../../models/department.model";
import ErrorCode from "../../Utilities/ErrorCode";
import { sequelize } from "../../config/database";
import User from "../../models/user.model";

export async function CreateDepartment(req: Request, res: Response) {
  try {
    const data = req.body as Department;

    if (!data.faculty || !data.department)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    await Department.create({
      faculty: data.faculty,
      department: data.department,
    });

    return res.status(200).json({ message: "Create Successfully" });
  } catch (error) {
    console.log("Create Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

interface EditDepartmentType extends Department {
  id: number;
}
export async function EditDepartment(req: Request, res: Response) {
  try {
    const data = req.body as EditDepartmentType;

    if (!data.id || !data.faculty || !data.department)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    await Department.update(
      { faculty: data.faculty, department: data.department },
      { where: { id: data.id } }
    );
  } catch (error) {
    console.log("Edit Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteDepartment(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const data: { id: number } = req.body;

    if (!data.id)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const users = await User.findAll({ where: { departmentID: data.id } });

    for (const { id } of users) {
      await User.update({ departmentID: null }, { where: { id }, transaction });
    }
    await transaction.commit();
    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    console.log("Delete Department", error);
    await transaction.rollback();
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetDepartment(req: Request, res: Response) {
  try {
    const data = await Department.findAll();

    return res.status(200).json({ data });
  } catch (error) {
    console.log("Get Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

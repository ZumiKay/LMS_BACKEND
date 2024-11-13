import { Response, Request } from "express";
import Department from "../../models/department.model";
import ErrorCode from "../../Utilities/ErrorCode";
import sequelize from "../../config/database";
import User from "../../models/user.model";
import Faculty from "../../models/faculty.model";

export async function CreateFaculty(req: Request, res: Response) {
  try {
    const data = req.body as { name: string[] };

    if (!data.name)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    await Promise.all(
      data.name.map((name) =>
        Faculty.findOrCreate({ where: { name }, defaults: { name } })
      )
    );

    return res.status(200).json({ message: "Created" });
  } catch (error) {
    console.log("Faculty", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteFaculty(req: Request, res: Response) {
  try {
    const data: { name: string } = req.body;
    await Faculty.destroy({ where: { name: data.name } });

    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    console.log("Delete Faculty", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function CreateDepartment(req: Request, res: Response) {
  try {
    const data = req.body as { faculty: { name: string }; department: string };

    if (!data.faculty || !data.department)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const faculty = await Faculty.findOne({
      where: { name: data.faculty.name },
    });
    const isDep = await Department.findOne({
      where: { department: data.department },
    });

    if (isDep) {
      return res.status(400).json({
        message: "Department Exist",
        status: ErrorCode("Bad Request"),
      });
    }

    await Department.create({
      department: data.department,
      facultyID: faculty?.id,
    });

    return res.status(200).json({ message: "Create Successfully" });
  } catch (error) {
    console.log("Create Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditDepartment(req: Request, res: Response) {
  try {
    const { id, faculty, department } = req.body;

    if (!id || !faculty || !department) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    // Find the existing department
    const existingDepartment = await Department.findByPk(id);
    if (!existingDepartment) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    const [facultyRecord] = await Faculty.findOrCreate({
      where: { name: faculty },
      defaults: { name: faculty },
    });

    // Update the department
    existingDepartment.department = department;
    existingDepartment.facultyID = facultyRecord.id;
    await existingDepartment.save();

    return res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.error("Edit Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteDepartment(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    // Check if the department exists
    const department = await Department.findByPk(id);
    if (!department) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    // Find all users associated with this department
    const users = await User.findAll({ where: { departmentID: id } });

    // Set departmentID to null for each user
    for (const user of users) {
      await user.update({ departmentID: null }, { transaction });
    }

    // Delete the department
    await Department.destroy({ where: { id }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    console.error("Delete Department", error);
    await transaction.rollback();
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetDepartment(req: Request, res: Response) {
  try {
    const data = await Faculty.findAll({ include: [Department] });

    return res.status(200).json({ data });
  } catch (error) {
    console.log("Get Department", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

import { Request, Response } from "express";
import { ExcelDataType, ExportReportType } from "../../Types/AdminType";
import User from "../../models/user.model";
import { Op } from "sequelize";
import LibraryEntry from "../../models/libraryentry.model";
import BorrowBook from "../../models/borrowbook.model";
import ErrorCode from "../../Utilities/ErrorCode";
import {
  filterDataBorrowByTimeRange,
  filterDataByTimeRange,
} from "../../Utilities/Helper";
import { generateExcel } from "../../config/excel";
import Department from "../../models/department.model";

export async function ExportReport(req: Request, res: Response) {
  try {
    const {
      name,
      department,
      information,
      informationtype,
      startdate,
      enddate,
    } = req.body as ExportReportType;

    const result =
      department !== "all"
        ? await User.findAll({
            where: {
              [Op.and]: [{ role: "STUDENT" }, { department }],
            },
            attributes: {
              exclude: ["password"],
            },
            include: [
              {
                model: LibraryEntry,
                as: "entries",
              },
              {
                model: Department,
                as: "deparment",
              },
            ],
          })
        : await User.findAll({
            where: { role: "STUDENT" },
            attributes: {
              exclude: ["password"],
            },
            include: [
              {
                model: LibraryEntry,
                as: "entries",
              },
              {
                model: Department,
                as: "deparment",
              },
              { model: BorrowBook, as: "borrowbooks" },
            ],
          });

    if (result.length === 0)
      return res
        .status(404)
        .json({ message: "No Student Found", status: ErrorCode("Not Found") });

    const data: ExcelDataType[] = result.map((student) => {
      const {
        studentID,
        firstname,
        lastname,
        department,
        email,
        phone_number,
      } = student;

      const library_entry = filterDataByTimeRange(
        student.entries ?? [],
        startdate,
        enddate
      );
      const borrowedbook =
        information !== "entry"
          ? filterDataBorrowByTimeRange(
              student.borrowbooks?.map((i) => i.createdAt) ?? [],
              startdate,
              enddate
            )
          : [];

      return {
        ID: studentID,
        fullname: `${firstname} ${lastname}`,
        faculty: department.faculty.name,
        department: department.department,
        email,
        phone_number,
        library_entry,
        borrowedbook,
      };
    });
    const workbook = generateExcel(data, information, informationtype);
    const buffer = await workbook.xlsx.writeBuffer();
    res.setHeader("Content-Disposition", `attachment; filename="${name}.xlsx"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.log("Generate Report Excel", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

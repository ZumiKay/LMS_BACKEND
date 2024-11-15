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
import { ROLE } from "../../Types/AuthenticationType";
import Faculty from "../../models/faculty.model";

class ReportExporter {
  exportReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const {
        name,
        department,
        information,
        informationtype,
        startdate,
        enddate,
      } = req.body as ExportReportType;

      const result = await this.fetchUsers(department);

      if (result.length === 0) {
        return res.status(404).json({
          message: "No Student Found",
          status: ErrorCode("Not Found"),
        });
      }

      const data = this.prepareData(
        result,
        information,
        new Date(startdate),
        new Date(enddate)
      );
      const buffer = await this.generateExcelFile(
        data,
        information,
        informationtype,
        name
      );

      return this.sendExcelResponse(res, buffer, name);
    } catch (error) {
      console.log("Generate Report Excel", error);
      return res.status(500).json({ status: ErrorCode("Error Server 500") });
    }
  };

  private fetchUsers = async (department: string) => {
    return User.findAll({
      where: {
        role: ROLE.STUDENT,
      },
      attributes: { exclude: ["password"] },

      include: [
        { model: LibraryEntry, as: "entries" },
        {
          model: Department,
          where: { department },
          required: true,
          include: [Faculty],
        },
        { model: BorrowBook },
      ],
    });
  };

  private prepareData = (
    users: User[],
    information: string,
    startdate: Date,
    enddate: Date
  ): ExcelDataType[] => {
    return users.map((student) => {
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
        startdate.toISOString(),
        enddate.toISOString()
      );
      const borrowedbook =
        information !== "entry"
          ? filterDataBorrowByTimeRange(
              student.borrowbooks?.map((i) => i.createdAt) ?? [],
              startdate.toISOString(),
              enddate.toISOString()
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
  };

  private generateExcelFile = async (
    data: ExcelDataType[],
    information: string,
    informationtype: string,
    name: string
  ): Promise<Buffer> => {
    const workbook = generateExcel(data, information, informationtype);
    return workbook.xlsx.writeBuffer() as Promise<Buffer>;
  };

  private sendExcelResponse = (
    res: Response,
    buffer: Buffer,
    name: string
  ): Response => {
    res.setHeader("Content-Disposition", `attachment; filename="${name}.xlsx"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    return res.send(buffer);
  };
}

export default ReportExporter;

import { Request, Response } from "express";
import { StudentCardReturnType } from "../../Types/AdminType";
import User from "../../models/user.model";
import LibraryEntry from "../../models/libraryentry.model";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";
import { countVisitsByTimeRange } from "../../Utilities/Helper";
import Bucket from "../../models/bucket.model";
import Book from "../../models/book.model";
import { Op } from "sequelize";
import { ROLE } from "../../Types/AuthenticationType";

export default async function TrackEntry(req: Request, res: Response) {
  try {
    const { url }: { url: string } = req.body;
    let id;
    if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
      id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
    } else {
      id = url;
    }

    const response = fetch(
      `https://my.paragoniu.edu.kh/api/anonymous/students/${id}`,
      { method: "GET" }
    )
      .then((i) => i.json())
      .catch((err) =>
        res
          .status(400)
          .json({ message: "Invalid Code", status: ErrorCode("Bad Request") })
      );
    const data = (await response) as StudentCardReturnType;

    if (data) {
      const id_number = data.id_number;
      const profile_url = data.profile_url;
      const name = data.name;
      const department = data.department;
      const faculty = data.faculty;

      const stu = await User.findOne({ where: { studentID: id_number } });
      if (stu) {
        await LibraryEntry.create({
          userId: stu.id,
        });

        return res.status(200).json({
          ID: id_number,
          profile: profile_url,
          name: name,
          department: department,
          faculty: faculty,
        });
      } else {
        return res.status(401).json({ message: "PLEASE REGISTER THE STUDENT" });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetStudent(req: Request, res: Response) {
  try {
    const { p, lt, q }: { p?: string; lt?: string; q?: string } =
      req.query as Record<string, string>;

    const page = parseInt(p);
    const limit = parseInt(lt);

    const studentcount = await User.count({
      where: { role: { [Op.not]: ROLE.LIBRARIAN } },
    });
    const student = await User.findAll({
      where: {
        role: { [Op.not]: ROLE.LIBRARIAN },
        ...(q
          ? {
              studentID: {
                [Op.contained]: q,
              },
            }
          : {}),
      },
      limit,
      offset: (page - 1) * limit,
      attributes: {
        exclude: ["password"],
      },

      include: [
        {
          model: BorrowBook,
          as: "borrowbooks",
          include: [
            {
              model: Bucket,
              as: "bucket",
              include: [{ model: Book, as: "books" }],
            },
          ],
        },
        {
          model: LibraryEntry,
          as: "entries",
        },
      ],
    });

    const studentData = student.map((stu) => ({
      ...stu,
      library_entry: {
        count: stu.entries
          ? countVisitsByTimeRange(stu.entries?.map((i) => i.createdAt))
          : undefined,
        data: stu.entries,
      },
      borrow_book: stu.borrowbooks,
    }));

    return res
      .status(200)
      .json({ data: studentData, totalcount: studentcount });
  } catch (error) {
    console.log("Get Student", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

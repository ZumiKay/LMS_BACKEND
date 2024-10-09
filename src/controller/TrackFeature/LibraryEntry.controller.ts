import { Request, Response } from "express";
import { StudentCardReturnType } from "../../Types/AdminType";
import User from "../../models/user.model";
import LibraryEntry from "../../models/libraryentry.model";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";

export default async function TrackEntry(req: Request, res: Response) {
  try {
    const { url }: { url: string } = req.body;
    let id;
    if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
      id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
    } else {
      id = url;
    }

    const response = await fetch(
      `https://my.paragoniu.edu.kh/api/anonymous/students/${id}`,
      { method: "GET" }
    ).then((i) => i.json());
    const data = response as StudentCardReturnType;

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
    } else {
      return res
        .status(400)
        .json({ message: "Invalid Code", status: ErrorCode("Bad Request") });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetStudent(req: Request, res: Response) {
  try {
    const student = await User.findAll({
      where: { role: "STUDENT" },
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: BorrowBook,
        },
        {
          model: LibraryEntry,
        },
      ],
    });

    const studentData = student.map((stu) => ({
      ...stu,
      library_entry: stu.entries,
      borrow_book: stu.borrowbooks,
    }));

    return res.status(200).json({ data: studentData });
  } catch (error) {
    console.log("Get Student", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

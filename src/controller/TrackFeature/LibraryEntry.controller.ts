import { Request, Response } from "express";
import { StudentCardReturnType } from "../../Types/AdminType";
import User from "../../models/user.model";
import LibraryEntry from "../../models/libraryentry.model";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";
import { Op } from "sequelize";
import { ROLE } from "../../Types/AuthenticationType";
import { formatDateToMMDDYYYYHHMMSS } from "../../Utilities/Helper";
import Department from "../../models/department.model";

export default async function TrackEntry(req: Request, res: Response) {
  try {
    const { url }: { url: string } = req.body;

    let id;
    if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
      id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
    } else {
      id = url;
    }

    const response = fetch(`${process.env.PARAGONIU_URL}${id}`, {
      method: "GET",
    })
      .then((i) => i.json())
      .catch((err) =>
        res
          .status(400)
          .json({ message: "Invalid Code", status: ErrorCode("Bad Request") })
      );
    const data = (await response)?.data as StudentCardReturnType;

    if (data) {
      const id_number = data.id_number;
      const profile_url = data.profile_url;
      const name = data.name;

      const stu = await User.findOne({
        where: { studentID: id_number },
        attributes: {
          exclude: ["password"],
        },
      });
      if (stu) {
        const department = await Department.findOne({
          where: {
            department: {
              [Op.like]: `%${data.department}`,
            },
          },
        });

        const dep = department ?? {
          department: data.department,
          faculty: { name: data.faculty },
        };

        await LibraryEntry.create({
          userId: stu.id,
        });
        return res.status(200).json({
          data: {
            profile: profile_url,
            fullname: name,
            ...stu.dataValues,
            department: dep,
          },
        });
      } else {
        return res
          .status(404)
          .json({
            message: "PLEASE REGISTER THE STUDENT",
            status: ErrorCode("Not Found"),
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetStudent(req: Request, res: Response) {
  try {
    const {
      page,
      limit,
      search,
      ty,
      id,
      role,
      startdate,
      endstart,
    }: {
      page?: string;
      id?: string;
      limit?: string;
      search?: string;
      ty?: "user" | "entry" | "borrowedbook";
      short?: string;
      role?: string;
      startdate?: string;
      endstart?: string;
    } = req.query as Record<string, string>;

    const currentpage = Number(page);
    const currentLimit = Number(limit);

    switch (ty) {
      case "user": {
        const usercount = await User.count({
          where: { role: { [Op.not]: ROLE.LIBRARIAN } },
        });
        const userdata = await User.findAll({
          where: {
            role: { [Op.not]: ROLE.LIBRARIAN },
            ...(search
              ? {
                  studentID: {
                    [Op.eq]: search,
                  },
                }
              : {}),
            ...(role && { role: role }),
          },
          limit: currentLimit,

          offset: (currentpage - 1) * currentLimit,
          attributes: {
            include: [
              "firstname",
              "lastname",
              "email",
              "studentID",
              "role",
              "phone_number",
            ],
            exclude: ["password", "code"],
          },
        });

        let result = userdata.map((user) => ({
          ...user.dataValues,
          entries: [],
          borrowbooks: [],
        }));

        return res.status(200).json({
          data: result,
          totalcount: usercount,
        });
      }

      case "borrowedbook":
        if (id) {
          const uid = Number(id);
          const borrowedbook = await BorrowBook.findAndCountAll({
            where: {
              userId: uid,
            },
            limit: currentLimit,
            offset: (currentpage - 1) * currentLimit,
          });

          return res
            .status(200)
            .json({ data: borrowedbook.rows, totalcount: borrowedbook.count });
        }
        break;
      case "entry":
        if (id) {
          const uid = Number(id);
          const entry = await LibraryEntry.findAndCountAll({
            where: {
              userId: uid,
              ...(startdate || endstart
                ? {
                    createdAt: {
                      [Op.between]: [new Date(startdate), new Date(endstart)],
                    },
                  }
                : {}),
            },
            limit: currentLimit,
            offset: (currentpage - 1) * currentLimit,
          });

          const result = entry.rows.map((row) => ({
            ...row.dataValues,
            createdAt: formatDateToMMDDYYYYHHMMSS(new Date(row.createdAt)),
          }));
          return res
            .status(200)
            .json({ data: result, totalcount: entry.count });
        }
        break;

      default:
        break;
    }

    return res.status(400).json({ status: ErrorCode("Bad Request") });
  } catch (error) {
    console.log("Get Student", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetStudentFromScan(req: Request, res: Response) {
  try {
    const { url } = req.query as { url?: string };

    if (!url) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    let id;
    if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
      id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
    } else {
      id = url;
    }

    const response = await fetch(process.env.PARAGONIU_URL + id, {
      method: "GET",
    });

    const result = await response.json();

    return res.status(200).json({ data: result.data });
  } catch (error) {
    console.log("Fetch ParagonU ID Card", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function SeedStudentEntry() {
  await LibraryEntry.bulkCreate(
    Array.from({ length: 5 }).map((i) => ({ userId: 7 }))
  );
  return true;
}

import { Request, Response } from "express";
import { CustomReqType, Role } from "../../Types/AuthenticationType";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";
import User from "../../models/user.model";
import Book from "../../models/book.model";
import { BookStatus } from "../../Types/BookType";
import {
  formatDateToMMDDYYYYHHMMSS,
  paginateArray,
} from "../../Utilities/Helper";
import Bucket from "../../models/bucket.model";
import { Op } from "sequelize";
import { isNumeric } from "validator";
import Department from "../../models/department.model";
import Faculty from "../../models/faculty.model";
import Category from "../../models/category.model";

export async function ScanBorrowBook(req: Request, res: Response) {
  try {
    const { bid }: { bid?: string } = req.query;

    if (!bid) return res.status(400).json({ status: ErrorCode("Bad Request") });

    const borrow = await BorrowBook.findOne({
      where: {
        borrow_id: bid,
        status: {
          [Op.not]: BookStatus.RETURNED,
        },
      },
      include: [
        { model: Bucket, include: [{ model: Book, include: [Category] }] },
        {
          model: User,
        },
      ],
    });

    if (!borrow) {
      const byuser = await User.findOne({
        where: { studentID: bid },
        include: [
          {
            model: BorrowBook,
            include: [
              {
                model: Bucket,
                include: [{ model: Book, include: [Category] }],
              },
              {
                model: User,
              },
            ],
          },
        ],
      });

      if (!byuser || !byuser.borrowbooks || byuser.borrowbooks.length === 0)
        return res.status(404).json({
          message: "No Borrow Book Request Found",
          status: ErrorCode("Not Found"),
        });

      return res.status(200).json({ data: byuser.borrowbooks[0] });
    }

    return res.status(200).json({ data: borrow });
  } catch (error) {
    console.log("scan borrowbook", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetBorrowBook(req: CustomReqType, res: Response) {
  let result: { data: any; totalcount: number } | null = null;
  try {
    const {
      type,
      limit = 3,
      page = 1,
      status,
      search,
      detailtype,
    } = req.query as unknown as {
      type?: Role;
      limit?: string;
      page?: string;
      filter?: boolean;
      status?: string;
      search?: string;
      detailtype?: string;
    };

    const [p, lt] = [
      parseInt((page ?? "1") as string),
      parseInt(limit as string),
    ];

    switch (type) {
      case "STUDENT":
        result = await GetBorrowBook_STUDENT(
          req.user.uid as string,
          req.user.id as number,
          lt,
          p,
          status as BookStatus,
          search,
          detailtype as never
        );
        break;
      case "LIBRARIAN":
        result = await GetBorrowBook_Librarian(lt, p, status as any, search);
        break;

      default:
        return res.status(400).json({
          message: "Invalid Param",
          status: ErrorCode("Bad Request"),
        });
    }

    return res
      .status(200)
      .json({ data: result.data, totalcount: result.totalcount });
  } catch (error) {
    console.log("Get BorrowBook", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export const GetBorrowBookDetail = async (
  req: CustomReqType,
  res: Response
) => {
  try {
    const query: { borrowid?: string; ty?: "book" | "user" } = req.query;

    if (
      !query.borrowid ||
      !isNumeric(query.borrowid) ||
      !query.ty ||
      (query.ty !== "book" && query.ty !== "user")
    ) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const result = await BorrowBook.findByPk(Number(query.borrowid), {
      include:
        query.ty === "book"
          ? [{ model: Bucket, include: [{ model: Book, include: [Category] }] }]
          : [
              {
                model: User,
                include: [{ model: Department, include: [Faculty] }],
              },
            ],
    });

    if (!result)
      return res.status(404).json({ status: ErrorCode("Not Found") });

    const data = query.ty === "book" ? result.bucket.books : result.user;
    return res.status(200).json({ data });
  } catch (error) {
    console.log("Get BorrowBook Detail", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
};

//Helper Function
export const GetBorrowBook_Librarian = async (
  limit: number,
  page: number,
  status?: BookStatus,
  search?: string
) => {
  try {
    const borrow_bookcount = await BorrowBook.count();
    const borrow_book = await BorrowBook.findAll({
      ...(status || search
        ? {
            where: {
              [Op.and]: [
                { ...(search && { borrow_id: { [Op.like]: `%${search}%` } }) },
                {
                  ...(status && {
                    status: {
                      [Op.like]: {
                        [Op.any]: status?.split(",") as string[],
                      },
                    },
                  }),
                },
              ],
            },
          }
        : {}),
      limit,
      offset: (page - 1) * limit,
    });
    //Pepare For Return Data
    return {
      data: borrow_book.map((borrow) => ({
        ...borrow.dataValues,
        createdAt: formatDateToMMDDYYYYHHMMSS(borrow.dataValues.createdAt),
      })),
      totalcount: borrow_bookcount,
    };
  } catch (error) {
    throw error;
  }
};

export const GetBorrowBook_STUDENT = async (
  studentID: string,
  id: number,
  limit: number,
  page: number,
  status?: BookStatus,
  search?: string,
  ty?: "book"
) => {
  try {
    const borrow_book_count = await BorrowBook.count({ where: { userId: id } });
    const borrow_book = await User.findOne({
      where: { studentID, id },
      include: [
        {
          model: BorrowBook,
          ...(status || search
            ? {
                where: {
                  status,
                  borrow_id: {
                    [Op.contained]: search,
                  },
                },
              }
            : {}),

          attributes: {
            exclude: ["userId"],
          },

          ...(ty === "book" && {
            include: [
              {
                model: Bucket,
                include: [
                  {
                    model: Book,
                    attributes: {
                      exclude: [
                        "description",
                        "borrow_count",
                        "createdAt",
                        "updatedAt",
                      ],
                    },
                  },
                ],
              },
            ],
          }),
        },
      ],
      attributes: {
        exclude: ["password", "firstname", "lastname", "email", "studentID"], // Omit user fields
      },
    });
    if (!borrow_book || !borrow_book.borrowbooks)
      throw new Error("No borrow book found");

    const paginationBorrowBook = paginateArray(
      borrow_book.borrowbooks,
      page,
      limit
    );

    return {
      data: paginationBorrowBook.map((borrow) => ({
        ...borrow.dataValues,
        createdAt: formatDateToMMDDYYYYHHMMSS(borrow.dataValues.createdAt),
      })),
      totalcount: borrow_book_count,
    };
  } catch (error) {
    throw error;
  }
};

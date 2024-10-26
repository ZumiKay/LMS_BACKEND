import { Response } from "express";
import { CustomReqType, Role } from "../../Types/AuthenticationType";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";
import User from "../../models/user.model";
import Book from "../../models/book.model";
import { BookStatus, BorrowBookReturnType } from "../../Types/BookType";
import {
  formatDateToMMDDYYYYHHMMSS,
  paginateArray,
} from "../../Utilities/Helper";
import Bucket from "../../models/bucket.model";
import { Op } from "sequelize";

export async function GetBorrowBook(req: CustomReqType, res: Response) {
  let result: { data: BorrowBookReturnType[]; totalcount: number } | null =
    null;
  try {
    const {
      type,
      limit = 3,
      page = 1,
      status,
      search,
    } = req.query as unknown as {
      type?: Role;
      limit?: string;
      page?: string;
      filter?: boolean;
      status?: string;
      search?: string;
    };

    const [p, lt] = [
      parseInt((page ?? "1") as string),
      parseInt(limit as string),
    ];
    switch (type) {
      case "STUDENT":
        result = await GetBorrowBook_STUDENT(
          req.user.studentID as string,
          req.user.id as number,
          lt,
          p,
          status as BookStatus,
          search
        );
        break;
      case "LIBRARIAN":
        result = await GetBorrowBook_Librarian(
          lt,
          p,
          status as BookStatus,
          search
        );
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
              status,
              borrow_id: {
                [Op.contained]: search,
              },
            },
          }
        : {}),
      include: [
        {
          model: Bucket,
          as: "bucket",
        },
        { model: User, as: "user" },
      ],
      limit,
      offset: (page - 1) * limit,
    });

    //Pepare For Return Data
    const result: Array<BorrowBookReturnType> = borrow_book.map((item) => {
      return {
        borrow_id: item.borrow_id,
        borrow_date: item.createdAt,
        user: {
          firstname: item.user.firstname,
          lastname: item.user.lastname,
          email: item.user.email,
          role: item.user.role,
          studentID: item.user.studentID,
        },
        Books: item.bucket.books,
        status: item.status,
        expect_return_date: item.expect_return_date,
        qrcode: item.qrcode,
        retrun_date: item.return_date
          ? formatDateToMMDDYYYYHHMMSS(item.return_date)
          : undefined,
        updatedAt: item.updatedAt,
      };
    });

    return { data: result, totalcount: borrow_bookcount };
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
  search?: string
) => {
  try {
    const borrow_book_count = await BorrowBook.count({ where: { userId: id } });
    const borrow_book = await User.findOne({
      where: { studentID, id },
      include: [
        {
          model: BorrowBook,
          as: "borrowbooks",
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
          include: [
            {
              model: Bucket,
              as: "buckets",
              include: [
                {
                  model: Book,
                  as: "books",
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

    const transformedData: BorrowBookReturnType[] = paginationBorrowBook.map(
      (borrow) => ({
        borrow_id: borrow.borrow_id,
        Books: borrow.bucket.books, // Books are included directly
        borrow_date: borrow.createdAt, // Assuming 'createdAt' is the borrow date
        status: borrow.status,
        expect_return_date: borrow.expect_return_date,
        qrcode: borrow.qrcode,
        return_date: borrow.return_date
          ? borrow.return_date.toISOString()
          : undefined, // Optional field
        updatedAt: borrow.updatedAt as Date, // Last updated date
      })
    );

    return {
      data: transformedData,
      totalcount: borrow_book_count,
    };
  } catch (error) {
    throw error;
  }
};

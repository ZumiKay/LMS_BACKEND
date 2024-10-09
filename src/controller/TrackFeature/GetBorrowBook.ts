import { Response } from "express";
import { CustomReqType, Role } from "../../Types/AuthenticationType";
import ErrorCode from "../../Utilities/ErrorCode";
import BorrowBook from "../../models/borrowbook.model";
import User from "../../models/user.model";
import Book from "../../models/book.model";
import { BorrowBookReturnType } from "../../Types/BookType";
import { formatDateToMMDDYYYYHHMMSS } from "../../Utilities/Helper";

export async function GetBorrowBook(req: CustomReqType, res: Response) {
  let result: { data: BorrowBookReturnType[]; isLimit: boolean } | null = null;
  try {
    const { type, limit } = req.query as unknown as {
      type: Role;
      limit: number;
    };
    switch (type) {
      case "STUDENT":
        result = await GetBorrowBook_STUDENT(
          req.user.studentID as string,
          req.user.id as number,
          limit
        );
        break;
      case "LIBRARIAN":
        result = await GetBorrowBook_Librarian(limit);
        break;

      default:
        return res.status(400).json({
          message: "Invalid Param",
          status: ErrorCode("Bad Request"),
        });
    }

    return res.status(200).json({ data: result.data, isLimit: result.isLimit });
  } catch (error) {
    console.log("Get BorrowBook", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

//Helper Function
export const GetBorrowBook_Librarian = async (limit: number) => {
  try {
    const borrow_book = await BorrowBook.findAll({
      include: [Book, User],
      limit,
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
        Books: item.books,
        status: item.status,
        expect_return_date: item.expect_return_date,
        qrcode: item.qrcode,
        retrun_date: item.return_date
          ? formatDateToMMDDYYYYHHMMSS(item.return_date)
          : undefined,
        updatedAt: item.updatedAt,
      };
    });

    return { data: result, isLimit: limit >= borrow_book.length };
  } catch (error) {
    throw error;
  }
};

export const GetBorrowBook_STUDENT = async (
  studentID: string,
  id: number,
  limit: number
) => {
  try {
    const borrow_book = await User.findOne({
      where: { studentID, id },
      include: [
        {
          model: BorrowBook,
          as: "borrowbooks",
          limit,
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
      attributes: {
        exclude: ["password", "firstname", "lastname", "email", "studentID"], // Omit user fields
      },
    });
    if (!borrow_book || !borrow_book.borrowbooks)
      throw new Error("No borrow book found");

    const transformedData: BorrowBookReturnType[] = borrow_book.borrowbooks.map(
      (borrow) => ({
        borrow_id: borrow.borrow_id,
        Books: borrow.books, // Books are included directly
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
      isLimit: limit >= borrow_book.borrowbooks.length,
    };
  } catch (error) {
    throw error;
  }
};

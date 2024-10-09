import { Request, Response } from "express";
import BorrowBook from "../../models/borrowbook.model";
import ErrorCode from "../../Utilities/ErrorCode";
import { GenerateRandomCode } from "../../Utilities/Helper";
import QRCode from "qrcode";
import { DeleteFromStorage, UploadToStorage } from "../../config/storage";
import { CustomReqType } from "../../Types/AuthenticationType";
import { BookStatus, EditBorrowBookType } from "../../Types/BookType";
import { sequelize } from "../../config/database";
import Book from "../../models/book.model";
import BookCart from "../../models/bookcart.model";
import User from "../../models/user.model";
import { Op } from "sequelize";

export default async function BorrowBookHandler(
  req: CustomReqType,
  res: Response
) {
  const transaction = await sequelize.transaction();
  try {
    const data = req.body as BorrowBook;
    if (!data.books || data.books.length === 0) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    // Generate Unique Borrow ID
    let generatedCode: string;
    let isCodeUnique = false;

    // Ensuring a unique borrow_id is generated
    do {
      generatedCode = GenerateRandomCode(8);
      const existingCode = await BorrowBook.findOne({
        where: { borrow_id: generatedCode },
        transaction,
      });
      if (!existingCode) isCodeUnique = true;
    } while (!isCodeUnique);

    // Generate QR Code and upload it to storage
    const QrCodeBuffer = await QRCode.toBuffer(generatedCode, { type: "png" });
    const qrCodeUrl = await UploadToStorage(
      QrCodeBuffer,
      `QR_${generatedCode}`
    );

    if (!qrCodeUrl) {
      throw new Error("Error uploading QR Code");
    }

    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create Borrow Record
    await BorrowBook.create(
      {
        borrow_id: generatedCode,
        userId: req.user.id as number,
        status: BookStatus.TOPICKUP,
        qrcode: qrCodeUrl.url,
        expect_return_date: nextDay,
      },
      { transaction }
    );

    const bookCartData = data.books.map((book) => ({
      bookID: book.id,
      borrowID: generatedCode,
    }));

    const bookIds = data.books.map((book) => book.id) as number[];

    //  create records in BookCart
    await BookCart.bulkCreate(bookCartData, { transaction });

    // Update all books

    for (const book of data.books) {
      await Book.update(
        {
          status: BookStatus.UNAVAILABLE,
          borrow_count: book.borrow_count ?? 0 + 1,
        },
        {
          where: {
            id: book.id,
          },
          transaction,
        }
      );
    }

    await transaction.commit();

    return res.status(200).json({ message: "Checkout Completed" });
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.log("Borrow Book Error", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function BorrowBookPickUpAndReturn(
  req: CustomReqType,
  res: Response
) {
  const date = new Date();
  const nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);

  const transaction = await sequelize.transaction();
  try {
    const data = req.body as EditBorrowBookType;

    const borrowedbook = await BorrowBook.findOne({
      where: { borrow_id: data.borrowId },
      include: [BookCart, Book, User],
      transaction,
    });

    if (!borrowedbook) {
      await transaction.rollback();
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    switch (data.type) {
      case "pickup":
        await BorrowBook.update(
          {
            status: BookStatus.PICKEDUP,
            expect_return_date: nextWeek,
            qrcode: null,
          },
          { where: { borrow_id: data.borrowId }, transaction }
        );

        if (borrowedbook.qrcode) {
          await DeleteFromStorage(borrowedbook.qrcode);
        }

        await transaction.commit();

        return res.status(200).json({
          borrow_id: borrowedbook.borrow_id,
          borrow_date: date,
          expect_return_date: nextWeek,
          student: {
            fullname: `${borrowedbook.user.lastname} ${borrowedbook.user.firstname}`,
            ID: borrowedbook.user.studentID,
            department: borrowedbook.user.department,
          },
          Books: borrowedbook.books,
        });

      case "return":
        await BorrowBook.update(
          {
            status: BookStatus.RETURNED,
            return_date: date,
          },
          { where: { borrow_id: data.borrowId }, transaction }
        );

        const bookIds = borrowedbook.books.map((book) => book.id);
        await Book.update(
          { status: BookStatus.AVAILABLE },
          {
            where: {
              id: {
                [Op.in]: bookIds,
              },
            },
            transaction,
          }
        );

        await transaction.commit();

        return res.status(200).json({ message: "Returned" });

      default:
        await transaction.rollback();
        return res.status(400).json({
          message: "Invalid Request Type",
          status: ErrorCode("Bad Request"),
        });
    }
  } catch (error) {
    console.log("BorrowBook Operation Error:", error);
    await transaction.rollback();
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function HandleIndividualReturn(
  req: CustomReqType,
  res: Response
) {
  const transaction = await sequelize.transaction();

  try {
    const { borrowId, bookId }: { borrowId: string; bookId: number[] } =
      req.body;

    if (!borrowId || !bookId) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const borrowedBook = await BorrowBook.findOne({
      where: { borrow_id: borrowId },
      include: [BookCart, Book],
      transaction,
    });

    if (!borrowedBook) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Ivalid BorrowId", status: ErrorCode("Not Found") });
    }

    //update borrowbook status

    const unavailableBook = borrowedBook.books.filter(
      (book) => book.status === BookStatus.UNAVAILABLE
    );
    const availablebook = borrowedBook.books.filter(
      (i) => i.status === BookStatus.AVAILABLE
    );
    const updatedstatus =
      unavailableBook.length === 0
        ? BookStatus.RETURNED
        : `${BookStatus.RETURNED} ${
            availablebook.length - unavailableBook.length
          }`;

    await BorrowBook.update(
      { status: updatedstatus },
      { where: { id: borrowId }, transaction }
    );

    //update returned book status

    await Book.update(
      { status: BookStatus.AVAILABLE, return_date: new Date() },
      {
        where: {
          id: {
            [Op.in]: bookId,
          },
        },
        transaction,
      }
    );

    await transaction.commit();
    return res.status(200).json({ message: "Return Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.log("Individual Return", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteBorrow_Book(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { id }: { id: string } = req.body;
    if (!id) return res.status(400).json({ status: ErrorCode("Bad Request") });

    const borrowbook = await BorrowBook.findOne({ where: { id }, transaction });

    if (!borrowbook) {
      await transaction.rollback();
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    if (borrowbook.status !== BookStatus.RETURNED) {
      await Book.update(
        { status: BookStatus.AVAILABLE },
        {
          where: {
            [Op.and]: [
              {
                id: {
                  [Op.in]: borrowbook.books.map((i) => i.id),
                },
              },
              { status: BookStatus.UNAVAILABLE },
            ],
          },
          transaction,
        }
      );
    }

    await BorrowBook.destroy({ where: { borrow_id: id }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.log("Delete BorrowBook", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

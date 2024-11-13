import { Request, Response } from "express";
import BorrowBook from "../../models/borrowbook.model";
import ErrorCode from "../../Utilities/ErrorCode";
import { GenerateRandomCode } from "../../Utilities/Helper";
import QRCode from "qrcode";
import { DeleteFromStorage, UploadToStorage } from "../../config/storage";
import { CustomReqType } from "../../Types/AuthenticationType";
import { BookStatus, EditBorrowBookType } from "../../Types/BookType";
import sequelize from "../../config/database";
import Book from "../../models/book.model";
import { Op } from "sequelize";
import User from "../../models/user.model";
import Bucket, { BucketStatus } from "../../models/bucket.model";
import BookBucket from "../../models/bookbucket.model";
import Category from "../../models/category.model";

export default async function BorrowBookHandler(
  req: CustomReqType,
  res: Response
) {
  const transaction = await sequelize.transaction();
  try {
    const data = req.body as { bucketId: number };

    if (!data.bucketId)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const bucket = await Bucket.findByPk(data.bucketId, {
      transaction,
      include: [Book],
    });

    if (!bucket)
      return res.status(404).json({ status: ErrorCode("Not Found") });

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
    const QrCodeBuffer = await QRCode.toBuffer(generatedCode, {
      type: "png",
      color: {
        dark: "#00F", // Blue dots
        light: "#0000", // Transparent background
      },
      width: 280,
      scale: 1,
    });
    const qrCodeUrl = await UploadToStorage(
      QrCodeBuffer,
      `QR_${generatedCode}`
    );

    if (!qrCodeUrl) {
      throw new Error("Error uploading QR Code");
    }

    const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create Borrow Record
    const createdBorrowBook = await BorrowBook.create({
      borrow_id: generatedCode,
      userId: req.user.id as number,
      status: BookStatus.TOPICKUP,
      qrcode: qrCodeUrl.url,
      expect_return_date: nextDay,
    });

    await Bucket.update(
      { borrowbookId: createdBorrowBook.id, status: BucketStatus.CHECKOUT },
      { where: { id: data.bucketId }, transaction }
    );

    // Update all books

    await transaction.commit();

    return res.status(200).json({
      message: "Checkout Completed",
      data: {
        borrow_id: generatedCode,
        qrcode: qrCodeUrl.url,
      },
    });
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

    let borrowedbook = await BorrowBook.findOne({
      where:
        data.type === "pickup"
          ? { borrow_id: data.borrowId }
          : {
              [Op.and]: [
                { userId: data.borrowId },
                { status: BookStatus.PICKEDUP },
              ],
            },
      include: [
        {
          model: Bucket,
          as: "bucket",
          required: true,
          include: [{ model: Book }],
        },
        {
          model: User,
        },
      ],
      transaction,
    });

    if (!borrowedbook) {
      const user = await User.findOne({
        where: { studentID: data.borrowId },
        include: [
          {
            model: BorrowBook,
            where: {
              status: {
                [Op.notIn]: [BookStatus.RETURNED, BookStatus.TOPICKUP],
              },
            },
            include: [
              {
                model: Bucket,
                include: [{ model: Book }],
              },
            ],
          },
        ],
      });

      if (!user) {
        await transaction.rollback();
        return res.status(404).json({ status: ErrorCode("Not Found") });
      }

      if (user.borrowbooks) {
        borrowedbook = user.borrowbooks[0] as any;
      }
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

        if (borrowedbook?.qrcode) {
          await DeleteFromStorage(borrowedbook.qrcode);
        }

        await transaction.commit();

        return res.status(200).json({ data: borrowedbook });

      case "return":
        const bookIds = borrowedbook?.bucket.books.map((book) => book.id);
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

        await BookBucket.update(
          { returndate: new Date() },
          { where: { bookId: { [Op.in]: bookIds } } }
        );

        await BorrowBook.update(
          { status: BookStatus.RETURNED },
          { where: { borrow_id: borrowedbook?.borrow_id } }
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

export async function HandleManualReturn(req: CustomReqType, res: Response) {
  const transaction = await sequelize.transaction();

  try {
    const { borrowId, bookId }: { borrowId: string; bookId: number } = req.body;

    if (!borrowId || !bookId) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const borrowedBook = await BorrowBook.findByPk(borrowId, {
      include: [
        {
          model: Bucket,
          include: [{ model: Book }],
        },
      ],
      transaction,
    });

    if (!borrowedBook) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "Ivalid BorrowId", status: ErrorCode("Not Found") });
    }

    //update returned book status

    await Book.update(
      { status: BookStatus.AVAILABLE },
      {
        where: {
          id: bookId,
        },
        transaction,
      }
    );

    await BookBucket.update({ returndate: new Date() }, { where: { bookId } });

    //update borrowbook status
    const bookreturnedcount =
      borrowedBook.bucket.books.filter(
        (i) => i.status === BookStatus.UNAVAILABLE
      ).length - 1;

    await BorrowBook.update(
      {
        status:
          bookreturnedcount <= 0
            ? BookStatus.RETURNED
            : `${BookStatus.RETURNED} ${bookreturnedcount}`,
      },
      { where: { id: borrowId }, transaction }
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
  const { id }: { id: string[] } = req.body;

  if (!id || id.length === 0) {
    return res.status(400).json({ status: ErrorCode("Bad Request") });
  }

  const transaction = await sequelize.transaction();
  try {
    const borrowbooks = await BorrowBook.findAll({
      where: { id: { [Op.in]: id } },
      transaction,
      include: [
        {
          model: Bucket,
          as: "bucket",
          required: true,
          include: [{ model: Book, as: "books" }],
        },
      ],
    });

    if (!borrowbooks || borrowbooks.length === 0) {
      await transaction.rollback();
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    // Collect all book IDs to update, where the book status is currently unavailable
    const bookIdsToUpdate = borrowbooks.flatMap((borrow) =>
      borrow.status !== BookStatus.RETURNED
        ? borrow.bucket.books
            .filter((book) => book.status === BookStatus.UNAVAILABLE)
            .map((book) => book.id)
        : []
    );

    if (bookIdsToUpdate.length > 0) {
      await Book.update(
        { status: BookStatus.AVAILABLE },
        {
          where: { id: { [Op.in]: bookIdsToUpdate } },
          transaction,
        }
      );
    }

    // Delete related records in bulk
    const bucketIds = borrowbooks.map((borrow) => borrow.bucket.id);
    await BookBucket.destroy({
      where: { bucketId: { [Op.in]: bucketIds } },
      transaction,
    });
    await Bucket.destroy({
      where: { id: { [Op.in]: bucketIds } },
      transaction,
    });
    await BorrowBook.destroy({ where: { id: { [Op.in]: id } }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete BorrowBook Error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

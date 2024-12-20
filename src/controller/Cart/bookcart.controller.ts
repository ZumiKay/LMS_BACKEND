import { Response } from "express";
import { CustomReqType } from "../../Types/AuthenticationType";
import ErrorCode from "../../Utilities/ErrorCode";
import {
  BookBucketType,
  BookStatus,
  DeleteBookBucketType,
} from "../../Types/BookType";
import Bucket, { BucketStatus } from "../../models/bucket.model";
import BookBucket from "../../models/bookbucket.model";
import sequelize from "../../config/database";
import { Op } from "sequelize";
import Book from "../../models/book.model";
import Category from "../../models/category.model";

export default async function CreateCart(req: CustomReqType, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { bookIds } = req.body as BookBucketType;
    const userId = req.user.id as number;

    const [CreatedBucket] = await Bucket.findOrCreate({
      where: {
        status: BucketStatus.INCART,
        userId,
      },
      defaults: {
        userId,
        status: BucketStatus.INCART,
      },
      transaction,
    });

    const bookBucketData = bookIds.map((bookId) => ({
      bucketId: CreatedBucket.id,
      bookId,
    }));

    if (bookBucketData.length > 0) {
      await BookBucket.bulkCreate(bookBucketData, {
        transaction,
        ignoreDuplicates: true,
      });
    }

    //update book status

    await Book.update(
      { status: BookStatus.UNAVAILABLE },
      { where: { id: { [Op.in]: bookIds } } }
    );

    await transaction.commit();

    return res.status(200).json({ message: "Added To Bucket" });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Cart Error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function CountBucketItems(req: CustomReqType, res: Response) {
  try {
    const count = await Bucket.findOne({
      where: {
        [Op.and]: [{ userId: req.user.id }, { status: BucketStatus.INCART }],
      },
      include: [Book],
    });
    return res.status(200).json({ data: count?.books.length });
  } catch (error) {
    console.log("Count Bucket", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetBucket(req: CustomReqType, res: Response) {
  try {
    const { id } = req.user;

    const result = await Bucket.findOne({
      where: {
        status: { [Op.not]: BucketStatus.CHECKOUT },
        userId: id,
      },
      include: {
        model: Book,
        as: "books",
        required: true,
        include: [Category],
        attributes: {
          exclude: [
            "return_date",
            "createdAt",
            "updatedAt",
            "description",
            "borrow_count",
          ],
        },
      },
    });

    if (!result)
      return res.status(404).json({ status: ErrorCode("Not Found") });

    return res.status(200).json({ data: result });
  } catch (error) {
    console.log("Get Bucket", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditBucket(req: CustomReqType, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { id: bucketId, bookIds } = req.body as BookBucketType;

    if (!bucketId || !bookIds)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const bucket = await Bucket.findByPk(bucketId, {
      include: {
        model: Book,
        as: "books",
        attributes: ["id"],
        required: true,
      },
      transaction,
    });

    if (!bucket) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ message: "No Bucket Found", status: ErrorCode("Not Found") });
    }

    // Delete BookBucket records where bookId is not in the new bookIds
    await BookBucket.destroy({
      where: {
        bucketId,
        bookId: {
          [Op.notIn]: bookIds,
        },
      },
      transaction,
    });

    // Filter out existing books that are not in the new bookIds
    const newBookIds = bookIds.filter(
      (bookId) => !bucket.books.some((book) => book.id === bookId)
    );

    // Insert only the new books that are not already in the bucket
    if (newBookIds.length > 0) {
      const bookBucketData = newBookIds.map((bookId) => ({
        bookId,
        bucketId,
      }));

      await BookBucket.bulkCreate(bookBucketData, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({ message: "Bucket Updated" });
  } catch (error) {
    await transaction.rollback();
    console.error("Update Buckets Error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteBuckets(req: CustomReqType, res: Response) {
  try {
    const data = req.body as DeleteBookBucketType;

    if (!data.bookId && !data.bucketId)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const bucket = await Bucket.findByPk(data.bucketId, {
      include: {
        model: Book,
        as: "books",
        attributes: { include: ["id"] },
        required: true,
      },
    });

    if (data.all) {
      if (typeof data.all !== "boolean")
        return res.status(400).json({ status: ErrorCode("Bad Request") });

      await BookBucket.destroy({ where: { bucketId: data.bucketId } });
      await Bucket.destroy({ where: { id: data.bucketId } });
    } else {
      const isEmpty = bucket?.books.length === 1;

      await BookBucket.destroy({
        where: {
          [Op.and]: [
            { bookId: { [Op.in]: data.bookId }, bucketId: data.bucketId },
          ],
        },
      });

      if (isEmpty) await Bucket.destroy({ where: { id: data.bucketId } });
    }

    await Book.update(
      { status: BookStatus.AVAILABLE },
      { where: { id: { [Op.in]: data.bookId } } }
    );

    return res.status(200).json({ message: "Delete Success" });
  } catch (error) {
    console.log("Delete Bucket", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function VerifyBookByUser(req: CustomReqType, res: Response) {
  try {
    const { bookid } = req.body;
    const bucket = await Bucket.findOne({
      where: {
        id: req.user.id,
      },
      include: [
        {
          model: Book,
          where: {
            id: bookid,
          },
        },
      ],
    });

    if (!bucket || bucket.books.length === 0) return res.status(200);

    if (bucket.books.length !== 0)
      return res.status(200).json({ incart: true });
  } catch (error) {
    console.log("Verify Book Status", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

import { Request, Response } from "express";
import Book from "../../models/book.model";
import Categoryitem from "../../models/category_item.model";
import Category from "../../models/category.model";
import sequelize from "../../config/database";
import ErrorCode from "../../Utilities/ErrorCode";
import { BookStatus, CategoryType, GetBookType } from "../../Types/BookType";

import { convertQueryParams, normalizeString } from "../../Utilities/Helper";
import { cast, col, fn, Op, Sequelize, where } from "sequelize";
import { CustomReqType } from "../../Types/AuthenticationType";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import BookBucket from "../../models/bookbucket.model";
import Bucket from "../../models/bucket.model";
import { del } from "@vercel/blob";

const FindOrCreateCategory = async (Cate: CategoryType[]) => {
  const transaction = await sequelize.transaction();
  try {
    const data = [];
    for (const cate of Cate) {
      const res = await Category.findOrCreate({
        where: { name: cate.name },
        defaults: {
          name: cate.name,
          description: cate.description,
        },
        transaction,
      });
      data.push(res[0]);
    }

    await transaction.commit();
    return data;
  } catch (error) {
    console.log("Category Error", error);
    await transaction.rollback();
    return null;
  }
};

export const getgooglebook = async (categories: string) => {
  const subject = categories;
  const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&printType=books&orderBy=relevance&maxResults=10&key=${process.env.GOOGLEBOOK_APIKEY}`;

  try {
    const res = await fetch(url).then((response) => response.json());

    const book: Book[] = [];

    if (res && res.items) {
      //Categories
      const cates = await FindOrCreateCategory([{ name: categories }]);

      if (!cates) return { success: false };

      res.items.map((i: any) =>
        book.push({
          ISBN: i.volumeInfo.industryIdentifiers ?? [],
          title: i.volumeInfo.title,
          description: i.volumeInfo.description,
          cover_img: i.volumeInfo.imageLinks.thumbnail,
          author: i.volumeInfo.authors,
          publisher_date: i.volumeInfo.publishedDate,
          status: BookStatus.AVAILABLE,
        } as any)
      );

      const createdBook = await Book.bulkCreate(book.map((i) => i));

      await Categoryitem.bulkCreate(
        createdBook.map((i) => ({ cateId: cates[0].id, bookId: i.id }))
      );
    }

    return { success: true };
  } catch (error) {
    console.log("Get Google Book", error);
    return { success: false };
  }
};

export async function RegisterBook(req: Request, res: Response) {
  try {
    const data = req.body as Book;

    const isExist = await Book.findOne({ where: { title: data.title } });
    if (isExist)
      return res
        .status(400)
        .json({ message: "Book Exist", status: ErrorCode("Bad Request") });

    await FindOrCreateCategory(data.categories as CategoryType[]);

    //Create Book

    const createdata = { ...data, categories: undefined };

    const createdBook = await Book.create({
      ...createdata,
      status: BookStatus.AVAILABLE,
    });

    if (createdBook.id) {
      //create Categoryitem for m to m relationship
      await Categoryitem.bulkCreate(
        data.categories
          .filter((i) => i.id)
          .map((cate) => ({
            cateId: cate.id,
            bookId: createdBook.id,
          }))
      );
    }

    return res.status(200).json({ message: "Book Registered" });
  } catch (error) {
    console.log("Register Book", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function EditBook(req: Request, res: Response) {
  const transaction = await sequelize.transaction();
  try {
    const { id, cover_img, categories, ...restEditData } = req.body as Book;

    if (!id) {
      return res.status(400).json({ status: ErrorCode("Bad Request") });
    }

    const book = await Book.findByPk(id, { include: [Category], transaction });

    if (!book) {
      return res.status(404).json({ status: ErrorCode("Not Found") });
    }

    //Update CoverImage
    if (cover_img && book.cover_img) {
      if (cover_img !== book.cover_img) {
        await del(book.cover_img);
      }
    }

    // Update categories if provided
    if (categories) {
      await FindOrCreateCategory(categories as CategoryType[]);

      const currentCategoryIds = new Set(book.categories.map((c) => c.id));
      const newCategoryIds = new Set(categories.map((c) => c.id));

      const categoriesToRemove = [...currentCategoryIds].filter(
        (id) => !newCategoryIds.has(id)
      );
      const categoriesToAdd = [...newCategoryIds].filter(
        (id) => !currentCategoryIds.has(id)
      );

      if (categoriesToRemove.length > 0) {
        await Categoryitem.destroy({
          where: { bookId: id, cateId: { [Op.in]: categoriesToRemove } },
          transaction,
        });
      }

      if (categoriesToAdd.length > 0) {
        const newCategoryItems = categoriesToAdd.map((cateId) => ({
          bookId: id,
          cateId,
        }));
        await Categoryitem.bulkCreate(newCategoryItems, { transaction });
      }
    }
    const updateData: Partial<Book> = {
      ...restEditData,
      ...(cover_img !== book.cover_img && { cover_img }),
    };

    await Book.update(updateData, { where: { id }, transaction });

    await transaction.commit();
    return res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("EditBook error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteBook(req: Request, res: Response) {
  const { id }: { id: number[] } = req.body;

  if (!Array.isArray(id) || id.length === 0) {
    return res.status(400).json({ status: ErrorCode("Bad Request") });
  }

  try {
    await sequelize.transaction(async (transaction) => {
      const relatedBucketIds = await BookBucket.findAll({
        where: { bookId: { [Op.in]: id } },
        attributes: ["bucketId"],
        transaction,
      }).then((buckets) => buckets.map((bucket) => bucket.bucketId));

      if (relatedBucketIds.length > 0) {
        await Bucket.destroy({
          where: { id: { [Op.in]: relatedBucketIds } },
          transaction,
        });
      }

      await Book.destroy({
        where: { id: { [Op.in]: id } },
        transaction,
      });
    });

    return res.status(200).json({ message: "Delete Successfully" });
  } catch (error) {
    console.error("DeleteBook error:", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

const types = {
  id: "int",
  type: "string",
  limit: "int",
  page: "int",
  popular: "boolean",
  latest: "boolean",
  search: "string",
  cate: "string",
  status: "string",
  cates: "string",
};

export async function GetBook(req: Request, res: Response) {
  try {
    const {
      id,
      type,
      limit = 5,
      page = 1,
      popular,
      latest,
      search,
      cate,
      status,
      cates,
    } = convertQueryParams<typeof types>(
      req.query as any,
      types as any
    ) as unknown as GetBookType;

    switch (type) {
      case "all":
        const { count, rows } = await Book.findAndCountAll({
          limit,
          offset: (page - 1) * limit,
          order: ["id"],
          include: [
            {
              model: Category,
            },
          ],
        });
        return res.status(200).json({
          data: rows,
          totalcount: count,
        });
      case "id":
        if (!id)
          return res.status(400).json({ status: ErrorCode("Bad Request") });
        const book = await Book.findByPk(id, {
          include: [{ model: Category, as: "categories" }],
        });

        if (!book) {
          return res.status(404).json({ status: ErrorCode("Not Found") });
        }

        return res.status(200).json({ data: book });
      case "filter":
        let result: any = [];
        let totalcount = 0;
        if (popular) {
          result = await Book.findAll({
            where: {
              borrow_count: {
                [Op.not]: 0,
              },
            },
            order: [["borrow_count", "DESC"]],
            include: [
              {
                model: Category,
              },
            ],
            limit,
          });
        } else if (latest) {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          result = await Book.findAll({
            where: {
              createdAt: {
                [Op.gte]: sevenDaysAgo,
              },
            },
            limit,
            include: [
              {
                model: Category,
              },
            ],
            order: ["id"],
          });
        } else if (search) {
          const { rows, count } = await Book.findAndCountAll({
            where: {
              [Op.or]: [
                where(
                  fn("LOWER", fn("REPLACE", col("title"), " ", "")), // Remove spaces and lowercase title
                  {
                    [Op.like]: `%${normalizeString(search)}%`, // Use normalized search term
                  }
                ),
                where(fn("LOWER", cast(col("ISBN"), "text")), {
                  [Op.like]: `%${normalizeString(search)}%`,
                }),
                where(fn("LOWER", cast(col("author"), "text")), {
                  [Op.like]: `%${normalizeString(search)}%`,
                }),
              ],
            },
            include: [
              {
                model: Category,
              },
            ],
            limit,
            offset: (page - 1) * limit,
          });
          result = rows;
          totalcount = count;
        } else if (cate) {
          const category = await Category.findOne({
            where: {
              name: cate,
            },
            include: [{ model: Book, as: "items", order: ["id"] }],
          });
          result = category?.items;
        } else if (cates) {
          const offset = (page - 1) * limit;

          // Step 1: Fetch book IDs with pagination
          const bookIds = await Book.findAll({
            attributes: ["id"],
            include: {
              model: Category,
              where: { name: { [Op.in]: cates.split(",") } },
              through: { attributes: [] }, // Avoid fetching join table columns
            },
            order: [["id", "ASC"]],
            limit,
            offset,
          });

          const ids = bookIds.map((book) => book.id);

          // Step 2: Fetch detailed books with categories based on these IDs
          const books = await Book.findAll({
            where: { id: { [Op.in]: ids } },
            include: [Category],
            order: [["id", "ASC"]],
          });

          // Fetch the total count of books for the given categories
          const totalBooks = await Book.count({
            include: {
              model: Category,
              where: { name: { [Op.in]: cates.split(",") } },
              through: { attributes: [] }, // Avoid fetching join table columns
            },
          });

          result = books;
          totalcount = totalBooks;
        } else if (status) {
          const { count, rows } = await Book.findAndCountAll({
            where: {
              status: {
                [Op.in]: status.split(","),
              },
            },
            limit,
            offset: (page - 1) * limit,
            include: [Category],
          });
          return res.status(200).json({
            data: rows,
            totalcount: count,
          });
        }
        return res.status(200).json({ data: result, totalcount });

      default:
        return res.status(400).json({ status: ErrorCode("Bad Request") });
    }
  } catch (error) {
    console.log("Get Book", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function UploadCover(req: CustomReqType, res: Response) {
  try {
    const body = req.body as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request: req as any, // Cast to match expected type
      onBeforeGenerateToken: async (
        pathname: string
        /* clientPayload */
      ) => {
        // Authenticate and authorize users before generating the token
        // This example allows anonymous uploads for specific content types
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
          tokenPayload: JSON.stringify({
            // Optional payload, can include user information or metadata
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Logic after the upload is completed

        try {
          // Example: Update user avatar or other actions
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error("Could not update user");
        }
      },
    });

    res.status(200).json(jsonResponse);
  } catch (error) {
    console.log("Upload Image", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

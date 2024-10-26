import { Request, Response } from "express";
import Book from "../../models/book.model";
import Categoryitem from "../../models/category_item.model";
import Category from "../../models/category.model";
import sequelize from "../../config/database";
import ErrorCode from "../../Utilities/ErrorCode";
import { BookStatus, CategoryType, GetBookType } from "../../Types/BookType";

import { convertQueryParams } from "../../Utilities/Helper";
import { Op } from "sequelize";

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
  try {
    const editData = req.body as Book;

    if (!editData.id)
      return res.status(400).json({ status: ErrorCode("Bad Request") });

    const book = await Book.findByPk(editData.id);

    if (!book) return res.status(404).json({ status: ErrorCode("Not Found") });

    //Update Cases
    if (editData.categories)
      await FindOrCreateCategory(editData.categories as CategoryType[]);

    const updateData = Object.fromEntries(
      Object.entries(editData).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    await Book.update(updateData, { where: { id: editData.id } });
    return res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.log("EditBook", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function DeleteBook(req: Request, res: Response) {
  try {
    const { id }: { id: number[] } = req.body;
    if (!id) return res.status(400).json({ status: ErrorCode("Bad Request") });

    //TODO Delete Associate of Book (User , BorrowBook)

    await Book.destroy({ where: { id: { [Op.in]: id } } });

    return res.status(200).json({ message: "Delete Succesfully" });
  } catch (error) {
    console.log("Delete Book", error);
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
    } = convertQueryParams<typeof types>(
      req.query as any,
      types as any
    ) as unknown as GetBookType;

    switch (type) {
      case "all":
        const { count, rows } = await Book.findAndCountAll({
          limit,
          offset: (page - 1) * limit,
        });
        return res
          .status(200)
          .json({
            data: rows,
            totalpage: Math.ceil(count / limit),
            totalcount: count,
          });
      case "id":
        if (!id)
          return res.status(400).json({ status: ErrorCode("Bad Request") });
        const book = await Book.findByPk(id);

        return res.status(200).json({ data: book });
      case "filter":
        let result: any = [];
        if (popular) {
          result = await Book.findAll({
            where: {
              borrow_count: {
                [Op.not]: 0,
              },
            },
            order: [["borrow_count", "DESC"]],
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
          });
        }

        return res.status(200).json({ data: result });

      // Add conditions to the filter object only if they exist

      default:
        break;
    }
  } catch (error) {
    console.log("Get Book", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

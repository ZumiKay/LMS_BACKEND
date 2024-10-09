import { Request, Response } from "express";
import Book from "../../models/book.model";
import Categoryitem from "../../models/category_item.model";
import Category from "../../models/category.model";
import { sequelize } from "../../config/database";
import ErrorCode from "../../Utilities/ErrorCode";
import { GetBookType } from "../../Types/BookType";
import { Op } from "sequelize";

const FindOrCreateCategory = async (Cate: Category[]) => {
  const transaction = await sequelize.transaction();
  try {
    for (const cate of Cate) {
      await Category.findOrCreate({
        where: { name: cate.name },
        defaults: {
          name: cate.name,
          description: cate.description,
        },
        transaction,
      });
    }

    await transaction.commit();
  } catch (error) {
    throw error;
  }
};
export async function RegisterBook(req: Request, res: Response) {
  try {
    const data = req.body as Book;

    await FindOrCreateCategory(data.categories);

    //Create Book

    const createdata = { ...data, categories: undefined };

    const createdBook = await Book.create({
      ...createdata,
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
    if (editData.categories) await FindOrCreateCategory(editData.categories);

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
    const { id }: { id: number } = req.body;
    if (!id) return res.status(400).json({ status: ErrorCode("Bad Request") });

    //TODO Delete Associate of Book (User , BorrowBook)
  } catch (error) {
    console.log("Delete Book", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

export async function GetBook(req: Request, res: Response) {
  try {
    const data = req.params;
    const { id, type, limit = 5, filter } = data as unknown as GetBookType;

    switch (type) {
      case "all":
        const books = await Book.findAll({ limit });

        return res
          .status(200)
          .json({ data: books, isLimit: books.length <= limit });
      case "id":
        if (!id)
          return res.status(400).json({ status: ErrorCode("Bad Request") });
        const book = await Book.findByPk(id);

        return res.status(200).json({ data: book });
      case "filter":
        const filterConditions: any = {};

        // Add conditions to the filter object only if they exist
        if (filter?.ISBN) {
          filterConditions.ISBN = {
            [Op.or]: filter.ISBN.map((isbnObj) => ({
              type: isbnObj.type,
              identifier: isbnObj.identifier,
            })),
          };
        }

        if (filter?.title) {
          filterConditions.title = {
            [Op.like]: `%${filter.title}%`, // Using LIKE for partial matches
          };
        }

        if (filter?.publisher_date) {
          filterConditions.publisher_date = filter.publisher_date;
        }

        if (filter?.status) {
          filterConditions.status = filter.status;
        }

        if (filter?.createAt) {
          filterConditions.createAt = filter.createAt;
        }

        const filteredBooks = await Book.findAll({
          where: { ...filterConditions },
          limit,
        });

        return res.status(200).json({
          data: filteredBooks,
          isLimit: filteredBooks.length <= limit,
        });

      default:
        break;
    }
  } catch (error) {
    console.log("Get Book", error);
    return res.status(500).json({ status: ErrorCode("Error Server 500") });
  }
}

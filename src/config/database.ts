import { Sequelize } from "sequelize-typescript";

import "../config/dotenv";
import Category from "../models/category.model";
import Categoryitem from "../models/category_item.model";
import Book from "../models/book.model";

import BorrowBook from "../models/borrowbook.model";
import User from "../models/user.model";
import Department from "../models/department.model";
import Usersession from "../models/usersession.model";
import LibraryEntry from "../models/libraryentry.model";
import Bucket from "../models/bucket.model";
import BookBucket from "../models/bookbucket.model";
import Faculty from "../models/faculty.model";
import pg from "pg";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  dialectModule: pg,
});

sequelize.addModels([
  Category,
  Categoryitem,
  Book,
  Bucket,
  BookBucket,
  BorrowBook,
  User,
  Department,
  Faculty,
  Usersession,
  LibraryEntry,
]);

export default sequelize;

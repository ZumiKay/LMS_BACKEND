import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsToMany,
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Category from "./category.model";
import Categoryitem from "./category_item.model";
import { BookStatus, ISBN_OBJ } from "../Types/BookType";
import BorrowBook from "./borrowbook.model";
import BookCart from "./bookcart.model";

@Table
class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book, { omit: "categories" }>
> {
  @BelongsToMany(() => Category, () => Categoryitem)
  categories: Category[];

  @Column({
    type: DataTypes.JSONB,
    allowNull: false,
  })
  ISBN: ISBN_OBJ[];

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  cover_img: string | null;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  title: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  description: string | null;

  @Column({ type: DataTypes.JSONB, allowNull: false })
  author: string[];

  @Column
  publisher_date: Date;

  @Column
  status: string;

  @Column({ type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 })
  borrow_count: number | null;

  @Column({ type: DataTypes.DATE, allowNull: true })
  return_date: Date | null;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;

  @BelongsToMany(() => BorrowBook, () => BookCart)
  borrowbook: BorrowBook[];
}

export default Book;

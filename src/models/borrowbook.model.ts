import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Book from "./book.model";
import User from "./user.model";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { BookStatus } from "../Types/BookType";
import BookCart from "./bookcart.model";

@Table
class BorrowBook extends Model<
  InferAttributes<BorrowBook>,
  InferCreationAttributes<BorrowBook, { omit: "books" | "user" | "createdAt" }>
> {
  @Column({ unique: true, type: DataTypes.STRING, allowNull: false })
  borrow_id: string;

  //M TO M WITH BOOK
  @BelongsToMany(() => Book, () => BookCart)
  books: Book[];

  //User Relationship
  @ForeignKey(() => User)
  @Column
  userId: number;
  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  status: BookStatus | string;

  @Column({ allowNull: true, type: DataTypes.STRING })
  qrcode: string | null;

  @Column({ allowNull: true, type: DataTypes.DATE })
  expect_return_date: Date | null;

  @Column({ allowNull: true, type: DataTypes.DATE })
  return_date: Date | null;

  @CreatedAt
  createdAt: Date;
}

export default BorrowBook;

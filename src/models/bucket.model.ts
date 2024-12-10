import { InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import Book from "./book.model";
import BookBucket from "./bookbucket.model";
import BorrowBook from "./borrowbook.model";

export enum BucketStatus {
  INCART = "incart",
  CHECKOUT = "checkout",
}
@Table
class Bucket extends Model<
  InferAttributes<Bucket>,
  InferCreationAttributes<Bucket, { omit: "user" | "books" | "borrowbook" }>
> {
  @Column
  status: string;

  @ForeignKey(() => User)
  @Column
  userId: number;
  @BelongsTo(() => User)
  user: User;

  @BelongsToMany(() => Book, () => BookBucket)
  books: Book[];

  @ForeignKey(() => BorrowBook)
  @Column({ type: DataType.INTEGER, allowNull: true })
  borrowbookId: number | null;

  @BelongsTo(() => BorrowBook)
  borrowbook: BorrowBook;
}

export default Bucket;

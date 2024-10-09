import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import Book from "./book.model";
import BorrowBook from "./borrowbook.model";

@Table
class BookCart extends Model<
  InferAttributes<BookCart>,
  InferCreationAttributes<BookCart>
> {
  @ForeignKey(() => Book)
  @Column
  bookID: number;

  @ForeignKey(() => BorrowBook)
  @Column
  borrowID: string;
}

export default BookCart;

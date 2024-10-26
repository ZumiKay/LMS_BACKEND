import { InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import Bucket from "./bucket.model";
import Book from "./book.model";

@Table
class BookBucket extends Model<
  InferAttributes<BookBucket>,
  InferCreationAttributes<BookBucket>
> {
  @ForeignKey(() => Bucket)
  @Column
  bucketId: number;

  @ForeignKey(() => Book)
  @Column
  bookId: number;
}

export default BookBucket;

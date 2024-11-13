import { InferAttributes, InferCreationAttributes } from "sequelize";
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
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

  @Column({ type: DataType.DATE, allowNull: true })
  returndate: Date | null;
}

export default BookBucket;

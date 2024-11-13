import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  HasOne,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { BookStatus } from "../Types/BookType";
import Bucket from "./bucket.model";

@Table
class BorrowBook extends Model<
  InferAttributes<BorrowBook>,
  InferCreationAttributes<BorrowBook, { omit: "user" | "createdAt" | "bucket" }>
> {
  @Column({ unique: true, type: DataTypes.STRING, allowNull: false })
  borrow_id: string;

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

  //Buckets of Book
  @HasOne(() => Bucket)
  bucket: Bucket;
}

export default BorrowBook;

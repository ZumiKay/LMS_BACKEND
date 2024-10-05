import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Book from "./book.model";
import User from "./user.model";
import { DataTypes } from "sequelize";

type status =
  | "ToPickup"
  | "PickedUp"
  | "Unavaliable"
  | "Avaliable"
  | "Returned";

@Table
class BorrowBook extends Model {
  @Column({ unique: true, type: DataTypes.STRING, allowNull: false })
  borrow_id: string;

  //Book Relationship
  @ForeignKey(() => Book)
  @Column
  bookId: number;
  @BelongsTo(() => Book)
  book: Book;

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
  status: status;

  @CreatedAt
  createdAt: Date;

  @Column({ allowNull: true, type: DataTypes.STRING })
  qrcode: string | null;

  @Column({ allowNull: true, type: DataTypes.DATE })
  expect_return_date: Date | null;

  @Column({ allowNull: true, type: DataTypes.DATE })
  return_date: Date | null;
}

export default BorrowBook;

import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import { InferAttributes, InferCreationAttributes } from "sequelize";

@Table
class LibraryEntry extends Model<
  InferAttributes<LibraryEntry>,
  InferCreationAttributes<LibraryEntry, { omit: "student" | "createdAt" }>
> {
  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  student: User;

  @CreatedAt
  createdAt: Date;
}

export default LibraryEntry;

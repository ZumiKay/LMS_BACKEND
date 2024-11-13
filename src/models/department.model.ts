import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";
import Faculty from "./faculty.model";

@Table
class Department extends Model<
  InferAttributes<Department>,
  InferCreationAttributes<Department, { omit: "users" | "faculty" }>
> {
  @ForeignKey(() => Faculty)
  @Column
  facultyID: number;

  @BelongsTo(() => Faculty)
  faculty: Faculty;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  department: string;

  @HasMany(() => User)
  users: User[];
}

export default Department;

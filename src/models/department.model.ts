import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, HasMany, Model, Table } from "sequelize-typescript";
import User from "./user.model";

@Table
class Department extends Model<
  InferAttributes<Department>,
  InferCreationAttributes<Department, { omit: "users" }>
> {
  @Column
  faculty: string;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  department: string;

  @HasMany(() => User)
  users: User[];
}

export default Department;

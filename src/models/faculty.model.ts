import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { Column, HasMany, Model, Table } from "sequelize-typescript";
import Department from "./department.model";

@Table
export default class Faculty extends Model<
  InferAttributes<Faculty>,
  InferCreationAttributes<Faculty, { omit: "departments" }>
> {
  @Column
  name: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  description?: string;

  @HasMany(() => Department)
  departments: Department[];
}

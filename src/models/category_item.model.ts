import { Column, ForeignKey, Model, Table } from "sequelize-typescript";
import Category from "./category.model";
import Book from "./book.model";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";

@Table
class Categoryitem extends Model<
  InferAttributes<Categoryitem>,
  InferCreationAttributes<Categoryitem>
> {
  @ForeignKey(() => Category)
  @Column
  cateId: number;

  @ForeignKey(() => Book)
  @Column({
    type: DataTypes.INTEGER,
    allowNull: true,
  })
  bookId: number | null;
}

export default Categoryitem;

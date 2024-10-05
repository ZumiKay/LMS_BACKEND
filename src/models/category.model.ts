import { BelongsToMany, Column, Model, Table } from "sequelize-typescript";
import Book from "./book.model";
import Categoryitem from "./category_item.model";
import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";

@Table
class Category extends Model<
  InferAttributes<Category>,
  InferCreationAttributes<Category, { omit: "items" }>
> {
  @BelongsToMany(() => Book, () => Categoryitem)
  items: Book[];

  @Column
  name: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  description: string | null;
}

export default Category;

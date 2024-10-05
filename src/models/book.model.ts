import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsToMany,
  Column,
  CreatedAt,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import Category from "./category.model";
import Categoryitem from "./category_item.model";

@Table
class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book, { omit: "categories" }>
> {
  @BelongsToMany(() => Category, () => Categoryitem)
  categories: Category[];

  @Column({
    type: DataTypes.JSONB,
    allowNull: false,
  })
  ISBN: object;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  cover_img: string | null;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  title: string;

  @Column({ type: DataTypes.STRING, allowNull: true })
  description: string | null;

  @Column({ type: DataTypes.JSONB, allowNull: false })
  author: object;

  @Column
  publisher_date: Date;

  @Column
  status: string;

  @Column({ type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 })
  borrow_count: number | null;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
}

export default Book;

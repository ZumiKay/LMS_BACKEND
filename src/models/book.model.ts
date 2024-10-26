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
import { ISBN_OBJ } from "../Types/BookType";
import Bucket from "./bucket.model";
import BookBucket from "./bookbucket.model";

@Table
class Book extends Model<
  InferAttributes<Book>,
  InferCreationAttributes<Book, { omit: "categories" }>
> {
  @Column({
    type: DataTypes.JSONB,
    allowNull: false,
  })
  ISBN: ISBN_OBJ[];

  @BelongsToMany(() => Category, () => Categoryitem)
  categories: Category[];

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  cover_img: string | null;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  title: string;

  @Column({ type: DataTypes.TEXT, allowNull: true })
  description: string | null;

  @Column({ type: DataTypes.JSONB, allowNull: false })
  author: string[];

  @Column
  publisher_date: Date;

  @Column
  status: string;

  @Column({ type: DataTypes.INTEGER, allowNull: true, defaultValue: 0 })
  borrow_count: number | null;

  @Column({ type: DataTypes.DATE, allowNull: true })
  return_date: Date | null;

  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;

  //Buckets
  @BelongsToMany(() => Bucket, () => BookBucket)
  buckets: Bucket[];
}

export default Book;

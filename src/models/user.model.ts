import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsTo,
  Column,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import Usersession from "./usersession.model";
import Department from "./department.model";
import LibraryEntry from "./libraryentry.model";
import BorrowBook from "./borrowbook.model";
import Bucket from "./bucket.model";

type Role = "STUDENT" | "HEADDEPARTMENT" | "LIBRARIAN";

@Table
class User extends Model<
  InferAttributes<User>,
  InferCreationAttributes<User, { omit: "department" }>
> {
  @Column
  firstname: string;

  @Column
  lastname: string;

  @Column
  studentID: string;

  //Department Relationship
  @ForeignKey(() => Department)
  @Column({ allowNull: true, type: DataTypes.INTEGER })
  departmentID: number | null;

  @BelongsTo(() => Department)
  department: Department;

  @Column({ type: DataTypes.STRING, allowNull: false })
  role: Role;

  @Column({ type: DataTypes.DATE, allowNull: true })
  date_of_birth: Date | null;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  })
  phone_number: string | null;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  })
  email: string;

  @Column
  password: string;

  @Column({ allowNull: true, type: DataTypes.STRING })
  code: string | null;

  //Session Relationship
  @HasMany(() => Usersession)
  session: Usersession[] | null;
  //Library Entry
  @HasMany(() => LibraryEntry)
  entries: LibraryEntry[] | null;
  //Borrow Book
  @HasMany(() => BorrowBook)
  borrowbooks: BorrowBook[] | null;
  //Book Bucket
  @HasMany(() => Bucket)
  buckets: Bucket[] | null;
}

export default User;

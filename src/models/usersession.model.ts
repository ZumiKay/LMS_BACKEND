import { DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import User from "./user.model";

@Table
class Usersession extends Model<
  InferAttributes<Usersession>,
  InferCreationAttributes<Usersession, { omit: "user" }>
> {
  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  session_id: string;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  expiredAt: Date;
}

export default Usersession;

import { Sequelize } from "sequelize-typescript";
import "../config/dotenv";
import path from "path";

const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  models: [path.join(__dirname, "../models")],
});

export { sequelize };

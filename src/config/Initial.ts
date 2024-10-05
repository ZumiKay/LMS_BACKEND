import Crypto from "crypto";
import { sequelize } from "./database";

const InitalStartSever = async () => {
  try {
    await sequelize.sync();

    console.log(process.env.DB_NAME);

    console.log("SecretKey", Crypto.randomBytes(32).toString("hex"));
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default InitalStartSever;

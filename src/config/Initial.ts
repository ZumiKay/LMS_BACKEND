import Crypto from "crypto";
import { sequelize } from "./database";

const InitalStartSever = async () => {
  try {
    await sequelize.sync();

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default InitalStartSever;

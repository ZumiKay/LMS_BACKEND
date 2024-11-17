import { getgooglebook } from "../controller/Admin/Book.controller";
import { SeedAdmin } from "../controller/Authentication/Account.controller";
import { SeedPopularBook } from "../seeders/Books.seeder";

import sequelize from "./database";

const InitalStartSever = async () => {
  try {
    await sequelize.sync();
    await SeedAdmin();
    await Promise.all(
      ["Action", "Romance", "Astrology", "Health", "Mystery"].map((cate) =>
        getgooglebook(cate)
      )
    );
    await SeedPopularBook();

    console.log("DB Connection Is Connected");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default InitalStartSever;

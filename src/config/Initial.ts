import { getgooglebook } from "../controller/Admin/Book.controller";
import { SeedAdmin } from "../controller/Authentication/Account.controller";
import { SeedStudentEntry } from "../controller/TrackFeature/LibraryEntry.controller";
import { SeedPopularBook } from "../seeders/Books.seeder";

import sequelize from "./database";

const InitalStartSever = async () => {
  try {
    await sequelize.sync();

    // await SeedAdmin();
    // await SeedPopularBook();

    // const seeded = await SeedStudentEntry();

    // if (seeded) console.log("Seeded Entry");

    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

export default InitalStartSever;

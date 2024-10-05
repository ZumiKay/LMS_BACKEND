import dotenv from "dotenv";
import path from "path";

// Load environment variables from the .env file, located in the root directory
dotenv.config({
  path: path.resolve(__dirname, "../../.env"), // Adjust path based on your folder structure
});

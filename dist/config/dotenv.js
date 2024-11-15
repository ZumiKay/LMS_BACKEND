"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from the .env file, located in the root directory
dotenv_1.default.config({
    path: path_1.default.resolve(__dirname, "../../.env"), // Adjust path based on your folder structure
});

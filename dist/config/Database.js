"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
require("../config/dotenv");
const category_model_1 = __importDefault(require("../models/category.model"));
const category_item_model_1 = __importDefault(require("../models/category_item.model"));
const book_model_1 = __importDefault(require("../models/book.model"));
const borrowbook_model_1 = __importDefault(require("../models/borrowbook.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const department_model_1 = __importDefault(require("../models/department.model"));
const usersession_model_1 = __importDefault(require("../models/usersession.model"));
const libraryentry_model_1 = __importDefault(require("../models/libraryentry.model"));
const bucket_model_1 = __importDefault(require("../models/bucket.model"));
const bookbucket_model_1 = __importDefault(require("../models/bookbucket.model"));
const faculty_model_1 = __importDefault(require("../models/faculty.model"));
const pg_1 = __importDefault(require("pg"));
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    dialectModule: pg_1.default,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
    },
});
sequelize.addModels([
    category_model_1.default,
    category_item_model_1.default,
    book_model_1.default,
    bucket_model_1.default,
    bookbucket_model_1.default,
    borrowbook_model_1.default,
    user_model_1.default,
    department_model_1.default,
    faculty_model_1.default,
    usersession_model_1.default,
    libraryentry_model_1.default,
]);
exports.default = sequelize;

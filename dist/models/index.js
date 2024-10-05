"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const dotenv_1 = require("dotenv");
const sequelize_typescript_1 = require("sequelize-typescript");
(0, dotenv_1.configDotenv)();
// Create a Sequelize instance
const sequelize = new sequelize_typescript_1.Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    models: [__dirname + "/models/**/*.model.ts"],
    modelMatch: (filename, member) => {
        return (filename.substring(0, filename.indexOf(".model")) === member.toLowerCase());
    },
});
exports.sequelize = sequelize;

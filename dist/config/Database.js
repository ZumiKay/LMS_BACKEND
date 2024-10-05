"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
require("dotenv").config();
// Option 1: Passing a connection URI
const sequelize = new sequelize_1.Sequelize(process.env.DB_STRING, {
    dialect: "postgres",
    host: "localhost",
}); // Example for postgres
exports.default = sequelize;

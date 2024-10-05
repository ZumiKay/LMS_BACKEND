"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Initial_1 = __importDefault(require("./config/Initial"));
require("dotenv").config();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Express!");
});
app.listen(port, () => {
    (0, Initial_1.default)();
    console.log(`Server is running on http://localhost:${port}`);
});

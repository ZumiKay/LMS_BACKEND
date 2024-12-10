"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Initial_1 = __importDefault(require("./config/Initial"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const Router_1 = __importDefault(require("./Router"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
const book_model_1 = __importDefault(require("./models/book.model"));
const BookType_1 = require("./Types/BookType");
(0, dotenv_1.configDotenv)();
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL,
    credentials: true,
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.query({}));
app.use(express_1.default.json());
app.use(express_1.default.text());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api", Router_1.default);
app.get("/", (req, res) => {
    res.send("Hello, TypeScript with Express!");
});
app.get("/resetbook", ((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield book_model_1.default.update({ status: BookType_1.BookStatus.AVAILABLE }, { where: { status: BookType_1.BookStatus.UNAVAILABLE } });
    return res.send("Reset");
})));
// A POST route
// app.post("/api/data", (req: Request, res: Response) => {
//   const { data } = req.body;
//   if (data) {
//     res.status(201).json({ message: "Data received", data });
//   } else {
//     res.status(400).json({ error: "No data provided" });
//   }
// });
// app.get("/getbook", async (req: Request, res: Response) => {
//   res.cookie("Testcookie", "testvalue", {
//     httpOnly: true,
//     sameSite: "none",
//     secure: true,
//     domain: process.env.FRONTEND_URL,
//     maxAge: 60 * 60 * 1000,
//   });
//   res.status(200).send("Cookie Set");
// });
app.listen(port, () => {
    (0, Initial_1.default)();
    console.log(`Server is running on http://localhost:${port}`);
});
exports.default = app;

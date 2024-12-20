import express, { Request, Response } from "express";
import InitalStartSever from "./config/Initial";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import Router from "./Router";
import { configDotenv } from "dotenv";
import cors from "cors";
import Book from "./models/book.model";
import { BookStatus } from "./Types/BookType";

configDotenv();

const app = express();
const port = process.env.PORT || 4000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.query({}));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", Router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.get("/resetbook", (async (_req: Request, res: Response) => {
  await Book.update(
    { status: BookStatus.AVAILABLE },
    { where: { status: BookStatus.UNAVAILABLE } }
  );

  return res.send("Reset");
}) as any);

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
  InitalStartSever();
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;

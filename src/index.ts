import express, { Request, Response } from "express";
import InitalStartSever from "./config/Initial";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "./config/dotenv";

import Router from "./Router";

const app = express();
const port = process.env.PORT || 4000;

app.use(morgan("dev"));
app.use(express.query({}));
app.use(express.json());
app.use(express.text());
app.use(cookieParser());

app.use("/api", Router);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript with Express!");
});

app.get("/api/hello", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, World!" });
});

// A POST route
app.post("/api/data", (req: Request, res: Response) => {
  const { data } = req.body;
  if (data) {
    res.status(201).json({ message: "Data received", data });
  } else {
    res.status(400).json({ error: "No data provided" });
  }
});

app.listen(port, () => {
  InitalStartSever();
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;

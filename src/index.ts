import express, { Request, Response } from "express";
import InitalStartSever from "./config/Initial";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import Router from "./Router";
import { configDotenv } from "dotenv";
import cors from "cors";
import { getgooglebook } from "./controller/Admin/Book.controller";

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

// A POST route
app.post("/api/data", (req: Request, res: Response) => {
  const { data } = req.body;
  if (data) {
    res.status(201).json({ message: "Data received", data });
  } else {
    res.status(400).json({ error: "No data provided" });
  }
});

app.get("/getbook", async (req: Request, res: Response) => {
  const get = await getgooglebook("Science fiction");
  if (get.success) {
    console.log("Got Google Book");
  } else {
    console.log("Error");
  }

  res.status(200).send({ get });
});

app.listen(port, () => {
  InitalStartSever();
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;

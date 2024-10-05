import { NextFunction, Request, Response } from "express";
import { query, validationResult } from "express-validator";
import ErrorCode from "../Utilities/ErrorCode";
import Book from "../models/book.model";

export const RegisterBookValidate = [
  query("ISBN").isObject().notEmpty(),
  query("cover_img").isString(),
  query("title").isString().notEmpty(),
  query("description").isString(),
  query("author").isObject().notEmpty(),
  query("publisher_date").isDate().notEmpty(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Invalid Parameter",
        error: ErrorCode("Bad Request"),
      });
    }
    next();
  },
];

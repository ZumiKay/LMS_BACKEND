import { query, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import ErrorCode from "../Utilities/ErrorCode";
import JWT from "jsonwebtoken";
import { CustomReqType, Role } from "../Types/AuthenticationType";

export const RegisterUserDataValidate = [
  query("firstname").isString().notEmpty(),
  query("lastname").isString().notEmpty(),
  query("studentID").isString().notEmpty(),
  query("email").isEmail().isString().notEmpty(),
  query("departmentID").isString().notEmpty(),
  query("password").isString().notEmpty(),
  query("date_of_birth").isDate(),
  query("phone_number").isString(),
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

export const VerifyToken = (
  req: CustomReqType,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ status: ErrorCode("Unauthenticated") });
  }

  JWT.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.status(403).json({ status: ErrorCode("No Access") });
    }
    req.user = decoded as any;
    next();
  });
};
export async function CheckRole(
  req: CustomReqType,
  res: Response,
  next: NextFunction,
  Role: Role
) {
  const role = req.user.role;
  if (role !== Role && role !== "LIBRARIAN") {
    return res.status(403).json({ status: ErrorCode("No Access") });
  }
  return next();
}

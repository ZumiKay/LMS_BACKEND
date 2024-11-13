import { query, validationResult } from "express-validator";
import { NextFunction, Request, Response } from "express";
import ErrorCode from "../Utilities/ErrorCode";
import JWT from "jsonwebtoken";
import { CustomReqType, ROLE, Role } from "../Types/AuthenticationType";

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

type PasswordValidationResult = {
  isValid: boolean;
  errors: string[];
};
export const PasswordValidate = (
  password: string
): PasswordValidationResult => {
  const errors: string[] = [];

  // Check if the password is at least 8 characters long
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  // Check if the password contains at least one number or special character
  if (!/[0-9!@#$%^&*]/.test(password)) {
    errors.push(
      "Password must contain at least one number or special character."
    );
  }

  // Return the validation result with details
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const VerifyToken = async (
  req: CustomReqType,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies[process.env.ACCESSTOKEN_COOKIENAME as string];

  if (!token) {
    return res.status(401).json({ status: ErrorCode("Unauthenticated") });
  }

  const payload = await JWT.verify(token, process.env.JWT_SECRET as string);
  req.user = payload as any;

  if (!payload) return res.status(403).json({ status: ErrorCode("No Access") });

  return next();
};

async function CheckRole({
  role,
  req,
  res,
  next,
}: {
  role: Role;
  req: CustomReqType;
  res: Response;
  next: NextFunction;
}) {
  if (!req.user)
    return res.status(401).json({ status: ErrorCode("Unauthenticated") });
  if (role === req.user.role) return next();

  return res.status(403).json({ status: ErrorCode("No Access") });
}
export const IsAdmin = async (
  req: CustomReqType,
  res: Response,
  next: NextFunction
) => CheckRole({ role: ROLE.LIBRARIAN, req, res, next });

export const IsHD = async (
  req: CustomReqType,
  res: Response,
  next: NextFunction
) => CheckRole({ role: ROLE.HEADDEPARTMENT || ROLE.LIBRARIAN, req, res, next });

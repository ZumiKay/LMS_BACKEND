import { Request } from "express";
import Department from "../models/department.model";

export type Role = "STUDENT" | "HEADDEPARTMENT" | "LIBRARIAN";

export interface Usertype {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  role: Role;
  studentID?: string;
  libarianID?: string;
  headdeparmentID?: string;
  departmentID?: number;
  password?: string;
  date_of_birth?: Date;
  phone_number?: string;
  access_token?: string;
  department?: Department;
  refresh_token?: string;
}

export interface LoginType {
  id?: string;
  email?: string;
  password: string;
}

export interface CustomReqType extends Request {
  user: Pick<Usertype, "id" | "role" | "studentID">;
}

export interface EditUserType extends Usertype {
  edittype: "Name" | "Email" | "Password" | "ID" | "AdminName";
  newpassword?: string;
}

export interface ResetPasswordType {
  type: "Request" | "Verify" | "Change";
  email: string;
  html: string;
  code?: string;
  password?: string;
}

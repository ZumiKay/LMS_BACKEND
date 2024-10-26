import { Router } from "express";
import { IsAdmin, VerifyToken } from "../middleware/UserValidate";
import {
  CreateDepartment,
  DeleteDepartment,
  EditDepartment,
  GetDepartment,
} from "../controller/Admin/Department.controller";
import TrackEntry, {
  GetStudent,
} from "../controller/TrackFeature/LibraryEntry.controller";
import { DeleteBorrow_Book } from "../controller/TrackFeature/BorrowBook.controller";
import {
  DeleteBook,
  EditBook,
  RegisterBook,
} from "../controller/Admin/Book.controller";
import { GetBorrowBook } from "../controller/TrackFeature/GetBorrowBook";
import {
  DeleteMultipleUser,
  EditUserInfo,
} from "../controller/Authentication/User.controller";

const Adminroute = Router();

//Middleware
Adminroute.use(VerifyToken as any);
Adminroute.use(IsAdmin as any);

//Department
Adminroute.post("/createdepartment", CreateDepartment as any);
Adminroute.put("/editdepartment", EditDepartment as any);
Adminroute.delete("/deletedepartment", DeleteDepartment as any);
Adminroute.get("/getdepartment", GetDepartment as any);

//Book
Adminroute.post("/registerbook", RegisterBook as any);
Adminroute.put("/editbook", EditBook as any);
Adminroute.delete("/deletebook", DeleteBook as any);
//student
Adminroute.get("/getstudent", GetStudent as any);
Adminroute.delete("/deleteusers", DeleteMultipleUser as any);
Adminroute.put("/edituser", EditUserInfo as any);

//Borrow Book
Adminroute.delete("/d-bb", DeleteBorrow_Book as any);
Adminroute.get("/getborrowbook", GetBorrowBook as any);

//Track Feature
Adminroute.post("/scanentry", TrackEntry as any);

export default Adminroute;

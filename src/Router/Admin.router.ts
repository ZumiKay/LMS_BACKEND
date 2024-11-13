import { Router } from "express";
import { IsAdmin, VerifyToken } from "../middleware/UserValidate";
import {
  CreateDepartment,
  CreateFaculty,
  DeleteDepartment,
  DeleteFaculty,
  EditDepartment,
  GetDepartment,
} from "../controller/Admin/Department.controller";
import TrackEntry, {
  GetStudent,
  GetStudentFromScan,
} from "../controller/TrackFeature/LibraryEntry.controller";
import {
  BorrowBookPickUpAndReturn,
  DeleteBorrow_Book,
  HandleManualReturn,
} from "../controller/TrackFeature/BorrowBook.controller";
import {
  DeleteBook,
  EditBook,
  RegisterBook,
} from "../controller/Admin/Book.controller";
import {
  GetBorrowBook,
  ScanBorrowBook,
} from "../controller/TrackFeature/GetBorrowBook";
import {
  DeleteMultipleUser,
  EditUserInfo_Admin,
} from "../controller/Authentication/User.controller";
import {
  CreateCategory,
  GetCategories,
} from "../controller/Category/Category.controller";
import RegisterUser from "../controller/Authentication/Account.controller";
import SummaryStudentUsage from "../controller/TrackFeature/SummaryStudentInfo.controller";

const Adminroute = Router();

//Middleware
Adminroute.use(VerifyToken as any);
Adminroute.use(IsAdmin as any);

//Department & Faculty
Adminroute.post("/createfaculty", CreateFaculty as any);
Adminroute.delete("/deletefaculty", DeleteFaculty as any);
Adminroute.post("/createdepartment", CreateDepartment as any);
Adminroute.put("/editdepartment", EditDepartment as any);
Adminroute.delete("/deletedepartment", DeleteDepartment as any);
Adminroute.get("/getdepartment", GetDepartment as any);

//Book
Adminroute.post("/registerbook", RegisterBook as any);
Adminroute.put("/editbook", EditBook as any);
Adminroute.delete("/deletebook", DeleteBook as any);

//Category
Adminroute.get("/getcategory", GetCategories as any);
Adminroute.post("/createcategory", CreateCategory as any);
//student
Adminroute.post("/registeruser", RegisterUser as any);
Adminroute.get("/getstudent", GetStudent as any);
Adminroute.delete("/deleteusers", DeleteMultipleUser as any);
Adminroute.put("/edituser", EditUserInfo_Admin as any);

//Borrow Book
Adminroute.delete("/d-bb", DeleteBorrow_Book as any);
Adminroute.get("/getborrowbook", GetBorrowBook as any);
Adminroute.get("/scanborrowbook", ScanBorrowBook as any);
Adminroute.put("/manuallyreturn", HandleManualReturn as any);

//Track Feature
Adminroute.post("/scanentry", TrackEntry as any);
Adminroute.put("/handleborrowbook", BorrowBookPickUpAndReturn as any);
Adminroute.get("/scancard", GetStudentFromScan as any);

//Report
Adminroute.post("/summaryusage", SummaryStudentUsage as any);

export default Adminroute;

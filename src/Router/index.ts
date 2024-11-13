import { Router as router } from "express";
import UserRoute from "./User.router";
import Adminroute from "./Admin.router";
import { GetBook, UploadCover } from "../controller/Admin/Book.controller";
import { GetCategories } from "../controller/Category/Category.controller";
import { IsHD, VerifyToken } from "../middleware/UserValidate";
import CreateCart, {
  DeleteBuckets,
  EditBucket,
  GetBucket,
} from "../controller/Cart/bookcart.controller";
import BorrowBookHandler from "../controller/TrackFeature/BorrowBook.controller";
import {
  GetUserSession,
  RefreshToken,
} from "../controller/Authentication/Account.controller";
import SummaryStudentUsage from "../controller/TrackFeature/SummaryStudentInfo.controller";
import { GetDepartment } from "../controller/Admin/Department.controller";
import { ExportReport } from "../controller/Admin/Report.controller";

const Router = router();

Router.use("/user", UserRoute);
Router.use("/librarian", Adminroute);

//check Login Session
Router.get("/checksession", VerifyToken as any, GetUserSession as any);

//Category
Router.get("/getallcategory", GetCategories as any);

//RefreshToken
Router.get("/refreshtoken", RefreshToken as any);

//Bucket
Router.post("/addbucket", VerifyToken as any, CreateCart as any);
Router.put("/editbucket", VerifyToken as any, EditBucket as any);
Router.get("/getbucket", VerifyToken as any, GetBucket as any);
Router.delete("/deletebucket", VerifyToken as any, DeleteBuckets as any);

//Checkout Book
Router.post("/checkout", VerifyToken as any, BorrowBookHandler as any);

//Get Book
Router.get("/getallbook", GetBook as any);
Router.post("/uploadimg", UploadCover as any);

//Get SummaryInfo
Router.post("/getsummaryusage", VerifyToken as any, SummaryStudentUsage as any);
Router.get("/getdepartment", VerifyToken as any, GetDepartment as any);
Router.post(
  "/generatereport",
  VerifyToken as any,
  IsHD as any,
  ExportReport as any
);
export default Router;

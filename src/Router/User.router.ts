import express from "express";
import {
  Login,
  RefreshToken,
  SignOut,
} from "../controller/Authentication/Account.controller";
import {
  EditUserInfo,
  ForgotPassword,
  GetUserInfo,
} from "../controller/Authentication/User.controller";
import { VerifyToken } from "../middleware/UserValidate";
import BorrowBookHandler from "../controller/TrackFeature/BorrowBook.controller";
import {
  GetBorrowBook,
  GetBorrowBookDetail,
} from "../controller/TrackFeature/GetBorrowBook";
import { CountBucketItems } from "../controller/Cart/bookcart.controller";

const UserRoute = express.Router();

UserRoute.post("/login", Login as any);
UserRoute.get("/getinfo", VerifyToken as any, GetUserInfo as any);
UserRoute.put("/edituser", VerifyToken as any, EditUserInfo as any);
UserRoute.post("/forgotpassword", ForgotPassword as any);
UserRoute.post("/logout", VerifyToken as any, SignOut as any);
UserRoute.post("/checkout", VerifyToken as any, BorrowBookHandler as any);

//BorrowBook
UserRoute.get("/checkcart", VerifyToken as any, CountBucketItems as any);
UserRoute.get("/getborrowbook", VerifyToken as any, GetBorrowBook as any);
UserRoute.get(
  "/getborrowdetail",
  VerifyToken as any,
  GetBorrowBookDetail as any
);
//Token
UserRoute.get("/refreshtoken", RefreshToken as any);

export default UserRoute;

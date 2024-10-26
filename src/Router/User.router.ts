import express from "express";
import RegisterUser, {
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
import { GetBorrowBook } from "../controller/TrackFeature/GetBorrowBook";

const UserRoute = express.Router();

UserRoute.post("/registerstudent", async (req, res) => {
  await RegisterUser(req, res, "STUDENT");
});

UserRoute.post("/register", RegisterUser as any);
UserRoute.post("/login", Login as any);
UserRoute.get("/getinfo", VerifyToken as any, GetUserInfo as any);
UserRoute.put("/edituser", VerifyToken as any, EditUserInfo as any);
UserRoute.post("/forgotpassword", ForgotPassword as any);
UserRoute.post("/logout", VerifyToken as any, SignOut as any);
UserRoute.post("/checkout", VerifyToken as any, BorrowBookHandler as any);

//BorrowBook
UserRoute.get("/getborrowbook", VerifyToken as any, GetBorrowBook as any);
//Token
UserRoute.get("/refreshtoken", VerifyToken as any, RefreshToken as any);

export default UserRoute;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Account_controller_1 = require("../controller/Authentication/Account.controller");
const User_controller_1 = require("../controller/Authentication/User.controller");
const UserValidate_1 = require("../middleware/UserValidate");
const BorrowBook_controller_1 = __importDefault(require("../controller/TrackFeature/BorrowBook.controller"));
const GetBorrowBook_1 = require("../controller/TrackFeature/GetBorrowBook");
const bookcart_controller_1 = require("../controller/Cart/bookcart.controller");
const UserRoute = express_1.default.Router();
UserRoute.post("/login", Account_controller_1.Login);
UserRoute.get("/getinfo", UserValidate_1.VerifyToken, User_controller_1.GetUserInfo);
UserRoute.put("/edituser", UserValidate_1.VerifyToken, User_controller_1.EditUserInfo);
UserRoute.post("/forgotpassword", User_controller_1.ForgotPassword);
UserRoute.post("/logout", UserValidate_1.VerifyToken, Account_controller_1.SignOut);
UserRoute.post("/checkout", UserValidate_1.VerifyToken, BorrowBook_controller_1.default);
//BorrowBook
UserRoute.get("/checkcart", UserValidate_1.VerifyToken, bookcart_controller_1.CountBucketItems);
UserRoute.get("/getborrowbook", UserValidate_1.VerifyToken, GetBorrowBook_1.GetBorrowBook);
UserRoute.get("/getborrowdetail", UserValidate_1.VerifyToken, GetBorrowBook_1.GetBorrowBookDetail);
//Token
UserRoute.get("/refreshtoken", Account_controller_1.RefreshToken);
exports.default = UserRoute;

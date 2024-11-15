"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_router_1 = __importDefault(require("./User.router"));
const Admin_router_1 = __importDefault(require("./Admin.router"));
const Book_controller_1 = require("../controller/Admin/Book.controller");
const Category_controller_1 = require("../controller/Category/Category.controller");
const UserValidate_1 = require("../middleware/UserValidate");
const bookcart_controller_1 = __importStar(require("../controller/Cart/bookcart.controller"));
const BorrowBook_controller_1 = __importDefault(require("../controller/TrackFeature/BorrowBook.controller"));
const Account_controller_1 = require("../controller/Authentication/Account.controller");
const SummaryStudentInfo_controller_1 = __importDefault(require("../controller/TrackFeature/SummaryStudentInfo.controller"));
const Department_controller_1 = require("../controller/Admin/Department.controller");
const Report_controller_1 = __importDefault(require("../controller/Admin/Report.controller"));
const Router = (0, express_1.Router)();
Router.use("/user", User_router_1.default);
Router.use("/librarian", Admin_router_1.default);
//check Login Session
Router.get("/checksession", UserValidate_1.VerifyToken, Account_controller_1.GetUserSession);
//Category
Router.get("/getallcategory", Category_controller_1.GetCategories);
//RefreshToken
Router.get("/refreshtoken", Account_controller_1.RefreshToken);
//Bucket
Router.post("/addbucket", UserValidate_1.VerifyToken, bookcart_controller_1.default);
Router.put("/editbucket", UserValidate_1.VerifyToken, bookcart_controller_1.EditBucket);
Router.get("/getbucket", UserValidate_1.VerifyToken, bookcart_controller_1.GetBucket);
Router.delete("/deletebucket", UserValidate_1.VerifyToken, bookcart_controller_1.DeleteBuckets);
//Checkout Book
Router.post("/checkout", UserValidate_1.VerifyToken, BorrowBook_controller_1.default);
//Get Book
Router.get("/getallbook", Book_controller_1.GetBook);
Router.post("/uploadimg", Book_controller_1.UploadCover);
//Get SummaryInfo
Router.post("/getsummaryusage", UserValidate_1.VerifyToken, SummaryStudentInfo_controller_1.default);
Router.get("/getdepartment", UserValidate_1.VerifyToken, Department_controller_1.GetDepartment);
const exportreport = new Report_controller_1.default();
Router.post("/generatereport", UserValidate_1.VerifyToken, UserValidate_1.IsHD, exportreport.exportReport);
exports.default = Router;

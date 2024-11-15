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
const UserValidate_1 = require("../middleware/UserValidate");
const Department_controller_1 = require("../controller/Admin/Department.controller");
const LibraryEntry_controller_1 = __importStar(require("../controller/TrackFeature/LibraryEntry.controller"));
const BorrowBook_controller_1 = require("../controller/TrackFeature/BorrowBook.controller");
const Book_controller_1 = require("../controller/Admin/Book.controller");
const GetBorrowBook_1 = require("../controller/TrackFeature/GetBorrowBook");
const User_controller_1 = require("../controller/Authentication/User.controller");
const Category_controller_1 = require("../controller/Category/Category.controller");
const Account_controller_1 = __importDefault(require("../controller/Authentication/Account.controller"));
const SummaryStudentInfo_controller_1 = __importDefault(require("../controller/TrackFeature/SummaryStudentInfo.controller"));
const Adminroute = (0, express_1.Router)();
//Middleware
Adminroute.use(UserValidate_1.VerifyToken);
Adminroute.use(UserValidate_1.IsAdmin);
//Department & Faculty
Adminroute.post("/createfaculty", Department_controller_1.CreateFaculty);
Adminroute.delete("/deletefaculty", Department_controller_1.DeleteFaculty);
Adminroute.post("/createdepartment", Department_controller_1.CreateDepartment);
Adminroute.put("/editdepartment", Department_controller_1.EditDepartment);
Adminroute.delete("/deletedepartment", Department_controller_1.DeleteDepartment);
Adminroute.get("/getdepartment", Department_controller_1.GetDepartment);
//Book
Adminroute.post("/registerbook", Book_controller_1.RegisterBook);
Adminroute.put("/editbook", Book_controller_1.EditBook);
Adminroute.delete("/deletebook", Book_controller_1.DeleteBook);
//Category
Adminroute.get("/getcategory", Category_controller_1.GetCategories);
Adminroute.post("/createcategory", Category_controller_1.CreateCategory);
//student
Adminroute.post("/registeruser", Account_controller_1.default);
Adminroute.get("/getstudent", LibraryEntry_controller_1.GetStudent);
Adminroute.delete("/deleteusers", User_controller_1.DeleteMultipleUser);
Adminroute.put("/edituser", User_controller_1.EditUserInfo_Admin);
//Borrow Book
Adminroute.delete("/d-bb", BorrowBook_controller_1.DeleteBorrow_Book);
Adminroute.get("/getborrowbook", GetBorrowBook_1.GetBorrowBook);
Adminroute.get("/scanborrowbook", GetBorrowBook_1.ScanBorrowBook);
Adminroute.put("/manuallyreturn", BorrowBook_controller_1.HandleManualReturn);
//Track Feature
Adminroute.post("/scanentry", LibraryEntry_controller_1.default);
Adminroute.put("/handleborrowbook", BorrowBook_controller_1.BorrowBookPickUpAndReturn);
Adminroute.get("/scancard", LibraryEntry_controller_1.GetStudentFromScan);
//Report
Adminroute.post("/summaryusage", SummaryStudentInfo_controller_1.default);
exports.default = Adminroute;

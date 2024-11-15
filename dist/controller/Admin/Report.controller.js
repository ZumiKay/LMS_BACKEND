"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../../models/user.model"));
const libraryentry_model_1 = __importDefault(require("../../models/libraryentry.model"));
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const Helper_1 = require("../../Utilities/Helper");
const excel_1 = require("../../config/excel");
const department_model_1 = __importDefault(require("../../models/department.model"));
const AuthenticationType_1 = require("../../Types/AuthenticationType");
const faculty_model_1 = __importDefault(require("../../models/faculty.model"));
class ReportExporter {
    constructor() {
        this.exportReport = (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, department, information, informationtype, startdate, enddate, } = req.body;
                const result = yield this.fetchUsers(department);
                if (result.length === 0) {
                    return res.status(404).json({
                        message: "No Student Found",
                        status: (0, ErrorCode_1.default)("Not Found"),
                    });
                }
                const data = this.prepareData(result, information, new Date(startdate), new Date(enddate));
                const buffer = yield this.generateExcelFile(data, information, informationtype, name);
                return this.sendExcelResponse(res, buffer, name);
            }
            catch (error) {
                console.log("Generate Report Excel", error);
                return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
            }
        });
        this.fetchUsers = (department) => __awaiter(this, void 0, void 0, function* () {
            return user_model_1.default.findAll({
                where: {
                    role: AuthenticationType_1.ROLE.STUDENT,
                },
                attributes: { exclude: ["password"] },
                include: [
                    { model: libraryentry_model_1.default, as: "entries" },
                    {
                        model: department_model_1.default,
                        where: { department },
                        required: true,
                        include: [faculty_model_1.default],
                    },
                    { model: borrowbook_model_1.default },
                ],
            });
        });
        this.prepareData = (users, information, startdate, enddate) => {
            return users.map((student) => {
                var _a, _b, _c;
                const { studentID, firstname, lastname, department, email, phone_number, } = student;
                const library_entry = (0, Helper_1.filterDataByTimeRange)((_a = student.entries) !== null && _a !== void 0 ? _a : [], startdate.toISOString(), enddate.toISOString());
                const borrowedbook = information !== "entry"
                    ? (0, Helper_1.filterDataBorrowByTimeRange)((_c = (_b = student.borrowbooks) === null || _b === void 0 ? void 0 : _b.map((i) => i.createdAt)) !== null && _c !== void 0 ? _c : [], startdate.toISOString(), enddate.toISOString())
                    : [];
                return {
                    ID: studentID,
                    fullname: `${firstname} ${lastname}`,
                    faculty: department.faculty.name,
                    department: department.department,
                    email,
                    phone_number,
                    library_entry,
                    borrowedbook,
                };
            });
        };
        this.generateExcelFile = (data, information, informationtype, name) => __awaiter(this, void 0, void 0, function* () {
            const workbook = (0, excel_1.generateExcel)(data, information, informationtype);
            return workbook.xlsx.writeBuffer();
        });
        this.sendExcelResponse = (res, buffer, name) => {
            res.setHeader("Content-Disposition", `attachment; filename="${name}.xlsx"`);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            return res.send(buffer);
        };
    }
}
exports.default = ReportExporter;

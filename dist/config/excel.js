"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateExcel = void 0;
const exceljs_1 = __importDefault(require("exceljs"));
const Helper_1 = require("../Utilities/Helper");
const generateExcel = (data, information, informationtypes) => {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet("Sheet1");
    workbook.created = new Date();
    worksheet.columns = [
        { header: "ID", key: "id", width: 15 },
        { header: "Name", key: "name", width: 15 },
        { header: "Department", key: "department", width: 15 },
        { header: "Email", key: "email", width: 15 },
        { header: "Library Entry (Times)", key: "entry", width: 40 },
        information !== "entry"
            ? {
                header: "Borrowed Book (books)",
                key: "borrow_book",
                width: 40,
            }
            : {},
    ];
    data.forEach((i) => {
        worksheet.addRow({
            id: i.ID,
            name: i.fullname,
            department: i.department,
            email: i.email,
            entry: i.library_entry && informationtypes !== "short"
                ? i.library_entry
                    .map((j) => (0, Helper_1.formatDateToMMDDYYYYHHMMSS)(j.createdAt))
                    .join(", ")
                : i.library_entry
                    ? i.library_entry.length
                    : 0,
            borrow_book: i.borrowedbook && information !== "entry" ? i.borrowedbook.length : 0,
        });
    });
    worksheet.eachRow((row) => {
        row.eachCell((cell) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
            };
        });
    });
    return workbook;
};
exports.generateExcel = generateExcel;

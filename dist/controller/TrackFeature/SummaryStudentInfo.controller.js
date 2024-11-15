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
exports.default = SummaryStudentUsage;
const Helper_1 = require("../../Utilities/Helper");
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const department_model_1 = __importDefault(require("../../models/department.model"));
const libraryentry_model_1 = __importDefault(require("../../models/libraryentry.model"));
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
function filterByUniqueDate(datesArray) {
    const filteredDates = [];
    datesArray.forEach((dates) => {
        const uniqueDates = dates.reduce((result, date) => {
            // Check if the current date is already in the result array
            const hasDuplicate = result.some((existingDate) => {
                return (new Date(date).toDateString() ===
                    new Date(existingDate).toDateString());
            });
            // Add the current date to the result array if it's not a duplicate
            if (!hasDuplicate) {
                result.push(date);
            }
            return result;
        }, []);
        filteredDates.push(uniqueDates);
    });
    return filteredDates;
}
function countMonthsInRange(datesArray, startDate, endDate) {
    let result = {};
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const startYear = new Date(startDate).getFullYear();
    const startMonth = new Date(startDate).getMonth();
    const endYear = new Date(endDate).getFullYear();
    const endMonth = new Date(endDate).getMonth();
    //Inititalize Result
    for (let year = startYear; year <= endYear; year++) {
        const isStartYear = year === startYear;
        const isEndYear = year === endYear;
        const start = isStartYear ? startMonth : 0;
        const end = isEndYear ? endMonth : 11;
        for (let month = start; month <= end; month++) {
            const monthName = monthNames[month];
            result[monthName] = { monthCount: 0, weekly: {} };
            for (let week = 1; week <= 4; week++) {
                result[monthName].weekly[week] = 0;
            }
        }
    }
    //
    datesArray.forEach((subarray) => {
        if (Array.isArray(subarray)) {
            const subarrayStartDate = new Date(subarray[0]);
            const subarrayEndDate = new Date(subarray[subarray.length - 1]);
            const year = subarrayStartDate.getFullYear();
            const month = subarrayStartDate.getMonth();
            const monthenddate = subarrayEndDate.getMonth();
            // Check if the subarray's start and end dates are within the specified range
            const isWithinRange = (year > startYear || (year === startYear && month >= startMonth)) &&
                (year < endYear || (year === endYear && month <= endMonth)) &&
                subarrayStartDate >= startDate &&
                subarrayEndDate <= endDate;
            if (isWithinRange) {
                const monthName = monthNames[month];
                const lastmonthname = monthNames[monthenddate];
                if (result.hasOwnProperty(monthName)) {
                    result[monthName].monthCount++;
                    // Get the unique weeks within the subarray
                    const uniqueWeeks = new Set();
                    subarray.forEach((date) => {
                        const week = Math.ceil(new Date(date).getDate() / 7);
                        uniqueWeeks.add(week);
                    });
                    // Update the weekly count for each week in the month
                    uniqueWeeks.forEach((week) => {
                        if (result[monthName].weekly.hasOwnProperty(week)) {
                            result[monthName].weekly[week]++;
                        }
                    });
                }
                if (result.hasOwnProperty(lastmonthname) && monthenddate !== month) {
                    result[lastmonthname].monthCount++;
                    // Get the unique weeks within the subarray
                    const uniqueWeeks = new Set();
                    subarray.forEach((date) => {
                        const week = Math.ceil(new Date(date).getDate() / 7);
                        uniqueWeeks.add(week);
                    });
                    // Update the weekly count for each week in the month
                    uniqueWeeks.forEach((week) => {
                        if (result[lastmonthname].weekly.hasOwnProperty(week)) {
                            result[lastmonthname].weekly[week]++;
                        }
                    });
                }
            }
        }
    });
    return result;
}
function countEntriesAndBorrowedBooksBySemesterAndSelected(entries, borrowedbook, selecteddaterange) {
    console.log(selecteddaterange);
    const result = {};
    selecteddaterange.forEach((range) => {
        // Filter both entries and borrowed book data by date range
        const filteredEntries = filterByUniqueDate((0, Helper_1.filterDatesArrayByRange)(entries, range.filter.start, range.filter.end));
        const filteredBorrowedBooks = filterByUniqueDate((0, Helper_1.filterDatesArrayByRange)(borrowedbook, range.filter.start, range.filter.end));
        console.log(filteredEntries);
        // Calculate totals and monthly breakdowns
        result[range.name] = {
            entry: {
                total: (0, Helper_1.countNonEmptySubArrays)(filteredEntries),
                monthly: countMonthsInRange(filteredEntries, range.filter.start, range.filter.end),
            },
            borrowedbook: {
                total: (0, Helper_1.countNonEmptySubArrays)(filteredBorrowedBooks),
                monthly: countMonthsInRange(filteredBorrowedBooks, range.filter.start, range.filter.end),
            },
        };
    });
    return result;
}
function SummaryStudentUsage(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { department, filtervalue } = req.body;
            if (!department || !filtervalue) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            const filtercondition = {
                where: Object.assign({}, (department !== "all" ? { department } : {})),
                include: [
                    {
                        model: user_model_1.default,
                        as: "users",
                        required: true,
                        include: [
                            {
                                model: libraryentry_model_1.default,
                            },
                            { model: borrowbook_model_1.default, as: "borrowbooks" },
                        ],
                        attributes: {
                            exclude: ["password"],
                        },
                    },
                ],
            };
            const student = yield (department === "all"
                ? department_model_1.default.findAll(filtercondition)
                : department_model_1.default.findOne(filtercondition));
            if (!student) {
                return res.status(200).json({ message: "No data found" });
            }
            const library_entry = [];
            const borrowbooks = [];
            switch (department) {
                case "all":
                    const studata = student;
                    studata.flatMap((stu) => {
                        stu.users.forEach((data) => {
                            var _a, _b, _c, _d;
                            library_entry.push((_b = (_a = data.entries) === null || _a === void 0 ? void 0 : _a.map((i) => i.createdAt)) !== null && _b !== void 0 ? _b : []);
                            borrowbooks.push((_d = (_c = data.borrowbooks) === null || _c === void 0 ? void 0 : _c.map((i) => i.createdAt)) !== null && _d !== void 0 ? _d : []);
                        });
                    });
                    break;
                default:
                    const filterstudent = student;
                    filterstudent.users.forEach((user) => {
                        var _a, _b, _c, _d;
                        library_entry.push((_b = (_a = user.entries) === null || _a === void 0 ? void 0 : _a.map((i) => i.createdAt)) !== null && _b !== void 0 ? _b : []);
                        borrowbooks.push((_d = (_c = user.borrowbooks) === null || _c === void 0 ? void 0 : _c.map((i) => i.createdAt)) !== null && _d !== void 0 ? _d : []);
                    });
                    break;
            }
            const result = countEntriesAndBorrowedBooksBySemesterAndSelected(library_entry, borrowbooks, filtervalue.map((i) => (Object.assign(Object.assign({}, i), { filter: {
                    start: new Date(i.filter.start),
                    end: new Date(i.filter.end),
                } }))));
            return res.status(200).json({ data: result });
        }
        catch (error) {
            console.log("Summary Student", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

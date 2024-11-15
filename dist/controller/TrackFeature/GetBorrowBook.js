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
exports.GetBorrowBook_STUDENT = exports.GetBorrowBook_Librarian = exports.GetBorrowBookDetail = void 0;
exports.ScanBorrowBook = ScanBorrowBook;
exports.GetBorrowBook = GetBorrowBook;
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const book_model_1 = __importDefault(require("../../models/book.model"));
const BookType_1 = require("../../Types/BookType");
const Helper_1 = require("../../Utilities/Helper");
const bucket_model_1 = __importDefault(require("../../models/bucket.model"));
const sequelize_1 = require("sequelize");
const validator_1 = require("validator");
const department_model_1 = __importDefault(require("../../models/department.model"));
const faculty_model_1 = __importDefault(require("../../models/faculty.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
function ScanBorrowBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { bid } = req.query;
            if (!bid)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const borrow = yield borrowbook_model_1.default.findOne({
                where: {
                    borrow_id: bid,
                    status: {
                        [sequelize_1.Op.not]: BookType_1.BookStatus.RETURNED,
                    },
                },
                include: [
                    { model: bucket_model_1.default, include: [{ model: book_model_1.default, include: [category_model_1.default] }] },
                    {
                        model: user_model_1.default,
                    },
                ],
            });
            if (!borrow) {
                const byuser = yield user_model_1.default.findOne({
                    where: { studentID: bid },
                    include: [
                        {
                            model: borrowbook_model_1.default,
                            include: [
                                {
                                    model: bucket_model_1.default,
                                    include: [{ model: book_model_1.default, include: [category_model_1.default] }],
                                },
                                {
                                    model: user_model_1.default,
                                },
                            ],
                        },
                    ],
                });
                if (!byuser || !byuser.borrowbooks || byuser.borrowbooks.length === 0)
                    return res.status(404).json({
                        message: "No Borrow Book Request Found",
                        status: (0, ErrorCode_1.default)("Not Found"),
                    });
                return res.status(200).json({ data: byuser.borrowbooks[0] });
            }
            return res.status(200).json({ data: borrow });
        }
        catch (error) {
            console.log("scan borrowbook", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function GetBorrowBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = null;
        try {
            const { type, limit = 3, page = 1, status, search, detailtype, } = req.query;
            const [p, lt] = [
                parseInt((page !== null && page !== void 0 ? page : "1")),
                parseInt(limit),
            ];
            switch (type) {
                case "STUDENT":
                    result = yield (0, exports.GetBorrowBook_STUDENT)(req.user.uid, req.user.id, lt, p, status, search, detailtype);
                    break;
                case "LIBRARIAN":
                    result = yield (0, exports.GetBorrowBook_Librarian)(lt, p, status, search);
                    break;
                default:
                    return res.status(400).json({
                        message: "Invalid Param",
                        status: (0, ErrorCode_1.default)("Bad Request"),
                    });
            }
            return res
                .status(200)
                .json({ data: result.data, totalcount: result.totalcount });
        }
        catch (error) {
            console.log("Get BorrowBook", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
const GetBorrowBookDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const query = req.query;
        if (!query.borrowid ||
            !(0, validator_1.isNumeric)(query.borrowid) ||
            !query.ty ||
            (query.ty !== "book" && query.ty !== "user")) {
            return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
        }
        const result = yield borrowbook_model_1.default.findByPk(Number(query.borrowid), {
            include: query.ty === "book"
                ? [{ model: bucket_model_1.default, include: [{ model: book_model_1.default, include: [category_model_1.default] }] }]
                : [
                    {
                        model: user_model_1.default,
                        include: [{ model: department_model_1.default, include: [faculty_model_1.default] }],
                    },
                ],
        });
        if (!result)
            return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
        const data = query.ty === "book" ? result.bucket.books : result.user;
        return res.status(200).json({ data });
    }
    catch (error) {
        console.log("Get BorrowBook Detail", error);
        return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
    }
});
exports.GetBorrowBookDetail = GetBorrowBookDetail;
//Helper Function
const GetBorrowBook_Librarian = (limit, page, status, search) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrow_bookcount = yield borrowbook_model_1.default.count();
        const borrow_book = yield borrowbook_model_1.default.findAll(Object.assign(Object.assign({}, (status || search
            ? {
                where: {
                    [sequelize_1.Op.and]: [
                        Object.assign({}, (search && { borrow_id: { [sequelize_1.Op.like]: `%${search}%` } })),
                        Object.assign({}, (status && {
                            status: {
                                [sequelize_1.Op.like]: {
                                    [sequelize_1.Op.any]: status === null || status === void 0 ? void 0 : status.split(","),
                                },
                            },
                        })),
                    ],
                },
            }
            : {})), { limit, offset: (page - 1) * limit }));
        //Pepare For Return Data
        return {
            data: borrow_book.map((borrow) => (Object.assign(Object.assign({}, borrow.dataValues), { createdAt: (0, Helper_1.formatDateToMMDDYYYYHHMMSS)(borrow.dataValues.createdAt) }))),
            totalcount: borrow_bookcount,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.GetBorrowBook_Librarian = GetBorrowBook_Librarian;
const GetBorrowBook_STUDENT = (studentID, id, limit, page, status, search, ty) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const borrow_book_count = yield borrowbook_model_1.default.count({ where: { userId: id } });
        const borrow_book = yield user_model_1.default.findOne({
            where: { studentID, id },
            include: [
                Object.assign(Object.assign(Object.assign({ model: borrowbook_model_1.default }, (status || search
                    ? {
                        where: {
                            status,
                            borrow_id: {
                                [sequelize_1.Op.contained]: search,
                            },
                        },
                    }
                    : {})), { attributes: {
                        exclude: ["userId"],
                    } }), (ty === "book" && {
                    include: [
                        {
                            model: bucket_model_1.default,
                            include: [
                                {
                                    model: book_model_1.default,
                                    attributes: {
                                        exclude: [
                                            "description",
                                            "borrow_count",
                                            "createdAt",
                                            "updatedAt",
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                })),
            ],
            attributes: {
                exclude: ["password", "firstname", "lastname", "email", "studentID"], // Omit user fields
            },
        });
        if (!borrow_book || !borrow_book.borrowbooks)
            throw new Error("No borrow book found");
        const paginationBorrowBook = (0, Helper_1.paginateArray)(borrow_book.borrowbooks, page, limit);
        return {
            data: paginationBorrowBook.map((borrow) => (Object.assign(Object.assign({}, borrow.dataValues), { createdAt: (0, Helper_1.formatDateToMMDDYYYYHHMMSS)(borrow.dataValues.createdAt) }))),
            totalcount: borrow_book_count,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.GetBorrowBook_STUDENT = GetBorrowBook_STUDENT;

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
exports.default = BorrowBookHandler;
exports.BorrowBookPickUpAndReturn = BorrowBookPickUpAndReturn;
exports.HandleManualReturn = HandleManualReturn;
exports.DeleteBorrow_Book = DeleteBorrow_Book;
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const Helper_1 = require("../../Utilities/Helper");
const qrcode_1 = __importDefault(require("qrcode"));
const storage_1 = require("../../config/storage");
const BookType_1 = require("../../Types/BookType");
const database_1 = __importDefault(require("../../config/database"));
const book_model_1 = __importDefault(require("../../models/book.model"));
const sequelize_1 = require("sequelize");
const user_model_1 = __importDefault(require("../../models/user.model"));
const bucket_model_1 = __importStar(require("../../models/bucket.model"));
const bookbucket_model_1 = __importDefault(require("../../models/bookbucket.model"));
function BorrowBookHandler(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const data = req.body;
            if (!data.bucketId)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const bucket = yield bucket_model_1.default.findByPk(data.bucketId, {
                transaction,
                include: [book_model_1.default],
            });
            if (!bucket)
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            // Generate Unique Borrow ID
            let generatedCode;
            let isCodeUnique = false;
            // Ensuring a unique borrow_id is generated
            do {
                generatedCode = (0, Helper_1.GenerateRandomCode)(8);
                const existingCode = yield borrowbook_model_1.default.findOne({
                    where: { borrow_id: generatedCode },
                    transaction,
                });
                if (!existingCode)
                    isCodeUnique = true;
            } while (!isCodeUnique);
            // Generate QR Code and upload it to storage
            const QrCodeBuffer = yield qrcode_1.default.toBuffer(generatedCode, {
                type: "png",
                color: {
                    dark: "#00F", // Blue dots
                    light: "#0000", // Transparent background
                },
                width: 280,
                scale: 1,
            });
            const qrCodeUrl = yield (0, storage_1.UploadToStorage)(QrCodeBuffer, `QR_${generatedCode}`);
            if (!qrCodeUrl) {
                throw new Error("Error uploading QR Code");
            }
            const nextDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
            // Create Borrow Record
            const createdBorrowBook = yield borrowbook_model_1.default.create({
                borrow_id: generatedCode,
                userId: req.user.id,
                status: BookType_1.BookStatus.TOPICKUP,
                qrcode: qrCodeUrl.url,
                expect_return_date: nextDay,
            });
            yield bucket_model_1.default.update({ borrowbookId: createdBorrowBook.id, status: bucket_model_1.BucketStatus.CHECKOUT }, { where: { id: data.bucketId }, transaction });
            // Update all books
            yield transaction.commit();
            return res.status(200).json({
                message: "Checkout Completed",
                data: {
                    borrow_id: generatedCode,
                    qrcode: qrCodeUrl.url,
                },
            });
        }
        catch (error) {
            if (transaction)
                yield transaction.rollback();
            console.log("Borrow Book Error", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function BorrowBookPickUpAndReturn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        const nextWeek = new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000);
        const transaction = yield database_1.default.transaction();
        try {
            const data = req.body;
            let borrowedbook = yield borrowbook_model_1.default.findOne({
                where: data.type === "pickup"
                    ? { borrow_id: data.borrowId }
                    : {
                        [sequelize_1.Op.and]: [
                            { userId: data.borrowId },
                            { status: BookType_1.BookStatus.PICKEDUP },
                        ],
                    },
                include: [
                    {
                        model: bucket_model_1.default,
                        as: "bucket",
                        required: true,
                        include: [{ model: book_model_1.default }],
                    },
                    {
                        model: user_model_1.default,
                    },
                ],
                transaction,
            });
            if (!borrowedbook) {
                const user = yield user_model_1.default.findOne({
                    where: { studentID: data.borrowId },
                    include: [
                        {
                            model: borrowbook_model_1.default,
                            where: {
                                status: {
                                    [sequelize_1.Op.notIn]: [BookType_1.BookStatus.RETURNED, BookType_1.BookStatus.TOPICKUP],
                                },
                            },
                            include: [
                                {
                                    model: bucket_model_1.default,
                                    include: [{ model: book_model_1.default }],
                                },
                            ],
                        },
                    ],
                });
                if (!user) {
                    yield transaction.rollback();
                    return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
                }
                if (user.borrowbooks) {
                    borrowedbook = user.borrowbooks[0];
                }
            }
            switch (data.type) {
                case "pickup":
                    yield borrowbook_model_1.default.update({
                        status: BookType_1.BookStatus.PICKEDUP,
                        expect_return_date: nextWeek,
                        qrcode: null,
                    }, { where: { borrow_id: data.borrowId }, transaction });
                    if (borrowedbook === null || borrowedbook === void 0 ? void 0 : borrowedbook.qrcode) {
                        yield (0, storage_1.DeleteFromStorage)(borrowedbook.qrcode);
                    }
                    yield transaction.commit();
                    return res.status(200).json({ data: borrowedbook });
                case "return":
                    const bookIds = borrowedbook === null || borrowedbook === void 0 ? void 0 : borrowedbook.bucket.books.map((book) => book.id);
                    yield book_model_1.default.update({ status: BookType_1.BookStatus.AVAILABLE }, {
                        where: {
                            id: {
                                [sequelize_1.Op.in]: bookIds,
                            },
                        },
                        transaction,
                    });
                    yield bookbucket_model_1.default.update({ returndate: new Date() }, { where: { bookId: { [sequelize_1.Op.in]: bookIds } } });
                    yield borrowbook_model_1.default.update({ status: BookType_1.BookStatus.RETURNED }, { where: { borrow_id: borrowedbook === null || borrowedbook === void 0 ? void 0 : borrowedbook.borrow_id } });
                    yield transaction.commit();
                    return res.status(200).json({ message: "Returned" });
                default:
                    yield transaction.rollback();
                    return res.status(400).json({
                        message: "Invalid Request Type",
                        status: (0, ErrorCode_1.default)("Bad Request"),
                    });
            }
        }
        catch (error) {
            console.log("BorrowBook Operation Error:", error);
            yield transaction.rollback();
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function HandleManualReturn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const { borrowId, bookId } = req.body;
            if (!borrowId || !bookId) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            const borrowedBook = yield borrowbook_model_1.default.findByPk(borrowId, {
                include: [
                    {
                        model: bucket_model_1.default,
                        include: [{ model: book_model_1.default }],
                    },
                ],
                transaction,
            });
            if (!borrowedBook) {
                yield transaction.rollback();
                return res
                    .status(404)
                    .json({ message: "Ivalid BorrowId", status: (0, ErrorCode_1.default)("Not Found") });
            }
            //update returned book status
            yield book_model_1.default.update({ status: BookType_1.BookStatus.AVAILABLE }, {
                where: {
                    id: bookId,
                },
                transaction,
            });
            yield bookbucket_model_1.default.update({ returndate: new Date() }, { where: { bookId } });
            //update borrowbook status
            const bookreturnedcount = borrowedBook.bucket.books.filter((i) => i.status === BookType_1.BookStatus.UNAVAILABLE).length - 1;
            yield borrowbook_model_1.default.update({
                status: bookreturnedcount <= 0
                    ? BookType_1.BookStatus.RETURNED
                    : `${BookType_1.BookStatus.RETURNED} ${bookreturnedcount}`,
            }, { where: { id: borrowId }, transaction });
            yield transaction.commit();
            return res.status(200).json({ message: "Return Successfully" });
        }
        catch (error) {
            yield transaction.rollback();
            console.log("Individual Return", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteBorrow_Book(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.body;
        if (!id || id.length === 0) {
            return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
        }
        const transaction = yield database_1.default.transaction();
        try {
            const borrowbooks = yield borrowbook_model_1.default.findAll({
                where: { id: { [sequelize_1.Op.in]: id } },
                transaction,
                include: [
                    {
                        model: bucket_model_1.default,
                        as: "bucket",
                        required: true,
                        include: [{ model: book_model_1.default, as: "books" }],
                    },
                ],
            });
            if (!borrowbooks || borrowbooks.length === 0) {
                yield transaction.rollback();
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            // Collect all book IDs to update, where the book status is currently unavailable
            const bookIdsToUpdate = borrowbooks.flatMap((borrow) => borrow.status !== BookType_1.BookStatus.RETURNED
                ? borrow.bucket.books
                    .filter((book) => book.status === BookType_1.BookStatus.UNAVAILABLE)
                    .map((book) => book.id)
                : []);
            if (bookIdsToUpdate.length > 0) {
                yield book_model_1.default.update({ status: BookType_1.BookStatus.AVAILABLE }, {
                    where: { id: { [sequelize_1.Op.in]: bookIdsToUpdate } },
                    transaction,
                });
            }
            // Delete related records in bulk
            const bucketIds = borrowbooks.map((borrow) => borrow.bucket.id);
            yield bookbucket_model_1.default.destroy({
                where: { bucketId: { [sequelize_1.Op.in]: bucketIds } },
                transaction,
            });
            yield bucket_model_1.default.destroy({
                where: { id: { [sequelize_1.Op.in]: bucketIds } },
                transaction,
            });
            yield borrowbook_model_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: id } }, transaction });
            yield transaction.commit();
            return res.status(200).json({ message: "Delete Successfully" });
        }
        catch (error) {
            yield transaction.rollback();
            console.error("Delete BorrowBook Error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

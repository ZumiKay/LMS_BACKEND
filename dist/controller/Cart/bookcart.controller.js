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
exports.default = CreateCart;
exports.CountBucketItems = CountBucketItems;
exports.GetBucket = GetBucket;
exports.EditBucket = EditBucket;
exports.DeleteBuckets = DeleteBuckets;
exports.VerifyBookByUser = VerifyBookByUser;
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const BookType_1 = require("../../Types/BookType");
const bucket_model_1 = __importStar(require("../../models/bucket.model"));
const bookbucket_model_1 = __importDefault(require("../../models/bookbucket.model"));
const database_1 = __importDefault(require("../../config/database"));
const sequelize_1 = require("sequelize");
const book_model_1 = __importDefault(require("../../models/book.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
function CreateCart(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const { bookIds } = req.body;
            const userId = req.user.id;
            const [CreatedBucket] = yield bucket_model_1.default.findOrCreate({
                where: {
                    status: bucket_model_1.BucketStatus.INCART,
                    userId,
                },
                defaults: {
                    userId,
                    status: bucket_model_1.BucketStatus.INCART,
                },
                transaction,
            });
            const bookBucketData = bookIds.map((bookId) => ({
                bucketId: CreatedBucket.id,
                bookId,
            }));
            if (bookBucketData.length > 0) {
                yield bookbucket_model_1.default.bulkCreate(bookBucketData, {
                    transaction,
                    ignoreDuplicates: true,
                });
            }
            //update book status
            yield book_model_1.default.update({ status: BookType_1.BookStatus.UNAVAILABLE }, { where: { id: { [sequelize_1.Op.in]: bookIds } } });
            yield transaction.commit();
            return res.status(200).json({ message: "Added To Bucket" });
        }
        catch (error) {
            yield transaction.rollback();
            console.error("Create Cart Error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function CountBucketItems(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const count = yield bucket_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.and]: [{ userId: req.user.id }, { status: bucket_model_1.BucketStatus.INCART }],
                },
                include: [book_model_1.default],
            });
            return res.status(200).json({ data: count === null || count === void 0 ? void 0 : count.books.length });
        }
        catch (error) {
            console.log("Count Bucket", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function GetBucket(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id } = req.user;
            const result = yield bucket_model_1.default.findOne({
                where: {
                    status: { [sequelize_1.Op.not]: bucket_model_1.BucketStatus.CHECKOUT },
                    userId: id,
                },
                include: {
                    model: book_model_1.default,
                    as: "books",
                    required: true,
                    include: [category_model_1.default],
                    attributes: {
                        exclude: [
                            "return_date",
                            "createdAt",
                            "updatedAt",
                            "description",
                            "borrow_count",
                        ],
                    },
                },
            });
            if (!result)
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            return res.status(200).json({ data: result });
        }
        catch (error) {
            console.log("Get Bucket", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function EditBucket(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const { id: bucketId, bookIds } = req.body;
            if (!bucketId || !bookIds)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const bucket = yield bucket_model_1.default.findByPk(bucketId, {
                include: {
                    model: book_model_1.default,
                    as: "books",
                    attributes: ["id"],
                    required: true,
                },
                transaction,
            });
            if (!bucket) {
                yield transaction.rollback();
                return res
                    .status(404)
                    .json({ message: "No Bucket Found", status: (0, ErrorCode_1.default)("Not Found") });
            }
            // Delete BookBucket records where bookId is not in the new bookIds
            yield bookbucket_model_1.default.destroy({
                where: {
                    bucketId,
                    bookId: {
                        [sequelize_1.Op.notIn]: bookIds,
                    },
                },
                transaction,
            });
            // Filter out existing books that are not in the new bookIds
            const newBookIds = bookIds.filter((bookId) => !bucket.books.some((book) => book.id === bookId));
            // Insert only the new books that are not already in the bucket
            if (newBookIds.length > 0) {
                const bookBucketData = newBookIds.map((bookId) => ({
                    bookId,
                    bucketId,
                }));
                yield bookbucket_model_1.default.bulkCreate(bookBucketData, { transaction });
            }
            yield transaction.commit();
            return res.status(200).json({ message: "Bucket Updated" });
        }
        catch (error) {
            yield transaction.rollback();
            console.error("Update Buckets Error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteBuckets(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            if (!data.bookId && !data.bucketId)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const bucket = yield bucket_model_1.default.findByPk(data.bucketId, {
                include: {
                    model: book_model_1.default,
                    as: "books",
                    attributes: { include: ["id"] },
                    required: true,
                },
            });
            if (data.all) {
                if (typeof data.all !== "boolean")
                    return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
                yield bookbucket_model_1.default.destroy({ where: { bucketId: data.bucketId } });
                yield bucket_model_1.default.destroy({ where: { id: data.bucketId } });
            }
            else {
                const isEmpty = (bucket === null || bucket === void 0 ? void 0 : bucket.books.length) === 1;
                yield bookbucket_model_1.default.destroy({
                    where: {
                        [sequelize_1.Op.and]: [
                            { bookId: { [sequelize_1.Op.in]: data.bookId }, bucketId: data.bucketId },
                        ],
                    },
                });
                if (isEmpty)
                    yield bucket_model_1.default.destroy({ where: { id: data.bucketId } });
            }
            yield book_model_1.default.update({ status: BookType_1.BookStatus.AVAILABLE }, { where: { id: { [sequelize_1.Op.in]: data.bookId } } });
            return res.status(200).json({ message: "Delete Success" });
        }
        catch (error) {
            console.log("Delete Bucket", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function VerifyBookByUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { bookid } = req.body;
            const bucket = yield bucket_model_1.default.findOne({
                where: {
                    id: req.user.id,
                },
                include: [
                    {
                        model: book_model_1.default,
                        where: {
                            id: bookid,
                        },
                    },
                ],
            });
            if (!bucket || bucket.books.length === 0)
                return res.status(200);
            if (bucket.books.length !== 0)
                return res.status(200).json({ incart: true });
        }
        catch (error) {
            console.log("Verify Book Status", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

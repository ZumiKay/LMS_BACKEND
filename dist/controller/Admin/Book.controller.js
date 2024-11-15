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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getgooglebook = void 0;
exports.RegisterBook = RegisterBook;
exports.EditBook = EditBook;
exports.DeleteBook = DeleteBook;
exports.GetBook = GetBook;
exports.UploadCover = UploadCover;
const book_model_1 = __importDefault(require("../../models/book.model"));
const category_item_model_1 = __importDefault(require("../../models/category_item.model"));
const category_model_1 = __importDefault(require("../../models/category.model"));
const database_1 = __importDefault(require("../../config/database"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const BookType_1 = require("../../Types/BookType");
const Helper_1 = require("../../Utilities/Helper");
const sequelize_1 = require("sequelize");
const client_1 = require("@vercel/blob/client");
const bookbucket_model_1 = __importDefault(require("../../models/bookbucket.model"));
const bucket_model_1 = __importDefault(require("../../models/bucket.model"));
const blob_1 = require("@vercel/blob");
const FindOrCreateCategory = (Cate) => __awaiter(void 0, void 0, void 0, function* () {
    const transaction = yield database_1.default.transaction();
    try {
        const data = [];
        for (const cate of Cate) {
            const res = yield category_model_1.default.findOrCreate({
                where: { name: cate.name },
                defaults: {
                    name: cate.name,
                    description: cate.description,
                },
                transaction,
            });
            data.push(res[0]);
        }
        yield transaction.commit();
        return data;
    }
    catch (error) {
        console.log("Category Error", error);
        yield transaction.rollback();
        return null;
    }
});
const getgooglebook = (categories) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = categories;
    const url = `https://www.googleapis.com/books/v1/volumes?q=subject:${subject}&printType=books&orderBy=relevance&maxResults=10&key=${process.env.GOOGLEBOOK_APIKEY}`;
    try {
        const res = yield fetch(url).then((response) => response.json());
        const book = [];
        if (res && res.items) {
            //Categories
            const cates = yield FindOrCreateCategory([{ name: categories }]);
            if (!cates)
                return { success: false };
            res.items.map((i) => {
                var _a;
                return book.push({
                    ISBN: (_a = i.volumeInfo.industryIdentifiers) !== null && _a !== void 0 ? _a : [],
                    title: i.volumeInfo.title,
                    description: i.volumeInfo.description,
                    cover_img: i.volumeInfo.imageLinks.thumbnail,
                    author: i.volumeInfo.authors,
                    publisher_date: i.volumeInfo.publishedDate,
                    status: BookType_1.BookStatus.AVAILABLE,
                });
            });
            const createdBook = yield book_model_1.default.bulkCreate(book.map((i) => i));
            yield category_item_model_1.default.bulkCreate(createdBook.map((i) => ({ cateId: cates[0].id, bookId: i.id })));
        }
        return { success: true };
    }
    catch (error) {
        console.log("Get Google Book", error);
        return { success: false };
    }
});
exports.getgooglebook = getgooglebook;
function RegisterBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            const isExist = yield book_model_1.default.findOne({ where: { title: data.title } });
            if (isExist)
                return res
                    .status(400)
                    .json({ message: "Book Exist", status: (0, ErrorCode_1.default)("Bad Request") });
            yield FindOrCreateCategory(data.categories);
            //Create Book
            const createdata = Object.assign(Object.assign({}, data), { categories: undefined });
            const createdBook = yield book_model_1.default.create(Object.assign(Object.assign({}, createdata), { status: BookType_1.BookStatus.AVAILABLE }));
            if (createdBook.id) {
                //create Categoryitem for m to m relationship
                yield category_item_model_1.default.bulkCreate(data.categories
                    .filter((i) => i.id)
                    .map((cate) => ({
                    cateId: cate.id,
                    bookId: createdBook.id,
                })));
            }
            return res.status(200).json({ message: "Book Registered" });
        }
        catch (error) {
            console.log("Register Book", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function EditBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const _a = req.body, { id, cover_img, categories } = _a, restEditData = __rest(_a, ["id", "cover_img", "categories"]);
            if (!id) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            const book = yield book_model_1.default.findByPk(id, { include: [category_model_1.default], transaction });
            if (!book) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            //Update CoverImage
            if (cover_img && book.cover_img) {
                if (cover_img !== book.cover_img) {
                    yield (0, blob_1.del)(book.cover_img);
                }
            }
            // Update categories if provided
            if (categories) {
                yield FindOrCreateCategory(categories);
                const currentCategoryIds = new Set(book.categories.map((c) => c.id));
                const newCategoryIds = new Set(categories.map((c) => c.id));
                const categoriesToRemove = [...currentCategoryIds].filter((id) => !newCategoryIds.has(id));
                const categoriesToAdd = [...newCategoryIds].filter((id) => !currentCategoryIds.has(id));
                if (categoriesToRemove.length > 0) {
                    yield category_item_model_1.default.destroy({
                        where: { bookId: id, cateId: { [sequelize_1.Op.in]: categoriesToRemove } },
                        transaction,
                    });
                }
                if (categoriesToAdd.length > 0) {
                    const newCategoryItems = categoriesToAdd.map((cateId) => ({
                        bookId: id,
                        cateId,
                    }));
                    yield category_item_model_1.default.bulkCreate(newCategoryItems, { transaction });
                }
            }
            const updateData = Object.assign(Object.assign({}, restEditData), (cover_img !== book.cover_img && { cover_img }));
            yield book_model_1.default.update(updateData, { where: { id }, transaction });
            yield transaction.commit();
            return res.status(200).json({ message: "Update Successfully" });
        }
        catch (error) {
            yield transaction.rollback();
            console.error("EditBook error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { id } = req.body;
        if (!Array.isArray(id) || id.length === 0) {
            return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
        }
        try {
            yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                const relatedBucketIds = yield bookbucket_model_1.default.findAll({
                    where: { bookId: { [sequelize_1.Op.in]: id } },
                    attributes: ["bucketId"],
                    transaction,
                }).then((buckets) => buckets.map((bucket) => bucket.bucketId));
                if (relatedBucketIds.length > 0) {
                    yield bucket_model_1.default.destroy({
                        where: { id: { [sequelize_1.Op.in]: relatedBucketIds } },
                        transaction,
                    });
                }
                yield book_model_1.default.destroy({
                    where: { id: { [sequelize_1.Op.in]: id } },
                    transaction,
                });
            }));
            return res.status(200).json({ message: "Delete Successfully" });
        }
        catch (error) {
            console.error("DeleteBook error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
const types = {
    id: "int",
    type: "string",
    limit: "int",
    page: "int",
    popular: "boolean",
    latest: "boolean",
    search: "string",
    cate: "string",
    status: "string",
    cates: "string",
};
function GetBook(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, type, limit = 5, page = 1, popular, latest, search, cate, status, cates, } = (0, Helper_1.convertQueryParams)(req.query, types);
            switch (type) {
                case "all":
                    const { count, rows } = yield book_model_1.default.findAndCountAll({
                        limit,
                        offset: (page - 1) * limit,
                        order: ["id"],
                        include: [
                            {
                                model: category_model_1.default,
                            },
                        ],
                    });
                    return res.status(200).json({
                        data: rows,
                        totalcount: count,
                    });
                case "id":
                    if (!id)
                        return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
                    const book = yield book_model_1.default.findByPk(id, {
                        include: [{ model: category_model_1.default, as: "categories" }],
                    });
                    if (!book) {
                        return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
                    }
                    return res.status(200).json({ data: book });
                case "filter":
                    let result = [];
                    let totalcount = 0;
                    if (popular) {
                        result = yield book_model_1.default.findAll({
                            where: {
                                borrow_count: {
                                    [sequelize_1.Op.not]: 0,
                                },
                            },
                            order: [["borrow_count", "DESC"]],
                            include: [
                                {
                                    model: category_model_1.default,
                                },
                            ],
                            limit,
                        });
                    }
                    else if (latest) {
                        const sevenDaysAgo = new Date();
                        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                        result = yield book_model_1.default.findAll({
                            where: {
                                createdAt: {
                                    [sequelize_1.Op.gte]: sevenDaysAgo,
                                },
                            },
                            limit,
                            include: [
                                {
                                    model: category_model_1.default,
                                },
                            ],
                            order: ["id"],
                        });
                    }
                    else if (search) {
                        const { rows, count } = yield book_model_1.default.findAndCountAll({
                            where: {
                                [sequelize_1.Op.or]: [
                                    (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("REPLACE", (0, sequelize_1.col)("title"), " ", "")), // Remove spaces and lowercase title
                                    {
                                        [sequelize_1.Op.like]: `%${(0, Helper_1.normalizeString)(search)}%`, // Use normalized search term
                                    }),
                                    (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.cast)((0, sequelize_1.col)("ISBN"), "text")), {
                                        [sequelize_1.Op.like]: `%${(0, Helper_1.normalizeString)(search)}%`,
                                    }),
                                    (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.cast)((0, sequelize_1.col)("author"), "text")), {
                                        [sequelize_1.Op.like]: `%${(0, Helper_1.normalizeString)(search)}%`,
                                    }),
                                ],
                            },
                            include: [
                                {
                                    model: category_model_1.default,
                                },
                            ],
                            limit,
                            offset: (page - 1) * limit,
                        });
                        result = rows;
                        totalcount = count;
                    }
                    else if (cate) {
                        const category = yield category_model_1.default.findOne({
                            where: {
                                name: cate,
                            },
                            include: [{ model: book_model_1.default, as: "items", order: ["id"] }],
                        });
                        result = category === null || category === void 0 ? void 0 : category.items;
                    }
                    else if (cates) {
                        const offset = (page - 1) * limit;
                        // Step 1: Fetch book IDs with pagination
                        const bookIds = yield book_model_1.default.findAll({
                            attributes: ["id"],
                            include: {
                                model: category_model_1.default,
                                where: { name: { [sequelize_1.Op.in]: cates.split(",") } },
                                through: { attributes: [] }, // Avoid fetching join table columns
                            },
                            order: [["id", "ASC"]],
                            limit,
                            offset,
                        });
                        const ids = bookIds.map((book) => book.id);
                        // Step 2: Fetch detailed books with categories based on these IDs
                        const books = yield book_model_1.default.findAll({
                            where: { id: { [sequelize_1.Op.in]: ids } },
                            include: [category_model_1.default],
                            order: [["id", "ASC"]],
                        });
                        // Fetch the total count of books for the given categories
                        const totalBooks = yield book_model_1.default.count({
                            include: {
                                model: category_model_1.default,
                                where: { name: { [sequelize_1.Op.in]: cates.split(",") } },
                                through: { attributes: [] }, // Avoid fetching join table columns
                            },
                        });
                        result = books;
                        totalcount = totalBooks;
                    }
                    else if (status) {
                        const { count, rows } = yield book_model_1.default.findAndCountAll({
                            where: {
                                status: {
                                    [sequelize_1.Op.in]: status.split(","),
                                },
                            },
                            limit,
                            offset: (page - 1) * limit,
                            include: [category_model_1.default],
                        });
                        return res.status(200).json({
                            data: rows,
                            totalcount: count,
                        });
                    }
                    return res.status(200).json({ data: result, totalcount });
                default:
                    return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
        }
        catch (error) {
            console.log("Get Book", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function UploadCover(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            const jsonResponse = yield (0, client_1.handleUpload)({
                body,
                request: req, // Cast to match expected type
                onBeforeGenerateToken: (pathname
                /* clientPayload */
                ) => __awaiter(this, void 0, void 0, function* () {
                    // Authenticate and authorize users before generating the token
                    // This example allows anonymous uploads for specific content types
                    return {
                        allowedContentTypes: ["image/jpeg", "image/png", "image/gif"],
                        tokenPayload: JSON.stringify({
                        // Optional payload, can include user information or metadata
                        }),
                    };
                }),
                onUploadCompleted: (_a) => __awaiter(this, [_a], void 0, function* ({ blob, tokenPayload }) {
                    // Logic after the upload is completed
                    try {
                        // Example: Update user avatar or other actions
                        // const { userId } = JSON.parse(tokenPayload);
                        // await db.update({ avatar: blob.url, userId });
                    }
                    catch (error) {
                        throw new Error("Could not update user");
                    }
                }),
            });
            res.status(200).json(jsonResponse);
        }
        catch (error) {
            console.log("Upload Image", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

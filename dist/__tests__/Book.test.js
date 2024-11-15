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
const storage_1 = require("../config/storage");
const BorrowBook_controller_1 = __importDefault(require("../controller/TrackFeature/BorrowBook.controller"));
const book_model_1 = __importDefault(require("../models/book.model"));
const bookcart_model_1 = __importDefault(require("../models/bookcart.model"));
const borrowbook_model_1 = __importDefault(require("../models/borrowbook.model"));
const BookType_1 = require("../Types/BookType");
jest.mock("../models/borrowbook.model");
jest.mock("../models/book.model");
jest.mock("../models/bookcart.model");
jest.mock("@vercel/blob");
jest.mock("qrcode");
jest.mock("../config/storage");
const mockbook = {
    id: 1,
    title: "Book title",
    ISBN: [{ type: "As", identifier: "001" }],
    description: "Description",
    categories: [{ name: "Action" }],
    author: ["Author1"],
    publisher_date: new Date(),
    status: BookType_1.BookStatus.AVAILABLE,
    borrow_count: 0,
};
const mockBorrowInfo = {
    id: 1,
    borrow_id: "unique id",
    books: [mockbook],
    userId: 1,
    status: BookType_1.BookStatus.TOPICKUP,
    qrcode: "qrcode",
    createdAt: new Date(),
};
describe("Borrow Book Process", () => {
    let res;
    let req;
    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    afterEach(() => jest.clearAllMocks());
    test("No Book", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, BorrowBook_controller_1.default)(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    }));
    test("Error QrCode ", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { books: mockbook };
        storage_1.UploadToStorage.mockRejectedValue(null);
        yield (0, BorrowBook_controller_1.default)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    }));
    test("Checkout Completed", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { books: [mockbook] };
        req.user = { id: 10 };
        storage_1.UploadToStorage.mockResolvedValue({
            url: "url",
        });
        borrowbook_model_1.default.create.mockResolvedValue(mockBorrowInfo);
        bookcart_model_1.default.bulkCreate.mockResolvedValue([
            { bookID: 1, borrowID: "uniqueid" },
        ]);
        book_model_1.default.update.mockResolvedValue([1]);
        yield (0, BorrowBook_controller_1.default)(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }));
});

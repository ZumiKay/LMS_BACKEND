"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const console_1 = require("console");
const sequelize_typescript_1 = require("sequelize-typescript");
const book_model_1 = __importDefault(require("./book.model"));
const user_model_1 = __importDefault(require("./user.model"));
const sequelize_1 = require("sequelize");
let BorrowBook = class BorrowBook extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ unique: true }),
    __metadata("design:type", String)
], BorrowBook.prototype, "borrow_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => book_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], BorrowBook.prototype, "bookId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => book_model_1.default),
    __metadata("design:type", book_model_1.default)
], BorrowBook.prototype, "book", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], BorrowBook.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], BorrowBook.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.STRING,
    }),
    __metadata("design:type", String)
], BorrowBook.prototype, "status", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], BorrowBook.prototype, "createdAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: true }),
    __metadata("design:type", Object)
], BorrowBook.prototype, "qrcode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: true }),
    __metadata("design:type", Object)
], BorrowBook.prototype, "expect_return_date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: true }),
    __metadata("design:type", Object)
], BorrowBook.prototype, "return_date", void 0);
BorrowBook = __decorate([
    console_1.table
], BorrowBook);
exports.default = BorrowBook;

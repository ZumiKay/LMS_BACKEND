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
const sequelize_typescript_1 = require("sequelize-typescript");
const bucket_model_1 = __importDefault(require("./bucket.model"));
const book_model_1 = __importDefault(require("./book.model"));
let BookBucket = class BookBucket extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => bucket_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], BookBucket.prototype, "bucketId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => book_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], BookBucket.prototype, "bookId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Object)
], BookBucket.prototype, "returndate", void 0);
BookBucket = __decorate([
    sequelize_typescript_1.Table
], BookBucket);
exports.default = BookBucket;

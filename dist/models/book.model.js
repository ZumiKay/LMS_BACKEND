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
const sequelize_1 = require("sequelize");
const sequelize_typescript_1 = require("sequelize-typescript");
const category_model_1 = __importDefault(require("./category.model"));
const category_item_model_1 = __importDefault(require("./category_item.model"));
const bucket_model_1 = __importDefault(require("./bucket.model"));
const bookbucket_model_1 = __importDefault(require("./bookbucket.model"));
let Book = class Book extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    }),
    __metadata("design:type", Array)
], Book.prototype, "ISBN", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => category_model_1.default, () => category_item_model_1.default),
    __metadata("design:type", Array)
], Book.prototype, "categories", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", Object)
], Book.prototype, "cover_img", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    }),
    __metadata("design:type", String)
], Book.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.TEXT, allowNull: true }),
    __metadata("design:type", Object)
], Book.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.JSONB, allowNull: false }),
    __metadata("design:type", Array)
], Book.prototype, "author", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", Date)
], Book.prototype, "publisher_date", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Book.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.INTEGER, allowNull: true, defaultValue: 0 }),
    __metadata("design:type", Object)
], Book.prototype, "borrow_count", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.DATE, allowNull: true }),
    __metadata("design:type", Object)
], Book.prototype, "return_date", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Book.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Book.prototype, "updatedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => bucket_model_1.default, () => bookbucket_model_1.default),
    __metadata("design:type", Array)
], Book.prototype, "buckets", void 0);
Book = __decorate([
    sequelize_typescript_1.Table
], Book);
exports.default = Book;

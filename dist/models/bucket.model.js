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
exports.BucketStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_1 = __importDefault(require("./user.model"));
const book_model_1 = __importDefault(require("./book.model"));
const bookbucket_model_1 = __importDefault(require("./bookbucket.model"));
const borrowbook_model_1 = __importDefault(require("./borrowbook.model"));
var BucketStatus;
(function (BucketStatus) {
    BucketStatus["INCART"] = "incart";
    BucketStatus["CHECKOUT"] = "checkout";
})(BucketStatus || (exports.BucketStatus = BucketStatus = {}));
let Bucket = class Bucket extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Bucket.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Bucket.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default),
    __metadata("design:type", user_model_1.default)
], Bucket.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsToMany)(() => book_model_1.default, () => bookbucket_model_1.default),
    __metadata("design:type", Array)
], Bucket.prototype, "books", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => borrowbook_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Object)
], Bucket.prototype, "borrowbookId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => borrowbook_model_1.default),
    __metadata("design:type", borrowbook_model_1.default)
], Bucket.prototype, "borrowbook", void 0);
Bucket = __decorate([
    sequelize_typescript_1.Table
], Bucket);
exports.default = Bucket;

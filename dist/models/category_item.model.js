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
const category_model_1 = __importDefault(require("./category.model"));
const book_model_1 = __importDefault(require("./book.model"));
const sequelize_1 = require("sequelize");
let Categoryitem = class Categoryitem extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => category_model_1.default),
    sequelize_typescript_1.Column,
    __metadata("design:type", Number)
], Categoryitem.prototype, "cateId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => book_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true, // Allow `null` for `bookId`
    }),
    __metadata("design:type", Object)
], Categoryitem.prototype, "bookId", void 0);
Categoryitem = __decorate([
    sequelize_typescript_1.Table
], Categoryitem);
exports.default = Categoryitem;

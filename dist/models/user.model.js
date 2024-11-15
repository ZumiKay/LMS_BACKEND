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
const usersession_model_1 = __importDefault(require("./usersession.model"));
const department_model_1 = __importDefault(require("./department.model"));
const libraryentry_model_1 = __importDefault(require("./libraryentry.model"));
const borrowbook_model_1 = __importDefault(require("./borrowbook.model"));
const bucket_model_1 = __importDefault(require("./bucket.model"));
let User = class User extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "studentID", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => department_model_1.default),
    (0, sequelize_typescript_1.Column)({ allowNull: true, type: sequelize_1.DataTypes.INTEGER }),
    __metadata("design:type", Object)
], User.prototype, "departmentID", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => department_model_1.default),
    __metadata("design:type", department_model_1.default)
], User.prototype, "department", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.STRING, allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.DATE, allowNull: true }),
    __metadata("design:type", Object)
], User.prototype, "date_of_birth", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
    }),
    __metadata("design:type", Object)
], User.prototype, "phone_number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ allowNull: true, type: sequelize_1.DataTypes.STRING }),
    __metadata("design:type", Object)
], User.prototype, "code", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => usersession_model_1.default),
    __metadata("design:type", Object)
], User.prototype, "session", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => libraryentry_model_1.default),
    __metadata("design:type", Object)
], User.prototype, "entries", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => borrowbook_model_1.default),
    __metadata("design:type", Object)
], User.prototype, "borrowbooks", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => bucket_model_1.default),
    __metadata("design:type", Object)
], User.prototype, "buckets", void 0);
User = __decorate([
    sequelize_typescript_1.Table
], User);
exports.default = User;

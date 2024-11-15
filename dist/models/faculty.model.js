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
const department_model_1 = __importDefault(require("./department.model"));
let Faculty = class Faculty extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.Column,
    __metadata("design:type", String)
], Faculty.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_1.DataTypes.STRING, allowNull: true }),
    __metadata("design:type", String)
], Faculty.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => department_model_1.default),
    __metadata("design:type", Array)
], Faculty.prototype, "departments", void 0);
Faculty = __decorate([
    sequelize_typescript_1.Table
], Faculty);
exports.default = Faculty;

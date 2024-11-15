"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = exports.HashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const HashPassword = (pass) => {
    const salt = bcryptjs_1.default.genSaltSync(10);
    return bcryptjs_1.default.hashSync(pass, salt);
};
exports.HashPassword = HashPassword;
const generateToken = (payload, secret, expire) => {
    const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: expire });
    return token;
};
exports.generateToken = generateToken;

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
exports.IsHD = exports.IsAdmin = exports.VerifyToken = exports.PasswordValidate = exports.RegisterUserDataValidate = void 0;
const express_validator_1 = require("express-validator");
const ErrorCode_1 = __importDefault(require("../Utilities/ErrorCode"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthenticationType_1 = require("../Types/AuthenticationType");
exports.RegisterUserDataValidate = [
    (0, express_validator_1.query)("firstname").isString().notEmpty(),
    (0, express_validator_1.query)("lastname").isString().notEmpty(),
    (0, express_validator_1.query)("studentID").isString().notEmpty(),
    (0, express_validator_1.query)("email").isEmail().isString().notEmpty(),
    (0, express_validator_1.query)("departmentID").isString().notEmpty(),
    (0, express_validator_1.query)("password").isString().notEmpty(),
    (0, express_validator_1.query)("date_of_birth").isDate(),
    (0, express_validator_1.query)("phone_number").isString(),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Invalid Parameter",
                error: (0, ErrorCode_1.default)("Bad Request"),
            });
        }
        next();
    },
];
const PasswordValidate = (password) => {
    const errors = [];
    // Check if the password is at least 8 characters long
    if (password.length < 8) {
        errors.push("Password must be at least 8 characters long.");
    }
    // Check if the password contains at least one number or special character
    if (!/[0-9!@#$%^&*]/.test(password)) {
        errors.push("Password must contain at least one number or special character.");
    }
    // Return the validation result with details
    return {
        isValid: errors.length === 0,
        errors,
    };
};
exports.PasswordValidate = PasswordValidate;
const VerifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies[process.env.ACCESSTOKEN_COOKIENAME];
        if (!token) {
            return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
        }
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!payload) {
            return res.status(403).json({ status: (0, ErrorCode_1.default)("No Access") });
        }
        req.user = payload;
        next();
    }
    catch (error) {
        console.log("Verify Token Error:", error);
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(403).json({ status: (0, ErrorCode_1.default)("No Access") });
        }
        return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
    }
});
exports.VerifyToken = VerifyToken;
function CheckRole(_a) {
    return __awaiter(this, arguments, void 0, function* ({ role, req, res, next, }) {
        if (!req.user)
            return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
        if (role.includes(req.user.role))
            return next();
        return res.status(403).json({ status: (0, ErrorCode_1.default)("No Access") });
    });
}
const IsAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return CheckRole({ role: [AuthenticationType_1.ROLE.LIBRARIAN], req, res, next }); });
exports.IsAdmin = IsAdmin;
const IsHD = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () { return CheckRole({ role: [AuthenticationType_1.ROLE.LIBRARIAN, AuthenticationType_1.ROLE.HEADDEPARTMENT], req, res, next }); });
exports.IsHD = IsHD;

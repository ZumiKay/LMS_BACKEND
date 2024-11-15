"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterBookValidate = void 0;
const express_validator_1 = require("express-validator");
const ErrorCode_1 = __importDefault(require("../Utilities/ErrorCode"));
exports.RegisterBookValidate = [
    (0, express_validator_1.query)("ISBN").isObject().notEmpty(),
    (0, express_validator_1.query)("cover_img").isString(),
    (0, express_validator_1.query)("title").isString().notEmpty(),
    (0, express_validator_1.query)("description").isString(),
    (0, express_validator_1.query)("author").isObject().notEmpty(),
    (0, express_validator_1.query)("publisher_date").isDate().notEmpty(),
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

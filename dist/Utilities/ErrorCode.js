"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorCode = (message) => ({
    code: message === "Bad Request"
        ? 0
        : message === "Unauthenticated"
            ? 1
            : message === "Not Found"
                ? 2
                : message === "Error Server 500"
                    ? 3
                    : 4,
    message,
});
exports.default = ErrorCode;

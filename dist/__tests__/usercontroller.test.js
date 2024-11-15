"use strict";
// Adjust the path accordingly
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
const User_controller_1 = require("../controller/Authentication/User.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const ErrorCode_1 = __importDefault(require("../Utilities/ErrorCode"));
const AuthenticationType_1 = require("../Types/AuthenticationType");
jest.mock("../models/user.model");
jest.mock("bcryptjs");
jest.mock("../Utilities/Security");
jest.mock("../Utilities/ErrorCode");
jest.mock("../Utilities/Helper");
describe("EditUserInfo", () => {
    let req;
    let res;
    let jsonMock;
    let statusMock;
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        // Setup mock response
        res = {
            status: statusMock,
        };
        // Setup default mock request
        req = {
            body: {
                id: 1,
                edittype: "Password",
                password: "oldpassword",
                newpassword: "newpassword",
            },
            user: {
                id: 1,
                role: "STUDENT",
            },
        };
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    it("should return 404 if user is not found", () => __awaiter(void 0, void 0, void 0, function* () {
        user_model_1.default.findByPk.mockResolvedValue(null);
        yield (0, User_controller_1.EditUserInfo)(req, res);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ status: (0, ErrorCode_1.default)("Not Found") });
    }));
    it("should return 400 if password does not match", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockUser = { password: "hashedpassword" };
        user_model_1.default.findByPk.mockResolvedValue(mockUser);
        bcryptjs_1.default.compareSync.mockReturnValue(false);
        yield (0, User_controller_1.EditUserInfo)(req, res);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ status: (0, ErrorCode_1.default)("Bad Request") });
    }));
    it("should update name for student role", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = {
            id: 1,
            edittype: "Name",
            firstname: "John",
            lastname: "Doe",
            password: "password",
        };
        bcryptjs_1.default.compareSync.mockReturnValue(true);
        const mockUser = { id: 1, role: "STUDENT" };
        user_model_1.default.findByPk.mockReturnValue(mockUser);
        user_model_1.default.update;
        yield (0, User_controller_1.EditUserInfo)(req, res);
        expect(user_model_1.default.update).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith({ message: "Update Successfully" });
    }));
    it("should return 500 on error", () => __awaiter(void 0, void 0, void 0, function* () {
        user_model_1.default.findByPk.mockRejectedValue(new Error("Database error"));
        yield (0, User_controller_1.EditUserInfo)(req, res);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            status: (0, ErrorCode_1.default)("Error Server 500"),
        });
    }));
});
describe("Delete User", () => {
    let res;
    let req;
    beforeEach(() => {
        req = {
            user: {},
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });
    afterEach(() => jest.clearAllMocks());
    test("Return 403", () => __awaiter(void 0, void 0, void 0, function* () {
        req.user = {
            id: 1,
            role: AuthenticationType_1.ROLE.LIBRARIAN,
        };
        yield (0, User_controller_1.DeleteUser)(req, res);
        expect(res.status).toHaveBeenCalledWith(403);
    }));
});

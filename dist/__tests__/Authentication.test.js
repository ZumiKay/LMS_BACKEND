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
const sequelize_1 = require("sequelize");
const Account_controller_1 = require("../controller/Authentication/Account.controller");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorCode_1 = __importDefault(require("../Utilities/ErrorCode"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usersession_model_1 = __importDefault(require("../models/usersession.model"));
const Helper_1 = require("../Utilities/Helper");
const Security_1 = require("../Utilities/Security");
jest.mock("../models/user.model");
jest.mock("../models/Usersession.model");
jest.mock("bcryptjs");
jest.mock("../Utilities/Security");
jest.mock("../Utilities/ErrorCode");
jest.mock("../Utilities/Helper");
describe("Login", () => {
    let req;
    let res;
    beforeEach(() => {
        req = {
            body: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            cookie: jest.fn(),
        };
    });
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    it("User Not Found 404", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { email: "example@gmail.com", password: "12345" };
        user_model_1.default.findOne.mockResolvedValue(null); // Mock no user found
        ErrorCode_1.default.mockReturnValue("Unauthenticated");
        yield (0, Account_controller_1.Login)(req, res);
        expect(user_model_1.default.findOne).toHaveBeenCalledWith({
            where: {
                [sequelize_1.Op.or]: [
                    { email: "example@gmail.com" },
                    {}, // No studentID
                ],
            },
        });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            message: "Wrong Email or Password",
            error: "Unauthenticated",
        });
    }));
    test("should return 200 and set cookies if login is successful", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { email: "test@example.com", password: "password123" };
        const mockUser = {
            id: 1,
            password: "hashedpassword",
            studentID: "12345",
            role: "user",
        };
        user_model_1.default.findOne.mockResolvedValue(mockUser);
        bcryptjs_1.default.compareSync.mockReturnValue(true); // Assume Password is Correct
        Security_1.generateToken
            .mockReturnValueOnce("accessToken")
            .mockReturnValueOnce("refreshToken"); // Mock tokens
        Helper_1.getDateWithOffset.mockReturnValue(new Date());
        yield (0, Account_controller_1.Login)(req, res);
        expect(usersession_model_1.default.create).toHaveBeenCalledWith({
            session_id: "refreshToken",
            userId: mockUser.id,
            expiredAt: expect.any(Date),
        });
        expect(res.cookie).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Logging In" });
    }));
    test("Shoud Return Status 500 if error", () => __awaiter(void 0, void 0, void 0, function* () {
        req.body = { email: "example@gmail.com", password: "12345" };
        user_model_1.default.findOne.mockRejectedValue(new Error("DB Error"));
        yield (0, Account_controller_1.Login)(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: (0, ErrorCode_1.default)("Error Server 500"),
        });
    }));
});
// describe("RefreshToken", () => {
//   let req: any;
//   let res: any;
//   const mockUserSession = {
//     session_id: "valid_refresh_token",
//     expiredAt: new Date(Date.now() + 10000), // Not expired
//   };
//   beforeEach(() => {
//     req = {
//       body: {},
//       headers: {},
//     };
//     res = {
//       status: jest.fn().mockReturnThis(),
//       json: jest.fn(),
//       cookie: jest.fn(),
//     };
//   });
//   afterEach(() => {
//     jest.clearAllMocks(); // Clear mocks between tests
//   });
//   it("should return a 401 error if the token is invalid or expired", async () => {
//     // Mock findOne to return null (invalid or expired session)
//     req.headers = {
//       authorization: "Bearer invalid_token",
//     };
//     (Usersession.findOne as jest.Mock).mockResolvedValueOnce(null);
//     await RefreshToken(req, res);
//     expect(res.status).toHaveBeenCalledWith(401);
//     expect(res.json).toHaveBeenCalledWith({
//       status: ErrorCode("Unauthenticated"),
//     });
//   });
//   it("Should Return New Token if Refresh Token is Valid", async () => {
//     req.headers = {
//       authorization: "Bearer valid_refresh_token",
//     };
//     (Usersession.findOne as jest.Mock).mockResolvedValueOnce(mockUserSession);
//     const mockNewToken = "new_access_token";
//     (generateToken as jest.Mock).mockReturnValue(mockNewToken);
//     await RefreshToken(req, res);
//     expect(Usersession.findOne).toHaveBeenCalledWith({
//       where: {
//         session_id: "valid_refresh_token",
//         expiredAt: { [Op.lt]: expect.any(Date) },
//       },
//     });
//     expect(generateToken).toHaveBeenCalledWith(
//       expect.any(Object),
//       process.env.JWT_SECRET,
//       process.env.ACCESSTOKEN_LIFE
//     );
//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledWith({ data: mockNewToken });
//   });
// });

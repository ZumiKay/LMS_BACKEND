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
const UserValidate_1 = require("../middleware/UserValidate");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthenticationType_1 = require("../Types/AuthenticationType");
const LibraryEntry_controller_1 = __importDefault(require("../controller/TrackFeature/LibraryEntry.controller"));
const user_model_1 = __importDefault(require("../models/user.model"));
jest.mock("../models/user.model");
jest.mock("../models/libraryentry.model");
jest.mock("../models/borrowbook.model");
jest.mock("jsonwebtoken");
const MockUser = {
    id: 1,
    firstname: "zumi",
    lastname: "lock",
    email: "zumi@gmail.com",
    password: "securepassword",
    studentID: "19020119",
    department: {
        faculty: "ICT",
        department: "CS",
    },
    role: AuthenticationType_1.ROLE.STUDENT,
};
describe("Track Feature Test", () => {
    let req;
    let res;
    let next;
    beforeEach(() => {
        next = jest.fn();
        req = {
            body: {},
            headers: {},
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
    });
    afterEach(() => jest.clearAllMocks());
    test("Verify Token", () => __awaiter(void 0, void 0, void 0, function* () {
        req.headers.authorization = "Bearer validtoken";
        jsonwebtoken_1.default.verify.mockResolvedValue({
            id: MockUser.id,
            role: MockUser.role,
        });
        yield (0, UserValidate_1.VerifyToken)(req, res, next);
        expect(next).toHaveBeenCalled();
    }));
    test("Role Check", () => __awaiter(void 0, void 0, void 0, function* () {
        req.user = {
            id: MockUser.id,
            role: AuthenticationType_1.ROLE.LIBRARIAN,
            studentID: MockUser.studentID,
        };
        yield (0, UserValidate_1.IsAdmin)(req, res, next);
        expect(next).toHaveBeenCalled();
    }));
    test("POST /Scan Entry", () => __awaiter(void 0, void 0, void 0, function* () {
        const mockData = {
            url: "https://my.paragoniu.edu.kh/qr?student_id=19020119",
        };
        req.body = mockData;
        user_model_1.default.findOne.mockResolvedValue(MockUser);
        yield (0, LibraryEntry_controller_1.default)(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    }));
    test("");
});

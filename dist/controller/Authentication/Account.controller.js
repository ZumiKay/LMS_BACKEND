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
exports.default = RegisterUser;
exports.Login = Login;
exports.SignOut = SignOut;
exports.RefreshToken = RefreshToken;
exports.SeedAdmin = SeedAdmin;
exports.GetUserSession = GetUserSession;
const AuthenticationType_1 = require("../../Types/AuthenticationType");
const Security_1 = require("../../Utilities/Security");
const user_model_1 = __importDefault(require("../../models/user.model"));
const sequelize_1 = require("sequelize");
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const usersession_model_1 = __importDefault(require("../../models/usersession.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Helper_1 = require("../../Utilities/Helper");
const email_1 = require("../../config/email");
function RegisterUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { firstname, lastname, studentID, departmentID, date_of_birth, phone_number, email, html, role, } = req.body;
            // Validate required fields
            if (!firstname || !lastname || !email || !role || !studentID) {
                return res.status(400).json({ error: "Required fields are missing" });
            }
            const password = (0, Helper_1.GenerateRandomCode)(8);
            const hashedpass = (0, Security_1.HashPassword)(password);
            const isUser = yield user_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        {
                            email: email,
                        },
                        { studentID },
                    ],
                },
            });
            if (isUser) {
                return res.status(400).json({ message: "User Exist" });
            }
            yield user_model_1.default.create({
                firstname,
                lastname,
                studentID: studentID,
                departmentID: departmentID,
                role: role,
                date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
                phone_number: phone_number || null,
                email,
                password: hashedpass,
            });
            //Send Email
            yield (0, email_1.SendEmail)(email, "Login Information", html.replace(":code:", password));
            return res.status(200).json({ message: "User Created" });
        }
        catch (error) {
            console.log("Register Student", error);
            return res.status(500).json((0, ErrorCode_1.default)("Error Server 500"));
        }
    });
}
function Login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ message: "Not Allowed", error: 0 });
            }
            const user = yield user_model_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [{ email }, { studentID: email }],
                },
            });
            if (!user || !bcryptjs_1.default.compareSync(password, user.password)) {
                return res.status(404).json({
                    message: "Wrong Email or Password",
                    error: (0, ErrorCode_1.default)("Unauthenticated"),
                });
            }
            const TokenPayload = {
                id: user.id,
                studentID: user.studentID,
                role: user.role,
            };
            const accessTokenExpire = 10 * 60; // 10 minutes
            const refreshTokenExpire = 2 * 60 * 60; // 2 hours
            const AccessToken = (0, Security_1.generateToken)(TokenPayload, process.env.JWT_SECRET, accessTokenExpire * 1000);
            const RefreshToken = (0, Security_1.generateToken)(TokenPayload, process.env.REFRESH_JWT_SECRET, refreshTokenExpire * 1000);
            // Save login session
            yield usersession_model_1.default.create({
                session_id: RefreshToken,
                userId: user.id,
                expiredAt: (0, Helper_1.getDateWithOffset)(refreshTokenExpire),
            });
            return res.status(200).json({
                message: "Logged In",
                data: {
                    AccessToken,
                    RefreshToken,
                },
            });
        }
        catch (error) {
            console.error("Login User Error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function SignOut(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            if (!token || !req.user) {
                return res.status(400).json({
                    message: "Invalid Parameter",
                    status: (0, ErrorCode_1.default)("Bad Request"),
                });
            }
            const user = yield user_model_1.default.findByPk(req.user.id);
            if (!user) {
                return res.status(404).json({
                    message: "Unauthorized",
                    status: (0, ErrorCode_1.default)("Unauthenticated"),
                });
            }
            yield usersession_model_1.default.destroy({
                where: {
                    [sequelize_1.Op.and]: [{ userId: user.id, session_id: token }],
                },
            });
            return res.status(200).json({ message: "Signed Out" });
        }
        catch (error) {
            console.log("Signout", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
//Token Functions
function RefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = req.body;
            if (!token) {
                return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
            }
            const isValid = yield usersession_model_1.default.findOne({
                where: {
                    session_id: token,
                },
                include: [
                    {
                        model: user_model_1.default,
                        attributes: {
                            include: ["id", "studentID", "role"],
                        },
                    },
                ],
            });
            if (!isValid) {
                return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
            }
            const accessTokenExpire = 10 * 60; //10 minute
            const refreshTokenExpire = 2 * 60 * 60; // 2 hours
            const tokenpayload = {
                id: isValid.userId,
                studentID: isValid.user.studentID,
                role: isValid.user.role,
            };
            const newAccessToken = (0, Security_1.generateToken)(tokenpayload, process.env.JWT_SECRET, accessTokenExpire);
            const newRefreshToken = (0, Security_1.generateToken)(tokenpayload, process.env.REFRESH_JWT_SECRET, refreshTokenExpire);
            yield usersession_model_1.default.update({
                session_id: newRefreshToken,
                expiredAt: new Date(Date.now() + refreshTokenExpire * 1000),
            }, { where: { id: isValid.id } });
            return res.status(200).json({
                message: "Refreshed Token",
                data: {
                    AccessToken: newAccessToken,
                    RefreshToken: newRefreshToken,
                },
            });
        }
        catch (error) {
            console.log("Refresh Token", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function SeedAdmin() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isAdmin = yield user_model_1.default.findOne({ where: { role: AuthenticationType_1.ROLE.LIBRARIAN } });
            if (isAdmin) {
                console.log("Admin Exist");
                return;
            }
            const data = {
                firstname: "Test",
                lastname: "Librarian",
                role: AuthenticationType_1.ROLE.LIBRARIAN,
                studentID: "00000001",
                email: "workzumi@gmail.com",
                password: (0, Security_1.HashPassword)("Kkzumi@001"),
            };
            yield user_model_1.default.create(Object.assign({}, data));
            console.log("Seeded");
        }
        catch (error) {
            console.log("Seed Admin", error);
            return;
        }
    });
}
function GetUserSession(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = req.user;
            const userinfo = yield user_model_1.default.findByPk(user.id, {
                attributes: { exclude: ["password"] },
            });
            if (!userinfo) {
                return res.status(401).json({ status: (0, ErrorCode_1.default)("Unauthenticated") });
            }
            return res.status(200).json({ data: req.user });
        }
        catch (error) {
            console.log("Check Usersession", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

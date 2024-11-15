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
exports.GetUserInfo = GetUserInfo;
exports.EditUserInfo_Admin = EditUserInfo_Admin;
exports.EditUserInfo = EditUserInfo;
exports.DeleteUser = DeleteUser;
exports.DeleteMultipleUser = DeleteMultipleUser;
exports.ForgotPassword = ForgotPassword;
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const AuthenticationType_1 = require("../../Types/AuthenticationType");
const user_model_1 = __importDefault(require("../../models/user.model"));
const department_model_1 = __importDefault(require("../../models/department.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Security_1 = require("../../Utilities/Security");
const email_1 = require("../../config/email");
const Helper_1 = require("../../Utilities/Helper");
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
const libraryentry_model_1 = __importDefault(require("../../models/libraryentry.model"));
const usersession_model_1 = __importDefault(require("../../models/usersession.model"));
const sequelize_1 = require("sequelize");
const UserValidate_1 = require("../../middleware/UserValidate");
const database_1 = __importDefault(require("../../config/database"));
const faculty_model_1 = __importDefault(require("../../models/faculty.model"));
function GetUserInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const param = req.query;
            const user = yield user_model_1.default.findOne({
                where: { id: (param === null || param === void 0 ? void 0 : param.id) ? Number(param.id) : req.user.id },
                include: [{ model: department_model_1.default, as: "department", include: [faculty_model_1.default] }],
                attributes: {
                    exclude: ["password"],
                },
            });
            if (!user) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            return res.status(200).json({ data: user });
        }
        catch (error) {
            console.log("Get User Info", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function EditUserInfo_Admin(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            const updateUser = yield user_model_1.default.update(Object.assign({}, data), { where: { id: data.id } });
            if (updateUser[0] === 0)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            return res.status(200).json({ message: "Update Successfully" });
        }
        catch (error) {
            console.log("Edit User Admin", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function EditUserInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const editdata = req.body;
            const user = yield user_model_1.default.findByPk((_a = editdata.id) !== null && _a !== void 0 ? _a : req.user.id);
            if (!user || !editdata.password) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            const confirmpassword = bcryptjs_1.default.compareSync(editdata.password, user.password);
            if (!confirmpassword)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const role = req.user.role;
            //update user information
            if (editdata.edittype === "other") {
                yield user_model_1.default.update({
                    date_of_birth: editdata.dateofbirth,
                    phone_number: editdata.phonenumber,
                }, {
                    where: {
                        id: (_b = editdata.id) !== null && _b !== void 0 ? _b : req.user.id,
                    },
                });
                return res.status(200).json({ message: "Update Successfully" });
            }
            if (editdata.edittype === "Password" &&
                editdata.password &&
                editdata.newpassword) {
                const isPassword = bcryptjs_1.default.compareSync(editdata.password, user.password);
                const isValid = (0, UserValidate_1.PasswordValidate)(editdata.newpassword);
                if (isValid.errors.length !== 0) {
                    return res.status(400).json({ message: isValid.errors.join("\n") });
                }
                if (!isPassword)
                    res.status(400).json({
                        message: "Wrong Password",
                        status: (0, ErrorCode_1.default)("Bad Request"),
                    });
                const hashednewPassword = (0, Security_1.HashPassword)(editdata.newpassword);
                yield user_model_1.default.update({ password: hashednewPassword }, { where: { id: req.user.id } });
                const refreshToken = req.cookies[process.env.REFRESHTOKEN_COOKIENAME];
                yield usersession_model_1.default.destroy({
                    where: {
                        [sequelize_1.Op.and]: [
                            {
                                id: req.user.id,
                            },
                            { session_id: { [sequelize_1.Op.not]: refreshToken } },
                        ],
                    },
                });
            }
            if (role === "LIBRARIAN") {
                if (editdata.edittype === "AdminName") {
                    yield user_model_1.default.update({ firstname: editdata.firstname, lastname: editdata.lastname }, { where: { id: req.user.id } });
                }
                if (editdata.edittype === "Email")
                    yield user_model_1.default.update({ email: editdata.email }, { where: { id: editdata.studentID } });
                if (editdata.edittype === "ID")
                    yield user_model_1.default.update({ studentID: editdata.studentID }, { where: { studentID: editdata.studentID } });
            }
            else if (role === "STUDENT") {
                if (editdata.edittype === "Name")
                    yield user_model_1.default.update({ firstname: editdata.firstname, lastname: editdata.lastname }, { where: { id: req.user.id } });
            }
            return res.status(200).json({ message: "Update Successfully" });
        }
        catch (error) {
            console.log("Edit User", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const role = req.user.role;
            if (role === AuthenticationType_1.ROLE.LIBRARIAN)
                return res.status(403).json({
                    message: "Can't Delete Admin Account",
                    status: (0, ErrorCode_1.default)("No Access"),
                });
            yield borrowbook_model_1.default.destroy({ where: { userId: req.user.id } });
            yield libraryentry_model_1.default.destroy({ where: { userId: req.user.id } });
            yield usersession_model_1.default.destroy({ where: { userId: req.user.id } });
            yield user_model_1.default.destroy({ where: { id: req.user.id } });
            return res.status(200).json({ message: "Delete Successfully" });
        }
        catch (error) {
            console.log("Delete User", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteMultipleUser(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { uid } = req.body;
        try {
            // Start a transaction
            yield database_1.default.transaction((transaction) => __awaiter(this, void 0, void 0, function* () {
                // Perform all deletions within the transaction
                yield borrowbook_model_1.default.destroy({
                    where: { userId: { [sequelize_1.Op.in]: uid } },
                    transaction,
                });
                yield libraryentry_model_1.default.destroy({
                    where: { userId: { [sequelize_1.Op.in]: uid } },
                    transaction,
                });
                yield usersession_model_1.default.destroy({
                    where: { userId: { [sequelize_1.Op.in]: uid } },
                    transaction,
                });
                yield user_model_1.default.destroy({ where: { id: { [sequelize_1.Op.in]: uid } }, transaction });
            }));
            // Send a success response
            return res.status(200).json({ status: "success" });
        }
        catch (error) {
            console.log("Delete Multiple User", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function ForgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { type, email, code, html, password } = req.body;
            if (!email) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            const user = yield user_model_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            switch (type) {
                case "Request":
                    let generatedCode;
                    let isCodeUnique = false;
                    do {
                        generatedCode = (0, Helper_1.GenerateRandomCode)(6);
                        const existingCode = yield user_model_1.default.findOne({
                            where: { code: generatedCode },
                        });
                        if (!existingCode)
                            isCodeUnique = true;
                    } while (!isCodeUnique);
                    yield (0, email_1.SendEmail)(email, "Reset Password", html.replace(":code:", generatedCode));
                    break;
                case "Verify":
                    const validCode = yield user_model_1.default.findOne({ where: { code } });
                    if (!validCode) {
                        return res
                            .status(403)
                            .json({ message: "Wrong Code", status: (0, ErrorCode_1.default)("No Access") });
                    }
                    break;
                case "Change":
                    if (!password) {
                        return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
                    }
                    const hashedPassword = (0, Security_1.HashPassword)(password);
                    yield user_model_1.default.update({ password: hashedPassword }, { where: { id: user.id } });
                    break;
                default:
                    return res.status(403).json({ status: (0, ErrorCode_1.default)("No Access") });
            }
            return res.status(200).json({ status: "Success" });
        }
        catch (error) {
            console.error("Forgot Password Error:", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

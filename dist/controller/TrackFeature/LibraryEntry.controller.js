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
exports.default = TrackEntry;
exports.GetStudent = GetStudent;
exports.GetStudentFromScan = GetStudentFromScan;
exports.SeedStudentEntry = SeedStudentEntry;
const user_model_1 = __importDefault(require("../../models/user.model"));
const libraryentry_model_1 = __importDefault(require("../../models/libraryentry.model"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const borrowbook_model_1 = __importDefault(require("../../models/borrowbook.model"));
const sequelize_1 = require("sequelize");
const AuthenticationType_1 = require("../../Types/AuthenticationType");
const Helper_1 = require("../../Utilities/Helper");
const department_model_1 = __importDefault(require("../../models/department.model"));
function TrackEntry(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { url } = req.body;
            let id;
            if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
                id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
            }
            else {
                id = url;
            }
            const response = fetch(`${process.env.PARAGONIU_URL}${id}`, {
                method: "GET",
            })
                .then((i) => i.json())
                .catch((err) => res
                .status(400)
                .json({ message: "Invalid Code", status: (0, ErrorCode_1.default)("Bad Request") }));
            const data = (_a = (yield response)) === null || _a === void 0 ? void 0 : _a.data;
            if (data) {
                const id_number = data.id_number;
                const profile_url = data.profile_url;
                const name = data.name;
                const stu = yield user_model_1.default.findOne({
                    where: { studentID: id_number },
                    attributes: {
                        exclude: ["password"],
                    },
                });
                if (stu) {
                    const department = yield department_model_1.default.findOne({
                        where: {
                            department: {
                                [sequelize_1.Op.like]: `%${data.department}`,
                            },
                        },
                    });
                    const dep = department !== null && department !== void 0 ? department : {
                        department: data.department,
                        faculty: { name: data.faculty },
                    };
                    yield libraryentry_model_1.default.create({
                        userId: stu.id,
                    });
                    return res.status(200).json({
                        data: Object.assign(Object.assign({ profile: profile_url, fullname: name }, stu.dataValues), { department: dep }),
                    });
                }
                else {
                    return res
                        .status(404)
                        .json({
                        message: "PLEASE REGISTER THE STUDENT",
                        status: (0, ErrorCode_1.default)("Not Found"),
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function GetStudent(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { page, limit, search, ty, id, role, startdate, endstart, } = req.query;
            const currentpage = Number(page);
            const currentLimit = Number(limit);
            switch (ty) {
                case "user": {
                    const usercount = yield user_model_1.default.count({
                        where: { role: { [sequelize_1.Op.not]: AuthenticationType_1.ROLE.LIBRARIAN } },
                    });
                    const userdata = yield user_model_1.default.findAll({
                        where: Object.assign(Object.assign({ role: { [sequelize_1.Op.not]: AuthenticationType_1.ROLE.LIBRARIAN } }, (search
                            ? {
                                studentID: {
                                    [sequelize_1.Op.eq]: search,
                                },
                            }
                            : {})), (role && { role: role })),
                        limit: currentLimit,
                        offset: (currentpage - 1) * currentLimit,
                        attributes: {
                            include: [
                                "firstname",
                                "lastname",
                                "email",
                                "studentID",
                                "role",
                                "phone_number",
                            ],
                            exclude: ["password", "code"],
                        },
                    });
                    let result = userdata.map((user) => (Object.assign(Object.assign({}, user.dataValues), { entries: [], borrowbooks: [] })));
                    return res.status(200).json({
                        data: result,
                        totalcount: usercount,
                    });
                }
                case "borrowedbook":
                    if (id) {
                        const uid = Number(id);
                        const borrowedbook = yield borrowbook_model_1.default.findAndCountAll({
                            where: {
                                userId: uid,
                            },
                            limit: currentLimit,
                            offset: (currentpage - 1) * currentLimit,
                        });
                        return res
                            .status(200)
                            .json({ data: borrowedbook.rows, totalcount: borrowedbook.count });
                    }
                    break;
                case "entry":
                    if (id) {
                        const uid = Number(id);
                        const entry = yield libraryentry_model_1.default.findAndCountAll({
                            where: Object.assign({ userId: uid }, (startdate || endstart
                                ? {
                                    createdAt: {
                                        [sequelize_1.Op.between]: [new Date(startdate), new Date(endstart)],
                                    },
                                }
                                : {})),
                            limit: currentLimit,
                            offset: (currentpage - 1) * currentLimit,
                        });
                        const result = entry.rows.map((row) => (Object.assign(Object.assign({}, row.dataValues), { createdAt: (0, Helper_1.formatDateToMMDDYYYYHHMMSS)(new Date(row.createdAt)) })));
                        return res
                            .status(200)
                            .json({ data: result, totalcount: entry.count });
                    }
                    break;
                default:
                    break;
            }
            return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
        }
        catch (error) {
            console.log("Get Student", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function GetStudentFromScan(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { url } = req.query;
            if (!url) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            let id;
            if (url.includes("https://my.paragoniu.edu.kh/qr?student_id=")) {
                id = url.replace("https://my.paragoniu.edu.kh/qr?student_id=", "");
            }
            else {
                id = url;
            }
            const response = yield fetch(process.env.PARAGONIU_URL + id, {
                method: "GET",
            });
            const result = yield response.json();
            return res.status(200).json({ data: result.data });
        }
        catch (error) {
            console.log("Fetch ParagonU ID Card", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function SeedStudentEntry() {
    return __awaiter(this, void 0, void 0, function* () {
        yield libraryentry_model_1.default.bulkCreate(Array.from({ length: 5 }).map((i) => ({ userId: 7 })));
        return true;
    });
}

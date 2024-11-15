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
exports.CreateFaculty = CreateFaculty;
exports.DeleteFaculty = DeleteFaculty;
exports.CreateDepartment = CreateDepartment;
exports.EditDepartment = EditDepartment;
exports.DeleteDepartment = DeleteDepartment;
exports.GetDepartment = GetDepartment;
const department_model_1 = __importDefault(require("../../models/department.model"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
const database_1 = __importDefault(require("../../config/database"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const faculty_model_1 = __importDefault(require("../../models/faculty.model"));
function CreateFaculty(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            if (!data.name)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            yield Promise.all(data.name.map((name) => faculty_model_1.default.findOrCreate({ where: { name }, defaults: { name } })));
            return res.status(200).json({ message: "Created" });
        }
        catch (error) {
            console.log("Faculty", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteFaculty(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            yield faculty_model_1.default.destroy({ where: { name: data.name } });
            return res.status(200).json({ message: "Deleted" });
        }
        catch (error) {
            console.log("Delete Faculty", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function CreateDepartment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = req.body;
            if (!data.faculty || !data.department)
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            const faculty = yield faculty_model_1.default.findOne({
                where: { name: data.faculty.name },
            });
            const isDep = yield department_model_1.default.findOne({
                where: { department: data.department },
            });
            if (isDep) {
                return res.status(400).json({
                    message: "Department Exist",
                    status: (0, ErrorCode_1.default)("Bad Request"),
                });
            }
            yield department_model_1.default.create({
                department: data.department,
                facultyID: faculty === null || faculty === void 0 ? void 0 : faculty.id,
            });
            return res.status(200).json({ message: "Create Successfully" });
        }
        catch (error) {
            console.log("Create Department", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function EditDepartment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { id, faculty, department } = req.body;
            if (!id || !faculty || !department) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            // Find the existing department
            const existingDepartment = yield department_model_1.default.findByPk(id);
            if (!existingDepartment) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            const [facultyRecord] = yield faculty_model_1.default.findOrCreate({
                where: { name: faculty },
                defaults: { name: faculty },
            });
            // Update the department
            existingDepartment.department = department;
            existingDepartment.facultyID = facultyRecord.id;
            yield existingDepartment.save();
            return res.status(200).json({ message: "Update Successfully" });
        }
        catch (error) {
            console.error("Edit Department", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function DeleteDepartment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const transaction = yield database_1.default.transaction();
        try {
            const { id } = req.body;
            if (!id) {
                return res.status(400).json({ status: (0, ErrorCode_1.default)("Bad Request") });
            }
            // Check if the department exists
            const department = yield department_model_1.default.findByPk(id);
            if (!department) {
                return res.status(404).json({ status: (0, ErrorCode_1.default)("Not Found") });
            }
            // Find all users associated with this department
            const users = yield user_model_1.default.findAll({ where: { departmentID: id } });
            // Set departmentID to null for each user
            for (const user of users) {
                yield user.update({ departmentID: null }, { transaction });
            }
            // Delete the department
            yield department_model_1.default.destroy({ where: { id }, transaction });
            yield transaction.commit();
            return res.status(200).json({ message: "Delete Successfully" });
        }
        catch (error) {
            console.error("Delete Department", error);
            yield transaction.rollback();
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function GetDepartment(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield faculty_model_1.default.findAll({ include: [department_model_1.default] });
            return res.status(200).json({ data });
        }
        catch (error) {
            console.log("Get Department", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

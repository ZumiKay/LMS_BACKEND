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
exports.GetCategories = GetCategories;
exports.CreateCategory = CreateCategory;
const category_model_1 = __importDefault(require("../../models/category.model"));
const ErrorCode_1 = __importDefault(require("../../Utilities/ErrorCode"));
function GetCategories(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categories = yield category_model_1.default.findAll({
                attributes: {
                    exclude: ["description", "createdAt", "updatedAt"],
                },
            });
            return res.status(200).json({ data: categories });
        }
        catch (error) {
            console.log("Get Categories", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}
function CreateCategory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { data } = req.body;
            yield category_model_1.default.bulkCreate(data.map((i) => ({ name: i })));
            return res.status(200).json({ message: "Create Successfully" });
        }
        catch (error) {
            console.log("Create Category", error);
            return res.status(500).json({ status: (0, ErrorCode_1.default)("Error Server 500") });
        }
    });
}

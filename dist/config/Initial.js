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
const Book_controller_1 = require("../controller/Admin/Book.controller");
const Account_controller_1 = require("../controller/Authentication/Account.controller");
const Books_seeder_1 = require("../seeders/Books.seeder");
const database_1 = __importDefault(require("./database"));
const InitalStartSever = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.sync();
        yield (0, Account_controller_1.SeedAdmin)();
        yield Promise.all(["Action", "Romance", "Astrology", "Health", "Mystery"].map((cate) => (0, Book_controller_1.getgooglebook)(cate)));
        yield (0, Books_seeder_1.SeedPopularBook)();
        console.log("DB Connection Is Connected");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
    }
});
exports.default = InitalStartSever;

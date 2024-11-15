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
exports.SeedPopularBook = void 0;
const book_model_1 = __importDefault(require("../models/book.model"));
const SeedPopularBook = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookIds = [1, 6, 12, 24, 28, 32];
        yield Promise.all(bookIds.map((id) => __awaiter(void 0, void 0, void 0, function* () {
            // Assigning a random borrow_count value between 10 and 100 for variety
            const borrowCount = Math.floor(Math.random() * 91) + 10;
            yield book_model_1.default.update({ borrow_count: borrowCount }, { where: { id } });
        })));
        console.log("Popular books seeded successfully.");
    }
    catch (error) {
        console.log("Seed Popular Book Error:", error);
        return null;
    }
});
exports.SeedPopularBook = SeedPopularBook;

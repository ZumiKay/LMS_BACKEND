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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFromStorage = exports.UploadToStorage = void 0;
const blob_1 = require("@vercel/blob");
const UploadToStorage = (file, name) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blob = yield (0, blob_1.put)(name, file, { access: "public" });
        return blob;
    }
    catch (error) {
        console.log("Upload to storage", error);
        return null;
    }
});
exports.UploadToStorage = UploadToStorage;
const DeleteFromStorage = (fileurl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, blob_1.del)(fileurl);
    }
    catch (error) {
        console.log("Delete from storage", error);
        throw error;
    }
});
exports.DeleteFromStorage = DeleteFromStorage;

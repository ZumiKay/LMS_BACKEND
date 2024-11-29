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
const InitalStartSever = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await sequelize.sync();
        // await SeedAdmin();
        // await Promise.all(
        //   ["Action", "Romance", "Astrology", "Health", "Mystery"].map((cate) =>
        //     getgooglebook(cate)
        //   )
        // );
        // await SeedPopularBook();
        console.log("DB Connection Is Connected");
    }
    catch (error) {
        console.error("Unable to connect to the database:", error);
    }
});
exports.default = InitalStartSever;

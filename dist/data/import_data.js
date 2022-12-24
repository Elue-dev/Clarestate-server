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
const fs_1 = __importDefault(require("fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const property_model_1 = __importDefault(require("../models/schemas/property_model"));
dotenv_1.default.config();
const properties = JSON.parse(fs_1.default.readFileSync(`${__dirname}/properties.json`, "utf-8"));
const database = process.env.DATABASE;
mongoose_1.default
    .connect(database)
    .then(() => console.log("DB Connected Successfully!"));
const importData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield property_model_1.default.create(properties);
    }
    catch (error) {
        console.log(error);
    }
    process.exit(1);
});
const deleteData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield property_model_1.default.deleteMany();
    }
    catch (error) {
        console.log(error);
    }
    process.exit(1);
});
if (process.argv[2] === "--import") {
    importData();
}
else if (process.argv[2] === "--delete") {
    deleteData();
}

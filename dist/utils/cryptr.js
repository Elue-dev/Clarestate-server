"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cryptr = void 0;
const cryptr_1 = __importDefault(require("cryptr"));
exports.cryptr = new cryptr_1.default("process.env.CRYPTR_KEYasstring");

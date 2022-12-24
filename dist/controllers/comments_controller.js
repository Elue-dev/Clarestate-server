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
exports.gettAllComments = exports.createComment = void 0;
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const comments_model_1 = __importDefault(require("../models/schemas/comments_model"));
exports.createComment = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newReview = yield comments_model_1.default.create(req.body);
    // res.status(201).json({
    //   status: "success",
    //   review: newReview,
    // });
}));
exports.gettAllComments = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const newReview = yield comments_model_1.default.create(req.body);
    // res.status(201).json({
    //   status: "success",
    //   review: newReview,
    // });
}));

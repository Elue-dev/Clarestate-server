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
exports.deleteComment = exports.updateComment = exports.getSingleComment = exports.gettAllComments = exports.createComment = void 0;
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const global_error_1 = require("../utils/global_error");
const comments_model_1 = __importDefault(require("../models/schemas/comments_model"));
exports.createComment = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { comment, user, property } = req.body;
    if (!comment || !user || !property) {
        return next(new global_error_1.GlobalError("comment, user and property are all required", 400));
    }
    const newComment = yield comments_model_1.default.create(req.body);
    res.status(201).json({
        status: "success",
        comment: newComment,
    });
}));
exports.gettAllComments = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = yield comments_model_1.default.find().sort("-createdAt");
    res.status(200).json({
        status: "success",
        comments,
    });
}));
exports.getSingleComment = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentID } = req.params;
    const comment = yield comments_model_1.default.findById(commentID);
    if (!comment) {
        return next(new global_error_1.GlobalError("Comment not found", 404));
    }
    res.status(200).json({
        status: "success",
        comment,
    });
}));
exports.updateComment = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentID } = req.params;
    const comment = yield comments_model_1.default.findById(commentID);
    if (!comment) {
        return next(new global_error_1.GlobalError("Comment not found", 404));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== comment.user.toString()) {
        return next(new global_error_1.GlobalError("You can only update comments you added", 401));
    }
    const newComment = yield comments_model_1.default.findByIdAndUpdate(commentID, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        message: "Comment updated successfully",
        newComment,
    });
}));
exports.deleteComment = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentID } = req.params;
    const comment = yield comments_model_1.default.findById(commentID);
    if (!comment) {
        return next(new global_error_1.GlobalError("Comment not found", 404));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== comment.user.toString()) {
        return next(new global_error_1.GlobalError("You can only delete comments you added", 401));
    }
    yield comments_model_1.default.findByIdAndDelete(commentID);
    res.status(200).json({
        status: "success",
        message: "Comment deleted successfully",
    });
}));

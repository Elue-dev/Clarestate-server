"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const commentSchema = new mongoose_1.default.Schema({
    comment: {
        type: String,
        required: [true, "Your comment is required"],
    },
    property: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Tour",
        required: [true, "A comment must belong to a property"],
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A comment must belong to a user"],
    },
});
const Comment = mongoose_1.default.model("comment", commentSchema);
exports.default = Comment;

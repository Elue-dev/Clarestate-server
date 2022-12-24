"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const reviewSchema = new mongoose_1.default.Schema({
    review: {
        type: String,
        required: [true, "Please leave your review"],
    },
    rating: {
        type: Number,
        min: [1, "A property must have a rating of at least 1"],
        max: [5, "A property cannot have a rating of more than 5"],
        required: [true, "Please leave a rating"],
    },
    property: {
        //parent referencing
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Tour",
        required: [true, "A review must belong to a property"],
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "A review must belong to a user"],
    },
});
const Review = mongoose_1.default.model("review", reviewSchema);
exports.default = Review;

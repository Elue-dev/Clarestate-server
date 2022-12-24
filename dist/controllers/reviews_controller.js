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
exports.deleteReview = exports.updateReview = exports.getSingleReview = exports.getAllReviews = exports.createReview = void 0;
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const global_error_1 = require("../utils/global_error");
const reviews_model_1 = __importDefault(require("../models/schemas/reviews_model"));
exports.createReview = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { review, rating, user, property } = req.body;
    if (!review || !rating || !user || !property) {
        return next(new global_error_1.GlobalError("Please provide all required fields", 400));
    }
    const newReview = yield reviews_model_1.default.create(req.body);
    res.status(201).json({
        status: "success",
        review: newReview,
    });
}));
exports.getAllReviews = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield reviews_model_1.default.find().sort("-createdAt");
    res.status(200).json({
        status: "success",
        results: reviews.length,
        reviews,
    });
}));
exports.getSingleReview = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewID } = req.params;
    const review = yield reviews_model_1.default.findById(reviewID);
    if (!review) {
        return next(new global_error_1.GlobalError("Review not found", 400));
    }
    res.status(200).json({
        status: "success",
        review,
    });
}));
exports.updateReview = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewID } = req.params;
    const review = yield reviews_model_1.default.findById(reviewID);
    if (!review) {
        return next(new global_error_1.GlobalError("Review not found", 404));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== review.user.toString()) {
        return next(new global_error_1.GlobalError("You can only update reviews you added", 401));
    }
    if (req.body.user || req.body.property || req.body.id || req.body._id) {
        return next(new global_error_1.GlobalError("Only review and rating can be changed", 400));
    }
    const updatedReview = yield reviews_model_1.default.findByIdAndUpdate(reviewID, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        message: "Review updated successfully",
        updatedReview,
    });
}));
exports.deleteReview = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { reviewID } = req.params;
    const review = yield reviews_model_1.default.findById(reviewID);
    if (!review) {
        return next(new global_error_1.GlobalError("Review not found", 404));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== review.user.toString()) {
        return next(new global_error_1.GlobalError("You can only delete reviews you added", 401));
    }
    yield reviews_model_1.default.findByIdAndDelete(reviewID);
    res.status(200).json({
        status: "success",
        message: "Review deleted successfully",
    });
}));

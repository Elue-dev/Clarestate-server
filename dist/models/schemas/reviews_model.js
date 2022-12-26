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
const mongoose_1 = __importDefault(require("mongoose"));
const property_model_1 = __importDefault(require("./property_model"));
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
        ref: "property",
        required: [true, "A review must belong to a property"],
    },
    user: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "user",
        required: [true, "A review must belong to a user"],
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
reviewSchema.index({ property: 1, user: 1 }, { unique: true });
reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
        select: "first_name last_name photo",
    });
    next();
});
reviewSchema.statics.calcAverageRatings = function (propertyID) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(propertyID);
        const ratingStats = yield this.aggregate([
            {
                $match: { property: propertyID },
            },
            {
                $group: {
                    _id: "$property",
                    nRating: { $sum: 1 },
                    avgRating: { $avg: "$rating" },
                },
            },
        ]);
        console.log(ratingStats);
        if (ratingStats.length > 0) {
            yield property_model_1.default.findByIdAndUpdate(propertyID, {
                ratingsQuantity: ratingStats[0].nRating,
                ratingsAverage: ratingStats[0].avgRating,
            });
        }
        else {
            yield property_model_1.default.findByIdAndUpdate(propertyID, {
                ratingsQuantity: 0,
                ratingsAverage: 4.5,
            });
        }
    });
};
reviewSchema.post("save", function () {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        yield this.constructor.calcAverageRatings(this.property);
    });
});
reviewSchema.pre(/^findByIdAnd/, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        this.rev = yield this.findOne();
        //@ts-ignore
        console.log(this.rev);
        next();
    });
});
reviewSchema.post(/^findByIdAnd/, function () {
    return __awaiter(this, void 0, void 0, function* () {
        //@ts-ignore
        yield this.rev.constructor.calcAverageRatings(this.rev.property);
    });
});
const Review = mongoose_1.default.model("review", reviewSchema);
exports.default = Review;

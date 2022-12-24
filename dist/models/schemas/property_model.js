"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const slugify_1 = __importDefault(require("slugify"));
const propertySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Property name is required"],
        trim: true,
        unique: true,
    },
    price: {
        type: Number,
        required: [true, "Property price is required"],
    },
    location: {
        type: String,
        required: [true, "Property location is required"],
        trim: true,
    },
    images: {
        type: [String],
        required: [true, "Images of property is required"],
        // default: {},
    },
    features: {
        type: [String],
        required: [true, "Please specify key features of this property"],
    },
    availability: {
        type: String,
        required: [true, "Please specify the availability of this property"],
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, "A property must have a rating of at least 1"],
        max: [5, "A property cannot have a rating of more than 5"],
    },
    ratingsQuantity: {
        type: Number,
        default: 0,
    },
    purpose: {
        type: String,
        required: [true, "Please specify the purpose of this property"],
        enum: {
            values: ["Sale", "Rent", "Shortlet"],
            message: "Propery purpose must be one of the following: Sale, Rent or Shortlet",
        },
    },
    description: {
        type: String,
        trim: true,
        required: [true, "A property must have a description"],
    },
    bedrooms: {
        type: Number,
        required: [true, "Please specify the number of bedrooms"],
    },
    bathrooms: {
        type: Number,
        required: [true, "Please specify the number of bathrooms"],
    },
    toilets: {
        type: Number,
        required: [true, "Please specify the number of toilets"],
    },
    agentName: {
        type: String,
        required: [true, "Please specify the agent name"],
    },
    agentContact: {
        type: String,
        required: [true, "Please specify the agent contact"],
    },
    addedBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    slug: String,
});
propertySchema.pre("save", function (next) {
    this.slug = (0, slugify_1.default)(this.name, { lower: true });
    next();
});
const Property = mongoose_1.default.model("property", propertySchema);
exports.default = Property;

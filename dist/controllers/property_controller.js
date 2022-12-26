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
exports.uplodaProperyPhotos = exports.getPropertyReviews = exports.deleteProperty = exports.updateProperty = exports.getSingleProperty = exports.getAllProperties = exports.createProperty = void 0;
const property_model_1 = __importDefault(require("../models/schemas/property_model"));
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const file_upload_1 = require("../utils/file_upload");
const global_error_1 = require("../utils/global_error");
const api_features_1 = require("../services/api_features");
const reviews_model_1 = __importDefault(require("../models/schemas/reviews_model"));
const app_1 = require("../app");
const cloud = cloudinary_1.default.v2;
exports.createProperty = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    cloud.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDINARY_KEY,
        api_secret: process.env.CLOUDINARY_SECRET,
    });
    let uploadedFiles = [];
    req.body.images = [];
    yield Promise.all(
    // @ts-ignore
    req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        uploadedFiles = yield cloud.uploader.upload(file.path, {
            folder: "Clarestate",
            resource_type: "image",
        });
        yield req.body.images.push(uploadedFiles.secure_url);
    })));
    const property = yield property_model_1.default.create(req.body);
    res.status(201).json({
        status: "success",
        property,
    });
}));
exports.getAllProperties = (0, handle_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const cachedProperties = yield app_1.redisClient.get("clarProp");
    if (cachedProperties) {
        return res.status(200).json({
            status: "success from redis",
            // results: cachedProperties.length,
            properties: JSON.parse(cachedProperties),
        });
    }
    //@ts-ignore
    const features = new api_features_1.APIFeatures(property_model_1.default.find(), req.query)
        .filter()
        .sort()
        .limitFields();
    //@ts-ignore
    const properties = yield features.query;
    yield app_1.redisClient.set("clarProp", JSON.stringify(properties));
    res.status(200).json({
        status: "success",
        // results: properties.length,
        properties,
    });
}));
exports.getSingleProperty = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    //@ts-ignore
    const cachedProperty = yield app_1.redisClient.get(slug);
    if (cachedProperty) {
        return res.status(200).json({
            status: "success",
            property: JSON.parse(cachedProperty),
        });
    }
    const property = yield property_model_1.default.findOne({ slug })
        .populate("reviews")
        .populate("comments");
    yield app_1.redisClient.set(slug, JSON.stringify(property));
    if (!property) {
        return next(new global_error_1.GlobalError("Property not found", 404));
    }
    res.status(200).json({
        status: "success",
        property,
    });
}));
exports.updateProperty = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyID } = req.params;
    if (req.body.id || req.body._id) {
        return next(new global_error_1.GlobalError("property ID cannot be modified", 404));
    }
    //@ts-ignore
    const property = yield property_model_1.default.findByIdAndUpdate(propertyID, req.body, {
        new: true,
        runValidators: true,
    });
    if (!property) {
        return next(new global_error_1.GlobalError("Property not found", 404));
    }
    res.status(200).json({
        status: "success",
        message: "Property updated successfully",
        property,
    });
}));
exports.deleteProperty = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyID } = req.params;
    if (req.body.id || req.body._id) {
        return next(new global_error_1.GlobalError("property ID cannot be modified", 404));
    }
    const property = yield property_model_1.default.findById(propertyID);
    if (!property) {
        return next(new global_error_1.GlobalError("Property not found", 404));
    }
    //@ts-ignore
    if (property.addedBy !== req.user._id && req.user.role !== "admin") {
        return next(new global_error_1.GlobalError("You can only delete properties you added", 401));
    }
    yield property_model_1.default.findByIdAndDelete(propertyID);
    res.status(200).json({
        status: "success",
        message: "Property deleted successfully",
    });
}));
exports.getPropertyReviews = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { propertyID } = req.params;
    const review = reviews_model_1.default.findById(propertyID);
    res.status(200).json({
        status: "success",
        message: "Property deleted successfully",
    });
}));
exports.uplodaProperyPhotos = file_upload_1.upload.array("images", 6);

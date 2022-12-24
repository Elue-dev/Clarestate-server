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
exports.uplodaProperyPhotos = exports.getAllProperties = exports.createProperty = void 0;
const property_model_1 = __importDefault(require("../models/schemas/property_model"));
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const file_upload_1 = require("../utils/file_upload");
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
    res.status(200).json({
        status: "success",
        property,
    });
}));
exports.getAllProperties = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let queryObj = Object.assign({}, req.query);
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt|ne|eq)\b/g, (match) => `$${match}`);
    let query = property_model_1.default.find(JSON.parse(queryString));
    if (req.query.sort) {
        //@ts-ignore
        const sortBy = req.query.sort.split(",").join(" ");
        query = query.sort(sortBy);
    }
    else {
        query = query.sort("-createdAt");
    }
    if (req.query.fields) {
        //@ts-ignore
        const fields = req.query.fields.split(",").join(" ");
        query = query.select(fields);
    }
    else {
        query = query.select("-__v");
    }
    const properties = yield query;
    res.status(200).json({
        status: "success",
        results: properties.length,
        properties,
    });
}));
exports.uplodaProperyPhotos = file_upload_1.upload.array("images", 6);

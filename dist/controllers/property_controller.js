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
    // let file_data = {};
    let uploadedFiles = [];
    req.body.images = [];
    console.log("running");
    yield Promise.all(
    // @ts-ignore
    req.files.map((file) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("running.....");
        uploadedFiles = yield cloud.uploader.upload(file.path, {
            folder: "Clarestate",
            resource_type: "image",
        });
        let imagesArray = [];
        // await imagesArray.push(uploadedFiles.secure_url);
        // console.log(imagesArray);
        yield req.body.images.push(uploadedFiles.secure_url);
    })));
    const property = yield property_model_1.default.create(req.body);
    res.status(200).json({
        status: "success",
        property,
    });
}));
exports.getAllProperties = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const properties = yield property_model_1.default.find().sort("-createdAt");
    res.status(200).json({
        status: "success",
        results: properties.length,
        properties,
    });
}));
exports.uplodaProperyPhotos = file_upload_1.upload.array("images", 6);

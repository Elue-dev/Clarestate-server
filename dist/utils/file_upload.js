"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileSizeFormatter = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const global_error_1 = require("./global_error");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "server/uploads");
    },
    filename: function (req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true);
    }
    else {
        cb(new global_error_1.GlobalError("Not an image, Please upload only images", 400), false);
    }
};
exports.upload = (0, multer_1.default)({ storage, fileFilter });
const fileSizeFormatter = (bytes, decimal) => {
    if (bytes === 0) {
        return "0 Bytes";
    }
    const dm = decimal || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "YB", "ZB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return (parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + " " + sizes[index]);
};
exports.fileSizeFormatter = fileSizeFormatter;

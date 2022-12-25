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
exports.deleteUser = exports.deleteLoggedInUser = exports.getLoggedInUser = exports.updateLoggedInUser = exports.updateUser = exports.getSingleUser = exports.getAllUsers = void 0;
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
const email_service_1 = __importDefault(require("../services/email_service"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const delete_account_1 = require("../views/delete_account");
exports.getAllUsers = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield user_model_1.default.find().sort("-createdAt");
    console.log("start");
    res.status(200).json({
        status: "success",
        results: users.length,
        users,
    });
}));
exports.getSingleUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.params;
    const user = yield user_model_1.default.findById(userID);
    if (!user) {
        return next(new global_error_1.GlobalError("No user with that id exists", 404));
    }
    res.status(200).json({
        status: "success",
        data: user,
    });
}));
exports.updateUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.params;
    const { isVerified } = req.body;
    const user = yield user_model_1.default.findById(userID);
    if (!user) {
        return next(new global_error_1.GlobalError("No user with that id exists", 404));
    }
    if (isVerified) {
        return next(new global_error_1.GlobalError("You are not allowed to change user verification status", 401));
    }
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(userID, req.body, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        updatedUser,
    });
}));
exports.updateLoggedInUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user._id);
    const { username, email, bio, photo, phone } = req.body;
    if (!user) {
        return next(new global_error_1.GlobalError("User not found", 404));
    }
    if (!username && !email && !bio && !phone && !photo) {
        return next(new global_error_1.GlobalError("Please provide fields you want to update", 400));
    }
    if (req.body.password) {
        return next(new global_error_1.GlobalError("This route is not for password updates. Please use the forgot password route", 400));
    }
    const filteredBody = filteredObj(req.body, "username", "email", "photo", "bio", "phone");
    const updatedUser = yield user_model_1.default.findByIdAndUpdate(
    //@ts-ignore
    req.user._id, filteredBody, {
        new: true,
        runValidators: true,
    });
    res.status(200).json({
        status: "success",
        updatedUser,
    });
}));
exports.getLoggedInUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user._id).select("+active");
    if (!user) {
        return next(new global_error_1.GlobalError("User not found", 404));
    }
    res.status(200).json({
        status: "success",
        user,
    });
}));
exports.deleteLoggedInUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user._id).select("+active");
    if (!user) {
        return next(new global_error_1.GlobalError("User not found", 404));
    }
    if (!user.active) {
        return next(new global_error_1.GlobalError("User already deleted", 404));
    }
    user.active = false;
    yield user.save();
    const subject = `Notification on deleted account`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, delete_account_1.deleteAccount)(user.first_name);
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: "User sucessfully deleted",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.deleteUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.params;
    const user = yield user_model_1.default.findById(userID).select("+active");
    if (!user) {
        return next(new global_error_1.GlobalError("No user with that id exists", 404));
    }
    if (!user.active) {
        return next(new global_error_1.GlobalError("User already deleted", 404));
    }
    user.active = false;
    yield user.save();
    res.status(200).json({
        status: "success",
        message: "User sucessfully deleted",
    });
}));
//@ts-ignore
const filteredObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((val) => {
        if (allowedFields.includes(val)) {
            //@ts-ignore
            newObj[val] = obj[val];
        }
    });
    return newObj;
};

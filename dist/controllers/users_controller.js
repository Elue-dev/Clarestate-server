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
exports.deleteUser = exports.deleteLoggedInUser = exports.getLoggedInUser = exports.updateUser = exports.getSingleUser = exports.getAllUsers = void 0;
const app_1 = require("../app");
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
const email_service_1 = __importDefault(require("../services/email_service"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const delete_account_email_1 = require("../views/delete_account_email");
exports.getAllUsers = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const cachedUsers = yield app_1.redisClient.get("clarUsers");
    if (cachedUsers) {
        return res.status(200).json({
            status: "success RED",
            user: JSON.parse(cachedUsers),
        });
    }
    const users = yield user_model_1.default.find({ active: { $ne: false } })
        .sort("-createdAt")
        .select("+active");
    yield app_1.redisClient.set("clarUsers", JSON.stringify(users));
    res.status(200).json({
        status: "success",
        users,
    });
}));
exports.getSingleUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.params;
    //@ts-ignore
    const cachedUser = yield app_1.redisClient.get(userID);
    if (cachedUser) {
        return res.status(200).json({
            status: "success",
            user: JSON.parse(cachedUser),
        });
    }
    const user = yield user_model_1.default.findOne({
        _id: userID,
        active: { $ne: false },
    });
    yield app_1.redisClient.set(userID, JSON.stringify(user));
    if (!user) {
        return next(new global_error_1.GlobalError("No user found", 404));
    }
    res.status(200).json({
        status: "success",
        user,
    });
}));
exports.updateUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userID } = req.params;
    const { isVerified } = req.body;
    const user = yield user_model_1.default.findOne({
        _id: userID,
        active: { $ne: false },
    });
    if (!user) {
        return next(new global_error_1.GlobalError("No user found", 404));
    }
    if (isVerified) {
        return next(new global_error_1.GlobalError("You are not allowed to change user verification status", 401));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== userID &&
        //@ts-ignore
        req.user.role !== "admin") {
        return next(new global_error_1.GlobalError("You can only update your own account", 401));
    }
    if (req.body.password) {
        return next(new global_error_1.GlobalError("This route is not for password updates. Please use the forgot password route", 400));
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
exports.getLoggedInUser = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user._id).select("+active");
    if (!user || !user.active) {
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
    if (!user || !user.active) {
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
    const body = (0, delete_account_email_1.deleteAccount)(user.first_name);
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
    const user = yield user_model_1.default.findOne({
        _id: userID,
        active: { $ne: false },
    });
    if (!user) {
        return next(new global_error_1.GlobalError("No user found", 404));
    }
    if (
    //@ts-ignore
    req.user._id.toString() !== userID &&
        //@ts-ignore
        req.user.role !== "admin") {
        return next(new global_error_1.GlobalError("You can only delete your own account", 401));
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

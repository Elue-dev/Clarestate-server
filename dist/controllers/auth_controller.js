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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/database/user_model"));
const auth_service_1 = require("../service/auth_service");
const email_handler_1 = __importDefault(require("../service/email_handler"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
exports.signup = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return next(new global_error_1.GlobalError("Please fill in all required fields", 400));
    }
    if (!(0, auth_service_1.validateEmail)(email)) {
        return next(new global_error_1.GlobalError("Please enter a valid email address", 400));
    }
    const userExists = yield user_model_1.default.findOne({ email });
    if (userExists) {
        return next(new global_error_1.GlobalError("Email already in use", 400));
    }
    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    const user = yield user_model_1.default.create({
        username,
        email,
        password,
        verificationCode,
    });
    const subject = "Welcome to Clarestate!";
    const message = `Login code is ${verificationCode}`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@clarestate.com";
    (0, email_handler_1.default)({ subject, message, send_to, sent_from, reply_to });
    res.status(201).json({
        status: "success",
        message: "Check your email for a verification code",
    });
}));
exports.login = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ status: "success" });
}));
exports.forgotPassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ status: "success" });
}));
exports.resetPassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ status: "success" });
}));
exports.updatePassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({ status: "success" });
}));

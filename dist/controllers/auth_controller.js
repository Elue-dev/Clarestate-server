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
exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyCode = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
const auth_service_1 = require("../services/auth_service");
const email_service_1 = __importDefault(require("../services/email_service"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const verification_email_1 = require("../views/verification_email");
const cryptr_1 = __importDefault(require("cryptr"));
const verification_success_1 = require("../views/verification_success");
const cryptr = new cryptr_1.default("kjsdbhcgEVWdcqwdqwfdqwe");
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
    const code = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = code.toString();
    const encryptedCode = cryptr.encrypt(verificationCode);
    const user = yield user_model_1.default.create({
        username,
        email,
        password,
        verificationCode: encryptedCode,
        codeExpires: Date.now() + 60 * (60 * 1000),
    });
    const subject = "Verify Your Email";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@clarestate.com";
    const url = `https://test.com/${user._id}`;
    const body = (0, verification_email_1.verificationEmail)(user.username, verificationCode, url);
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            userID: user._id,
            message: `A verification code has been sent to ${email}`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. please try again!`,
        });
    }
}));
exports.verifyCode = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    const { userID } = req.params;
    if (!code) {
        return next(new global_error_1.GlobalError("Please provide your verification code", 400));
    }
    const user = yield user_model_1.default.findOne({
        _id: userID,
        codeExpires: { $gt: Date.now() },
    });
    if (!user) {
        return next(new global_error_1.GlobalError("Email already verified", 400));
    }
    const decryptedCode = cryptr.decrypt(user.verificationCode);
    if (decryptedCode !== code) {
        return next(new global_error_1.GlobalError("Invalid or expired verification code", 400));
    }
    user.verificationCode = undefined;
    user.isVerified = true;
    user.codeExpires = undefined;
    yield user.save();
    const subject = `Welcome Onboard, ${user.username}!`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = "noreply@clarestate.com";
    const body = (0, verification_success_1.verificationSuccess)(user.username);
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. please try again!`,
        });
    }
    (0, auth_service_1.createAndSendToken)(user, 201, res);
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

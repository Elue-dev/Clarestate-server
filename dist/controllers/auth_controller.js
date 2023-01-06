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
exports.emergencyResetPassword = exports.updatePassword = exports.resetPassword = exports.forgotPassword = exports.logout = exports.login = exports.sendVerificationCode = exports.verifyCode = exports.signup = void 0;
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
const auth_service_1 = require("../services/auth_service");
const email_service_1 = __importDefault(require("../services/email_service"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const verification_email_1 = require("../views/verification_email");
const crypto_1 = require("crypto");
const token_model_1 = __importDefault(require("../models/schemas/token_model"));
const verification_success_email_1 = require("../views/verification_success_email");
const cryptr_1 = require("../utils/cryptr");
const reset_email_1 = require("../views/reset_email");
const reset_success_email_1 = require("../views/reset_success_email");
const ua_parser_js_1 = __importDefault(require("ua-parser-js"));
const update_success_email_1 = require("../views/update_success_email");
exports.signup = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { first_name, last_name, email, password, phone } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return next(new global_error_1.GlobalError("Please fill in all required fields", 400));
    }
    if (!(0, auth_service_1.validateEmail)(email)) {
        return next(new global_error_1.GlobalError("Please enter a valid email address", 400));
    }
    const emailExists = yield user_model_1.default.findOne({ email });
    if (emailExists) {
        return next(new global_error_1.GlobalError("Email already in use", 400));
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = code.toString();
    const encryptedCode = cryptr_1.cryptr.encrypt(verificationCode);
    const user = yield user_model_1.default.create({
        first_name,
        last_name,
        email,
        password,
        phone,
        active: false,
        verificationCode: encryptedCode,
        codeExpires: Date.now() + 60 * (60 * 1000),
    });
    const subject = "Verify Your Email";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, verification_email_1.verificationEmail)({
        username: user.first_name,
        verificationCode,
    });
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
        return next(new global_error_1.GlobalError("Email already verified or account dosen't exist", 404));
    }
    const decryptedCode = cryptr_1.cryptr.decrypt(user === null || user === void 0 ? void 0 : user.verificationCode);
    if (decryptedCode !== code) {
        return next(new global_error_1.GlobalError("Invalid or expired verification code", 400));
    }
    user.verificationCode = undefined;
    user.codeExpires = undefined;
    user.isVerified = true;
    user.active = true;
    yield user.save();
    const subject = `Welcome Onboard, ${user.first_name}!`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, verification_success_email_1.verificationSuccess)(user.last_name);
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
    (0, auth_service_1.createAndSendToken)(user, 201, res, "verified");
}));
exports.sendVerificationCode = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return next(new global_error_1.GlobalError("Please provide your email", 400));
    }
    const user = yield user_model_1.default.findOne({ email });
    //@ts-ignore
    if (!user) {
        return next(new global_error_1.GlobalError("Account dosen't exist", 400));
    }
    else if (user.isVerified) {
        return next(new global_error_1.GlobalError("Email already verified", 400));
    }
    const code = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = code.toString();
    const encryptedCode = cryptr_1.cryptr.encrypt(verificationCode);
    //@ts-ignore
    user.verificationCode = encryptedCode;
    //@ts-ignore
    user.codeExpires = Date.now() + 60 * (60 * 1000);
    //@ts-ignore
    yield user.save();
    const subject = `${user.last_name}, you requested a verification code`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, verification_email_1.verificationEmail)({
        username: user.first_name,
        verificationCode,
    });
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: `A verification code has been sent to ${user.email}`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. please try again!`,
        });
    }
}));
exports.login = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) {
        return next(new global_error_1.GlobalError("Email or phone number and password are both required", 400));
    }
    const user = yield user_model_1.default.findOne({
        $or: [{ email: emailOrPhone.trim() }, { phone: emailOrPhone.trim() }],
    })
        .select("+password")
        .select("+userAgents");
    if (!user || !(yield user.correctPassword(password, user.password))) {
        return next(new global_error_1.GlobalError("Invalid credentials provided", 400));
    }
    const userAgent = (0, ua_parser_js_1.default)(req.headers["user-agent"]);
    if (!user.userAgents.includes(userAgent.ua)) {
        user.userAgents.push(userAgent.ua);
    }
    yield user.save();
    //@ts-ignore
    user === null || user === void 0 ? void 0 : user.userAgents = undefined;
    (0, auth_service_1.createAndSendToken)(user, 200, res, "login");
}));
exports.logout = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("token", "", {
        //@ts-ignore
        expires: Number(new Date(Date.now() * 10 * 1000)),
        httpOnly: true,
    });
    res.status(200).json({
        status: "success",
        message: "Logout successful",
    });
}));
exports.forgotPassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        return next(new global_error_1.GlobalError("Please provide your email address", 400));
    }
    const existingUser = yield user_model_1.default.findOne({ email });
    if (!existingUser) {
        return next(new global_error_1.GlobalError("That email is not registered", 404));
    }
    const resetToken = (0, crypto_1.randomBytes)(32).toString("hex") + existingUser._id;
    const hashedToken = (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex");
    yield new token_model_1.default({
        userId: existingUser._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
    }).save();
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    const subject = `Password Reset Request`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, reset_email_1.passwordResetEmail)({
        username: existingUser.first_name,
        token: resetToken,
        url: resetUrl,
    });
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: `An email has been sent to ${email} with instructions
        to reset your password`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.resetPassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword, confirmNewPassword } = req.body;
    const { token } = req.params;
    if (!newPassword || !confirmNewPassword) {
        return next(new global_error_1.GlobalError("Please provide all password credentials", 400));
    }
    if (newPassword !== confirmNewPassword) {
        return next(new global_error_1.GlobalError("New password credentials do not match", 400));
    }
    const hashedToken = (0, crypto_1.createHash)("sha256").update(token).digest("hex");
    const existingToken = yield token_model_1.default.findOne({
        token: hashedToken,
        expiresAt: { $gt: Date.now() },
    });
    if (!existingToken) {
        return next(new global_error_1.GlobalError("Invalid or expired token", 400));
    }
    const user = yield user_model_1.default.findOne({ _id: existingToken.userId });
    //@ts-ignore
    user.password = newPassword;
    //@ts-ignore
    yield user.save();
    yield token_model_1.default.deleteOne({ token: hashedToken });
    const userAgent = (0, ua_parser_js_1.default)(req.headers["user-agent"]);
    const browser = userAgent.browser.name || "Not detected";
    const OS = `${userAgent.os.name || "Not detected"} (${userAgent.os.version || "Not detected"})`;
    const subject = `${user === null || user === void 0 ? void 0 : user.first_name}, Your password was successfully reset`;
    const send_to = user === null || user === void 0 ? void 0 : user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, reset_success_email_1.resetSuccess)({
        //@ts-ignore
        username: user === null || user === void 0 ? void 0 : user.last_name,
        //@ts-ignore
        browser,
        OS,
    });
    try {
        //@ts-ignore
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: `Password reset successful!`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.updatePassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user.id).select("+password");
    if (!oldPassword || !newPassword || !confirmNewPassword) {
        return next(new global_error_1.GlobalError("Please provide all 3 password credentials", 400));
    }
    //@ts-ignore
    if (!(yield user.correctPassword(oldPassword, user.password))) {
        return next(new global_error_1.GlobalError("Old password is incorrect", 400));
    }
    if (oldPassword === newPassword) {
        return next(new global_error_1.GlobalError("You used an old password. To protect your account, please choose a new password.", 400));
    }
    if (newPassword !== confirmNewPassword) {
        return next(new global_error_1.GlobalError("New password credentials do not match", 400));
    }
    //@ts-ignore
    user.password = newPassword;
    yield (user === null || user === void 0 ? void 0 : user.save());
    const userAgent = (0, ua_parser_js_1.default)(req.headers["user-agent"]);
    const browser = userAgent.browser.name || "Not detected";
    const OS = `${userAgent.os.name || "Not detected"} (${userAgent.os.version || "Not detected"})`;
    const subject = `Clarestate Password Changed`;
    const send_to = user === null || user === void 0 ? void 0 : user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const resetUrl = `${process.env.CLIENT_URL}/auth/emergency-reset/${user === null || user === void 0 ? void 0 : user._id}`;
    const body = (0, update_success_email_1.updateSuccess)({
        //@ts-ignore
        username: user === null || user === void 0 ? void 0 : user.last_name,
        //@ts-ignore
        browser,
        OS,
        resetUrl,
    });
    try {
        //@ts-ignore
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: "Password successfully changed. Please log in again",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.emergencyResetPassword = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const { userID } = req.params;
    const user = yield user_model_1.default.findOne({ email });
    const userId = yield user_model_1.default.findById(userID);
    if (!user) {
        return next(new global_error_1.GlobalError("User not found", 404));
    }
    if (!userId) {
        return next(new global_error_1.GlobalError("This token is meant for another user", 404));
    }
    const resetToken = (0, crypto_1.randomBytes)(32).toString("hex") + user._id;
    const hashedToken = (0, crypto_1.createHash)("sha256").update(resetToken).digest("hex");
    yield new token_model_1.default({
        userId: user._id,
        token: hashedToken,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
    }).save();
    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;
    const subject = `Password Reset Request`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = process.env.REPLY_TO;
    const body = (0, reset_email_1.passwordResetEmail)({
        username: user.first_name,
        token: resetToken,
        url: resetUrl,
    });
    try {
        (0, email_service_1.default)({ subject, body, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: `An email has been sent to ${user.email} with instructions to reset your password`,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));

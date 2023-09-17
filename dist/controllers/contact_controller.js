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
exports.contactMe = exports.contactUs = void 0;
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const global_error_1 = require("../utils/global_error");
const email_service_1 = __importDefault(require("../services/email_service"));
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
exports.contactUs = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { subject, message } = req.body;
    //@ts-ignore
    const user = yield user_model_1.default.findById(req.user._id);
    if (!user) {
        return next(new global_error_1.GlobalError("User not found, please sign up", 404));
    }
    if (!subject || !message) {
        return next(new global_error_1.GlobalError("Both the subject and message are required", 400));
    }
    const send_to = process.env.ADMIN;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = user.email;
    try {
        (0, email_service_1.default)({ subject, body: message, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: "Email sent successfully. Thank you for contacting us",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));
exports.contactMe = (0, handle_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, message } = req.body;
    const subject = `Message from ${name} on Portfolio`;
    const send_to = process.env.ADMIN;
    const sent_from = process.env.EMAIL_USER;
    const reply_to = email;
    try {
        (0, email_service_1.default)({ subject, body: message, send_to, sent_from, reply_to });
        res.status(200).json({
            status: "success",
            message: "Email sent successfully. Thank you for reaching out!",
        });
    }
    catch (error) {
        res.status(500).json({
            status: "fail",
            message: `Email not sent. Please try again.`,
        });
    }
}));

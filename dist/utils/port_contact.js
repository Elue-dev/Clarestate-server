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
const app_1 = __importDefault(require("../app"));
const handle_async_1 = __importDefault(require("./handle_async"));
const email_service_1 = __importDefault(require("../services/email_service"));
app_1.default.post("/contact-me", (0, handle_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
})));

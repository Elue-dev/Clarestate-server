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
exports.restrictTo = exports.requireAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const global_error_1 = require("../utils/global_error");
const handle_async_1 = __importDefault(require("../utils/handle_async"));
const user_model_1 = __importDefault(require("../models/schemas/user_model"));
exports.requireAuth = (0, handle_async_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    const headers = req.headers.authorization;
    if (headers && headers.startsWith("Bearer")) {
        token = headers.split(" ")[1];
    }
    else if (req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new global_error_1.GlobalError("You are not logged in. Please log in to get access", 401));
    }
    const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    const freshUser = yield user_model_1.default.findById(payload.id).select("-password");
    if (!freshUser) {
        return next(new global_error_1.GlobalError("Session expired. Please Log in again", 401));
    }
    //@ts-ignore
    req.user = freshUser;
    next();
}));
const restrictTo = (...roles) => {
    return (req, res, next) => {
        //@ts-ignore
        if (!roles.includes(req.user.role)) {
            return next(new global_error_1.GlobalError("Unauthorized. Only admins can perform this action.", 401));
        }
        next();
    };
};
exports.restrictTo = restrictTo;

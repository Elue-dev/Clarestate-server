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
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = require("bcryptjs");
const userSchema = new mongoose_1.default.Schema({
    first_name: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    last_name: {
        type: String,
        required: [true, "Last name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Passsword is required"],
        select: false,
        minLength: [6, "Password must be up to 6 characters long"],
        trim: true,
    },
    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://a0.muscache.com/defaults/user_pic-50x50.png?v=3",
    },
    phone: {
        type: String,
        default: "",
        trim: true,
    },
    bio: {
        type: String,
        maxLength: [250, "Bio must not be more than 250 characters"],
        default: "Bio",
        trim: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
        trim: true,
    },
    verificationCode: String,
    codeExpires: Date,
    isVerified: {
        type: Boolean,
        default: false,
    },
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
    userAgents: {
        type: Array,
        required: true,
        select: false,
        default: [],
    },
}, { timestamps: true });
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!this.isModified("password"))
            return next();
        const salt = yield (0, bcryptjs_1.genSalt)(10);
        this.password = yield (0, bcryptjs_1.hash)(this.password, salt);
        next();
    });
});
userSchema.methods.correctPassword = function (providedPassword, userPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield (0, bcryptjs_1.compare)(providedPassword, userPassword);
    });
};
userSchema.methods.changedPasswordAfter = function (JWTTimeStamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
        //@ts-ignore
        this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimeStamp < changedTimestamp;
    }
    return false;
};
const User = mongoose_1.default.model("user", userSchema);
exports.default = User;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const global_error_1 = require("./utils/global_error");
const property_routes_1 = __importDefault(require("./routes/property_routes"));
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const review_routes_1 = __importDefault(require("./routes/review_routes"));
const comment_routes_1 = __importDefault(require("./routes/comment_routes"));
const contact_route_1 = __importDefault(require("./routes/contact_route"));
const error_middleware_1 = __importDefault(require("./middlewares/error_middleware"));
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json({ limit: "10kb" }));
exports.app.use((0, cookie_parser_1.default)());
exports.app.use((0, xss_clean_1.default)());
exports.app.use((0, express_mongo_sanitize_1.default)());
exports.app.use((0, helmet_1.default)());
exports.app.use((req, res, next) => {
    next();
});
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP. Please try again in an hour.",
});
exports.app.use("/api", limiter);
if (process.env.NODE_ENV === "development") {
    exports.app.use((0, morgan_1.default)("dev"));
}
exports.app.use("/api/auth", auth_routes_1.default);
exports.app.use("/api/users", user_routes_1.default);
exports.app.use("/api/properties", property_routes_1.default);
exports.app.use("/api/reviews", review_routes_1.default);
exports.app.use("/api/comments", comment_routes_1.default);
exports.app.use("/api/contact", contact_route_1.default);
exports.app.all("*", (req, res, next) => {
    next(new global_error_1.GlobalError(`Oops! Can't find ${req.originalUrl} on this server`, 404));
    exports.app.use(error_middleware_1.default);
});

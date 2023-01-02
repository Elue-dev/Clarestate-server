"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const xss_clean_1 = __importDefault(require("xss-clean"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const global_error_1 = require("./utils/global_error");
const error_controller_1 = __importDefault(require("./controllers/error_controller"));
const property_routes_1 = __importDefault(require("./routes/property_routes"));
const user_routes_1 = __importDefault(require("./routes/user_routes"));
const auth_routes_1 = __importDefault(require("./routes/auth_routes"));
const review_routes_1 = __importDefault(require("./routes/review_routes"));
const comment_routes_1 = __importDefault(require("./routes/comment_routes"));
const contact_route_1 = __importDefault(require("./routes/contact_route"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const app = (0, express_1.default)();
// const redisURL = process.env.REDIS_PORT || 6379;
// //@ts-ignore
// const redisClient = redis.createClient(redisURL);
// redisClient.connect();
// export { redisClient };
//@ts-ignore
process.env.UV_THREADPOOL_SIZE = os_1.default.cpus().length;
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
app.use((0, cors_1.default)({
    origin: [
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5173",
        "https://clarestate.netlify.app",
        process.env.CLIENT_URL,
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10kb" }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use((0, xss_clean_1.default)());
app.use((0, express_mongo_sanitize_1.default)());
app.use((0, helmet_1.default)());
app.use((req, res, next) => {
    next();
});
const limiter = (0, express_rate_limit_1.default)({
    max: 900,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP. Please try again in an hour.",
});
// app.use("/api", limiter);
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/properties", property_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
app.use("/api/comments", comment_routes_1.default);
app.use("/api/contact", contact_route_1.default);
app.all("*", (req, res, next) => {
    next(new global_error_1.GlobalError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(error_controller_1.default);
exports.default = app;

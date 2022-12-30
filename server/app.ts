import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
import morgan from "morgan";
import xss from "xss-clean";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { GlobalError } from "./utils/global_error";
import errorHandler from "./controllers/error_controller";

import propertyRouter from "./routes/property_routes";
import userRouter from "./routes/user_routes";
import authRouter from "./routes/auth_routes";
import reviewRouter from "./routes/review_routes";
import commentRouter from "./routes/comment_routes";
import contactRouter from "./routes/contact_route";
import path from "path";
import * as redis from "redis";

const app = express();

const redisURL = process.env.REDIS_PORT || 6379;
//@ts-ignore
const redisClient = redis.createClient(redisURL);

redisClient.connect();

export { redisClient };

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());

app.use(express.json({ limit: "10kb" }));

app.use(cookies());

app.use(xss());

app.use(mongoSanitize());

app.use(helmet());

app.use((req, res, next) => {
  next();
});

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try again in an hour.",
});

app.use("/api", limiter);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/comments", commentRouter);
app.use("/api/contact", contactRouter);

app.all("*", (req, res, next) => {
  next(new GlobalError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

export default app;

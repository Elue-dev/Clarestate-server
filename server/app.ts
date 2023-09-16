import express from "express";
import cors from "cors";
import cookies from "cookie-parser";
// import morgan from "morgan";
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
import os from "os";

const app = express();

// const redisURL = process.env.REDIS_PORT || 6379;
// //@ts-ignore
// const redisClient = redis.createClient(redisURL);

// redisClient.connect();

// export { redisClient };

//@ts-ignore
process.env.UV_THREADPOOL_SIZE = os.cpus().length;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "server/uploads")));

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://eluewisdom.com",
      "https://clarestate.netlify.app",
      "https://elue-dev.github.io/portfolio",
      "https://eluedev.vercel.app",
      process.env.CLIENT_URL as string,
    ],
    credentials: true,
  })
);

app.use(express.json({ limit: "10kb" }));

app.use(express.urlencoded({ extended: true }));

app.use(cookies());

app.use(xss());

app.use(mongoSanitize());

app.use(helmet());

app.use((req, res, next) => {
  next();
});

const limiter = rateLimit({
  max: 900,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try again in an hour.",
});

// app.use("/api", limiter);

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

import express, { Router } from "express";
import cors from "cors";
import cookies from "cookie-parser";
import morgan from "morgan";
import xss from "xss-clean";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { GlobalError } from "./utils/globalError";

import propertyRouter from "./routes/propertyRoutes";
import userRouter from "./routes/userRoutes";

export const app = Router();

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
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP. Please try again in an hour.",
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/v1/users", userRouter);
app.use("/api/v1/properties", propertyRouter);

app.all("*", (req, res, next) => {
  next(
    new GlobalError(`Oops! Can't find ${req.originalUrl} on this server`, 404)
  );
});

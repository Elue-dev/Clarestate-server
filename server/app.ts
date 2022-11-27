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

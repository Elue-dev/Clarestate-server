import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import { connectDatabase } from "./config/database";

dotenv.config();

const app = express();

connectDatabase();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}...`);
});

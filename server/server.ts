import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import { connectDatabase } from "./config/database";
import app from "./app";

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log(err.name, err.message);
  console.log("UNCAUGHT EXCEPTION ⛔️, Shutting down...");
  process.exit(1);
});

dotenv.config();

connectDatabase();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`server running on port ${PORT}...`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  console.log("UNHANDLED REJECTION ⛔️, Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});

import mongoose from "mongoose";
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

// connectDatabase();

const PORT = process.env.PORT || 5000;
const database = process.env.DATABASE;

mongoose
  .connect(database as string)
  .then(() => {
    console.log(`DATABASE CONNECTED SUCCESSFULLY!`);
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
  })
  .catch((error) => {
    console.log("MONGODB CONNECTION ERROR", error);
    process.exit(1);
  });

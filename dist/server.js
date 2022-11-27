"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
process.on("uncaughtException", (err) => {
    console.log(err);
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION ⛔️, Shutting down...");
    process.exit(1);
});
dotenv_1.default.config();
const app = (0, express_1.default)();
(0, database_1.connectDatabase)();
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

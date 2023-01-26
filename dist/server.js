"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
process.on("uncaughtException", (err) => {
    console.log(err);
    console.log(err.name, err.message);
    console.log("UNCAUGHT EXCEPTION ⛔️, Shutting down...");
    process.exit(1);
});
dotenv_1.default.config();
// connectDatabase();
const PORT = process.env.PORT || 5000;
const database = process.env.DATABASE;
mongoose_1.default
    .connect(database)
    .then(() => {
    console.log(`DATABASE CONNECTED SUCCESSFULLY!`);
    const server = app_1.default.listen(PORT, () => {
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

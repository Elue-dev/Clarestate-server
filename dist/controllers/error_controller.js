"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_error_1 = require("../utils/global_error");
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new global_error_1.GlobalError(message, 400);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.keyValue.name;
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new global_error_1.GlobalError(message, 400);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((val) => val.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new global_error_1.GlobalError(message, 400);
};
const hanndleJWTError = () => new global_error_1.GlobalError("Invalid token. Please log in again", 401);
const hanndleJWTExpiredError = () => new global_error_1.GlobalError("Your token has expired. Please log in again", 401);
const sendErrorDev = (err, res) => {
    const errorObj = process.env.NODE_ENV === "development"
        ? {
            status: err.status,
            message: err.message,
            stack: err.stack,
        }
        : {
            status: err.status,
            message: err.message,
        };
    res.status(err.statusCode).json(errorObj);
};
const sendErrorProd = (err, res) => {
    // operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
        //programinng or other unknown error: don't leak error details
    }
    else {
        // 1. log error
        console.error("ERROR ⛔️", err);
        // 2. send generic message
        res.status(500).json({
            status: "error",
            message: "Something went wrong",
        });
    }
};
exports.default = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === "production") {
        // let error = { ...err };
        sendErrorDev(err, res);
        // if (error.kind === "ObjectId") error = handleCastErrorDB(error);
        // if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        // if (error._message === "Validation failed")
        //   error = handleValidationErrorDB(error);
        // if (error.name === "JsonWebTokenError") error = hanndleJWTError();
        // if (error.name === "TokenExpiredError") error = hanndleJWTExpiredError();
        // sendErrorProd(error, res);
    }
};

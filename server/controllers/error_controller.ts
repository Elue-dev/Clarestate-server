import { GlobalError } from "../utils/global_error";
import { Response, Request, NextFunction } from "express";

const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new GlobalError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}. Please use another value`;
  return new GlobalError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((val: any) => val.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  return new GlobalError(message, 400);
};

const hanndleJWTError = () =>
  new GlobalError("Invalid token. Please log in again", 401);

const hanndleJWTExpiredError = () =>
  new GlobalError("Your token has expired. Please log in again", 401);

const sendErrorDev = (err: any, res: Response) => {
  const errorObj =
    process.env.NODE_ENV === "development"
      ? {
          status: err.status,
          message: err.message,
          stack: err.stack,
        }
      : {
          status: err.status,
          message: err.message,
          stack: err.stack,
        };

  res.status(err.statusCode).json(errorObj);
};

const sendErrorProd = (err: any, res: Response) => {
  // operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //programinng or other unknown error: don't leak error details
  } else {
    // 1. log error
    console.error("ERROR ⛔️", err);

    // 2. send generic message
    res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }
};

export default (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
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

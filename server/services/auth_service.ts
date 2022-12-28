import { Response } from "express";
import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const createAndSendToken = (
  user: any,
  statusCode: number,
  res: Response,
  type: string
) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(
      //@ts-ignore
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    path: "/",
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("token", token, cookieOptions);

  user.password = undefined;

  if (type === "verify") {
    res.status(statusCode).json({
      status: "success",
      message: "Email verified successfully",
      token,
      user,
    });
  } else {
    res.status(statusCode).json({
      status: "success",
      token,
      user,
    });
  }
};

export const validateEmail = (email: string) => {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
};

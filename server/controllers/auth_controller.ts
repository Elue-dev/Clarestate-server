import { Request, Response, NextFunction } from "express";
import User from "../models/database/user_model";
import { validateEmail } from "../service/auth_service";
import sendEmail from "../service/email_handler";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new GlobalError("Please fill in all required fields", 400));
    }

    if (!validateEmail(email)) {
      return next(new GlobalError("Please enter a valid email address", 400));
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return next(new GlobalError("Email already in use", 400));
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const user = await User.create({
      username,
      email,
      password,
      verificationCode,
    });

    const subject = "Welcome to Clarestate!";
    const message = `Login code is ${verificationCode}`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = "noreply@clarestate.com";

    sendEmail({ subject, message, send_to, sent_from, reply_to });

    res.status(201).json({
      status: "success",
      message: "Check your email for a verification code",
    });
  }
);

export const login = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);

export const forgotPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);

export const resetPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);

export const updatePassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);

import { Request, Response, NextFunction } from "express";
import User from "../models/schemas/user_model";
import { validateEmail } from "../services/auth_service";
import sendEmail from "../services/email_service";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import { verificationEmail } from "../views/verification_email";
import crypto from "crypto";
import Cryptr from "cryptr";
import Token from "../models/schemas/token_model";

const cryptr = new Cryptr("kjsdbhcgEVWdcqwdqwfdqwe");

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

    const code = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = code.toString();

    const encryptedCode = cryptr.encrypt(verificationCode);

    const user = await User.create({
      username,
      email,
      password,
      verificationCode: encryptedCode,
      codeExpires: Date.now() + 60 * (60 * 1000),
    });

    // await new Token({
    //   userId: user._id,
    //   vCode: encryptedCode,
    //   createdAt: Date.now(),
    //   expiresAt: Date.now() + 60 * (60 * 1000),
    // }).save();

    const subject = "Verify Your Email";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = "noreply@clarestate.com";
    const url = `https://test.com/${user._id}`;
    const body = verificationEmail(user.username, verificationCode, url);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `A verification code has been sent to ${email}`,
      });
    } catch (error) {
      console.log(error);
    }
  }
);

export const verifyCode = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const { email } = req.params;

    const user = await User.findOne({
      email,
      codeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new GlobalError("Email already verified", 400));
    }

    const decryptedCode = cryptr.decrypt(user?.verificationCode as string);

    if (decryptedCode !== code) {
      return next(new GlobalError("Invalid or expired verification code", 400));
    }

    user.verificationCode = undefined;
    user.isVerified = true;
    //@ts-ignore
    user.codeExpires = undefined;

    await user.save();

    res.status(200).json({
      status: "success",
      message: "Account successfully verified!",
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

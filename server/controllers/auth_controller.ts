import { Request, Response, NextFunction } from "express";
import User from "../models/schemas/user_model";
import { createAndSendToken, validateEmail } from "../services/auth_service";
import sendEmail from "../services/email_service";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import { verificationEmail } from "../views/verification_email";
import { createHash, randomBytes } from "crypto";
import Token from "../models/schemas/token_model";
import { verificationSuccess } from "../views/verification_success";
import { cryptr } from "../utils/cryptr";
import { userInfo } from "os";
import { passwordResetEmail } from "../views/reset_email";

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

    const subject = "Verify Your Email";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const url = `https://test.com/${user._id}`;
    const body = verificationEmail({
      username: user.username,
      verificationCode,
      url,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `A verification code has been sent to ${email}`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. please try again!`,
      });
    }
  }
);

export const verifyCode = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.body;
    const { userID } = req.params;

    if (!code) {
      return next(
        new GlobalError("Please provide your verification code", 400)
      );
    }

    const user = await User.findOne({
      _id: userID,
      codeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new GlobalError("Email already verified or user dosen't exist", 400)
      );
    }

    const decryptedCode = cryptr.decrypt(user.verificationCode as string);

    if (decryptedCode !== code) {
      return next(new GlobalError("Invalid or expired verification code", 400));
    }

    user.verificationCode = undefined;
    user.isVerified = true;
    user.codeExpires = undefined;

    await user.save();

    const subject = `Welcome Onboard, ${user.username}!`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = verificationSuccess(user.username);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }

    createAndSendToken(user, 201, res);
  }
);

export const login = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new GlobalError("Both email and password are required", 400));
    }

    const user = await User.findOne({ email }).select("+password");

    //@ts-ignore
    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new GlobalError("Invalid email or password", 400));
    }

    createAndSendToken(user, 200, res);

    res.status(200).json({ status: "success" });
  }
);

export const logout = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", "", {
      //@ts-ignore
      expires: Number(new Date(Date.now() * 10 * 1000)),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "You have been successfully logged out",
    });
  }
);

export const forgotPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new GlobalError("Please provide your email address", 400));
    }

    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      return next(new GlobalError("That email is not registered", 404));
    }

    let token = await Token.findOne({ userId: existingUser._id });

    if (token) await Token.deleteOne();

    const resetToken = randomBytes(32).toString("hex") + existingUser._id;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    console.log(resetToken);

    await new Token({
      userId: existingUser._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    }).save();

    const resetUrl = `${process.env.clientUrl}/forgot-password/${resetToken}`;

    const subject = `Password Reset Request`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      email,
      username: existingUser.username,
      token: resetToken,
      url: resetUrl,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `An email has been sent to ${email} to reset your password`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const resetPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { newPassword, confirmNewPassword } = req.body;
    const { token } = req.params;

    if (!newPassword || !confirmNewPassword) {
      return next(
        new GlobalError("Please provide all password credentials", 400)
      );
    }

    if (newPassword !== confirmNewPassword) {
      return next(
        new GlobalError("New password credentials do not match", 400)
      );
    }

    const hashedToken = createHash("sha256").update(token).digest("hex");

    const existingToken = await Token.findOne({
      token: hashedToken,
      expiresAt: { $gt: Date.now() },
    });

    if (!existingToken) {
      return next(new GlobalError("Invalid or expired token", 400));
    }

    const user = await User.findOne({ _id: existingToken.userId });

    //@ts-ignore
    user.password = newPassword;
    //@ts-ignore
    await user.save();

    await Token.deleteOne({ token: hashedToken });

    res.status(200).json({
      status: "success",
      message: "Password reset successful!",
    });
  }
);

export const updatePassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ status: "success" });
  }
);

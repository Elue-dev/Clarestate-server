import { Request, Response, NextFunction } from "express";
import User from "../models/schemas/user_model";
import { createAndSendToken, validateEmail } from "../services/auth_service";
import sendEmail from "../services/email_service";
import { GlobalError } from "../utils/global_error";
import handleAsync from "../utils/handle_async";
import { verificationEmail } from "../views/verification_email";
import { createHash, randomBytes } from "crypto";
import Token from "../models/schemas/token_model";
import { verificationSuccess } from "../views/verification_success_email";
import { cryptr } from "../utils/cryptr";
import { passwordResetEmail } from "../views/reset_email";
import { resetSuccess } from "../views/reset_success_email";
import parser from "ua-parser-js";
import { updateSuccess } from "../views/update_success_email";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
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
      first_name,
      last_name,
      email,
      password,
      active: false,
      verificationCode: encryptedCode,
      codeExpires: Date.now() + 60 * (60 * 1000),
    });

    const subject = "Verify Your Email";
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = verificationEmail({
      username: user.first_name,
      verificationCode,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        userID: user._id,
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
        new GlobalError("Email already verified or account dosen't exist", 404)
      );
    }

    const decryptedCode = cryptr.decrypt(user?.verificationCode as string);

    if (decryptedCode !== code) {
      return next(new GlobalError("Invalid or expired verification code", 400));
    }

    user.verificationCode = undefined;
    user.codeExpires = undefined;
    user.isVerified = true;
    user.active = true;

    await user.save();

    const subject = `Welcome Onboard, ${user.first_name}!`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = verificationSuccess(user.last_name);

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }

    createAndSendToken(user, 201, res, "verified");
  }
);

export const sendVerificationCode = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    if (!email) {
      return next(new GlobalError("Please provide your email", 400));
    }

    const user = await User.findOne({ email });

    //@ts-ignore
    if (!user || user.isVerified) {
      return next(
        new GlobalError("Email already verified or account dosen't exist", 400)
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = code.toString();

    const encryptedCode = cryptr.encrypt(verificationCode);
    //@ts-ignore
    user.verificationCode = encryptedCode;
    //@ts-ignore
    user.codeExpires = Date.now() + 60 * (60 * 1000);
    //@ts-ignore
    await user.save();

    const subject = `${user.last_name}, you requested a verification code`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = verificationEmail({
      username: user.first_name,
      verificationCode,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `A verification code has been sent to ${user.email}`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. please try again!`,
      });
    }
  }
);

export const login = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return next(
        new GlobalError(
          "Email or phone number and password are both required",
          400
        )
      );
    }

    const user: any = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    })
      .select("+password")
      .select("+userAgents");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new GlobalError("Invalid credentials provided", 400));
    }

    const userAgent = parser(req.headers["user-agent"]);

    if (!user.userAgents.includes(userAgent.ua)) {
      user.userAgents.push(userAgent.ua);
    }

    await user.save();

    //@ts-ignore
    user?.userAgents = undefined;

    createAndSendToken(user, 200, res, "login");
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
      message: "Logout successful",
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
      username: existingUser.first_name,
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

    const userAgent = parser(req.headers["user-agent"]);

    const browser = userAgent.browser.name || "Not detected";
    const OS = `${userAgent.os.name || "Not detected"}(${
      userAgent.os.version || "Not detected"
    })`;

    const subject = `${user?.first_name}, Your password was successfully reset`;
    const send_to = user?.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = resetSuccess({
      //@ts-ignore
      username: user?.last_name,
      //@ts-ignore
      browser,
      OS,
    });

    try {
      //@ts-ignore
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `Password reset successful!`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const updatePassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword, confirmNewPassword } = req.body;

    //@ts-ignore
    const user = await User.findById(req.user.id).select("+password");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      return next(
        new GlobalError("Please provide all 3 password credentials", 400)
      );
    }
    //@ts-ignore
    if (!(await user.correctPassword(oldPassword, user.password))) {
      return next(new GlobalError("Old password is incorrect", 400));
    }

    if (oldPassword === newPassword) {
      return next(
        new GlobalError(
          "You used an old password. To protect your account, please choose a new password.",
          400
        )
      );
    }

    if (newPassword !== confirmNewPassword) {
      return next(
        new GlobalError("New password credentials do not match", 400)
      );
    }
    //@ts-ignore
    user.password = newPassword;

    await user?.save();

    const userAgent = parser(req.headers["user-agent"]);

    const browser = userAgent.browser.name || "Not detected";
    const OS = `${userAgent.os.name || "Not detected"} (${
      userAgent.os.version || "Not detected"
    })`;

    const subject = `${user?.first_name}, Your password was successfully changed`;
    const send_to = user?.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = updateSuccess({
      //@ts-ignore
      username: user?.last_name,
      //@ts-ignore
      browser,
      OS,
    });

    try {
      //@ts-ignore
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: "Password successfully changed!",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

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
import { Twilio } from "twilio";

export const signup = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // const accountSid = process.env.TWILIO_ACCOUNT_SID as string;
    // const authToken = process.env.TWILIO_AUTH_TOKEN as string;

    // const client = new Twilio(accountSid, authToken);

    const { first_name, last_name, email, password, phone } = req.body;

    // try {
    //   client.messages
    //     .create({
    //       from: "+2348107339039",
    //       to: "+2348107339039",
    //       body: `Verify your email with this code 000000`,
    //     })
    //     .then((message: any) => {
    //       res.send(message);
    //       console.log(message);
    //     });
    // } catch (error) {
    //   console.log(error);
    // }

    if (!first_name || !last_name || !email || !password || !phone) {
      return next(new GlobalError("Please fill in all required fields", 400));
    }

    if (!validateEmail(email)) {
      return next(new GlobalError("Please enter a valid email address", 400));
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
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
      phone,
      active: false,
      verificationCode: encryptedCode,
      codeExpires: Date.now() + 60 * (60 * 1000),
    });

    // client.messages
    //   .create({
    //     body: `Verify your email with this code ${verificationCode}`,
    //     from: "+15017122661",
    //     to: "+2348107339039",
    //   })
    //   .then((message: any) => console.log(message));

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

    createAndSendToken(user, 201, res, "verify");
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
    if (!user) {
      return next(new GlobalError("Account dosen't exist", 400));
    } else if (user.isVerified) {
      return next(new GlobalError("Email already verified", 400));
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
      $or: [{ email: emailOrPhone.trim() }, { phone: emailOrPhone.trim() }],
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

    if (existingUser.email === "guestuser@clarestate.com") {
      return next(
        new GlobalError(
          "Sorry, you are not authorized to reset the guest user password",
          401
        )
      );
    }

    const resetToken = randomBytes(32).toString("hex") + existingUser._id;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    await new Token({
      userId: existingUser._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    }).save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    const subject = `Password Reset Request`;
    const send_to = email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      username: existingUser.first_name,
      token: resetToken,
      url: resetUrl,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `An email has been sent to ${email} with instructions
        to reset your password`,
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
    const OS = `${userAgent.os.name || "Not detected"} (${
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
    if (user.email === "guestuser@clarestate.com") {
      return next(
        new GlobalError(
          "Sorry, you are not authorized to update the guest user password",
          401
        )
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

    const subject = `Clarestate Password Changed`;
    const send_to = user?.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const resetUrl = `${process.env.CLIENT_URL}/auth/emergency-reset/${user?._id}`;
    const body = updateSuccess({
      //@ts-ignore
      username: user?.last_name,
      //@ts-ignore
      browser,
      OS,
      resetUrl,
    });

    try {
      //@ts-ignore
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: "Password successfully changed. Please log in again",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const emergencyResetPassword = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const { userID } = req.params;

    const user = await User.findOne({ email });
    const userId = await User.findById(userID);

    if (!user) {
      return next(new GlobalError("User not found", 404));
    }

    if (!userId) {
      return next(new GlobalError("This token is meant for another user", 404));
    }

    const resetToken = randomBytes(32).toString("hex") + user._id;
    const hashedToken = createHash("sha256").update(resetToken).digest("hex");

    await new Token({
      userId: user._id,
      token: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000,
    }).save();

    const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

    const subject = `Password Reset Request`;
    const send_to = user.email;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = process.env.REPLY_TO as string;
    const body = passwordResetEmail({
      username: user.first_name,
      token: resetToken,
      url: resetUrl,
    });

    try {
      sendEmail({ subject, body, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: `An email has been sent to ${user.email} with instructions to reset your password`,
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

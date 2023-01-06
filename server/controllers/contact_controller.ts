import { Request, Response, NextFunction } from "express";
import handleAsync from "../utils/handle_async";
import { GlobalError } from "../utils/global_error";
import sendEmail from "../services/email_service";
import User from "../models/schemas/user_model";

export const contactUs = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { subject, message } = req.body;

    //@ts-ignore
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new GlobalError("User not found, please sign up", 404));
    }

    if (!subject || !message) {
      return next(
        new GlobalError("Both the subject and message are required", 400)
      );
    }

    const send_to = process.env.ADMIN as string;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = user.email;

    try {
      sendEmail({ subject, body: message, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: "Email sent successfully. Thank you for contacting us",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

export const contactMe = handleAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, message } = req.body;

    const subject = `Message from ${name} on Portfolio`;
    const send_to = process.env.ADMIN as string;
    const sent_from = process.env.EMAIL_USER as string;
    const reply_to = email;

    try {
      sendEmail({ subject, body: message, send_to, sent_from, reply_to });
      res.status(200).json({
        status: "success",
        message: "Email sent successfully. Thank you for reaching out!",
      });
    } catch (error) {
      res.status(500).json({
        status: "fail",
        message: `Email not sent. Please try again.`,
      });
    }
  }
);

import app from "../app";
import handleAsync from "./handle_async";
import { Request, Response } from "express";
import sendEmail from "../services/email_service";

app.post(
  "/contact-me",
  handleAsync(async (req: Request, res: Response) => {
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
  })
);

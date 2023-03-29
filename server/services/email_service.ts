import nodemailer from "nodemailer";
import { EmailType } from "../models/types/email_types";

const sendEmail = ({
  subject,
  body,
  send_to,
  sent_from,
  reply_to,
}: EmailType) => {
  console.log({ env: process.env.EMAIL_HOST });

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const options = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject: subject,
    html: body,
  };

  transporter.sendMail(options, function (err, info) {
    if (err) return console.log(err);

    console.log("INFO", info);
  });
};

export default sendEmail;

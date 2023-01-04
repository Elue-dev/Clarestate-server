export interface EmailType {
  subject: string;
  body: string;
  send_to: string;
  sent_from: string;
  reply_to: string;
}

export interface passwordResetType {
  email: string;
  username: string;
  token: string;
  url: string;
}

export interface verificationType {
  username: string;
  verificationCode: string;
}

export interface resetSuccessType {
  username: string;
  browser: string;
  OS: string;
  url: string;
}

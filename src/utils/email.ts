import nodemailer from 'nodemailer';
import { config } from '../config/env';

export async function sendEmail(to: string, subject: string, html: string) {
  let transporter;
  if (config.EMAIL_USER && config.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: config.EMAIL_USER, pass: config.EMAIL_PASS },
    });
  } else if (config.SMTP.HOST) {
    transporter = nodemailer.createTransport({
      host: config.SMTP.HOST,
      port: config.SMTP.PORT || 587,
      auth: config.SMTP.USER && config.SMTP.PASS ? { user: config.SMTP.USER, pass: config.SMTP.PASS } : undefined,
    });
  } else {
    return; // No mail transport configured; skip silently
  }

  await transporter.sendMail({ from: config.EMAIL_USER || 'noreply@example.com', to, subject, html });
}

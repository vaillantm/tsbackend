"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
async function sendEmail(to, subject, html) {
    let transporter;
    if (env_1.config.EMAIL_USER && env_1.config.EMAIL_PASS) {
        transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: { user: env_1.config.EMAIL_USER, pass: env_1.config.EMAIL_PASS },
        });
    }
    else if (env_1.config.SMTP.HOST) {
        transporter = nodemailer_1.default.createTransport({
            host: env_1.config.SMTP.HOST,
            port: env_1.config.SMTP.PORT || 587,
            auth: env_1.config.SMTP.USER && env_1.config.SMTP.PASS ? { user: env_1.config.SMTP.USER, pass: env_1.config.SMTP.PASS } : undefined,
        });
    }
    else {
        return; // No mail transport configured; skip silently
    }
    await transporter.sendMail({ from: env_1.config.EMAIL_USER || 'noreply@example.com', to, subject, html });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderStatusUpdateEmail = exports.sendOrderPlacedEmail = exports.sendResetPasswordEmail = exports.sendPasswordChangedEmail = exports.sendWelcomeEmail = exports.orderStatusUpdateTemplate = exports.orderPlacedTemplate = exports.resetPasswordTemplate = exports.passwordChangedTemplate = exports.welcomeEmailTemplate = void 0;
// src/templates/email.templates.ts
const email_1 = require("./email");
/* ================= EMAIL TEMPLATES ================= */
const welcomeEmailTemplate = (firstName, email) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 15px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Welcome to Eshop!</h1></div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Welcome aboard! We’re glad to have you.</p>
      <p>Your account has been created with the email: <strong>${email}</strong></p>
      <a href="https://yourapp.com/login" class="button">Get Started</a>
    </div>
    <div class="footer">
      <p>© 2024 Your Company. All rights reserved.</p>
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
  </div>
</body>
</html>
`;
exports.welcomeEmailTemplate = welcomeEmailTemplate;
const passwordChangedTemplate = (firstName) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; }
    .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { text-align: center; padding: 15px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Password Changed</h1></div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your password was changed successfully.</p>
      <div class="warning">
        <strong>Notice:</strong> If this wasn’t you, take action immediately.
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
exports.passwordChangedTemplate = passwordChangedTemplate;
const resetPasswordTemplate = (firstName, resetToken) => {
    const resetUrl = `https://yourapp.com/reset-password?token=${resetToken}`;
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; }
    .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .button { display: inline-block; padding: 10px 20px; background: #FF5722; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .warning { background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107; margin: 20px 0; }
    .footer { text-align: center; padding: 15px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Password Reset Request</h1></div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>We received a request to reset your password. Click below to create a new one:</p>
      <a href="${resetUrl}" class="button">Reset Password</a>
      <div class="warning">
        <strong>Security Notice:</strong> This link will expire in 1 hour. If you didn't request this, ignore this email.
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
    </div>
    <div class="footer">
      <p>© 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
};
exports.resetPasswordTemplate = resetPasswordTemplate;
const orderPlacedTemplate = (firstName, orderId, totalAmount) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .order-details { background: #f9f9f9; padding: 15px; margin: 20px 0; border-radius: 5px; }
    .footer { text-align: center; padding: 15px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Order Confirmed!</h1></div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your order has been successfully placed.</p>
      <div class="order-details">
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
        <p><strong>Status:</strong> Processing</p>
      </div>
    </div>
    <div class="footer">
      <p>© 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
exports.orderPlacedTemplate = orderPlacedTemplate;
const orderStatusUpdateTemplate = (firstName, orderId, status) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 5px; overflow: hidden; }
    .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { text-align: center; padding: 15px; color: #777; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Order Status Update</h1></div>
    <div class="content">
      <p>Hi ${firstName},</p>
      <p>Your order <strong>${orderId}</strong> status has been updated.</p>
      <p>New status: <strong>${status}</strong></p>
    </div>
    <div class="footer">
      <p>© 2024 Your Company. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
exports.orderStatusUpdateTemplate = orderStatusUpdateTemplate;
/* ================= EMAIL SENDING FUNCTIONS ================= */
const sendWelcomeEmail = async (user) => {
    await (0, email_1.sendEmail)(user.email, 'Welcome to Eshop', (0, exports.welcomeEmailTemplate)(user.name, user.email));
};
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordChangedEmail = async (user) => {
    await (0, email_1.sendEmail)(user.email, 'Password changed', (0, exports.passwordChangedTemplate)(user.name));
};
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendResetPasswordEmail = async (user, resetToken) => {
    await (0, email_1.sendEmail)(user.email, 'Reset Password', (0, exports.resetPasswordTemplate)(user.name, resetToken));
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
const sendOrderPlacedEmail = async (user, orderId, totalAmount) => {
    await (0, email_1.sendEmail)(user.email, 'Order placed', (0, exports.orderPlacedTemplate)(user.name, orderId, totalAmount));
};
exports.sendOrderPlacedEmail = sendOrderPlacedEmail;
const sendOrderStatusUpdateEmail = async (user, orderId, status) => {
    await (0, email_1.sendEmail)(user.email, 'Order status updated', (0, exports.orderStatusUpdateTemplate)(user.name, orderId, status));
};
exports.sendOrderStatusUpdateEmail = sendOrderStatusUpdateEmail;

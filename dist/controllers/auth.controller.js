"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.changePassword = exports.deleteAccount = exports.updateProfile = exports.me = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = require("../models/User");
const asyncHandler_1 = require("../utils/asyncHandler");
const jwt_1 = require("../utils/jwt");
const files_1 = require("../utils/files");
const env_1 = require("../config/env");
const emailTemplates_1 = require("../utils/emailTemplates");
/* ================= REGISTER ================= */
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { name, username, email, password, role } = req.body;
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await User_1.User.create({ name, username, email, password: hashed, role });
    const token = (0, jwt_1.signToken)(user._id.toString());
    // Send welcome email (non-blocking)
    (0, emailTemplates_1.sendWelcomeEmail)(user).catch(() => { });
    res.status(201).json({
        token,
        user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
});
/* ================= LOGIN ================= */
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ message: 'Invalid credentials' });
    const token = (0, jwt_1.signToken)(user._id.toString());
    res.json({
        token,
        user: {
            id: user._id,
            name: user.name,
            username: user.username,
            email: user.email,
            role: user.role,
        },
    });
});
/* ================= ME ================= */
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    res.json({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
    });
});
/* ================= UPDATE PROFILE ================= */
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = { name: req.body.name, username: req.body.username };
    let oldAvatar;
    if (req.file)
        updates.avatar = req.file.path;
    const current = await User_1.User.findById(req.user.id);
    if (current)
        oldAvatar = current.avatar || undefined;
    const user = await User_1.User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (req.file && oldAvatar && oldAvatar !== user.avatar) {
        (0, files_1.removeFile)(oldAvatar);
    }
    res.json(user);
});
/* ================= DELETE ACCOUNT ================= */
exports.deleteAccount = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = await User_1.User.findById(req.user.id);
    if (user?.avatar)
        (0, files_1.removeFile)(user.avatar);
    await User_1.User.findByIdAndDelete(req.user.id);
    res.status(204).send();
});
/* ================= CHANGE PASSWORD ================= */
exports.changePassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User_1.User.findById(req.user.id);
    if (!user)
        return res.status(404).json({ message: 'Not found' });
    const ok = await bcryptjs_1.default.compare(currentPassword, user.password);
    if (!ok)
        return res.status(400).json({ message: 'Wrong password' });
    user.password = await bcryptjs_1.default.hash(newPassword, 10);
    await user.save();
    (0, emailTemplates_1.sendPasswordChangedEmail)(user).catch(() => { });
    res.json({ message: 'Password updated' });
});
/* ================= FORGOT PASSWORD ================= */
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.json({ message: 'If user exists, email sent' });
    const token = crypto_1.default.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();
    const link = `${env_1.config.CLIENT_URL}/reset-password?token=${token}`;
    (0, emailTemplates_1.sendResetPasswordEmail)(user, link).catch(() => { });
    res.json({ message: 'If user exists, email sent' });
});
/* ================= RESET PASSWORD ================= */
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, newPassword } = req.body;
    const user = await User_1.User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
        return res.status(400).json({ message: 'Invalid token' });
    user.password = await bcryptjs_1.default.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ message: 'Password reset' });
});
/* ================= LOGOUT ================= */
exports.logout = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    res.json({ message: 'Logged out' });
});

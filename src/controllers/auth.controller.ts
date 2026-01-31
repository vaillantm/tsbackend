import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { signToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { removeFile } from '../utils/files';
import { config } from '../config/env';
import {
  sendWelcomeEmail,
  sendPasswordChangedEmail,
  sendResetPasswordEmail,
} from '../utils/emailTemplates';

/* ================= REGISTER ================= */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, username, email, password, role } = req.body;

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, username, email, password: hashed, role });

  const token = signToken(user._id.toString());

  // Send welcome email (non-blocking)
  sendWelcomeEmail(user).catch(() => {});

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
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken(user._id.toString());

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
export const me = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;
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
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const updates: any = { name: req.body.name, username: req.body.username };
  let oldAvatar: string | undefined;

  if (req.file) updates.avatar = req.file.path;

  const current = await User.findById(req.user!.id);
  if (current) oldAvatar = current.avatar || undefined;

  const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true });

  if (req.file && oldAvatar && oldAvatar !== user!.avatar) {
    removeFile(oldAvatar);
  }

  res.json(user);
});

/* ================= DELETE ACCOUNT ================= */
export const deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (user?.avatar) removeFile(user.avatar);

  await User.findByIdAndDelete(req.user!.id);
  res.status(204).send();
});

/* ================= CHANGE PASSWORD ================= */
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ message: 'Not found' });

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) return res.status(400).json({ message: 'Wrong password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  sendPasswordChangedEmail(user).catch(() => {});
  res.json({ message: 'Password updated' });
});

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: 'If user exists, email sent' });

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const link = `${config.CLIENT_URL}/reset-password?token=${token}`;
  sendResetPasswordEmail(user, link).catch(() => {});

  res.json({ message: 'If user exists, email sent' });
});

/* ================= RESET PASSWORD ================= */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) return res.status(400).json({ message: 'Invalid token' });

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = null as any;
  user.resetPasswordExpires = null as any;
  await user.save();

  res.json({ message: 'Password reset' });
});

/* ================= LOGOUT ================= */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ message: 'Logged out' });
});
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';
import { Upload } from '../models/Upload';
import { User } from '../models/User';

export const uploadProfileImage = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const avatar = req.file.path;
  const updated = await User.findByIdAndUpdate(req.user!.id, { avatar }, { new: true });
  res.status(201).json({ path: avatar, user: { id: updated!._id, avatar: updated!.avatar } });
});

export const uploadProductImages = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.files || !Array.isArray(req.files) || (req.files as Express.Multer.File[]).length === 0) {
    return res.status(400).json({ message: 'No files uploaded' });
  }
  const files = (req.files as Express.Multer.File[]).map((f) => f.path);
  const saved = await Upload.insertMany(files.map((p) => ({ userId: req.user!.id, path: p, type: 'product' })));
  res.status(201).json({ files: saved.map((s) => ({ id: s._id, path: s.path })) });
});

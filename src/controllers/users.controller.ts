import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User';

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const page = Math.max(parseInt(_req.query.page as string, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(_req.query.limit as string, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const sort = (_req.query.sort as string) || '-createdAt';

  const [users, total] = await Promise.all([
    User.find().select('-password').sort(sort).skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  res.json({ data: users, page, limit, total });
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Category } from '../models/Category';
import { AuthRequest } from '../middleware/auth';
import { removeFile } from '../utils/files';

export const createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { name, description, path, image: imageUrl } = req.body;
  const image = req.file?.path || imageUrl; // Prefer uploaded file; fallback to JSON URL
  const cat = await Category.create({ name, description, path, image, createdBy: req.user!.id });
  res.status(201).json(cat);
});

export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const list = await Category.find();
  res.json(list);
});

export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Not found' });
  res.json(cat);
});

export const updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { image: imageUrl, ...rest } = req.body;
  const updates: any = rest;
  let oldImage: string | undefined;
  const current = await Category.findById(req.params.id);
  if (current?.image) oldImage = current.image;
  if (req.file) {
    updates.image = req.file.path; // Prefer uploaded file
  } else if (imageUrl !== undefined) {
    updates.image = imageUrl; // Fallback to JSON URL
  }
  const cat = await Category.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!cat) return res.status(404).json({ message: 'Not found' });
  if (oldImage && updates.image && oldImage !== updates.image) {
    removeFile(oldImage);
  }
  res.json(cat);
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const cat = await Category.findById(req.params.id);
  if (cat?.image) removeFile(cat.image);
  await Category.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

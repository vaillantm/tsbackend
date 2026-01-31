import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { removeFiles } from '../utils/files';

export const createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const body = req.body;
  const images: string[] = [];
  if (req.files && Array.isArray(req.files)) {
    for (const f of req.files as Express.Multer.File[]) images.push(f.path);
  }
  const prod = await Product.create({
    name: body.name,
    description: body.description,
    price: body.price,
    quantity: body.quantity,
    images,
    categoryId: body.categoryId,
    vendorId: req.user!.id,
  });
  res.status(201).json(prod);
});

export const getProducts = asyncHandler(async (_req: Request, res: Response) => {
  const list = await Product.find();
  res.json(list);
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ message: 'Not found' });
  res.json(prod);
});

export const updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ message: 'Not found' });
  if (req.user!.role !== 'admin' && prod.vendorId.toString() !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });
  const updates: any = { ...req.body };
  let oldImages: string[] | undefined;
  if (req.files && Array.isArray(req.files)) {
    oldImages = prod.images || [];
    updates.images = (req.files as Express.Multer.File[]).map((f) => f.path);
  }
  const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (oldImages && updates.images && Array.isArray(updates.images)) {
    // remove previous images only if replaced
    removeFiles(oldImages);
  }
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ message: 'Not found' });
  if (req.user!.role !== 'admin' && prod.vendorId.toString() !== req.user!.id) return res.status(403).json({ message: 'Forbidden' });
  const images = prod.images || [];
  await Product.findByIdAndDelete(req.params.id);
  removeFiles(images);
  res.status(204).send();
});

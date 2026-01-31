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

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(parseInt(req.query.page as string, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit as string, 10) || 10, 1), 100);
  const skip = (page - 1) * limit;
  const sortParam = (req.query.sort as string) || '-createdAt';
  const search = (req.query.search as string) || '';

  const filters: any = {};
  if (req.query.categoryId) filters.categoryId = req.query.categoryId;
  if (req.query.minPrice || req.query.maxPrice) {
    filters.price = {};
    if (req.query.minPrice) filters.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filters.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.inStock === 'true') filters.quantity = { $gt: 0 };

  if (search) {
    filters.$text = { $search: search };
  }

  const [items, total] = await Promise.all([
    Product.find(filters)
      .sort(sortParam)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filters),
  ]);

  res.json({ data: items, page, limit, total });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const prod = await Product.findById(req.params.id);
  if (!prod) return res.status(404).json({ message: 'Not found' });
  res.json(prod);
});

export const getProductStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await Product.aggregate([
    {
      $group: {
        _id: '$categoryId',
        totalProducts: { $sum: 1 },
        averagePrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    { $sort: { totalProducts: -1 } },
  ]);
  res.json(stats);
});

export const getTopProducts = asyncHandler(async (_req: Request, res: Response) => {
  const top = await Product.find().sort({ price: -1 }).limit(10);
  res.json(top);
});

export const getLowStockProducts = asyncHandler(async (req: Request, res: Response) => {
  const threshold = Math.max(parseInt(req.query.threshold as string, 10) || 5, 0);
  const list = await Product.find({ quantity: { $lte: threshold } }).sort({ quantity: 1 });
  res.json(list);
});

export const getPriceDistribution = asyncHandler(async (req: Request, res: Response) => {
  const buckets = Math.max(parseInt(req.query.buckets as string, 10) || 5, 1);
  const distribution = await Product.aggregate([
    { $bucketAuto: { groupBy: '$price', buckets } },
  ]);
  res.json(distribution);
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

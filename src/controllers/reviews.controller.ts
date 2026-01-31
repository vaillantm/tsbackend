import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, rating, comment } = req.body;
  if (!productId) return res.status(400).json({ message: 'Product is required' });
  const ratingValue = Number(rating);
  if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const existing = await Review.findOne({ productId, userId: req.user!.id });
  if (existing) return res.status(400).json({ message: 'Review already exists for this product' });

  const review = await Review.create({
    productId,
    userId: req.user!.id,
    rating: ratingValue,
    comment,
  });

  res.status(201).json(review);
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const reviews = await Review.find({ productId: req.params.productId })
    .populate('userId', 'name email role')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

export const getMyReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await Review.find({ userId: req.user!.id })
    .populate('productId', 'name price images')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

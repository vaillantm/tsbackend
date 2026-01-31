import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { Types } from 'mongoose';

async function getCart(userId: string) {
  // Find the most recent cart for the user
  let cart = await Cart.findOne({ userId }).sort({ updatedAt: -1 });

  // If not, create it safely
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }

  return cart;
}

export const getMyCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getCart(req.user!.id);
  res.json(cart);
});

export const addToCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized: User not found" });
  }
  const { productId, quantity } = req.body;
  const qty = Number(quantity ?? 1);
  if (!productId) return res.status(400).json({ message: 'Product is required' });
  if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const cart = await getCart(req.user!.id);

  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }

  const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
  const nextQuantity = idx >= 0 ? cart.items[idx].quantity + qty : qty;
  if (product.quantity < nextQuantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }
  if (idx >= 0) cart.items[idx].quantity = nextQuantity;
  else cart.items.push({ productId: new Types.ObjectId(productId), quantity: qty });
  await cart.save();
  res.json(cart);
});

export const updateQuantity = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId, quantity } = req.body;
  const qty = Number(quantity);
  if (!productId) return res.status(400).json({ message: 'Product is required' });
  if (!Number.isFinite(qty) || qty < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });
  const cart = await getCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  const item = cart.items.find((i) => i.productId.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });
  item.quantity = qty;
  await cart.save();
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ message: 'Product is required' });
  const cart = await getCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  cart.items = cart.items.filter((i) => i.productId.toString() !== productId);
  await cart.save();
  res.json(cart);
});

export const clearCart = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await getCart(req.user!.id);
  if (!cart) {
    return res.status(500).json({ message: 'Cart not found for this user and could not be created.' });
  }
  cart.items = [];
  await cart.save();
  res.json(cart);
});

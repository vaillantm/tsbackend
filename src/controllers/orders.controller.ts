import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { sendOrderPlacedEmail, sendOrderStatusUpdateEmail } from '../utils/emailTemplates';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const cart = await Cart.findOne({ userId: req.user!.id });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });
  const products = await Product.find({ _id: { $in: cart.items.map((i) => i.productId) } });
  const items = cart.items.map((i) => {
    const p = products.find((x) => x._id.equals(i.productId))!;
    return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
  });
  const totalAmount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const order = await Order.create({ userId: req.user!.id, items, totalAmount, status: 'pending' });
  cart.items = [];
  await cart.save();
  // Email notification (non-blocking)
  (async () => {
    try {
      const user = await User.findById(req.user!.id);
      if (user) await sendOrderPlacedEmail(user, order._id.toString(), totalAmount);
    } catch (_) {}
  })();
  res.status(201).json(order);
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ userId: req.user!.id });
  res.json(orders);
});

export const getOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId.toString() !== req.user!.id) return res.status(404).json({ message: 'Not found' });
  res.json(order);
});

export const cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId.toString() !== req.user!.id) return res.status(404).json({ message: 'Not found' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel' });
  order.status = 'cancelled';
  await order.save();
  res.json(order);
});

export const adminListOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find();
  res.json(orders);
});

export const adminUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Not found' });
  // Email notification (non-blocking)
  (async () => {
    try {
      const user = await User.findById(order.userId);
      if (user) await sendOrderStatusUpdateEmail(user, order._id.toString(), order.status);
    } catch (_) {}
  })();
  res.json(order);
});

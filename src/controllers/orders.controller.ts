import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import { sendOrderPlacedEmail, sendOrderStatusUpdateEmail } from '../utils/emailTemplates';

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cart = await Cart.findOne({ userId: req.user!.id }).sort({ updatedAt: -1 }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const products = await Product.find({ _id: { $in: cart.items.map((i) => i.productId) } }).session(session);
    if (products.length !== cart.items.length) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'One or more products are unavailable' });
    }

    const items = cart.items.map((i) => {
      const p = products.find((x) => x._id.equals(i.productId))!;
      return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
    });

    for (const item of items) {
      const update = await Product.updateOne(
        { _id: item.productId, quantity: { $gte: item.quantity } },
        { $inc: { quantity: -item.quantity } },
        { session }
      );
      if (update.modifiedCount === 0) {
        await session.abortTransaction();
        return res.status(400).json({ message: 'Insufficient stock for one or more items' });
      }
    }

    const totalAmount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
    const [order] = await Order.create([{ userId: req.user!.id, items, totalAmount, status: 'pending' }], { session });

    cart.items = [];
    await cart.save({ session });

    await session.commitTransaction();

    // Email notification (non-blocking)
    (async () => {
      try {
        const user = await User.findById(req.user!.id);
        if (user) await sendOrderPlacedEmail(user, order._id.toString(), totalAmount);
      } catch (_) {}
    })();

    res.status(201).json(order);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
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
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(req.params.id).session(session);
    if (!order || order.userId.toString() !== req.user!.id) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Not found' });
    }
    if (order.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot cancel' });
    }

    order.status = 'cancelled';
    await order.save({ session });

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.productId },
        { $inc: { quantity: item.quantity } },
        { session }
      );
    }

    await session.commitTransaction();
    res.json(order);
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
});

export const adminListOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await Order.find();
  res.json(orders);
});

export const adminUpdateStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = req.body;
  const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const existing = await Order.findById(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Not found' });
  if (['delivered', 'cancelled'].includes(existing.status)) {
    return res.status(400).json({ message: 'Cannot update a completed order' });
  }
  existing.status = status;
  const order = await existing.save();
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

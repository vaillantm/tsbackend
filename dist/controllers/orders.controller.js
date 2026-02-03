"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUpdateStatus = exports.adminListOrders = exports.cancelOrder = exports.getOrder = exports.getMyOrders = exports.createOrder = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const asyncHandler_1 = require("../utils/asyncHandler");
const Cart_1 = require("../models/Cart");
const Product_1 = require("../models/Product");
const Order_1 = require("../models/Order");
const User_1 = require("../models/User");
const emailTemplates_1 = require("../utils/emailTemplates");
exports.createOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const cart = await Cart_1.Cart.findOne({ userId: req.user.id }).sort({ updatedAt: -1 }).session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cart is empty' });
        }
        const products = await Product_1.Product.find({ _id: { $in: cart.items.map((i) => i.productId) } }).session(session);
        if (products.length !== cart.items.length) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'One or more products are unavailable' });
        }
        const items = cart.items.map((i) => {
            const p = products.find((x) => x._id.equals(i.productId));
            return { productId: p._id, name: p.name, price: p.price, quantity: i.quantity };
        });
        for (const item of items) {
            const update = await Product_1.Product.updateOne({ _id: item.productId, quantity: { $gte: item.quantity } }, { $inc: { quantity: -item.quantity } }, { session });
            if (update.modifiedCount === 0) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Insufficient stock for one or more items' });
            }
        }
        const totalAmount = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
        const [order] = await Order_1.Order.create([{ userId: req.user.id, items, totalAmount, status: 'pending' }], { session });
        cart.items = [];
        await cart.save({ session });
        await session.commitTransaction();
        // Email notification (non-blocking)
        (async () => {
            try {
                const user = await User_1.User.findById(req.user.id);
                if (user)
                    await (0, emailTemplates_1.sendOrderPlacedEmail)(user, order._id.toString(), totalAmount);
            }
            catch (_) { }
        })();
        res.status(201).json(order);
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
});
exports.getMyOrders = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const orders = await Order_1.Order.find({ userId: req.user.id });
    res.json(orders);
});
exports.getOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid order id' });
    }
    const order = await Order_1.Order.findById(req.params.id);
    if (!order || order.userId.toString() !== req.user.id)
        return res.status(404).json({ message: 'Not found' });
    res.json(order);
});
exports.cancelOrder = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        if (!mongoose_1.default.isValidObjectId(req.params.id)) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid order id' });
        }
        const order = await Order_1.Order.findById(req.params.id).session(session);
        if (!order || order.userId.toString() !== req.user.id) {
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
            await Product_1.Product.updateOne({ _id: item.productId }, { $inc: { quantity: item.quantity } }, { session });
        }
        await session.commitTransaction();
        res.json(order);
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
});
exports.adminListOrders = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const orders = await Order_1.Order.find();
    res.json(orders);
});
exports.adminUpdateStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: 'Invalid order id' });
    }
    const existing = await Order_1.Order.findById(req.params.id);
    if (!existing)
        return res.status(404).json({ message: 'Not found' });
    if (['delivered', 'cancelled'].includes(existing.status)) {
        return res.status(400).json({ message: 'Cannot update a completed order' });
    }
    existing.status = status;
    const order = await existing.save();
    if (!order)
        return res.status(404).json({ message: 'Not found' });
    // Email notification (non-blocking)
    (async () => {
        try {
            const user = await User_1.User.findById(order.userId);
            if (user)
                await (0, emailTemplates_1.sendOrderStatusUpdateEmail)(user, order._id.toString(), order.status);
        }
        catch (_) { }
    })();
    res.json(order);
});

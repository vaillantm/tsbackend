"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getPriceDistribution = exports.getLowStockProducts = exports.getTopProducts = exports.getProductStats = exports.getProduct = exports.getProducts = exports.createProduct = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Product_1 = require("../models/Product");
const files_1 = require("../utils/files");
exports.createProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const body = req.body;
    const images = [];
    if (req.files && Array.isArray(req.files)) {
        for (const f of req.files)
            images.push(f.path);
    }
    const prod = await Product_1.Product.create({
        name: body.name,
        description: body.description,
        price: body.price,
        quantity: body.quantity,
        images,
        categoryId: body.categoryId,
        vendorId: req.user.id,
    });
    res.status(201).json(prod);
});
exports.getProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;
    const sortParam = req.query.sort || '-createdAt';
    const search = req.query.search || '';
    const filters = {};
    if (req.query.categoryId)
        filters.categoryId = req.query.categoryId;
    if (req.query.minPrice || req.query.maxPrice) {
        filters.price = {};
        if (req.query.minPrice)
            filters.price.$gte = Number(req.query.minPrice);
        if (req.query.maxPrice)
            filters.price.$lte = Number(req.query.maxPrice);
    }
    if (req.query.inStock === 'true')
        filters.quantity = { $gt: 0 };
    if (search) {
        filters.$text = { $search: search };
    }
    const [items, total] = await Promise.all([
        Product_1.Product.find(filters)
            .sort(sortParam)
            .skip(skip)
            .limit(limit),
        Product_1.Product.countDocuments(filters),
    ]);
    res.json({ data: items, page, limit, total });
});
exports.getProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    res.json(prod);
});
exports.getProductStats = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const stats = await Product_1.Product.aggregate([
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
exports.getTopProducts = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const top = await Product_1.Product.find().sort({ price: -1 }).limit(10);
    res.json(top);
});
exports.getLowStockProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const threshold = Math.max(parseInt(req.query.threshold, 10) || 5, 0);
    const list = await Product_1.Product.find({ quantity: { $lte: threshold } }).sort({ quantity: 1 });
    res.json(list);
});
exports.getPriceDistribution = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const buckets = Math.max(parseInt(req.query.buckets, 10) || 5, 1);
    const distribution = await Product_1.Product.aggregate([
        { $bucketAuto: { groupBy: '$price', buckets } },
    ]);
    res.json(distribution);
});
exports.updateProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && prod.vendorId.toString() !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
    const updates = { ...req.body };
    let oldImages;
    if (req.files && Array.isArray(req.files)) {
        oldImages = prod.images || [];
        updates.images = req.files.map((f) => f.path);
    }
    const updated = await Product_1.Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (oldImages && updates.images && Array.isArray(updates.images)) {
        // remove previous images only if replaced
        (0, files_1.removeFiles)(oldImages);
    }
    res.json(updated);
});
exports.deleteProduct = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const prod = await Product_1.Product.findById(req.params.id);
    if (!prod)
        return res.status(404).json({ message: 'Not found' });
    if (req.user.role !== 'admin' && prod.vendorId.toString() !== req.user.id)
        return res.status(403).json({ message: 'Forbidden' });
    const images = prod.images || [];
    await Product_1.Product.findByIdAndDelete(req.params.id);
    (0, files_1.removeFiles)(images);
    res.status(204).send();
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyReviews = exports.getProductReviews = exports.createReview = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
exports.createReview = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { productId, rating, comment } = req.body;
    if (!productId)
        return res.status(400).json({ message: 'Product is required' });
    const ratingValue = Number(rating);
    if (!Number.isFinite(ratingValue) || ratingValue < 1 || ratingValue > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    const product = await Product_1.Product.findById(productId);
    if (!product)
        return res.status(404).json({ message: 'Product not found' });
    const existing = await Review_1.Review.findOne({ productId, userId: req.user.id });
    if (existing)
        return res.status(400).json({ message: 'Review already exists for this product' });
    const review = await Review_1.Review.create({
        productId,
        userId: req.user.id,
        rating: ratingValue,
        comment,
    });
    res.status(201).json(review);
});
exports.getProductReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviews = await Review_1.Review.find({ productId: req.params.productId })
        .populate('userId', 'name email role')
        .sort({ createdAt: -1 });
    res.json(reviews);
});
exports.getMyReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const reviews = await Review_1.Review.find({ userId: req.user.id })
        .populate('productId', 'name price images')
        .sort({ createdAt: -1 });
    res.json(reviews);
});

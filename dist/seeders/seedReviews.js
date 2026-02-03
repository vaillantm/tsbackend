"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Review_1 = require("../models/Review");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const utils_1 = require("./utils");
async function seedReviews() {
    await Review_1.Review.deleteMany({});
    const product = await Product_1.Product.findOne();
    if (!product) {
        throw new Error('No products found. Run seed:products first.');
    }
    const customer = await User_1.User.findOne({ role: 'customer' });
    if (!customer) {
        throw new Error('No customer found. Run seed:users first.');
    }
    const reviews = await Review_1.Review.create([
        {
            productId: product._id,
            userId: customer._id,
            rating: 5,
            comment: 'Excellent quality and fast shipping.',
        },
    ]);
    console.log(`Seeded ${reviews.length} reviews`);
}
(0, utils_1.connectAndSeed)(seedReviews)
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});

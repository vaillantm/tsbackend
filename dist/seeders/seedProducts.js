"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Category_1 = require("../models/Category");
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const utils_1 = require("./utils");
async function seedProducts() {
    await Product_1.Product.deleteMany({});
    await Category_1.Category.deleteMany({});
    let vendor = await User_1.User.findOne({ role: 'vendor' });
    if (!vendor) {
        const password = await bcryptjs_1.default.hash('Password123!', 10);
        vendor = await User_1.User.create({
            name: 'Seed Vendor',
            username: 'seed-vendor',
            email: 'seed-vendor@example.com',
            password,
            role: 'vendor',
        });
    }
    const categories = await Category_1.Category.create([
        { name: 'Electronics', path: 'electronics', description: 'Devices and gadgets', createdBy: vendor._id },
        { name: 'Apparel', path: 'apparel', description: 'Clothing and accessories', createdBy: vendor._id },
    ]);
    const products = await Product_1.Product.create([
        {
            name: 'Wireless Headphones',
            description: 'Noise-cancelling over-ear headphones',
            price: 199.99,
            quantity: 25,
            images: [],
            categoryId: categories[0]._id,
            vendorId: vendor._id,
        },
        {
            name: 'Smart Watch',
            description: 'Fitness tracking smartwatch',
            price: 149.99,
            quantity: 40,
            images: [],
            categoryId: categories[0]._id,
            vendorId: vendor._id,
        },
        {
            name: 'Hoodie',
            description: 'Soft cotton hoodie',
            price: 59.99,
            quantity: 60,
            images: [],
            categoryId: categories[1]._id,
            vendorId: vendor._id,
        },
    ]);
    console.log(`Seeded ${categories.length} categories and ${products.length} products`);
}
(0, utils_1.connectAndSeed)(seedProducts)
    .then(() => process.exit(0))
    .catch((err) => {
    console.error(err);
    process.exit(1);
});

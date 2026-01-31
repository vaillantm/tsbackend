import bcrypt from 'bcryptjs';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { connectAndSeed } from './utils';

async function seedProducts() {
  await Product.deleteMany({});
  await Category.deleteMany({});

  let vendor = await User.findOne({ role: 'vendor' });
  if (!vendor) {
    const password = await bcrypt.hash('Password123!', 10);
    vendor = await User.create({
      name: 'Seed Vendor',
      username: 'seed-vendor',
      email: 'seed-vendor@example.com',
      password,
      role: 'vendor',
    });
  }

  const categories = await Category.create([
    { name: 'Electronics', path: 'electronics', description: 'Devices and gadgets', createdBy: vendor._id },
    { name: 'Apparel', path: 'apparel', description: 'Clothing and accessories', createdBy: vendor._id },
  ]);

  const products = await Product.create([
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

connectAndSeed(seedProducts)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

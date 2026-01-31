import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { User } from '../models/User';
import { connectAndSeed } from './utils';

async function seedReviews() {
  await Review.deleteMany({});

  const product = await Product.findOne();
  if (!product) {
    throw new Error('No products found. Run seed:products first.');
  }

  const customer = await User.findOne({ role: 'customer' });
  if (!customer) {
    throw new Error('No customer found. Run seed:users first.');
  }

  const reviews = await Review.create([
    {
      productId: product._id,
      userId: customer._id,
      rating: 5,
      comment: 'Excellent quality and fast shipping.',
    },
  ]);

  console.log(`Seeded ${reviews.length} reviews`);
}

connectAndSeed(seedReviews)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

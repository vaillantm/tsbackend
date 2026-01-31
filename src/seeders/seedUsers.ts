import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { connectAndSeed } from './utils';

async function seedUsers() {
  await User.deleteMany({});

  const password = await bcrypt.hash('Password123!', 10);
  const users = await User.create([
    {
      name: 'Admin User',
      username: 'admin',
      email: 'admin@example.com',
      password,
      role: 'admin',
    },
    {
      name: 'Vendor User',
      username: 'vendor',
      email: 'vendor@example.com',
      password,
      role: 'vendor',
    },
    {
      name: 'Customer User',
      username: 'customer',
      email: 'customer@example.com',
      password,
      role: 'customer',
    },
  ]);

  console.log(`Seeded ${users.length} users`);
}

connectAndSeed(seedUsers)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

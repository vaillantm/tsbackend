import mongoose from 'mongoose';
import { connectDB } from '../config/db';

export async function connectAndSeed(seedFn: () => Promise<void>) {
  await connectDB();
  try {
    await seedFn();
  } finally {
    await mongoose.disconnect();
  }
}

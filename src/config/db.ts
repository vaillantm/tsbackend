import mongoose from 'mongoose';
import { config } from './env';

export async function connectDB() {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}

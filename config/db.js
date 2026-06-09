import mongoose from 'mongoose';
import './env.js';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined');
  }
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

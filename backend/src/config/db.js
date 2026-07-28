import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/blog_db';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Primary MongoDB Connection Warning (${error.message}). Trying fallback to local MongoDB...`);
    try {
      const conn = await mongoose.connect('mongodb://localhost:27017/blog_db');
      console.log(`Local MongoDB Connected Fallback: ${conn.connection.host}`);
    } catch (fallbackError) {
      console.error(`MongoDB Connection Error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

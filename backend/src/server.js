import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';
import { seedDatabaseIfEmpty } from './utils/seedMongo.js';
import postRoutes from './routes/postRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB & seed initial data if empty
connectDB().then(() => {
  seedDatabaseIfEmpty();
});

const app = express();
const PORT = process.env.PORT || 5000;

// Standard Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes mapping
app.use('/api/posts', postRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Holographic Blog MongoDB Backend Server is Running!' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;

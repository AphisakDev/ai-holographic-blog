import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import postRoutes from './apps/postRoutes.mjs';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import authRouter from './routes/auth.mjs';

// ขั้นตอนที่ 9: นำเข้า Middlewares ป้องกันเส้นทาง
import protectUser from './middlewares/protectUser.mjs';
import protectAdmin from './middlewares/protectAdmin.mjs';

// Load environment variables
dotenv.config();

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
app.use('/api/auth', authRouter);
app.use('/auth', authRouter);

// ขั้นตอนที่ 9: ตัวอย่างการใช้งาน Middleware กับ Routes ที่ต้องการป้องกัน
app.get('/protected-route', protectUser, (req, res) => {
  res.json({ message: 'This is protected content', user: req.user });
});

app.get('/admin-only', protectAdmin, (req, res) => {
  res.json({ message: 'This is admin-only content', admin: req.user });
});

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Express Supabase Backend Server is Healthy' });
});

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'Holographic Blog Express + Supabase Backend Server is Running!' });
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

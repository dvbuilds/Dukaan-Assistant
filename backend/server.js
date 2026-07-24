import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import productItemRoutes from './routes/productItemRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import shopOrderRoutes from './routes/shopOrderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Dukaan Assistant API is running.' });
});

// Route mounting
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);

// Nested under a shop: products, orders, AI — mergeParams in each router
// picks up :shopId from these parent mounts.
app.use('/api/shops/:shopId/products', productRoutes);
app.use('/api/shops/:shopId/orders', shopOrderRoutes);
app.use('/api/shops/:shopId/ai', aiRoutes);

// Flat resource routes (operate by their own :id, not nested under a shop)
app.use('/api/products', productItemRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// 404 + centralized error handler — must be last
app.use(notFound);
app.use(errorHandler);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();

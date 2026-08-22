import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { seedDatabase } from './database/seed.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import recoveryRoutes from './routes/recoveryRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import chaosRoutes from './routes/chaosRoutes.js';
import agenticRoutes from './routes/agenticRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting for API protection (120 req / 1 minute)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests from this IP, please try again after a minute' }
});
app.use('/api', apiLimiter);

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Razorpay RevivePay Enterprise API",
    version: "2.5.0",
    authMode: process.env.AUTH_BYPASS_DEMO !== 'false' ? 'DEMO_BYPASS_ENABLED' : 'JWT_STRICT',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Public Auth routes
app.use('/api/auth', authRoutes);

// JWT & Merchant Scoping Middleware for Protected API routes
app.use('/api', authMiddleware);

// API Routes (Scoped to merchant)
app.use('/api/recovery', recoveryRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/chaos', chaosRoutes);
app.use('/api/agentic-commerce', agenticRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Backend Error:", err);
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

// Seed DB if empty
seedDatabase();

app.listen(PORT, () => {
  console.log(`🚀 RevivePay Enterprise Backend running on http://localhost:${PORT}`);
});

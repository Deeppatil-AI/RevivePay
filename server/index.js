import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { logger } from './logger.js';
import { initSocketIO } from './services/socketService.js';
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
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

initSocketIO(io);

const PORT = process.env.PORT || 5000;

// Security Hardening with Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for seamless SPA + API serving in development
    crossOriginEmbedderPolicy: false
  })
);

// Global Middleware
app.use(cors());
app.use(express.json());

// Metrics & Latency Tracking Middleware
const metrics = {
  requestCount: 0,
  errorCount: 0,
  totalLatencyMs: 0,
  startedAt: new Date().toISOString()
};

app.use((req, res, next) => {
  const start = Date.now();
  metrics.requestCount++;

  res.on('finish', () => {
    const duration = Date.now() - start;
    metrics.totalLatencyMs += duration;
    if (res.statusCode >= 400) {
      metrics.errorCount++;
    }
  });

  next();
});

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

// Observability & Metrics endpoint
app.get('/api/metrics', (req, res) => {
  const avgLatencyMs = metrics.requestCount > 0 
    ? Math.round(metrics.totalLatencyMs / metrics.requestCount) 
    : 0;

  res.json({
    success: true,
    metrics: {
      requestCount: metrics.requestCount,
      errorCount: metrics.errorCount,
      averageLatencyMs: avgLatencyMs,
      errorRatePct: metrics.requestCount > 0 ? Number(((metrics.errorCount / metrics.requestCount) * 100).toFixed(2)) : 0,
      uptimeSeconds: Math.floor(process.uptime()),
      startedAt: metrics.startedAt,
      systemMemoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
    }
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

// Serve frontend static build in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler with structured logger
app.use((err, req, res, next) => {
  logger.error({ err, path: req.path }, 'Unhandled backend error');
  res.status(500).json({ success: false, error: err.message || "Internal Server Error" });
});

// Seed DB if empty
seedDatabase();

httpServer.listen(PORT, () => {
  logger.info(`🚀 RevivePay Enterprise Backend running on http://localhost:${PORT}`);
});

import express from 'express';
import cors from 'cors';
import recoveryRoutes from './routes/recoveryRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import chaosRoutes from './routes/chaosRoutes.js';
import agenticRoutes from './routes/agenticRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "Razorpay RevivePay Enterprise API",
    version: "2.5.0",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// API Routes
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

app.listen(PORT, () => {
  console.log(`🚀 RevivePay Enterprise Backend running on http://localhost:${PORT}`);
});

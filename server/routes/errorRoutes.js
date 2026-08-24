import express from 'express';
import { db } from '../database/store.js';
import { logger } from '../logger.js';

const router = express.Router();

// POST /api/errors - Log client-side / React Error Boundary exceptions
router.post('/', (req, res) => {
  const { viewName, message, stack, componentStack, userAgent } = req.body || {};

  try {
    const errorEntry = {
      id: `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      viewName: viewName || 'Unknown View',
      message: message || 'Unspecified React Exception',
      stack: stack || null,
      componentStack: componentStack || null,
      userAgent: userAgent || req.headers['user-agent'] || null,
      timestamp: new Date().toISOString(),
      merchantId: req.merchantId || 'merchant_rzp_primary'
    };

    db.addErrorLog(errorEntry);

    logger.error({
      event: 'CLIENT_ERROR_LOGGED',
      viewName: errorEntry.viewName,
      message: errorEntry.message
    }, `Client React Error in ${errorEntry.viewName}: ${errorEntry.message}`);

    res.status(201).json({
      success: true,
      id: errorEntry.id,
      message: 'Error logged successfully'
    });
  } catch (err) {
    logger.error({ err: err.message }, 'Failed to record error log');
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/errors - Retrieve recorded error logs for auditability
router.get('/', (req, res) => {
  const list = db.errorLogs || [];
  res.json({
    success: true,
    count: list.length,
    errors: list
  });
});

export default router;

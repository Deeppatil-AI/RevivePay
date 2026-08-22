import express from 'express';
import { db } from '../database/store.js';
import { processSingleTransaction } from '../services/agentOrchestrator.js';
import { generateFullBatch } from '../../src/data/syntheticBatch.js';

const router = express.Router();

// GET all subscription transactions
router.get('/transactions', (req, res) => {
  res.json({
    success: true,
    count: db.subscriptions.length,
    transactions: db.subscriptions
  });
});

// POST process single transaction
router.post('/process/:id', async (req, res) => {
  try {
    const txn = db.subscriptions.find(s => s.id === req.params.id);
    if (!txn) return res.status(404).json({ success: false, message: "Transaction not found" });

    const result = await processSingleTransaction(txn);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST process all pending transactions in batch
router.post('/process-batch', async (req, res) => {
  try {
    const pending = db.subscriptions.filter(s => !s.recoveryResult);
    const results = [];
    for (const t of pending) {
      const resSingle = await processSingleTransaction(t);
      results.push(resSingle);
    }
    res.json({
      success: true,
      processedCount: results.length,
      transactions: db.subscriptions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST reset batch
router.post('/reset', (req, res) => {
  db.subscriptions = generateFullBatch(3);
  db.auditLogs = [];
  res.json({ success: true, message: "Batch reset successfully", count: db.subscriptions.length });
});

// GET & POST policy guardrails
router.get('/policy', (req, res) => {
  res.json({ success: true, policy: db.policy });
});

router.post('/policy', (req, res) => {
  db.policy = { ...db.policy, ...req.body };
  res.json({ success: true, policy: db.policy });
});

// GET audit logs
router.get('/audit-logs', (req, res) => {
  res.json({ success: true, count: db.auditLogs.length, auditLogs: db.auditLogs });
});

export default router;

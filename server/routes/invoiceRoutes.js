import express from 'express';
import { getInvoices, registerPromiseToPay, markInvoiceSettled } from '../services/ptpTracker.js';

const router = express.Router();

// GET all B2B invoices
router.get('/', (req, res) => {
  res.json({ success: true, invoices: getInvoices() });
});

// POST register Promise-to-Pay (PTP)
router.post('/register-ptp/:id', (req, res) => {
  try {
    const { ptpDate, notes } = req.body;
    const result = registerPromiseToPay(req.params.id, ptpDate, notes);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST mark invoice settled
router.post('/settle/:id', (req, res) => {
  try {
    const inv = markInvoiceSettled(req.params.id);
    res.json({ success: true, invoice: inv });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

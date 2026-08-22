import express from 'express';
import { z } from 'zod';
import { getInvoices, registerPromiseToPay, markInvoiceSettled } from '../services/ptpTracker.js';

const router = express.Router();

const ptpSchema = z.object({
  ptpDate: z.string().min(4, "PTP Date is required"),
  notes: z.string().optional()
});

// GET all B2B invoices
router.get('/', (req, res) => {
  res.json({ success: true, invoices: getInvoices() });
});

// POST register Promise-to-Pay (PTP) with Zod validation
router.post('/register-ptp/:id', (req, res) => {
  try {
    const parseResult = ptpSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ 
        success: false, 
        error: "Validation Error", 
        details: parseResult.error.errors.map(e => e.message) 
      });
    }

    const { ptpDate, notes } = parseResult.data;
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

import express from 'express';
import { negotiateAgenticCommerce } from '../services/agenticCommerceService.js';

const router = express.Router();

// POST autonomous machine-to-machine negotiation (NPCI UAP / x402)
router.post('/negotiate', (req, res) => {
  try {
    const result = negotiateAgenticCommerce(req.body);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

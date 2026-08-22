import express from 'express';
import { getDisputes, compileDisputeDossier } from '../services/disputeService.js';

const router = express.Router();

// GET all disputes
router.get('/', (req, res) => {
  res.json({ success: true, disputes: getDisputes() });
});

// POST compile & submit dispute defense dossier
router.post('/submit-dossier/:id', (req, res) => {
  try {
    const result = compileDisputeDossier(req.params.id);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

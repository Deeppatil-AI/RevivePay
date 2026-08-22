import express from 'express';
import { triggerChaosOutage, resetChaosMode, getChaosStatus } from '../services/chaosService.js';

const router = express.Router();

// GET chaos status
router.get('/status', (req, res) => {
  res.json({ success: true, ...getChaosStatus() });
});

// POST trigger bank chaos outage
router.post('/trigger', (req, res) => {
  const { bankKey = "SBI", scenario = "MIDNIGHT_CBS_LOCK" } = req.body;
  const result = triggerChaosOutage(bankKey, scenario);
  res.json({ success: true, message: `Chaos Outage triggered for ${bankKey}`, ...result });
});

// POST reset chaos mode
router.post('/reset', (req, res) => {
  const result = resetChaosMode();
  res.json({ success: true, ...result });
});

export default router;

import express from 'express';
import { generateMerchantToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/token - Mint a signed JWT token for a merchant
router.post('/token', (req, res) => {
  const { merchantId = 'merchant_rzp_primary', expiresIn = '7d' } = req.body;
  const token = generateMerchantToken(merchantId, expiresIn);
  res.json({
    success: true,
    token,
    merchantId,
    tokenType: 'Bearer',
    expiresIn
  });
});

// GET /api/auth/verify - Verify current auth context
router.get('/verify', (req, res) => {
  res.json({
    success: true,
    merchantId: req.merchantId || 'merchant_rzp_primary',
    isDemo: Boolean(req.isDemo)
  });
});

export default router;

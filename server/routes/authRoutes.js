import express from 'express';
import { generateMerchantToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const DEMO_API_KEY = process.env.DEMO_API_KEY || 'revivepay_demo_key_2026';

// POST /api/auth/token - Mint a signed JWT token for a merchant (requires DEMO_API_KEY)
router.post('/token', (req, res) => {
  const providedKey = req.headers['x-api-key'] || req.body?.apiKey;

  if (!providedKey || providedKey !== DEMO_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Authentication failed. Valid x-api-key header or apiKey in body is required to issue tokens.'
    });
  }

  const { merchantId = 'merchant_rzp_primary', expiresIn = '7d' } = req.body || {};
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

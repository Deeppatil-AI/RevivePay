import express from 'express';
import crypto from 'crypto';
import { generateMerchantToken } from '../middleware/authMiddleware.js';
import { logger } from '../logger.js';

const router = express.Router();

let activeApiKey = process.env.DEMO_API_KEY;

if (!activeApiKey) {
  if (process.env.NODE_ENV === 'production') {
    logger.error('❌ SECURITY FATAL: DEMO_API_KEY is not set in production. Token minting is disabled!');
  } else {
    // Ephemeral random key generated once at boot so it's never a guessable constant
    activeApiKey = crypto.randomBytes(16).toString('hex');
    logger.info({ ephemeralApiKey: activeApiKey }, '🔑 Ephemeral DEMO_API_KEY generated for local session');
  }
}

// POST /api/auth/token - Mint a signed JWT token for a merchant (requires DEMO_API_KEY)
router.post('/token', (req, res) => {
  if (!activeApiKey) {
    return res.status(500).json({
      success: false,
      error: 'Token issuance is disabled because DEMO_API_KEY is not configured in production.'
    });
  }

  const providedKey = req.headers['x-api-key'] || req.body?.apiKey;

  if (!providedKey || providedKey !== activeApiKey) {
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

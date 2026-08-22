import jwt from 'jsonwebtoken';
import { logger } from '../logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'revivepay_jwt_secret_token_dev_2026';

if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'revivepay_jwt_secret_token_dev_2026')) {
  logger.warn('⚠️ SECURITY WARNING: JWT_SECRET is missing or using default development token in production mode!');
}

export function authMiddleware(req, res, next) {
  // Allow health checks and metrics without auth
  if (req.path === '/api/health' || req.path === '/api/metrics' || req.path.startsWith('/api/auth/')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.merchantId = decoded.merchantId || decoded.sub || 'merchant_rzp_primary';
      req.user = decoded;
      return next();
    } catch (err) {
      if (process.env.AUTH_BYPASS_DEMO === 'false') {
        return res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
      }
    }
  }

  // Demo bypass mode: enabled by default for frictionless demo flow
  const isDemoBypass = process.env.AUTH_BYPASS_DEMO !== 'false' || req.headers['x-demo-mode'] === 'true';
  if (isDemoBypass) {
    req.merchantId = req.headers['x-merchant-id'] || 'merchant_rzp_primary';
    req.isDemo = true;
    return next();
  }

  return res.status(401).json({ 
    success: false, 
    error: 'Authentication required. Provide Authorization: Bearer <token> or set AUTH_BYPASS_DEMO=true' 
  });
}

export function generateMerchantToken(merchantId = 'merchant_rzp_primary', expiresIn = '7d') {
  return jwt.sign(
    { merchantId, role: 'merchant_admin', issuer: 'revivepay_auth_v1' },
    JWT_SECRET,
    { expiresIn }
  );
}

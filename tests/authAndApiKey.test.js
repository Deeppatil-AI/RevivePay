import { describe, it, expect } from 'vitest';
import { generateMerchantToken } from '../server/middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

describe('Merchant JWT Authentication & Token Issuance', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'revivepay_jwt_secret_token_dev_2026';

  it('generates a verifiable JWT token scoped to merchantId', () => {
    const token = generateMerchantToken('merchant_test_7788', '1h');
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.merchantId).toBe('merchant_test_7788');
    expect(decoded.role).toBe('merchant_admin');
    expect(decoded.issuer).toBe('revivepay_auth_v1');
  });

  it('rejects invalid or tampered tokens', () => {
    const validToken = generateMerchantToken('merchant_test_7788', '1h');
    const tamperedToken = validToken.slice(0, -5) + 'xxxxx';
    expect(() => jwt.verify(tamperedToken, JWT_SECRET)).toThrow();
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { requireRoles, enforceMerchantScope } from '../server/middleware/rbacMiddleware.js';

describe('Role-Based Access Control (RBAC) & Security Policy', () => {
  it('allows ADMIN or MERCHANT_ADMIN role to access restricted routes', () => {
    const middleware = requireRoles('ADMIN');
    const req = { user: { role: 'ADMIN' } };
    let called = false;
    const next = () => { called = true; };
    const res = { status: () => ({ json: () => {} }) };

    middleware(req, res, next);
    expect(called).toBe(true);
  });

  it('blocks SUPPORT role from executing high-privilege merchant refund/payment routes', () => {
    const middleware = requireRoles('MERCHANT', 'ADMIN');
    const req = { user: { role: 'SUPPORT' }, path: '/api/refunds/request', method: 'POST' };
    let statusCode = 0;
    let jsonResult = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (payload) => { jsonResult = payload; }
        };
      }
    };
    const next = () => {};

    middleware(req, res, next);
    expect(statusCode).toBe(403);
    expect(jsonResult.success).toBe(false);
    expect(jsonResult.error).toContain('Access Denied');
  });

  it('permits ANALYST role to access analytical and audit reporting routes', () => {
    const middleware = requireRoles('ANALYST', 'ADMIN');
    const req = { user: { role: 'ANALYST' } };
    let called = false;
    const next = () => { called = true; };
    const res = {};

    middleware(req, res, next);
    expect(called).toBe(true);
  });

  it('enforces merchant data boundary and prevents cross-merchant IDOR', () => {
    // Same merchant
    expect(enforceMerchantScope('merchant_acme_123', 'merchant_acme_123')).toBe(true);
    
    // Cross-merchant unauthorized attempt
    expect(enforceMerchantScope('merchant_victim_999', 'merchant_attacker_001')).toBe(false);

    // Primary demo / Admin override
    expect(enforceMerchantScope('merchant_victim_999', 'merchant_rzp_primary')).toBe(true);
  });
});

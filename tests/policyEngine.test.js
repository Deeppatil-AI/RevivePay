import { describe, it, expect } from 'vitest';
import { evaluateBackendPolicy } from '../server/services/policyEngine.js';

describe('Server-side Policy Engine & Gating', () => {
  const sampleTxn = {
    id: 'txn_srv_7719',
    amount: 2499,
    customerLtv: 15000,
    churnRisk: 'HIGH',
    retryCount: 0
  };

  it('approves retention discount and computes accurate payable amount', () => {
    const result = evaluateBackendPolicy(sampleTxn, 'OFFER_RETENTION_DISCOUNT');
    expect(result.status).toBe('APPROVED');
    expect(result.actionApproved).toBe(true);
    expect(result.appliedDiscount).toBe(200); // 8% of 2499 = ~200 <= 250 cap
    expect(result.finalPayableAmount).toBe(2299);
    expect(result.auditToken).toMatch(/^sha256_/);
  });

  it('escalates enterprise amounts (>= ₹10,000) to human CFO review desk', () => {
    const highTicket = { ...sampleTxn, amount: 25000 };
    const result = evaluateBackendPolicy(highTicket, 'EXECUTE_RECOVERY');
    expect(result.status).toBe('ESCALATED');
    expect(result.actionApproved).toBe(false);
    expect(result.guardrailTriggered).toBe('HIGH_VALUE_TICKET_GATING');
  });

  it('enforces stopping rule when max retry count is reached', () => {
    const maxRetry = { ...sampleTxn, retryCount: 3 };
    const result = evaluateBackendPolicy(maxRetry, 'EXECUTE_RECOVERY');
    expect(result.status).toBe('BLOCKED');
    expect(result.actionApproved).toBe(false);
    expect(result.guardrailTriggered).toBe('MAX_RETRIES_EXCEEDED');
  });
});

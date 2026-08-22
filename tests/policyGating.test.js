import { describe, it, expect } from 'vitest';
import { evaluatePolicyGating, DEFAULT_MERCHANT_POLICY } from '../src/engine/policyGating.js';

describe('Policy & Guardrails Governance Engine (Frontend)', () => {
  const baseTxn = {
    id: 'sub_tx_1001',
    customerName: 'Aarav Sharma',
    amount: 1499,
    customerLtv: 12000,
    churnRisk: 'HIGH',
    retryCount: 1
  };

  it('approves bounded retention discount for high-LTV high churn-risk customer', () => {
    const res = evaluatePolicyGating(baseTxn, 'OFFER_RETENTION_DISCOUNT', DEFAULT_MERCHANT_POLICY);
    expect(res.status).toBe('APPROVED');
    expect(res.actionApproved).toBe(true);
    expect(res.incentiveApproved).toBe(true);
    expect(res.appliedDiscount).toBe(120); // 8% of 1499 = ~120 <= 250 cap
    expect(res.finalPayableAmount).toBe(1379);
    expect(res.guardrailTriggered).toBeNull();
  });

  it('caps discount at absolute rupee ceiling (₹250)', () => {
    const largeTxn = { ...baseTxn, amount: 6000 };
    const res = evaluatePolicyGating(largeTxn, 'OFFER_RETENTION_DISCOUNT', DEFAULT_MERCHANT_POLICY);
    expect(res.appliedDiscount).toBe(250); // 8% of 6000 is 480, capped at 250
    expect(res.finalPayableAmount).toBe(5750);
  });

  it('denies retention discount if customer LTV is below minimum policy threshold (₹8000)', () => {
    const lowLtvTxn = { ...baseTxn, customerLtv: 3500 };
    const res = evaluatePolicyGating(lowLtvTxn, 'OFFER_RETENTION_DISCOUNT', DEFAULT_MERCHANT_POLICY);
    expect(res.status).toBe('APPROVED');
    expect(res.incentiveApproved).toBe(false);
    expect(res.appliedDiscount).toBe(0);
    expect(res.finalPayableAmount).toBe(1499);
  });

  it('escalates to Human Controller when ticket size exceeds threshold (>= ₹10,000)', () => {
    const enterpriseTxn = { ...baseTxn, amount: 15000 };
    const res = evaluatePolicyGating(enterpriseTxn, 'EXECUTE_RECOVERY', DEFAULT_MERCHANT_POLICY);
    expect(res.status).toBe('ESCALATED');
    expect(res.actionApproved).toBe(false);
    expect(res.guardrailTriggered).toBe('HIGH_VALUE_TRANSACTION_LIMIT');
  });

  it('blocks execution when max automated retries (3) are exceeded', () => {
    const maxRetryTxn = { ...baseTxn, retryCount: 3 };
    const res = evaluatePolicyGating(maxRetryTxn, 'EXECUTE_RECOVERY', DEFAULT_MERCHANT_POLICY);
    expect(res.status).toBe('BLOCKED');
    expect(res.actionApproved).toBe(false);
    expect(res.guardrailTriggered).toBe('MAX_RETRIES_EXCEEDED');
  });
});

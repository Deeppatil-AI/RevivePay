import { describe, it, expect } from 'vitest';
import { db } from '../server/database/store.js';
import { PAYMENT_STATES, transitionPaymentState, InvalidStateTransitionError } from '../server/services/paymentStateMachine.js';
import { FraudDetectionService } from '../server/services/fraudDetectionService.js';
import { LedgerService } from '../server/services/ledgerService.js';

describe('Priority 9 & 3: Payment Security & Server-Side Verification', () => {
  it('blocks unauthorized transition directly from CREATED to SUCCESS', () => {
    const rawPayment = db.insertPayment({
      id: `pay_sec_test_${Date.now()}`,
      status: PAYMENT_STATES.CREATED,
      amount: 4500,
      currency: 'INR',
      sender: 'Tester',
      receiver: 'Merchant',
      paymentMethod: 'upi',
      idempotencyKey: `idemp_sec_${Date.now()}`
    });

    expect(() => {
      transitionPaymentState(rawPayment, PAYMENT_STATES.SUCCESS);
    }).toThrow(InvalidStateTransitionError);
  });

  it('evaluates and blocks high-risk payment attempts automatically', () => {
    const fraudTxn = {
      id: 'pay_fraud_001',
      amount: 150000,
      sender: 'Blacklisted_Bot_Agent',
      metadata: { isTorOrVpn: true, isNewDevice: true }
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(fraudTxn);
    expect(assessment.decision).toBe('BLOCK');
    expect(assessment.risk_level).toBe('HIGH');
  });

  it('verifies ledger balance integrity after mixed payments and partial refunds', () => {
    const p1 = db.insertPayment({
      id: `pay_mix_1_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 10000,
      sender: 'Enterprise Client A',
      receiver: 'Razorpay RevivePay Merchant',
      paymentMethod: 'netbanking',
      idempotencyKey: `idemp_mix1_${Date.now()}`
    });
    LedgerService.recordPaymentSettlement(p1);

    const p2 = db.insertPayment({
      id: `pay_mix_2_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 7500,
      sender: 'Enterprise Client B',
      receiver: 'Razorpay RevivePay Merchant',
      paymentMethod: 'card',
      idempotencyKey: `idemp_mix2_${Date.now()}`
    });
    LedgerService.recordPaymentSettlement(p2);

    // Partial refund on p1
    const rf = db.insertRefund({
      id: `rfnd_mix_1_${Date.now()}`,
      paymentId: p1.id,
      amount: 2500,
      reason: 'Partial license return',
      status: 'REFUNDED'
    });
    LedgerService.recordRefundSettlement(rf, p1);

    const integrity = LedgerService.verifyLedgerIntegrity();
    expect(integrity.isBalanced).toBe(true);
    expect(integrity.difference).toBe(0);
  });
});

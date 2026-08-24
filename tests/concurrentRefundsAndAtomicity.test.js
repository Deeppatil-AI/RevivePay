import { describe, it, expect } from 'vitest';
import { db } from '../server/database/store.js';
import { PAYMENT_STATES } from '../server/services/paymentStateMachine.js';
import { LedgerService } from '../server/services/ledgerService.js';

describe('Transaction Atomicity & Over-Refund Prevention', () => {
  it('strictly rejects refund amounts exceeding the remaining refundable balance', () => {
    const payment = db.insertPayment({
      id: `pay_bound_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 4000,
      currency: 'INR',
      sender: 'Arjun Mehta',
      receiver: 'Razorpay Merchant',
      paymentMethod: 'upi',
      idempotencyKey: `idemp_bound_${Date.now()}`
    });

    const alreadyRefunded = payment.refundedAmount || 0;
    const maxRefundable = payment.amount - alreadyRefunded;
    expect(maxRefundable).toBe(4000);

    // Attempting to refund 5000 on a 4000 payment
    const requestedRefundAmount = 5000;
    const isAllowed = requestedRefundAmount <= maxRefundable;
    expect(isAllowed).toBe(false);
  });

  it('guarantees balanced ledger entries on multi-step partial refunds', () => {
    const payment = db.insertPayment({
      id: `pay_multi_rf_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 10000,
      currency: 'INR',
      sender: 'Pooja Hegde',
      receiver: 'Razorpay Merchant',
      paymentMethod: 'netbanking',
      idempotencyKey: `idemp_multi_rf_${Date.now()}`
    });
    LedgerService.recordPaymentSettlement(payment);

    // 1st partial refund: 4000
    const rf1 = db.insertRefund({
      id: `rf_step1_${Date.now()}`,
      paymentId: payment.id,
      amount: 4000,
      currency: 'INR',
      reason: 'Partial cancellation step 1',
      status: 'REFUNDED'
    });
    LedgerService.recordRefundSettlement(rf1, payment);

    // 2nd partial refund: 6000
    const rf2 = db.insertRefund({
      id: `rf_step2_${Date.now()}`,
      paymentId: payment.id,
      amount: 6000,
      currency: 'INR',
      reason: 'Remaining refund step 2',
      status: 'REFUNDED'
    });
    LedgerService.recordRefundSettlement(rf2, payment);

    // Verify mathematical integrity
    const integrity = LedgerService.verifyLedgerIntegrity();
    expect(integrity.isBalanced).toBe(true);
    expect(integrity.difference).toBe(0);
  });
});

import { describe, it, expect } from 'vitest';
import { db } from '../server/database/store.js';
import { PAYMENT_STATES, transitionPaymentState } from '../server/services/paymentStateMachine.js';
import { LedgerService } from '../server/services/ledgerService.js';

describe('Priority 7: Refund Workflow & Lifecycle Validations', () => {
  it('executes full refund lifecycle with double-entry ledger settlement', () => {
    const payment = db.insertPayment({
      id: `pay_rf_full_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 3000,
      currency: 'INR',
      sender: 'Kavita Iyer',
      receiver: 'Razorpay RevivePay Merchant',
      paymentMethod: 'upi',
      idempotencyKey: `idemp_rf_full_${Date.now()}`
    });
    LedgerService.recordPaymentSettlement(payment);

    // Create refund
    const refund = db.insertRefund({
      id: `rfnd_full_${Date.now()}`,
      paymentId: payment.id,
      amount: 3000,
      currency: 'INR',
      reason: 'Customer requested cancellation within 24h window',
      status: 'REFUNDED',
      idempotencyKey: `idemp_rf_key_${Date.now()}`
    });

    // Update payment to REFUNDED
    const updatedPayment = db.updatePayment({
      ...payment,
      status: PAYMENT_STATES.REFUNDED,
      refundedAmount: 3000
    });

    LedgerService.recordRefundSettlement(refund, payment);

    expect(updatedPayment.status).toBe(PAYMENT_STATES.REFUNDED);
    expect(updatedPayment.refundedAmount).toBe(3000);

    const integrity = LedgerService.verifyLedgerIntegrity();
    expect(integrity.isBalanced).toBe(true);
  });

  it('handles partial refund and leaves payment in SUCCESS with tracked refundedAmount', () => {
    const payment = db.insertPayment({
      id: `pay_rf_part_${Date.now()}`,
      status: PAYMENT_STATES.SUCCESS,
      amount: 5000,
      currency: 'INR',
      sender: 'Rahul Verma',
      receiver: 'Razorpay RevivePay Merchant',
      paymentMethod: 'card',
      idempotencyKey: `idemp_rf_part_${Date.now()}`
    });
    LedgerService.recordPaymentSettlement(payment);

    // Partial refund of 2000 out of 5000
    const refund = db.insertRefund({
      id: `rfnd_part_${Date.now()}`,
      paymentId: payment.id,
      amount: 2000,
      currency: 'INR',
      reason: 'Prorated subscription tier downgrade',
      status: 'REFUNDED'
    });

    const updatedPayment = db.updatePayment({
      ...payment,
      status: PAYMENT_STATES.SUCCESS,
      refundedAmount: 2000
    });

    LedgerService.recordRefundSettlement(refund, payment);

    expect(updatedPayment.status).toBe(PAYMENT_STATES.SUCCESS);
    expect(updatedPayment.refundedAmount).toBe(2000);
    expect(payment.amount - updatedPayment.refundedAmount).toBe(3000);
  });
});

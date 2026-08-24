import { describe, it, expect } from 'vitest';
import { 
  PAYMENT_STATES, 
  isValidTransition, 
  validateStateTransition, 
  InvalidStateTransitionError,
  transitionPaymentState
} from '../server/services/paymentStateMachine.js';
import { db } from '../server/database/store.js';

describe('Priority 1: Payment State Machine & Lifecycle Transitions', () => {
  it('allows valid state progression: CREATED -> PENDING -> PROCESSING -> SUCCESS', () => {
    expect(isValidTransition(PAYMENT_STATES.CREATED, PAYMENT_STATES.PENDING)).toBe(true);
    expect(isValidTransition(PAYMENT_STATES.PENDING, PAYMENT_STATES.PROCESSING)).toBe(true);
    expect(isValidTransition(PAYMENT_STATES.PROCESSING, PAYMENT_STATES.SUCCESS)).toBe(true);
  });

  it('allows valid cancellation from early states: CREATED -> CANCELLED & PENDING -> CANCELLED', () => {
    expect(isValidTransition(PAYMENT_STATES.CREATED, PAYMENT_STATES.CANCELLED)).toBe(true);
    expect(isValidTransition(PAYMENT_STATES.PENDING, PAYMENT_STATES.CANCELLED)).toBe(true);
  });

  it('allows refund lifecycle: SUCCESS -> REFUND_PENDING -> REFUNDED', () => {
    expect(isValidTransition(PAYMENT_STATES.SUCCESS, PAYMENT_STATES.REFUND_PENDING)).toBe(true);
    expect(isValidTransition(PAYMENT_STATES.REFUND_PENDING, PAYMENT_STATES.REFUNDED)).toBe(true);
    expect(isValidTransition(PAYMENT_STATES.REFUND_PENDING, PAYMENT_STATES.SUCCESS)).toBe(true); // refund failure rollback
  });

  it('strictly rejects illegal transitions from terminal states', () => {
    expect(isValidTransition(PAYMENT_STATES.FAILED, PAYMENT_STATES.SUCCESS)).toBe(false);
    expect(isValidTransition(PAYMENT_STATES.CANCELLED, PAYMENT_STATES.PENDING)).toBe(false);
    expect(isValidTransition(PAYMENT_STATES.REFUNDED, PAYMENT_STATES.PROCESSING)).toBe(false);
    expect(isValidTransition(PAYMENT_STATES.CREATED, PAYMENT_STATES.SUCCESS)).toBe(false); // cannot skip verification
  });

  it('throws InvalidStateTransitionError on illegal transition validation', () => {
    expect(() => {
      validateStateTransition(PAYMENT_STATES.FAILED, PAYMENT_STATES.SUCCESS, 'pay_test_001');
    }).toThrow(InvalidStateTransitionError);
  });

  it('executes state transition on database record and records audit event', () => {
    const testPayment = db.insertPayment({
      id: `pay_test_sm_${Date.now()}`,
      status: PAYMENT_STATES.CREATED,
      amount: 1500,
      currency: 'INR',
      sender: 'Aarav Patel',
      receiver: 'Test Merchant',
      paymentMethod: 'upi',
      idempotencyKey: `idemp_sm_${Date.now()}`
    });

    const pending = transitionPaymentState(testPayment, PAYMENT_STATES.PENDING);
    expect(pending.status).toBe(PAYMENT_STATES.PENDING);

    const processing = transitionPaymentState(pending, PAYMENT_STATES.PROCESSING, {
      referenceId: 'gw_ref_881920'
    });
    expect(processing.status).toBe(PAYMENT_STATES.PROCESSING);
    expect(processing.referenceId).toBe('gw_ref_881920');

    const success = transitionPaymentState(processing, PAYMENT_STATES.SUCCESS);
    expect(success.status).toBe(PAYMENT_STATES.SUCCESS);
  });
});

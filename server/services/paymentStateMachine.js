import { db } from '../database/store.js';
import { recordPaymentEvent } from './eventService.js';
import { logger } from '../logger.js';

export const PAYMENT_STATES = {
  CREATED: 'CREATED',
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUND_PENDING: 'REFUND_PENDING',
  REFUNDED: 'REFUNDED'
};

export const ALLOWED_TRANSITIONS = {
  [PAYMENT_STATES.CREATED]: [PAYMENT_STATES.PENDING, PAYMENT_STATES.CANCELLED, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.PENDING]: [PAYMENT_STATES.PROCESSING, PAYMENT_STATES.CANCELLED, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.PROCESSING]: [PAYMENT_STATES.SUCCESS, PAYMENT_STATES.FAILED],
  [PAYMENT_STATES.SUCCESS]: [PAYMENT_STATES.REFUND_PENDING],
  [PAYMENT_STATES.REFUND_PENDING]: [PAYMENT_STATES.REFUNDED, PAYMENT_STATES.SUCCESS], // Can return to SUCCESS if refund fails
  [PAYMENT_STATES.FAILED]: [],
  [PAYMENT_STATES.CANCELLED]: [],
  [PAYMENT_STATES.REFUNDED]: []
};

export class InvalidStateTransitionError extends Error {
  constructor(currentState, nextState, paymentId) {
    super(`Invalid payment state transition from '${currentState}' to '${nextState}' for transaction '${paymentId}'.`);
    this.name = 'InvalidStateTransitionError';
    this.currentState = currentState;
    this.nextState = nextState;
    this.paymentId = paymentId;
    this.statusCode = 400;
  }
}

/**
 * Checks if a transition is valid without throwing
 */
export function isValidTransition(currentState, nextState) {
  if (!currentState || !nextState) return false;
  if (currentState === nextState) return true; // idempotent same-state
  const allowed = ALLOWED_TRANSITIONS[currentState] || [];
  return allowed.includes(nextState);
}

/**
 * Validates a transition and throws InvalidStateTransitionError if illegal
 */
export function validateStateTransition(currentState, nextState, paymentId = 'unknown') {
  if (!isValidTransition(currentState, nextState)) {
    logger.warn({
      event: 'INVALID_STATE_TRANSITION_ATTEMPT',
      paymentId,
      currentState,
      nextState
    }, `Blocked invalid state transition: ${currentState} -> ${nextState}`);
    throw new InvalidStateTransitionError(currentState, nextState, paymentId);
  }
  return true;
}

/**
 * Executes a controlled state transition for a payment record
 */
export function transitionPaymentState(payment, nextState, { failureReason = null, referenceId = null, metadata = {} } = {}) {
  const currentState = payment.status;

  if (currentState === nextState) {
    return payment; // No-op if already in target state
  }

  validateStateTransition(currentState, nextState, payment.id);

  const updated = db.updatePayment({
    ...payment,
    status: nextState,
    failureReason: failureReason || payment.failureReason,
    referenceId: referenceId || payment.referenceId,
    metadata: {
      ...(payment.metadata || {}),
      ...metadata,
      lastTransition: {
        from: currentState,
        to: nextState,
        timestamp: new Date().toISOString()
      }
    }
  });

  // Map state to event type
  let eventType = `PAYMENT_${nextState}`;
  if (nextState === PAYMENT_STATES.REFUND_PENDING) {
    eventType = 'PAYMENT_REFUND_REQUESTED';
  }

  recordPaymentEvent({
    eventType,
    transactionId: payment.id,
    userId: payment.merchantId || 'merchant_rzp_primary',
    previousState: currentState,
    newState: nextState,
    metadata: {
      failureReason,
      referenceId,
      ...metadata
    }
  });

  logger.info({
    event: 'PAYMENT_STATE_TRANSITION',
    paymentId: payment.id,
    from: currentState,
    to: nextState,
    amount: payment.amount
  }, `Payment ${payment.id} transitioned: ${currentState} -> ${nextState}`);

  return updated;
}

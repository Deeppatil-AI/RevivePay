import { db } from '../database/store.js';
import { logger } from '../logger.js';

let ioInstance = null;

export function registerSocketForEvents(io) {
  ioInstance = io;
}

/**
 * Records an immutable payment lifecycle event in SQLite and broadcasts via WebSockets
 */
export function recordPaymentEvent({
  eventType,
  transactionId,
  userId = 'merchant_rzp_primary',
  previousState = null,
  newState = null,
  metadata = {}
}) {
  const eventRecord = {
    id: `pevt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`,
    eventType,
    transactionId,
    userId,
    previousState,
    newState,
    metadata,
    timestamp: new Date().toISOString()
  };

  try {
    db.insertPaymentEvent(eventRecord);

    if (ioInstance) {
      ioInstance.emit('payment:event', eventRecord);
      if (previousState && newState && previousState !== newState) {
        ioInstance.emit('payment:state_change', {
          transactionId,
          previousState,
          newState,
          timestamp: eventRecord.timestamp
        });
      }
    }

    logger.debug({
      event: 'PAYMENT_EVENT_RECORDED',
      eventType,
      transactionId,
      newState
    }, `Event logged: ${eventType} for ${transactionId}`);

    return eventRecord;
  } catch (err) {
    logger.error({ err: err.message, transactionId, eventType }, 'Failed to record payment event');
    return null;
  }
}

/**
 * Retrieves audit trail events for a transaction
 */
export function getTransactionAuditTrail(transactionId) {
  return db.getEventsByTxnId(transactionId);
}

import express from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../database/store.js';
import { PAYMENT_STATES, transitionPaymentState } from '../services/paymentStateMachine.js';
import { LedgerService } from '../services/ledgerService.js';
import { recordPaymentEvent } from '../services/eventService.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';
import { logger } from '../logger.js';

const router = express.Router();

const createRefundSchema = z.object({
  paymentId: z.string().min(1, 'paymentId is required'),
  amount: z.number().positive('Refund amount must be a positive number'),
  reason: z.string().min(3, 'Refund reason must be specified'),
  idempotencyKey: z.string().optional()
});

// GET /api/refunds - List all refunds
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: db.refunds.length,
    refunds: db.refunds
  });
});

// GET /api/refunds/payment/:paymentId - Get refunds for a specific payment
router.get('/payment/:paymentId', (req, res) => {
  const list = db.getRefundsByPaymentId(req.params.paymentId);
  res.json({
    success: true,
    count: list.length,
    refunds: list
  });
});

// GET /api/refunds/:id - Get single refund details
router.get('/:id', (req, res) => {
  const refund = db.getRefundById(req.params.id);
  if (!refund) {
    return res.status(404).json({ success: false, error: 'Refund record not found' });
  }
  res.json({
    success: true,
    refund
  });
});

// POST /api/refunds/create - Process a validated refund with ledger reversal
router.post('/create', idempotencyMiddleware, (req, res) => {
  const parseResult = createRefundSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.errors.map(e => e.message)
    });
  }

  const { paymentId, amount, reason, idempotencyKey } = parseResult.data;

  const payment = db.getPaymentById(paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, error: `Payment ${paymentId} not found` });
  }

  // State validation: can only refund successful payments
  if (payment.status !== PAYMENT_STATES.SUCCESS && payment.status !== PAYMENT_STATES.REFUND_PENDING) {
    return res.status(400).json({
      success: false,
      error: `Cannot refund payment in '${payment.status}' state. Payment must be in 'SUCCESS' state.`
    });
  }

  // Prevent over-refunding
  const alreadyRefunded = payment.refundedAmount || 0;
  const maxRefundable = payment.amount - alreadyRefunded;

  if (amount > maxRefundable) {
    return res.status(400).json({
      success: false,
      error: `Requested refund of ₹${amount.toLocaleString('en-IN')} exceeds maximum refundable amount of ₹${maxRefundable.toLocaleString('en-IN')} (Already refunded: ₹${alreadyRefunded.toLocaleString('en-IN')}).`
    });
  }

  const refundId = `rfnd_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  const key = idempotencyKey || `idemp_rf_${crypto.randomUUID()}`;

  try {
    // 1. Create Refund in REFUND_REQUESTED
    const initialRefund = db.insertRefund({
      id: refundId,
      paymentId,
      amount,
      currency: payment.currency || 'INR',
      reason,
      status: 'REFUND_REQUESTED',
      idempotencyKey: key,
      merchantId: req.merchantId || 'merchant_rzp_primary'
    });

    // 2. Transition Payment to REFUND_PENDING
    transitionPaymentState(payment, PAYMENT_STATES.REFUND_PENDING, {
      metadata: { activeRefundId: refundId, requestedAmount: amount }
    });

    // 3. Complete Refund to REFUNDED
    const completedRefund = db.updateRefund({
      ...initialRefund,
      status: 'REFUNDED'
    });

    // 4. Update total refunded amount on payment
    const newTotalRefunded = alreadyRefunded + amount;
    const isFullyRefunded = newTotalRefunded >= payment.amount;

    const finalPaymentStatus = isFullyRefunded ? PAYMENT_STATES.REFUNDED : PAYMENT_STATES.SUCCESS;

    db.updatePayment({
      ...payment,
      status: finalPaymentStatus,
      refundedAmount: newTotalRefunded,
      metadata: {
        ...(payment.metadata || {}),
        lastRefund: {
          id: refundId,
          amount,
          reason,
          timestamp: new Date().toISOString()
        }
      }
    });

    // 5. Record Double-Entry Ledger Reversal (Priority 6)
    const ledger = LedgerService.recordRefundSettlement(completedRefund, payment);

    // 6. Record Audit Event
    recordPaymentEvent({
      eventType: 'PAYMENT_REFUNDED',
      transactionId: payment.id,
      userId: req.merchantId || 'merchant_rzp_primary',
      previousState: PAYMENT_STATES.REFUND_PENDING,
      newState: finalPaymentStatus,
      metadata: {
        refundId,
        refundAmount: amount,
        isFullyRefunded,
        reason
      }
    });

    logger.info({
      event: 'REFUND_PROCESSED_SUCCESS',
      refundId,
      paymentId: payment.id,
      amount,
      isFullyRefunded
    }, `Refund of ₹${amount} executed for payment ${payment.id}`);

    res.status(201).json({
      success: true,
      message: isFullyRefunded 
        ? `Payment fully refunded (₹${amount.toLocaleString('en-IN')})`
        : `Partial refund processed (₹${amount.toLocaleString('en-IN')})`,
      refund: completedRefund,
      ledger,
      payment: db.getPaymentById(payment.id)
    });
  } catch (err) {
    logger.error({ err: err.message, paymentId, amount }, 'Refund processing failure');
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

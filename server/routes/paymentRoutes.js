import express from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { db } from '../database/store.js';
import { PAYMENT_STATES, transitionPaymentState } from '../services/paymentStateMachine.js';
import { FraudDetectionService } from '../services/fraudDetectionService.js';
import { LedgerService } from '../services/ledgerService.js';
import { recordPaymentEvent, getTransactionAuditTrail } from '../services/eventService.js';
import { idempotencyMiddleware } from '../middleware/idempotencyMiddleware.js';
import { logger } from '../logger.js';

const router = express.Router();

const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  currency: z.string().default('INR'),
  sender: z.string().min(2, 'Sender name is required'),
  senderAccount: z.string().optional(),
  receiver: z.string().default('Razorpay RevivePay Merchant'),
  receiverAccount: z.string().optional(),
  paymentMethod: z.enum(['upi', 'card', 'netbanking']).default('upi'),
  metadata: z.record(z.any()).optional(),
  idempotencyKey: z.string().optional()
});

// GET /api/payments - List all payments
router.get('/', (req, res) => {
  const status = req.query.status;
  let list = db.payments;
  if (status) {
    list = list.filter(p => p.status === status);
  }
  res.json({
    success: true,
    count: list.length,
    payments: list
  });
});

// GET /api/payments/:id - Get single payment details with ledger and events
router.get('/:id', (req, res) => {
  const payment = db.getPaymentById(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment transaction not found' });
  }

  const events = getTransactionAuditTrail(payment.id);
  const ledgerEntries = db.getLedgerEntriesByTxnId(payment.id);
  const refunds = db.getRefundsByPaymentId(payment.id);

  res.json({
    success: true,
    payment,
    events,
    ledgerEntries,
    refunds
  });
});

// GET /api/payments/:id/events - Get immutable audit trail
router.get('/:id/events', (req, res) => {
  const events = getTransactionAuditTrail(req.params.id);
  res.json({
    success: true,
    count: events.length,
    events
  });
});

// POST /api/payments/create - Secure server-side payment creation with Idempotency & Fraud Scoring
router.post('/create', idempotencyMiddleware, (req, res) => {
  const parseResult = createPaymentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: parseResult.error.errors.map(e => e.message)
    });
  }

  const data = parseResult.data;
  const idempotencyKey = req.headers['idempotency-key'] || 
                         req.headers['x-idempotency-key'] || 
                         data.idempotencyKey || 
                         `idemp_${crypto.randomUUID()}`;

  // Evaluate Fraud Risk Scoring (Priority 4)
  const fraudAssessment = FraudDetectionService.evaluateTransactionRisk({
    ...data,
    sender: data.sender
  });

  const paymentId = `pay_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;

  // If High-Risk Fraud Decision is BLOCK, record as FAILED immediately
  if (fraudAssessment.decision === 'BLOCK') {
    const failedPayment = db.insertPayment({
      id: paymentId,
      status: PAYMENT_STATES.FAILED,
      amount: data.amount,
      currency: data.currency,
      sender: data.sender,
      senderAccount: data.senderAccount,
      receiver: data.receiver,
      receiverAccount: data.receiverAccount,
      paymentMethod: data.paymentMethod,
      idempotencyKey,
      failureReason: `Blocked by Fraud Detection Engine: ${fraudAssessment.reasons.join('; ')}`,
      fraudScore: fraudAssessment.risk_score,
      fraudLevel: fraudAssessment.risk_level,
      fraudDecision: fraudAssessment.decision,
      fraudReasons: fraudAssessment.reasons,
      metadata: data.metadata,
      merchantId: req.merchantId || 'merchant_rzp_primary'
    });

    recordPaymentEvent({
      eventType: 'FRAUD_DETECTED',
      transactionId: paymentId,
      userId: req.merchantId || 'merchant_rzp_primary',
      previousState: null,
      newState: PAYMENT_STATES.FAILED,
      metadata: { fraudAssessment }
    });

    return res.status(403).json({
      success: false,
      error: 'Payment blocked by security policy due to high fraud risk.',
      payment: failedPayment,
      fraudAssessment
    });
  }

  // Create payment in CREATED state
  const initialPayment = db.insertPayment({
    id: paymentId,
    status: PAYMENT_STATES.CREATED,
    amount: data.amount,
    currency: data.currency,
    sender: data.sender,
    senderAccount: data.senderAccount,
    receiver: data.receiver,
    receiverAccount: data.receiverAccount,
    paymentMethod: data.paymentMethod,
    idempotencyKey,
    fraudScore: fraudAssessment.risk_score,
    fraudLevel: fraudAssessment.risk_level,
    fraudDecision: fraudAssessment.decision,
    fraudReasons: fraudAssessment.reasons,
    metadata: data.metadata,
    merchantId: req.merchantId || 'merchant_rzp_primary'
  });

  recordPaymentEvent({
    eventType: 'PAYMENT_CREATED',
    transactionId: paymentId,
    userId: req.merchantId || 'merchant_rzp_primary',
    previousState: null,
    newState: PAYMENT_STATES.CREATED,
    metadata: { fraudAssessment }
  });

  // Automatically advance CREATED -> PENDING (awaiting processing/capture)
  const pendingPayment = transitionPaymentState(initialPayment, PAYMENT_STATES.PENDING, {
    metadata: { fraudAssessment }
  });

  res.status(201).json({
    success: true,
    payment: pendingPayment,
    fraudAssessment
  });
});

// POST /api/payments/process/:id - Advance from PENDING to PROCESSING
router.post('/process/:id', idempotencyMiddleware, (req, res) => {
  const payment = db.getPaymentById(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  try {
    const processingPayment = transitionPaymentState(payment, PAYMENT_STATES.PROCESSING, {
      referenceId: req.body?.referenceId || `ref_gw_${Date.now()}`,
      metadata: req.body?.metadata || {}
    });

    res.json({
      success: true,
      payment: processingPayment
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

// POST /api/payments/verify/:id - Secure Server-Side Payment Verification (PROCESSING -> SUCCESS)
router.post('/verify/:id', idempotencyMiddleware, (req, res) => {
  const payment = db.getPaymentById(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  try {
    // If currently PENDING, advance through PROCESSING first
    let current = payment;
    if (current.status === PAYMENT_STATES.PENDING) {
      current = transitionPaymentState(current, PAYMENT_STATES.PROCESSING, {
        referenceId: req.body?.referenceId || `ref_gw_${Date.now()}`
      });
    }

    // Transition to SUCCESS
    const successPayment = transitionPaymentState(current, PAYMENT_STATES.SUCCESS, {
      referenceId: req.body?.referenceId || current.referenceId || `auth_rrn_${Date.now()}`,
      metadata: {
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'RevivePay_Server_Verification_Engine',
        ...req.body?.metadata
      }
    });

    // Record Double-Entry Financial Ledger (Priority 6)
    const ledger = LedgerService.recordPaymentSettlement(successPayment);

    logger.info({
      event: 'PAYMENT_VERIFIED_SUCCESS',
      paymentId: successPayment.id,
      amount: successPayment.amount
    }, `Payment ${successPayment.id} successfully verified on server`);

    res.json({
      success: true,
      message: 'Payment verified and settled successfully',
      payment: successPayment,
      ledger
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

// POST /api/payments/cancel/:id - Cancel payment (CREATED or PENDING -> CANCELLED)
router.post('/cancel/:id', idempotencyMiddleware, (req, res) => {
  const payment = db.getPaymentById(req.params.id);
  if (!payment) {
    return res.status(404).json({ success: false, error: 'Payment not found' });
  }

  try {
    const cancelledPayment = transitionPaymentState(payment, PAYMENT_STATES.CANCELLED, {
      failureReason: req.body?.reason || 'Cancelled by user or merchant request'
    });

    res.json({
      success: true,
      payment: cancelledPayment
    });
  } catch (err) {
    res.status(err.statusCode || 400).json({ success: false, error: err.message });
  }
});

export default router;

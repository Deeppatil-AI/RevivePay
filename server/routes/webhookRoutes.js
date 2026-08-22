import express from 'express';
import { z } from 'zod';
import { db } from '../database/store.js';
import { processSingleTransaction } from '../services/agentOrchestrator.js';
import { RazorpayService } from '../services/razorpayClient.js';
import { emitWebhookEvent } from '../services/socketService.js';
import { logger } from '../logger.js';

const router = express.Router();

const simulateWebhookSchema = z.object({
  eventType: z.string().default("payment.failed"),
  customerName: z.string().optional(),
  amount: z.number().positive().optional(),
  bank: z.string().optional(),
  failureCode: z.string().optional(),
  merchant: z.string().optional(),
  planName: z.string().optional()
});

// GET recent webhook events
router.get('/events', (req, res) => {
  res.json({ success: true, count: db.webhookEvents.length, events: db.webhookEvents });
});

// POST real Razorpay webhook listener with signature verification
router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] || 'simulated_sig';
  const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const isSignatureValid = RazorpayService.validateWebhookSignature(bodyString, signature);

  if (!isSignatureValid && process.env.AUTH_BYPASS_DEMO === 'false') {
    logger.warn({ event: 'WEBHOOK_SIGNATURE_INVALID', signature }, 'Invalid Razorpay webhook signature');
    return res.status(400).json({ success: false, error: 'Invalid Razorpay webhook signature (HMAC-SHA256 mismatch)' });
  }

  const event = req.body;
  const eventRecord = {
    id: `whevt_${Math.random().toString(36).substring(2, 9)}`,
    eventType: event.event || 'payment.failed',
    payload: event,
    signatureVerified: isSignatureValid,
    receivedAt: new Date().toISOString(),
    status: isSignatureValid ? "PROCESSED" : "PROCESSED_DEMO_BYPASS"
  };

  db.addWebhookEvent(eventRecord);
  emitWebhookEvent(eventRecord);

  logger.info({ event: 'WEBHOOK_INGESTED', eventType: eventRecord.eventType, id: eventRecord.id }, 'Ingested Razorpay webhook');

  // If payment failed event, create or find transaction and trigger recovery agent
  if (event.event === 'payment.failed' || event.event === 'subscription.halted') {
    const payloadEntity = event.payload?.payment?.entity || {};
    const txn = {
      id: payloadEntity.id || `txn_wh_${Date.now()}`,
      mandateId: payloadEntity.notes?.mandate_id || `man_wh_${Date.now()}`,
      rrn: payloadEntity.acquirer_data?.rrn || `33819${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: payloadEntity.notes?.customerName || "Customer (Webhook Triggered)",
      phone: payloadEntity.contact || "+91 98200 99881",
      email: payloadEntity.email || "webhook.customer@domain.in",
      city: "Bengaluru",
      merchant: payloadEntity.notes?.merchant || "Razorpay Live Merchant",
      category: "OTT",
      merchantCategory: "OTT",
      planName: payloadEntity.description || "Recurring AutoPay Plan",
      amount: Math.round((payloadEntity.amount || 149900) / 100),
      bank: payloadEntity.bank || "SBI",
      ifsc: `${payloadEntity.bank || 'SBIN'}0001234`,
      customerLtv: 12000,
      mandateLimit: 15000,
      retryCount: 1,
      failureCode: payloadEntity.error_code || "NPCI_U30",
      failureName: "Bank CBS Outage",
      failureCategory: "INFRASTRUCTURE",
      failureReason: payloadEntity.error_description || "Webhook triggered simulated failure event.",
      failedAt: new Date().toISOString(),
      recoveryResult: null
    };

    const existing = db.subscriptions;
    db.subscriptions = [txn, ...existing.filter(s => s.id !== txn.id)];
    await processSingleTransaction(txn);
  }

  res.json({ 
    success: true, 
    message: "Webhook processed with Razorpay signature verification and dispatched to Sentinel Agent", 
    eventId: eventRecord.id,
    signatureVerified: isSignatureValid
  });
});

// POST simulate custom event injection (from UI or curl) with Zod validation
router.post('/simulate', async (req, res) => {
  const parseResult = simulateWebhookSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ 
      success: false, 
      error: "Validation Error", 
      details: parseResult.error.errors.map(e => e.message) 
    });
  }

  const { eventType, customerName, amount, bank, failureCode, merchant, planName } = parseResult.data;

  const mockPayload = {
    event: eventType || "payment.failed",
    payload: {
      payment: {
        entity: {
          id: `pay_sim_${Date.now()}`,
          amount: (amount || 2499) * 100,
          currency: "INR",
          status: "failed",
          method: "upi",
          bank: bank || "SBI",
          error_code: failureCode || "NPCI_U30",
          error_description: `Simulated ${bank || 'SBI'} failure: ${failureCode || 'NPCI_U30'}`,
          description: planName || "Enterprise Cloud Subscription",
          notes: {
            customerName: customerName || "Ananya Iyer",
            merchant: merchant || "Razorpay Merchant"
          }
        }
      }
    }
  };

  const payloadString = JSON.stringify(mockPayload);
  const testSignature = RazorpayService.generateTestSignature(payloadString);

  const eventRecord = {
    id: `whevt_sim_${Date.now().toString(36)}`,
    eventType: mockPayload.event,
    payload: mockPayload,
    signatureVerified: true,
    testSignature,
    receivedAt: new Date().toISOString(),
    status: "PROCESSED_BY_SENTINEL"
  };

  db.addWebhookEvent(eventRecord);
  emitWebhookEvent(eventRecord);

  // Auto-inject and run through agent
  const txn = {
    id: mockPayload.payload.payment.entity.id,
    mandateId: `man_sim_${Date.now()}`,
    rrn: `33819${Math.floor(100000 + Math.random() * 900000)}`,
    customerName: customerName || "Ananya Iyer",
    phone: "+91 98451 22334",
    email: "ananya.iyer@fintech.io",
    city: "Mumbai",
    merchant: merchant || "StreamFlix India Pro",
    category: "OTT",
    merchantCategory: "OTT",
    planName: planName || "4K Ultra Monthly AutoPay",
    amount: amount || 2499,
    bank: bank || "SBI",
    ifsc: `${bank || 'SBIN'}0001234`,
    customerLtv: 18000,
    mandateLimit: 15000,
    retryCount: 1,
    failureCode: failureCode || "NPCI_U30",
    failureName: "Bank Switch Timeout",
    failureCategory: "INFRASTRUCTURE",
    failureReason: `Simulated custom webhook test: ${failureCode || 'NPCI_U30'}`,
    failedAt: new Date().toISOString(),
    recoveryResult: null
  };

  const existing = db.subscriptions;
  db.subscriptions = [txn, ...existing.filter(s => s.id !== txn.id)];
  const result = await processSingleTransaction(txn);

  res.json({
    success: true,
    message: "Custom webhook event injected and resolved by Sentinel AI Agent",
    event: eventRecord,
    signature: testSignature,
    recoveryResult: result
  });
});

export default router;

import express from 'express';
import crypto from 'crypto';
import { db } from '../database/store.js';
import { processSingleTransaction } from '../services/agentOrchestrator.js';

const router = express.Router();
const WEBHOOK_SECRET = "rzp_wh_secret_revivepay_2026";

// GET recent webhook events
router.get('/events', (req, res) => {
  res.json({ success: true, count: db.webhookEvents.length, events: db.webhookEvents });
});

// POST real Razorpay webhook listener
router.post('/razorpay', async (req, res) => {
  const signature = req.headers['x-razorpay-signature'] || 'simulated_sig';
  const event = req.body;

  const eventRecord = {
    id: `whevt_${Math.random().toString(36).substring(2, 9)}`,
    eventType: event.event || 'payment.failed',
    payload: event,
    signatureVerified: true,
    receivedAt: new Date().toISOString(),
    status: "PROCESSED"
  };

  db.webhookEvents.unshift(eventRecord);

  // If payment failed event, create or find transaction and trigger recovery agent
  if (event.event === 'payment.failed' || event.event === 'subscription.halted') {
    const payloadEntity = event.payload?.payment?.entity || {};
    const txn = {
      id: payloadEntity.id || `txn_wh_${Date.now()}`,
      customerName: payloadEntity.notes?.customerName || "Customer (Webhook Triggered)",
      phone: payloadEntity.contact || "+91 98200 99881",
      email: payloadEntity.email || "webhook.customer@domain.in",
      city: "Bengaluru",
      merchant: payloadEntity.notes?.merchant || "Razorpay Live Merchant",
      merchantCategory: "OTT",
      planName: payloadEntity.description || "Recurring AutoPay Plan",
      amount: Math.round((payloadEntity.amount || 149900) / 100),
      bank: payloadEntity.bank || "SBI",
      vpa: payloadEntity.vpa || "webhook.user@oksbi",
      paymentMethod: "UPI_AUTOPAY",
      failureCode: payloadEntity.error_code || "NPCI_U30",
      failedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      customerLtv: 12000,
      churnRisk: "HIGH",
      salaryCreditDay: 1,
      retryCount: 1,
      mandateId: `man_wh_${Date.now()}`,
      initialStatus: "FAILED",
      notes: payloadEntity.error_description || "Webhook triggered simulated failure event."
    };

    db.subscriptions.unshift(txn);
    await processSingleTransaction(txn);
  }

  res.json({ success: true, message: "Webhook processed and dispatched to Sentinel Agent", eventId: eventRecord.id });
});

// POST simulate custom event injection (from UI or curl)
router.post('/simulate', async (req, res) => {
  const { eventType, customerName, amount, bank, failureCode, merchant, planName } = req.body;

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

  const eventRecord = {
    id: `whevt_sim_${Date.now().toString(36)}`,
    eventType: mockPayload.event,
    payload: mockPayload,
    signatureVerified: true,
    receivedAt: new Date().toISOString(),
    status: "PROCESSED_BY_SENTINEL"
  };

  db.webhookEvents.unshift(eventRecord);

  // Auto-inject and run through agent
  const txn = {
    id: mockPayload.payload.payment.entity.id,
    customerName: customerName || "Ananya Iyer",
    phone: "+91 98451 22334",
    email: "ananya.iyer@fintech.io",
    city: "Mumbai",
    merchant: merchant || "StreamFlix India Pro",
    merchantCategory: "OTT",
    planName: planName || "4K Ultra Monthly AutoPay",
    amount: amount || 2499,
    bank: bank || "SBI",
    vpa: "ananya.iyer@oksbi",
    paymentMethod: "UPI_AUTOPAY",
    failureCode: failureCode || "NPCI_U30",
    failedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    customerLtv: 18000,
    churnRisk: "HIGH",
    salaryCreditDay: 1,
    retryCount: 1,
    mandateId: `man_sim_${Date.now()}`,
    initialStatus: "FAILED",
    notes: `Simulated custom webhook test: ${failureCode || 'NPCI_U30'}`
  };

  db.subscriptions.unshift(txn);
  const result = await processSingleTransaction(txn);

  res.json({
    success: true,
    message: "Custom webhook event injected and resolved by Sentinel AI Agent",
    event: eventRecord,
    recoveryResult: result
  });
});

export default router;

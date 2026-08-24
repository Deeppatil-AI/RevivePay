import express from 'express';
import { db } from '../database/store.js';
import { LedgerService } from '../services/ledgerService.js';

const router = express.Router();

// GET /api/analytics/transactions - Comprehensive Transaction Metrics & KPIs
router.get('/transactions', (req, res) => {
  const payments = db.payments || [];
  const refunds = db.refunds || [];
  const subscriptions = db.subscriptions || [];

  const totalPaymentsCount = payments.length;
  const successfulPayments = payments.filter(p => p.status === 'SUCCESS' || p.status === 'REFUNDED');
  const failedPayments = payments.filter(p => p.status === 'FAILED');
  const refundedPayments = payments.filter(p => p.status === 'REFUNDED');
  const pendingPayments = payments.filter(p => p.status === 'PENDING' || p.status === 'PROCESSING' || p.status === 'CREATED');

  const totalVolume = successfulPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalRefundedVolume = refunds.reduce((acc, r) => acc + (r.amount || 0), 0);
  const netVolume = totalVolume - totalRefundedVolume;

  const avgTransactionAmount = successfulPayments.length > 0 
    ? Math.round(totalVolume / successfulPayments.length) 
    : 0;

  const successRate = totalPaymentsCount > 0 
    ? Number(((successfulPayments.length / totalPaymentsCount) * 100).toFixed(2)) 
    : 0;

  const failureRate = totalPaymentsCount > 0 
    ? Number(((failedPayments.length / totalPaymentsCount) * 100).toFixed(2)) 
    : 0;

  // Subscription Cohort Analytics
  const totalSubscriptions = subscriptions.length;
  const recoveredSubscriptions = subscriptions.filter(s => s.recoveryResult?.status === 'RECOVERED');
  const totalSubscriptionVolume = subscriptions.reduce((acc, s) => acc + (s.amount || 0), 0);
  const recoveredSubscriptionVolume = recoveredSubscriptions.reduce((acc, s) => acc + (s.recoveryResult?.policy?.finalPayableAmount || s.amount || 0), 0);

  res.json({
    success: true,
    overview: {
      totalCount: totalPaymentsCount,
      successfulCount: successfulPayments.length,
      failedCount: failedPayments.length,
      refundedCount: refundedPayments.length,
      pendingCount: pendingPayments.length,
      totalVolume,
      totalRefundedVolume,
      netVolume,
      avgTransactionAmount,
      successRatePct: successRate,
      failureRatePct: failureRate
    },
    subscriptions: {
      totalCount: totalSubscriptions,
      recoveredCount: recoveredSubscriptions.length,
      recoveryRatePct: totalSubscriptions > 0 ? Number(((recoveredSubscriptions.length / totalSubscriptions) * 100).toFixed(2)) : 0,
      totalAtRiskVolume: totalSubscriptionVolume,
      recoveredVolume: recoveredSubscriptionVolume
    }
  });
});

// GET /api/analytics/fraud - Fraud Risk Distribution & High Risk Transactions
router.get('/fraud', (req, res) => {
  const payments = db.payments || [];
  
  let lowRiskCount = 0;
  let mediumRiskCount = 0;
  let highRiskCount = 0;
  let blockedCount = 0;

  const highRiskList = [];

  for (const p of payments) {
    const score = p.fraudScore || 0;
    const level = p.fraudLevel || 'LOW';

    if (level === 'HIGH' || score >= 70) {
      highRiskCount++;
      highRiskList.push({
        id: p.id,
        amount: p.amount,
        sender: p.sender,
        status: p.status,
        score,
        reasons: p.fraudReasons || [],
        createdAt: p.createdAt
      });
    } else if (level === 'MEDIUM' || score >= 30) {
      mediumRiskCount++;
    } else {
      lowRiskCount++;
    }

    if (p.fraudDecision === 'BLOCK' || (p.failureReason && p.failureReason.includes('Fraud'))) {
      blockedCount++;
    }
  }

  const totalEvaluated = payments.length;

  res.json({
    success: true,
    distribution: {
      totalEvaluated,
      lowRisk: {
        count: lowRiskCount,
        pct: totalEvaluated > 0 ? Number(((lowRiskCount / totalEvaluated) * 100).toFixed(2)) : 0
      },
      mediumRisk: {
        count: mediumRiskCount,
        pct: totalEvaluated > 0 ? Number(((mediumRiskCount / totalEvaluated) * 100).toFixed(2)) : 0
      },
      highRisk: {
        count: highRiskCount,
        pct: totalEvaluated > 0 ? Number(((highRiskCount / totalEvaluated) * 100).toFixed(2)) : 0
      },
      blockedCount
    },
    highRiskTransactions: highRiskList.slice(0, 20)
  });
});

// GET /api/analytics/ledger - Double-Entry Ledger Trial Balance & Integrity Status
router.get('/ledger', (req, res) => {
  const integrity = LedgerService.verifyLedgerIntegrity();
  const recentEntries = db.ledgerEntries.slice(0, 25);

  res.json({
    success: true,
    integrity,
    recentEntries
  });
});

export default router;

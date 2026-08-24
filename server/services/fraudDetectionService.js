import { db } from '../database/store.js';
import { logger } from '../logger.js';

/**
 * Modular Rule-Based and Statistical Fraud Risk Scoring Engine
 * Analyzes transaction parameters and historical velocity patterns to compute a 0-100 risk score.
 */
export class FraudDetectionService {
  /**
   * Evaluates fraud signals and returns standardized risk assessment
   * @param {Object} txn - Payment transaction data
   * @param {Object} options - Optional overrides for testing / simulation
   * @returns {Object} { risk_score, risk_level, decision, reasons }
   */
  static evaluateTransactionRisk(txn, options = {}) {
    let score = 0;
    const reasons = [];

    const amount = Number(txn.amount) || 0;
    const sender = txn.sender || 'unknown_sender';
    const metadata = txn.metadata || {};

    // 1. Amount Anomaly Signals
    if (amount >= 100000) {
      score += 45;
      reasons.push(`High-value transaction (₹${amount.toLocaleString('en-IN')}) exceeds standard consumer tier`);
    } else if (amount >= 50000) {
      score += 25;
      reasons.push(`Elevated transaction amount (₹${amount.toLocaleString('en-IN')})`);
    }

    // 2. Velocity Analysis (Recent transactions in last 10 minutes)
    try {
      const allPayments = db.payments || [];
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const recentAttempts = allPayments.filter(p => 
        p.sender === sender && 
        p.createdAt >= tenMinutesAgo &&
        p.id !== txn.id
      );

      if (recentAttempts.length >= 4) {
        score += 40;
        reasons.push(`High transaction velocity: ${recentAttempts.length} transactions attempted in the last 10 minutes`);
      } else if (recentAttempts.length >= 2) {
        score += 20;
        reasons.push(`Moderate velocity burst: ${recentAttempts.length} recent transactions within 10 minutes`);
      }

      // 3. Historical Failure History for Sender
      const failedAttempts = allPayments.filter(p => 
        p.sender === sender && 
        p.status === 'FAILED'
      );

      if (failedAttempts.length >= 3) {
        score += 30;
        reasons.push(`Account history shows ${failedAttempts.length} prior failed payment attempts`);
      } else if (failedAttempts.length === 2) {
        score += 15;
        reasons.push(`Repeated recent failure history on account`);
      }

      // 4. Sudden Increase vs Historical Average
      const successfulPayments = allPayments.filter(p => 
        p.sender === sender && 
        p.status === 'SUCCESS'
      );
      if (successfulPayments.length >= 2) {
        const avgAmount = successfulPayments.reduce((acc, p) => acc + p.amount, 0) / successfulPayments.length;
        if (amount > avgAmount * 3 && amount > 10000) {
          score += 25;
          reasons.push(`Transaction amount is >3x higher than sender's historical average (₹${Math.round(avgAmount).toLocaleString('en-IN')})`);
        }
      }
    } catch (e) {
      // Gracefully continue with available local transaction signals
    }

    // 5. Device & Network Signals (from metadata or options)
    if (metadata.isTorOrVpn || options.isTorOrVpn) {
      score += 35;
      reasons.push('Connection originated from high-risk anonymized proxy or VPN');
    }

    if (metadata.isNewDevice || options.isNewDevice) {
      score += 10;
      reasons.push('Unrecognized device fingerprint');
    }

    if (metadata.unusualLocation || options.unusualLocation) {
      score += 15;
      reasons.push('Geographic location anomaly detected');
    }

    // Cap score at 100
    const finalScore = Math.min(Math.max(score, 0), 100);

    // Decision Logic
    let risk_level = 'LOW';
    let decision = 'ALLOW';

    if (finalScore >= 70) {
      risk_level = 'HIGH';
      decision = 'BLOCK';
    } else if (finalScore >= 30) {
      risk_level = 'MEDIUM';
      decision = 'REVIEW';
    } else {
      risk_level = 'LOW';
      decision = 'ALLOW';
    }

    const assessment = {
      risk_score: finalScore,
      risk_level,
      decision,
      reasons: reasons.length > 0 ? reasons : ['Standard transaction within normal risk parameters']
    };

    logger.info({
      event: 'FRAUD_RISK_EVALUATION',
      paymentId: txn.id,
      sender,
      amount,
      risk_score: assessment.risk_score,
      risk_level: assessment.risk_level,
      decision: assessment.decision
    }, `Fraud assessment for ${txn.id || sender}: ${assessment.risk_level} (${assessment.risk_score}/100) -> ${assessment.decision}`);

    return assessment;
  }
}

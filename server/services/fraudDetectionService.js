import { extractFraudFeatures } from './fraudFeatureExtractor.js';
import { logger } from '../logger.js';

/**
 * Hybrid Fraud Risk Scoring & Intelligence Service (Version 2)
 * Pipeline: Transaction -> Feature Extraction -> Rule-Based Scoring -> Statistical Anomaly Scorer -> Aggregator
 */
export class FraudDetectionService {
  /**
   * Evaluates structured fraud features and returns standardized risk assessment
   * @param {Object} txn - Payment transaction data
   * @param {Object} options - Optional overrides for testing / simulation
   * @returns {Object} { features, risk_score, risk_level, decision, reasons }
   */
  static evaluateTransactionRisk(txn, options = {}) {
    const features = extractFraudFeatures(txn, options);
    let ruleScore = 0;
    const reasons = [];

    // 1. High-Ticket Amount Signals
    if (features.amount >= 100000) {
      ruleScore += 45;
      reasons.push(`High-value transaction (₹${features.amount.toLocaleString('en-IN')}) exceeds standard consumer tier`);
    } else if (features.amount >= 50000) {
      ruleScore += 25;
      reasons.push(`Elevated transaction amount (₹${features.amount.toLocaleString('en-IN')})`);
    }

    // 2. Velocity Analysis
    if (features.velocity_10m >= 4) {
      ruleScore += 40;
      reasons.push(`High transaction velocity: ${features.velocity_10m} transactions attempted in the last 10 minutes`);
    } else if (features.velocity_10m >= 2) {
      ruleScore += 20;
      reasons.push(`Moderate velocity burst: ${features.velocity_10m} recent transactions within 10 minutes`);
    }

    // 3. Historical Failure History for Account
    if (features.failed_attempts_count >= 3) {
      ruleScore += 30;
      reasons.push(`Account history shows ${features.failed_attempts_count} prior failed payment attempts`);
    } else if (features.failed_attempts_count === 2) {
      ruleScore += 15;
      reasons.push(`Repeated recent failure history on account`);
    }

    // 4. Historical Amount Jump / Deviation
    if (features.successful_count >= 2 && features.amount_deviation_ratio >= 3.0 && features.amount > 10000) {
      ruleScore += 25;
      reasons.push(`Transaction amount is ${features.amount_deviation_ratio}x higher than sender's historical average (₹${features.historical_avg_amount.toLocaleString('en-IN')})`);
    }

    // 5. Device & Network Signals
    if (features.is_tor_vpn) {
      ruleScore += 35;
      reasons.push('Connection originated from high-risk anonymized proxy or VPN');
    }

    if (features.is_new_device) {
      ruleScore += 10;
      reasons.push('Unrecognized device fingerprint');
    }

    if (features.unusual_location) {
      ruleScore += 15;
      reasons.push('Geographic location anomaly detected');
    }

    // 6. Off-Hours / Midnight Maintenance Window Anomaly
    if (features.is_off_hours && features.amount >= 25000) {
      ruleScore += 10;
      reasons.push('High-ticket transaction attempted during high-risk off-hours window (01:00-04:59 IST)');
    }

    // Statistical Anomaly Calculation (Baseline probability distribution)
    let statisticalAnomalyScore = 0;
    if (features.historical_fraud_ratio > 0.4) {
      statisticalAnomalyScore += 20;
      reasons.push(`Elevated historical fraud/failure ratio (${Math.round(features.historical_fraud_ratio * 100)}%)`);
    }

    // Combined Score (Capped between 0 and 100)
    const combinedScore = Math.min(Math.max(ruleScore + statisticalAnomalyScore, 0), 100);

    // Decision Logic
    let risk_level = 'LOW';
    let decision = 'ALLOW';

    if (combinedScore >= 70) {
      risk_level = 'HIGH';
      decision = 'BLOCK';
    } else if (combinedScore >= 30) {
      risk_level = 'MEDIUM';
      decision = 'REVIEW';
    } else {
      risk_level = 'LOW';
      decision = 'ALLOW';
    }

    const assessment = {
      features,
      risk_score: combinedScore,
      risk_level,
      decision,
      reasons: reasons.length > 0 ? reasons : ['Standard transaction within normal risk parameters']
    };

    logger.info({
      event: 'FRAUD_RISK_EVALUATION_V2',
      paymentId: txn.id,
      sender: txn.sender,
      amount: features.amount,
      risk_score: assessment.risk_score,
      risk_level: assessment.risk_level,
      decision: assessment.decision
    }, `Fraud V2 assessment for ${txn.id || txn.sender}: ${assessment.risk_level} (${assessment.risk_score}/100) -> ${assessment.decision}`);

    return assessment;
  }
}

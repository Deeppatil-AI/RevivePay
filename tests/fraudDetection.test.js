import { describe, it, expect } from 'vitest';
import { FraudDetectionService } from '../server/services/fraudDetectionService.js';

describe('Priority 4: Fraud Detection and Risk Scoring Engine', () => {
  it('assigns LOW risk score (< 30) and ALLOW decision to standard amount transactions', () => {
    const txn = {
      id: 'txn_safe_01',
      amount: 1499,
      sender: 'Neha Gupta',
      metadata: {}
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(txn);
    expect(assessment.risk_score).toBeLessThan(30);
    expect(assessment.risk_level).toBe('LOW');
    expect(assessment.decision).toBe('ALLOW');
    expect(Array.isArray(assessment.reasons)).toBe(true);
  });

  it('assigns HIGH risk score (>= 70) and BLOCK decision to high-ticket / high-risk signals', () => {
    const suspiciousTxn = {
      id: 'txn_suspicious_01',
      amount: 125000, // +45 points
      sender: 'Suspicious_User_99',
      metadata: {
        isTorOrVpn: true, // +35 points
        isNewDevice: true // +10 points
      }
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(suspiciousTxn);
    expect(assessment.risk_score).toBeGreaterThanOrEqual(70);
    expect(assessment.risk_level).toBe('HIGH');
    expect(assessment.decision).toBe('BLOCK');
    expect(assessment.reasons.length).toBeGreaterThan(0);
  });

  it('assigns MEDIUM risk score and REVIEW decision to moderate anomaly', () => {
    const moderateTxn = {
      id: 'txn_medium_01',
      amount: 60000, // +25 points
      sender: 'Karan Mehra',
      metadata: {
        unusualLocation: true // +15 points -> total 40
      }
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(moderateTxn);
    expect(assessment.risk_score).toBeGreaterThanOrEqual(30);
    expect(assessment.risk_score).toBeLessThan(70);
    expect(assessment.risk_level).toBe('MEDIUM');
    expect(assessment.decision).toBe('REVIEW');
  });
});

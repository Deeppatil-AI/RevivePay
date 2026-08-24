import { describe, it, expect } from 'vitest';
import { extractFraudFeatures } from '../server/services/fraudFeatureExtractor.js';
import { FraudDetectionService } from '../server/services/fraudDetectionService.js';

describe('Fraud Feature Extraction Layer & Hybrid Risk Scoring V2', () => {
  it('extracts numerical and categorical feature vectors correctly', () => {
    const txn = {
      id: `pay_feat_${Date.now()}`,
      amount: 150000,
      sender: 'high_roller_user',
      paymentMethod: 'upi',
      metadata: {
        isTorOrVpn: true,
        isNewDevice: true,
        unusualLocation: true
      }
    };

    const features = extractFraudFeatures(txn);
    expect(features.amount).toBe(150000);
    expect(features.is_tor_vpn).toBe(true);
    expect(features.is_new_device).toBe(true);
    expect(features.unusual_location).toBe(true);
    expect(features.payment_method).toBe('upi');
    expect(typeof features.hour_of_day).toBe('number');
  });

  it('blocks high-risk transactions with elevated ticket and anonymized proxy', () => {
    const txn = {
      id: `pay_block_${Date.now()}`,
      amount: 120000,
      sender: 'proxy_bad_actor',
      metadata: {
        isTorOrVpn: true
      }
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(txn);
    expect(assessment.features).toBeDefined();
    expect(assessment.risk_score).toBeGreaterThanOrEqual(70);
    expect(assessment.risk_level).toBe('HIGH');
    expect(assessment.decision).toBe('BLOCK');
  });

  it('allows normal low-ticket legitimate consumer payments', () => {
    const txn = {
      id: `pay_allow_${Date.now()}`,
      amount: 1499,
      sender: 'regular_subscriber_99',
      metadata: {}
    };

    const assessment = FraudDetectionService.evaluateTransactionRisk(txn);
    expect(assessment.risk_score).toBeLessThan(30);
    expect(assessment.risk_level).toBe('LOW');
    expect(assessment.decision).toBe('ALLOW');
  });
});

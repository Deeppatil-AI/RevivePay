import { describe, it, expect } from 'vitest';
import { RazorpayService } from '../server/services/razorpayClient.js';

describe('Razorpay Webhook Signature Verification (Test Mode)', () => {
  const payload = JSON.stringify({
    event: 'payment.failed',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_881920',
          amount: 149900,
          currency: 'INR'
        }
      }
    }
  });

  it('generates and validates a genuine HMAC-SHA256 signature', () => {
    const signature = RazorpayService.generateTestSignature(payload);
    const isValid = RazorpayService.validateWebhookSignature(payload, signature);
    expect(isValid).toBe(true);
  });

  it('rejects tampered or forged webhook payload', () => {
    const signature = RazorpayService.generateTestSignature(payload);
    const tamperedPayload = JSON.stringify({ ...JSON.parse(payload), event: 'payment.captured' });
    const isValid = RazorpayService.validateWebhookSignature(tamperedPayload, signature);
    expect(isValid).toBe(false);
  });

  it('allows simulated_sig under demo bypass mode', () => {
    const isValid = RazorpayService.validateWebhookSignature(payload, 'simulated_sig');
    expect(isValid).toBe(true);
  });
});

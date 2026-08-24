import { describe, it, expect } from 'vitest';
import { computeRequestHash, checkIdempotency, storeIdempotentResponse } from '../server/services/idempotencyService.js';

describe('Priority 2: Idempotency Protection & Duplicate Request Resilience', () => {
  const testKey = `idemp_test_key_${Date.now()}`;
  const requestPath = '/api/payments/create';
  const payload = { amount: 2500, sender: 'Priya Sharma', paymentMethod: 'upi' };
  const payloadHash = computeRequestHash(payload);

  it('computes deterministic SHA-256 hash for payloads regardless of key ordering', () => {
    const hash1 = computeRequestHash({ a: 1, b: 2 });
    const hash2 = computeRequestHash({ b: 2, a: 1 });
    expect(hash1).toBe(hash2);
  });

  it('returns exists: false for newly seen idempotency key', () => {
    const check = checkIdempotency(`unseen_key_${Date.now()}`, requestPath, payloadHash);
    expect(check.exists).toBe(false);
  });

  it('stores and safely replays cached response when same key is sent', () => {
    const mockResponse = { success: true, paymentId: 'pay_cached_9981', amount: 2500 };
    storeIdempotentResponse(testKey, requestPath, payloadHash, 201, mockResponse);

    const check = checkIdempotency(testKey, requestPath, payloadHash);
    expect(check.exists).toBe(true);
    expect(check.mismatch).toBe(false);
    expect(check.statusCode).toBe(201);
    expect(check.body).toEqual(mockResponse);
  });

  it('flags mismatch when same key is reused with different request payload', () => {
    const differentPayload = { amount: 9999, sender: 'Attacker' };
    const differentHash = computeRequestHash(differentPayload);

    const check = checkIdempotency(testKey, requestPath, differentHash);
    expect(check.exists).toBe(true);
    expect(check.mismatch).toBe(true);
    expect(check.error).toMatch(/different request payload/);
  });
});

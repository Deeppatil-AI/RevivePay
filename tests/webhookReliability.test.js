import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/database/store.js';

describe('Webhook Reliability, Deduplication & State Tracking', () => {
  const testEventId = `evt_test_dedup_${Date.now()}`;

  beforeEach(() => {
    // Clear out test event if exists
  });

  it('inserts and retrieves webhook event with status RECEIVED/PROCESSING/PROCESSED', () => {
    const internalId = `whevt_test_${Date.now()}`;
    const event = db.addWebhookEvent({
      id: internalId,
      eventId: testEventId,
      eventType: 'payment.failed',
      payload: { amount: 2499, reason: 'NPCI_U30' },
      signatureVerified: true,
      status: 'PROCESSING'
    });

    expect(event).toBeDefined();
    expect(event.eventId).toBe(testEventId);
    expect(event.status).toBe('PROCESSING');

    // Retrieve by external event ID for deduplication
    const found = db.getWebhookEventByEventId(testEventId);
    expect(found).toBeDefined();
    expect(found.id).toBe(internalId);

    // Update status to PROCESSED
    const updated = db.updateWebhookEventStatus(internalId, { status: 'PROCESSED' });
    expect(updated.status).toBe('PROCESSED');
    expect(updated.processedAt).toBeDefined();
  });

  it('detects duplicate events using getWebhookEventByEventId', () => {
    const existing = db.getWebhookEventByEventId(testEventId);
    expect(existing).not.toBeNull();
    expect(existing.status).toBe('PROCESSED');
  });
});

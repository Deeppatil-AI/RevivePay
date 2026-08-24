import crypto from 'crypto';
import { db } from '../database/store.js';
import { logger } from '../logger.js';

/**
 * Computes deterministic SHA-256 hash of request body
 */
export function computeRequestHash(body) {
  if (!body) return 'empty_payload';
  const serialized = typeof body === 'string' ? body : JSON.stringify(body, Object.keys(body).sort());
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Checks if an idempotency key was previously processed
 */
export function checkIdempotency(key, requestPath, requestHash) {
  if (!key) return { exists: false };

  const record = db.getIdempotencyRecord(key);
  if (!record) return { exists: false };

  if (record.requestHash && record.requestHash !== requestHash) {
    logger.warn({
      event: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
      key,
      originalHash: record.requestHash,
      newHash: requestHash
    }, 'Idempotency key reused with different request payload');
    return {
      exists: true,
      mismatch: true,
      error: 'Idempotency-Key reused with different request payload.'
    };
  }

  logger.info({
    event: 'IDEMPOTENCY_CACHE_HIT',
    key,
    requestPath
  }, `Replaying cached response for idempotency key: ${key}`);

  return {
    exists: true,
    mismatch: false,
    statusCode: record.responseStatus,
    body: record.responseBody
  };
}

/**
 * Persists an idempotent response into database
 */
export function storeIdempotentResponse(key, requestPath, requestHash, responseStatus, responseBody) {
  if (!key) return;

  try {
    db.saveIdempotencyRecord({
      key,
      requestPath,
      requestHash,
      responseStatus,
      responseBody
    });
    logger.debug({ event: 'IDEMPOTENCY_RECORD_SAVED', key, status: responseStatus }, 'Saved idempotency record');
  } catch (err) {
    logger.error({ err: err.message, key }, 'Failed to save idempotency record');
  }
}

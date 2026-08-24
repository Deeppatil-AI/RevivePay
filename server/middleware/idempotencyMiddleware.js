import { computeRequestHash, checkIdempotency, storeIdempotentResponse } from '../services/idempotencyService.js';

/**
 * Express middleware ensuring idempotent handling of payment and mutation endpoints
 */
export function idempotencyMiddleware(req, res, next) {
  // Only apply to state-modifying requests (POST, PUT, PATCH, DELETE)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const idempotencyKey = req.headers['idempotency-key'] || 
                         req.headers['x-idempotency-key'] || 
                         req.body?.idempotencyKey;

  if (!idempotencyKey) {
    return next();
  }

  const requestHash = computeRequestHash(req.body);
  const check = checkIdempotency(idempotencyKey, req.originalUrl || req.path, requestHash);

  if (check.exists) {
    if (check.mismatch) {
      return res.status(409).json({
        success: false,
        error: 'Conflict: Idempotency-Key has already been used with a different request payload.'
      });
    }

    res.setHeader('Idempotent-Replayed', 'true');
    res.setHeader('X-Idempotency-Key', idempotencyKey);
    return res.status(check.statusCode).json(check.body);
  }

  // Intercept response to store upon completion
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Only cache successful or definitive terminal responses (status < 500)
    if (res.statusCode < 500) {
      storeIdempotentResponse(
        idempotencyKey,
        req.originalUrl || req.path,
        requestHash,
        res.statusCode,
        body
      );
    }
    res.setHeader('X-Idempotency-Key', idempotencyKey);
    return originalJson(body);
  };

  next();
}

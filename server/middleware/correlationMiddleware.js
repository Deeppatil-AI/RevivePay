import crypto from 'crypto';

/**
 * Attaches a unique Correlation / Request ID to every inbound financial request
 * to enable end-to-end distributed tracing across logs, events, and client responses.
 */
export function correlationMiddleware(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || 
                        req.headers['x-request-id'] || 
                        `corr_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;

  req.correlationId = correlationId;
  res.setHeader('X-Correlation-Id', correlationId);

  next();
}

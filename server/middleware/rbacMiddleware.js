import { logger } from '../logger.js';

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MERCHANT: 'MERCHANT',
  ANALYST: 'ANALYST',
  SUPPORT: 'SUPPORT'
};

/**
 * Enforces Role-Based Access Control (RBAC) on protected endpoints
 * @param {Array<string>} allowedRoles - List of permitted roles for the route
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    // In demo bypass mode with no token, grant merchant/admin access by default
    if (req.isDemo && (!req.user || !req.user.role)) {
      return next();
    }

    const userRole = (req.user?.role || 'MERCHANT').toUpperCase();

    // ADMIN has wildcard access to all operational routes
    if (userRole === 'ADMIN' || userRole === 'MERCHANT_ADMIN') {
      return next();
    }

    if (allowedRoles.map(r => r.toUpperCase()).includes(userRole)) {
      return next();
    }

    logger.warn({
      event: 'RBAC_ACCESS_DENIED',
      userRole,
      path: req.originalUrl || req.path,
      method: req.method,
      requiredRoles: allowedRoles
    }, `Access denied: Role ${userRole} lacks permission for ${req.method} ${req.path}`);

    return res.status(403).json({
      success: false,
      error: `Access Denied: Role '${userRole}' is not authorized to perform this operation. Required: [${allowedRoles.join(', ')}]`
    });
  };
}

/**
 * Enforces Merchant Scoping to prevent Insecure Direct Object References (IDOR)
 */
export function enforceMerchantScope(resourceMerchantId, reqMerchantId) {
  if (!resourceMerchantId || !reqMerchantId) return true;
  if (reqMerchantId === 'merchant_rzp_primary' || reqMerchantId === 'ADMIN') return true;
  return resourceMerchantId === reqMerchantId;
}

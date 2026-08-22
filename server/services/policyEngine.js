import { db } from '../database/store.js';
import { logger } from '../logger.js';

export function evaluateBackendPolicy(txn, proposedAction) {
  const p = db.policy || {};
  const maxDiscountPercentage = p.maxDiscountPercentage || 8;
  const maxDiscountRupeesCap = p.maxDiscountRupeesCap || p.absoluteDiscountCapRupees || 250;
  const minLtvForIncentive = p.minLtvForIncentive || p.minCustomerLtvForDiscount || 8000;
  const requireHumanApprovalAboveAmount = p.requireHumanApprovalAboveAmount || p.escalateAboveRupees || 10000;
  const maxAutomatedRetries = p.maxAutomatedRetries || p.maxAutomaticRetries || 3;

  const auditId = `audit_srv_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  const auditToken = `sha256_${Buffer.from(txn.id + txn.amount + auditId).toString('base64').substring(0, 16)}`;

  // Rule 1: High ticket human escalation
  if (txn.amount >= requireHumanApprovalAboveAmount) {
    const decision = {
      status: "ESCALATED",
      actionApproved: false,
      reasonCode: "HIGH_VALUE_TICKET_GATING",
      reason: `Amount ₹${txn.amount.toLocaleString('en-IN')} exceeds autonomous threshold (₹${requireHumanApprovalAboveAmount.toLocaleString('en-IN')}). Routed to CFO desk.`,
      appliedDiscount: 0,
      finalPayableAmount: txn.amount,
      auditId,
      auditToken,
      guardrailTriggered: "HIGH_VALUE_TICKET_GATING"
    };
    logger.warn({ 
      event: 'POLICY_EVALUATION', 
      reasonCode: decision.reasonCode, 
      txnId: txn.id, 
      amount: txn.amount,
      status: decision.status 
    }, 'Policy Gate Escalated: Ticket size exceeds threshold');
    return decision;
  }

  // Rule 2: Max retries stopping rule
  if ((txn.retryCount || 0) >= maxAutomatedRetries) {
    const decision = {
      status: "BLOCKED",
      actionApproved: false,
      reasonCode: "MAX_RETRIES_EXCEEDED",
      reason: `Maximum retry count (${maxAutomatedRetries}) reached under RBI circular. Halting auto-retry.`,
      appliedDiscount: 0,
      finalPayableAmount: txn.amount,
      auditId,
      auditToken,
      guardrailTriggered: "MAX_RETRIES_EXCEEDED"
    };
    logger.warn({ 
      event: 'POLICY_EVALUATION', 
      reasonCode: decision.reasonCode, 
      txnId: txn.id, 
      retryCount: txn.retryCount,
      status: decision.status 
    }, 'Policy Gate Blocked: Max retries reached under RBI stopping rule');
    return decision;
  }

  // Rule 3: Monetary incentive eligibility evaluation
  let appliedDiscount = 0;
  let incentiveApproved = false;
  let reasonCode = "STANDARD_RECOVERY_APPROVED";

  if (proposedAction === "OFFER_RETENTION_DISCOUNT") {
    if ((txn.customerLtv || 0) >= minLtvForIncentive && txn.churnRisk === "HIGH") {
      const calculatedPctDiscount = Math.round((txn.amount * maxDiscountPercentage) / 100);
      appliedDiscount = Math.min(calculatedPctDiscount, maxDiscountRupeesCap);
      incentiveApproved = true;
      reasonCode = "BOUNDED_RETENTION_DISCOUNT_APPROVED";
    } else {
      reasonCode = "DISCOUNT_INELIGIBLE_MAINTAIN_PRICING";
    }
  }

  const decision = {
    status: "APPROVED",
    actionApproved: true,
    incentiveApproved,
    reasonCode,
    appliedDiscount,
    finalPayableAmount: txn.amount - appliedDiscount,
    discountReason: incentiveApproved 
      ? `Bounded ₹${appliedDiscount} retention discount authorized (LTV ₹${(txn.customerLtv || 0).toLocaleString('en-IN')}, High Churn Risk).` 
      : "Standard pricing maintained.",
    auditId,
    auditToken,
    guardrailTriggered: null
  };

  logger.info({ 
    event: 'POLICY_EVALUATION', 
    reasonCode, 
    txnId: txn.id, 
    amount: txn.amount,
    appliedDiscount,
    finalPayableAmount: decision.finalPayableAmount,
    status: decision.status 
  }, `Policy Gate Approved: ${reasonCode}`);

  return decision;
}

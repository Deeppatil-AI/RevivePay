import { db } from '../database/store.js';

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
    return {
      status: "ESCALATED",
      actionApproved: false,
      reason: `Amount ₹${txn.amount.toLocaleString('en-IN')} exceeds autonomous threshold (₹${requireHumanApprovalAboveAmount.toLocaleString('en-IN')}). Routed to CFO desk.`,
      appliedDiscount: 0,
      finalPayableAmount: txn.amount,
      auditId,
      auditToken,
      guardrailTriggered: "HIGH_VALUE_TICKET_GATING"
    };
  }

  // Rule 2: Max retries stopping rule
  if ((txn.retryCount || 0) >= maxAutomatedRetries) {
    return {
      status: "BLOCKED",
      actionApproved: false,
      reason: `Maximum retry count (${maxAutomatedRetries}) reached under RBI circular. Halting auto-retry.`,
      appliedDiscount: 0,
      finalPayableAmount: txn.amount,
      auditId,
      auditToken,
      guardrailTriggered: "MAX_RETRIES_EXCEEDED"
    };
  }

  // Rule 3: Monetary incentive eligibility evaluation
  let appliedDiscount = 0;
  let incentiveApproved = false;

  if (proposedAction === "OFFER_RETENTION_DISCOUNT") {
    if ((txn.customerLtv || 0) >= minLtvForIncentive && txn.churnRisk === "HIGH") {
      const calculatedPctDiscount = Math.round((txn.amount * maxDiscountPercentage) / 100);
      appliedDiscount = Math.min(calculatedPctDiscount, maxDiscountRupeesCap);
      incentiveApproved = true;
    }
  }

  return {
    status: "APPROVED",
    actionApproved: true,
    incentiveApproved,
    appliedDiscount,
    finalPayableAmount: txn.amount - appliedDiscount,
    discountReason: incentiveApproved 
      ? `Bounded ₹${appliedDiscount} retention discount authorized (LTV ₹${(txn.customerLtv || 0).toLocaleString('en-IN')}, High Churn Risk).` 
      : "Standard pricing maintained.",
    auditId,
    auditToken,
    guardrailTriggered: null
  };
}

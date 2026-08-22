/**
 * Policy & Guardrails Governance Engine
 * Ensures every autonomous financial action is strictly bounded, auditable, and gated by merchant policies.
 */

export const DEFAULT_MERCHANT_POLICY = {
  maxDiscountPercentage: 8, // Max % discount agent can offer
  maxDiscountRupeesCap: 250, // Absolute ₹ cap on discount
  minLtvForIncentive: 8000, // Min lifetime value required before offering monetary incentive
  maxAutomatedRetries: 3, // Hard cap on debit retry cycles
  requireHumanApprovalAboveAmount: 10000, // Large amounts trigger review
  allowedCommunicationChannels: ["WHATSAPP", "SMS", "IN_APP_PUSH"],
  auditLoggingEnabled: true
};

/**
 * Evaluates whether an agent proposed action complies with merchant safety guardrails.
 */
export function evaluatePolicyGating(txn, proposedAction, merchantPolicy = DEFAULT_MERCHANT_POLICY) {
  const auditId = `audit_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  const auditToken = `sha256_${btoa(txn.id + txn.amount + auditId).substring(0, 16)}`;

  // Rule 1: Human review needed for large ticket sizes exceeding policy threshold
  if (txn.amount >= merchantPolicy.requireHumanApprovalAboveAmount) {
    return {
      status: "ESCALATED",
      actionApproved: false,
      reason: `Amount ₹${txn.amount.toLocaleString('en-IN')} exceeds autonomous threshold (₹${merchantPolicy.requireHumanApprovalAboveAmount.toLocaleString('en-IN')}). Routed to Human Controller.`,
      appliedDiscount: 0,
      finalPayableAmount: txn.amount,
      auditId,
      auditToken,
      guardrailTriggered: "HIGH_VALUE_TRANSACTION_LIMIT"
    };
  }

  // Rule 2: Check retry count ceiling
  if (txn.retryCount >= merchantPolicy.maxAutomatedRetries) {
    return {
      status: "BLOCKED",
      actionApproved: false,
      reason: `Maximum retry count (${merchantPolicy.maxAutomatedRetries}) reached. Strict stopping rule applied.`,
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
    if (txn.customerLtv >= merchantPolicy.minLtvForIncentive && txn.churnRisk === "HIGH") {
      // Calculate bounded discount
      const calculatedPctDiscount = Math.round((txn.amount * merchantPolicy.maxDiscountPercentage) / 100);
      appliedDiscount = Math.min(calculatedPctDiscount, merchantPolicy.maxDiscountRupeesCap);
      incentiveApproved = true;
    } else {
      // Denied by policy: LTV too low or churn risk low
      appliedDiscount = 0;
      incentiveApproved = false;
    }
  }

  return {
    status: "APPROVED",
    actionApproved: true,
    incentiveApproved,
    appliedDiscount,
    finalPayableAmount: txn.amount - appliedDiscount,
    discountReason: incentiveApproved 
      ? `Bounded ₹${appliedDiscount} retention credit approved (LTV ₹${txn.customerLtv.toLocaleString('en-IN')}, High Churn Risk).` 
      : "Standard pricing maintained.",
    auditId,
    auditToken,
    guardrailTriggered: null
  };
}

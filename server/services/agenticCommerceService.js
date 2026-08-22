import { db } from '../database/store.js';

export function negotiateAgenticCommerce(buyerAgentPayload) {
  const { 
    buyerAgentId, 
    merchantId, 
    requestedSeats, 
    baseUnitPrice, 
    targetBudget, 
    protocol = "NPCI_UAP_v1" 
  } = buyerAgentPayload;

  const totalBaseAmount = requestedSeats * baseUnitPrice;
  const policy = db.policy;
  
  // Calculate automated tiered volume discount
  let volumeDiscountPct = 0;
  if (requestedSeats >= 50) volumeDiscountPct = 15;
  else if (requestedSeats >= 20) volumeDiscountPct = 10;
  else if (requestedSeats >= 5) volumeDiscountPct = 5;

  // Enforce merchant policy ceiling
  const allowedDiscountPct = Math.min(volumeDiscountPct, policy.maxDiscountPercentage || 12);
  const discountAmount = Math.round((totalBaseAmount * allowedDiscountPct) / 100);
  const agreedTotal = totalBaseAmount - discountAmount;
  const unitPriceAgreed = Math.round(agreedTotal / requestedSeats);

  const isBudgetFeasible = agreedTotal <= targetBudget;
  const transactionNonce = `uap_nonce_${Math.random().toString(36).substring(2, 10)}`;
  const cryptographicSignature = `uap_sig_${Buffer.from(buyerAgentId + agreedTotal + transactionNonce).toString('base64').substring(0, 20)}`;

  const negotiationResult = {
    protocol,
    buyerAgentId,
    merchantId: merchantId || "rzp_merchant_revivepay",
    requestedSeats,
    baseTotal: totalBaseAmount,
    discountApplied: discountAmount,
    discountPercentage: allowedDiscountPct,
    agreedFinalTotal: agreedTotal,
    unitPriceAgreed,
    settlementStatus: isBudgetFeasible ? "M2M_AUTHORIZED_200" : "BUDGET_EXCEEDED_COUNTER_OFFER",
    transactionNonce,
    cryptographicSignature,
    uapMandateToken: `uap_tok_${Date.now().toString(36)}`,
    negotiatedAt: new Date().toISOString()
  };

  if (isBudgetFeasible) {
    const auditEntry = {
      id: `audit_uap_${Date.now().toString(36)}`,
      auditToken: cryptographicSignature,
      txnId: transactionNonce,
      customerName: `AI Buyer Agent (${buyerAgentId})`,
      merchant: "Razorpay Enterprise API",
      diagnosis: {
        rootCauseCategory: "AGENTIC_M2M_COMMERCE_PROTOCOL",
        detailedRationale: `Autonomous machine-to-machine negotiation completed via ${protocol}. Resolved volume pricing for ${requestedSeats} seats.`
      },
      policy: {
        status: "APPROVED",
        discountReason: `Volume discount ${allowedDiscountPct}% authorized under merchant governance bounds.`
      },
      actionType: "AUTONOMOUS_UAP_MACHINE_SETTLEMENT",
      actionDetail: `Settled ₹${agreedTotal.toLocaleString('en-IN')} with cryptographic signature ${cryptographicSignature}.`,
      timestamp: new Date().toISOString()
    };
    db.auditLogs.unshift(auditEntry);
  }

  return negotiationResult;
}

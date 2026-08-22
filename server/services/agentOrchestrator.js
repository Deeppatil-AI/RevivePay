import { db } from '../database/store.js';
import { runDiagnosis } from '../../src/engine/diagnosisAgent.js';
import { schedulePredictiveRetry } from '../../src/engine/retryScheduler.js';
import { evaluateBackendPolicy } from './policyEngine.js';
import { RazorpayClient } from '../../src/engine/razorpayMockClient.js';

export async function processSingleTransaction(txn) {
  // Step 1: Diagnosis Agent
  const diagnosis = runDiagnosis(txn);

  // Step 2: Policy Gating
  const proposedAction = diagnosis.rootCauseCategory === "LIQUIDITY_TIMING"
    ? "OFFER_RETENTION_DISCOUNT"
    : "EXECUTE_RECOVERY";
  const policyResult = evaluateBackendPolicy(txn, proposedAction);

  // Step 3: Decision & Action Dispatch
  let recoveryStatus = "PENDING";
  let actionType = "AUTONOMOUS_ACTION";
  let actionDetail = "";
  let paymentLink = null;

  if (!policyResult.actionApproved) {
    if (policyResult.status === "ESCALATED") {
      recoveryStatus = "ESCALATED";
      actionType = "HUMAN_ESCALATION_TRIGGERED";
      actionDetail = `Halted by guardrail: ${policyResult.reason}`;
    } else {
      recoveryStatus = "BLOCKED";
      actionType = "NPCI_STOPPING_RULE_HALT";
      actionDetail = `Blocked: ${policyResult.reason}`;
    }
  } else {
    if (diagnosis.rootCauseCategory === "CORE_BANKING_OUTAGE") {
      const retryPlan = schedulePredictiveRetry(txn, diagnosis);
      await RazorpayClient.triggerMandateRetry(txn.mandateId, retryPlan.scheduledTime);
      recoveryStatus = "RESCHEDULED";
      actionType = "PREDICTIVE_MANDATE_RESCHEDULE";
      actionDetail = `Auto-rescheduled for ${retryPlan.scheduledTime}. Prevented NPCI rate-limit penalty.`;
    } else {
      const linkRes = await RazorpayClient.createPaymentLink({
        amount: policyResult.finalPayableAmount,
        customerName: txn.customerName,
        customerEmail: txn.email,
        customerPhone: txn.phone,
        merchant: txn.merchant
      });
      paymentLink = linkRes.short_url;

      recoveryStatus = "RECOVERED";
      actionType = "CONVERSATIONAL_UPI_RECOVERY";
      actionDetail = `Recovered ₹${policyResult.finalPayableAmount} via 1-click Razorpay intent link.`;
    }
  }

  const recoveryResult = {
    status: recoveryStatus,
    diagnosis,
    policy: policyResult,
    actionType,
    actionDetail,
    paymentLink,
    processedAt: new Date().toISOString()
  };

  // Update in DB
  const updatedTxn = { ...txn, recoveryResult };
  db.updateSubscription(updatedTxn);

  // Add to Audit Ledger
  const auditEntry = {
    id: policyResult.auditId,
    auditToken: policyResult.auditToken,
    txnId: txn.id,
    customerName: txn.customerName,
    merchant: txn.merchant,
    diagnosis,
    policy: policyResult,
    policyStatus: policyResult.status,
    actionType,
    actionDetail,
    paymentLink,
    timestamp: new Date().toISOString()
  };
  db.addAuditLog(auditEntry);

  return { txn: updatedTxn, auditEntry };
}

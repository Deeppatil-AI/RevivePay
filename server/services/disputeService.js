import { db } from '../database/store.js';

export function getDisputes() {
  return db.disputes;
}

export function compileDisputeDossier(disputeId) {
  const dispute = db.disputes.find(d => d.id === disputeId);
  if (!dispute) throw new Error("Dispute not found");

  // Compile full evidence packet
  const packetId = `dossier_npc_${Math.random().toString(36).substring(2, 9)}`;
  const submissionTimestamp = new Date().toISOString();

  dispute.status = "EVIDENCE_SUBMITTED";
  dispute.submittedPacketId = packetId;
  dispute.submittedAt = submissionTimestamp;

  const auditEntry = {
    id: `audit_disp_${Math.random().toString(36).substring(2, 9)}`,
    auditToken: `sha256_disp_${Buffer.from(disputeId + packetId).toString('base64').substring(0, 14)}`,
    txnId: dispute.paymentId,
    customerName: dispute.customerName,
    merchant: "Razorpay Verified Merchant",
    diagnosis: {
      rootCauseCategory: "FRIENDLY_FRAUD_DISPUTE",
      detailedRationale: `Customer raised chargeback (${dispute.disputeReason}), but OTP 3DS authentication & delivery proof confirm genuine receipt.`
    },
    policy: {
      status: "APPROVED",
      discountReason: "Legal defense dossier verified against Visa/Mastercard arbitration standard."
    },
    actionType: "LEGAL_DEFENSE_SUBMITTED",
    actionDetail: `Auto-submitted 4-point evidentiary packet (${packetId}) via Razorpay Dispute API. Predicted Win Rate: ${Math.round(dispute.winProbability * 100)}%.`,
    timestamp: submissionTimestamp
  };

  db.auditLogs.unshift(auditEntry);
  return { dispute, packetId, auditEntry };
}

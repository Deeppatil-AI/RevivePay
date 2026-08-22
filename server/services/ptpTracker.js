import { db } from '../database/store.js';

export function getInvoices() {
  return db.b2bInvoices;
}

export function registerPromiseToPay(invoiceId, ptpDate, notes) {
  const inv = db.b2bInvoices.find(i => i.id === invoiceId);
  if (!inv) throw new Error("Invoice not found");

  inv.status = "PTP_COMMITTED";
  inv.promiseToPayDate = ptpDate;
  inv.recoveryStage = "STAGE_2_PTP_MONITORING";
  inv.conversations.push({
    sender: "agent",
    text: `Promise-to-Pay (PTP) commitment recorded for ${ptpDate}. Note: ${notes}`,
    time: new Date().toISOString()
  });

  const auditEntry = {
    id: `audit_ptp_${Math.random().toString(36).substring(2, 9)}`,
    auditToken: `sha256_ptp_${Buffer.from(invoiceId + ptpDate).toString('base64').substring(0, 14)}`,
    txnId: inv.id,
    customerName: inv.clientName,
    merchant: "Enterprise B2B Billing",
    diagnosis: {
      rootCauseCategory: "B2B_RECEIVABLE_OVERDUE",
      detailedRationale: `Invoice overdue by ${inv.overdueDays} days. Autonomous agent negotiated formal PTP commitment before legal notice.`
    },
    policy: {
      status: "APPROVED",
      discountReason: "PTP calendar scheduled with automatic grace window monitoring."
    },
    actionType: "PTP_COMMITMENT_RECORDED",
    actionDetail: `Recorded commitment to pay ₹${inv.amount.toLocaleString('en-IN')} on ${ptpDate}. Virtual Account tracking active.`,
    timestamp: new Date().toISOString()
  };

  db.auditLogs.unshift(auditEntry);
  return { invoice: inv, auditEntry };
}

export function markInvoiceSettled(invoiceId) {
  const inv = db.b2bInvoices.find(i => i.id === invoiceId);
  if (!inv) throw new Error("Invoice not found");

  inv.status = "RECOVERED";
  inv.recoveryStage = "RECOVERED_SETTLED";
  inv.conversations.push({
    sender: "agent",
    text: `Full settlement of ₹${inv.amount.toLocaleString('en-IN')} received via Razorpay Smart Collect.`,
    time: new Date().toISOString()
  });

  return inv;
}

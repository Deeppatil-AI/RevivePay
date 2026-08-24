// Frontend API Client connecting to Express Backend
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const ApiService = {
  // Health & Metrics
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: "OFFLINE" };
    }
  },

  getMetrics: async () => {
    const res = await fetch(`${API_BASE}/metrics`);
    return await res.json();
  },

  logClientError: async (payload) => {
    try {
      const res = await fetch(`${API_BASE}/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // Priority 1 & 3: Secure Payment State Machine APIs
  createPayment: async (paymentData) => {
    const idempotencyKey = paymentData.idempotencyKey || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await fetch(`${API_BASE}/payments/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({ ...paymentData, idempotencyKey })
    });
    return await res.json();
  },

  processPayment: async (paymentId, data = {}) => {
    const res = await fetch(`${API_BASE}/payments/process/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  verifyPayment: async (paymentId, data = {}) => {
    const res = await fetch(`${API_BASE}/payments/verify/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  cancelPayment: async (paymentId, reason) => {
    const res = await fetch(`${API_BASE}/payments/cancel/${paymentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return await res.json();
  },

  getPayments: async (status) => {
    const url = status ? `${API_BASE}/payments?status=${encodeURIComponent(status)}` : `${API_BASE}/payments`;
    const res = await fetch(url);
    return await res.json();
  },

  getPaymentDetails: async (id) => {
    const res = await fetch(`${API_BASE}/payments/${id}`);
    return await res.json();
  },

  getPaymentEvents: async (id) => {
    const res = await fetch(`${API_BASE}/payments/${id}/events`);
    return await res.json();
  },

  // Priority 7: Refunds API
  createRefund: async (refundData) => {
    const idempotencyKey = refundData.idempotencyKey || `idemp_rf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const res = await fetch(`${API_BASE}/refunds/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      },
      body: JSON.stringify({ ...refundData, idempotencyKey })
    });
    return await res.json();
  },

  getRefunds: async (paymentId) => {
    const url = paymentId ? `${API_BASE}/refunds/payment/${paymentId}` : `${API_BASE}/refunds`;
    const res = await fetch(url);
    return await res.json();
  },

  // Priority 5: Analytics & Ledger Verification
  getTransactionAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/transactions`);
    return await res.json();
  },

  getFraudAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/fraud`);
    return await res.json();
  },

  getLedgerAnalytics: async () => {
    const res = await fetch(`${API_BASE}/analytics/ledger`);
    return await res.json();
  },

  // Subscriptions & Recovery
  getTransactions: async () => {
    const res = await fetch(`${API_BASE}/recovery/transactions`);
    return await res.json();
  },

  processTransaction: async (id) => {
    const res = await fetch(`${API_BASE}/recovery/process/${id}`, { method: 'POST' });
    return await res.json();
  },

  processBatch: async () => {
    const res = await fetch(`${API_BASE}/recovery/process-batch`, { method: 'POST' });
    return await res.json();
  },

  resetBatch: async () => {
    const res = await fetch(`${API_BASE}/recovery/reset`, { method: 'POST' });
    return await res.json();
  },

  // Policy
  getPolicy: async () => {
    const res = await fetch(`${API_BASE}/recovery/policy`);
    return await res.json();
  },

  savePolicy: async (policy) => {
    const res = await fetch(`${API_BASE}/recovery/policy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy)
    });
    return await res.json();
  },

  // Audit Logs
  getAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/recovery/audit-logs`);
    return await res.json();
  },

  // B2B Invoices (Track 03 & 04)
  getInvoices: async () => {
    const res = await fetch(`${API_BASE}/invoices`);
    return await res.json();
  },

  registerPtp: async (id, ptpDate, notes) => {
    const res = await fetch(`${API_BASE}/invoices/register-ptp/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ptpDate, notes })
    });
    return await res.json();
  },

  settleInvoice: async (id) => {
    const res = await fetch(`${API_BASE}/invoices/settle/${id}`, { method: 'POST' });
    return await res.json();
  },

  // Disputes & Chargebacks (Track 02)
  getDisputes: async () => {
    const res = await fetch(`${API_BASE}/disputes`);
    return await res.json();
  },

  submitDisputeDossier: async (id) => {
    const res = await fetch(`${API_BASE}/disputes/submit-dossier/${id}`, { method: 'POST' });
    return await res.json();
  },

  // Webhooks
  getWebhookEvents: async () => {
    const res = await fetch(`${API_BASE}/webhooks/events`);
    return await res.json();
  },

  simulateWebhook: async (payload) => {
    const res = await fetch(`${API_BASE}/webhooks/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Chaos Monkey Outage Simulator
  triggerChaos: async (bankKey = "SBI", scenario = "MIDNIGHT_CBS_LOCK") => {
    const res = await fetch(`${API_BASE}/chaos/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankKey, scenario })
    });
    return await res.json();
  },

  resetChaos: async () => {
    const res = await fetch(`${API_BASE}/chaos/reset`, { method: 'POST' });
    return await res.json();
  },

  getChaosStatus: async () => {
    const res = await fetch(`${API_BASE}/chaos/status`);
    return await res.json();
  },

  // Agentic Commerce Protocol (Track 01: NPCI UAP/x402)
  negotiateAgenticCommerce: async (payload) => {
    const res = await fetch(`${API_BASE}/agentic-commerce/negotiate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return await res.json();
  },

  // Verifiable RBI Certificate
  getAuditCertificate: async () => {
    const res = await fetch(`${API_BASE}/reports/rbi-audit-certificate`);
    return await res.json();
  }
};

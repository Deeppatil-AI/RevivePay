// Frontend API Client connecting to Express Backend on :5000
const API_BASE = "http://localhost:5000/api";

export const ApiService = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch(`${API_BASE}/health`);
      return await res.json();
    } catch {
      return { status: "OFFLINE" };
    }
  },

  // Subscriptions
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

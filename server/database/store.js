import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH 
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, 'revivepay.sqlite');

// Ensure directory exists
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sqlite = new Database(dbPath);

// Initialize schema
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    mandate_id TEXT,
    rrn TEXT,
    customer_name TEXT,
    city TEXT,
    phone TEXT,
    email TEXT,
    merchant TEXT,
    category TEXT,
    plan_name TEXT,
    amount REAL,
    bank TEXT,
    ifsc TEXT,
    customer_ltv REAL,
    mandate_limit REAL,
    retry_count INTEGER,
    failure_code TEXT,
    failure_name TEXT,
    failure_category TEXT,
    failure_reason TEXT,
    failed_at TEXT,
    recovery_result TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    buyer_name TEXT,
    buyer_gstin TEXT,
    amount REAL,
    due_date TEXT,
    overdue_days INTEGER,
    aging_bucket TEXT,
    status TEXT,
    ptp_date TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    items TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  CREATE TABLE IF NOT EXISTS disputes (
    id TEXT PRIMARY KEY,
    payment_id TEXT,
    amount REAL,
    reason_code TEXT,
    card_network TEXT,
    issuer_bank TEXT,
    chargeback_date TEXT,
    evidence_deadline TEXT,
    customer_name TEXT,
    customer_phone TEXT,
    dossier_compiled INTEGER,
    win_probability REAL,
    evidence_items TEXT,
    status TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    audit_token TEXT,
    txn_id TEXT,
    customer_name TEXT,
    merchant TEXT,
    diagnosis TEXT,
    policy TEXT,
    policy_status TEXT,
    action_type TEXT,
    action_detail TEXT,
    payment_link TEXT,
    merkle_hash TEXT,
    timestamp TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  CREATE TABLE IF NOT EXISTS policy (
    id TEXT PRIMARY KEY,
    max_discount_percentage REAL,
    absolute_discount_cap_rupees REAL,
    min_customer_ltv_for_discount REAL,
    escalate_above_rupees REAL,
    max_automatic_retries INTEGER,
    enforce_mandate_limit_strict INTEGER,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    event_type TEXT,
    payload TEXT,
    received_at TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );
`);

// Row deserializers
function rowToSubscription(r) {
  if (!r) return null;
  return {
    id: r.id,
    mandateId: r.mandate_id,
    rrn: r.rrn,
    customerName: r.customer_name,
    city: r.city,
    phone: r.phone,
    email: r.email,
    merchant: r.merchant,
    category: r.category,
    merchantCategory: r.category,
    planName: r.plan_name,
    amount: r.amount,
    bank: r.bank,
    ifsc: r.ifsc,
    customerLtv: r.customer_ltv,
    mandateLimit: r.mandate_limit,
    retryCount: r.retry_count,
    failureCode: r.failure_code,
    failureName: r.failure_name,
    failureCategory: r.failure_category,
    failureReason: r.failure_reason,
    failedAt: r.failed_at,
    recoveryResult: r.recovery_result ? JSON.parse(r.recovery_result) : null,
    merchantId: r.merchant_id
  };
}

function rowToInvoice(r) {
  if (!r) return null;
  return {
    id: r.id,
    buyerName: r.buyer_name,
    buyerGstin: r.buyer_gstin,
    amount: r.amount,
    dueDate: r.due_date,
    overdueDays: r.overdue_days,
    agingBucket: r.aging_bucket,
    status: r.status,
    ptpDate: r.ptp_date,
    contactPerson: r.contact_person,
    phone: r.phone,
    email: r.email,
    items: r.items ? JSON.parse(r.items) : [],
    merchantId: r.merchant_id
  };
}

function rowToDispute(r) {
  if (!r) return null;
  return {
    id: r.id,
    paymentId: r.payment_id,
    amount: r.amount,
    reasonCode: r.reason_code,
    cardNetwork: r.card_network,
    issuerBank: r.issuer_bank,
    chargebackDate: r.chargeback_date,
    evidenceDeadline: r.evidence_deadline,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    dossierCompiled: Boolean(r.dossier_compiled),
    winProbability: r.win_probability,
    evidenceItems: r.evidence_items ? JSON.parse(r.evidence_items) : {},
    status: r.status,
    merchantId: r.merchant_id
  };
}

function rowToAuditLog(r) {
  if (!r) return null;
  return {
    id: r.id,
    auditToken: r.audit_token,
    txnId: r.txn_id,
    customerName: r.customer_name,
    merchant: r.merchant,
    diagnosis: r.diagnosis ? JSON.parse(r.diagnosis) : null,
    policy: r.policy ? JSON.parse(r.policy) : null,
    policyStatus: r.policy_status,
    actionType: r.action_type,
    actionDetail: r.action_detail,
    paymentLink: r.payment_link,
    merkleHash: r.merkle_hash,
    timestamp: r.timestamp,
    merchantId: r.merchant_id
  };
}

function rowToPolicy(r) {
  if (!r) {
    return {
      maxDiscountPercentage: 8,
      absoluteDiscountCapRupees: 250,
      minCustomerLtvForDiscount: 8000,
      escalateAboveRupees: 10000,
      maxAutomaticRetries: 3,
      enforceMandateLimitStrict: true
    };
  }
  return {
    maxDiscountPercentage: r.max_discount_percentage,
    absoluteDiscountCapRupees: r.absolute_discount_cap_rupees,
    minCustomerLtvForDiscount: r.min_customer_ltv_for_discount,
    escalateAboveRupees: r.escalate_above_rupees,
    maxAutomaticRetries: r.max_automatic_retries,
    enforceMandateLimitStrict: Boolean(r.enforce_mandate_limit_strict)
  };
}

// Database wrapper with SQLite persistence maintaining existing API compatibility
export const db = {
  get subscriptions() {
    const rows = sqlite.prepare('SELECT * FROM subscriptions ORDER BY failed_at DESC').all();
    return rows.map(rowToSubscription);
  },
  set subscriptions(txns) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO subscriptions (
        id, mandate_id, rrn, customer_name, city, phone, email, merchant, category,
        plan_name, amount, bank, ifsc, customer_ltv, mandate_limit, retry_count,
        failure_code, failure_name, failure_category, failure_reason, failed_at, recovery_result, merchant_id
      ) VALUES (
        @id, @mandate_id, @rrn, @customer_name, @city, @phone, @email, @merchant, @category,
        @plan_name, @amount, @bank, @ifsc, @customer_ltv, @mandate_limit, @retry_count,
        @failure_code, @failure_name, @failure_category, @failure_reason, @failed_at, @recovery_result, @merchant_id
      )
    `);

    const insertMany = sqlite.transaction((items) => {
      sqlite.prepare('DELETE FROM subscriptions').run();
      for (const t of items) {
        insert.run({
          id: t.id,
          mandate_id: t.mandateId || t.mandate_id,
          rrn: t.rrn,
          customer_name: t.customerName || t.customer_name,
          city: t.city,
          phone: t.phone,
          email: t.email,
          merchant: t.merchant,
          category: t.category || t.merchantCategory,
          plan_name: t.planName || t.plan_name,
          amount: t.amount,
          bank: t.bank,
          ifsc: t.ifsc,
          customer_ltv: t.customerLtv || t.customer_ltv,
          mandate_limit: t.mandateLimit || t.mandate_limit,
          retry_count: t.retryCount || t.retry_count || 0,
          failure_code: t.failureCode || t.failure_code,
          failure_name: t.failureName || t.failure_name,
          failure_category: t.failureCategory || t.failure_category,
          failure_reason: t.failureReason || t.failure_reason,
          failed_at: t.failedAt || t.failed_at || new Date().toISOString(),
          recovery_result: t.recoveryResult ? JSON.stringify(t.recoveryResult) : null,
          merchant_id: t.merchantId || t.merchant_id || 'merchant_rzp_primary'
        });
      }
    });

    insertMany(txns);
  },

  updateSubscription(txn) {
    const stmt = sqlite.prepare(`
      UPDATE subscriptions SET
        recovery_result = @recovery_result,
        failure_code = @failure_code
      WHERE id = @id
    `);
    stmt.run({
      id: txn.id,
      recovery_result: txn.recoveryResult ? JSON.stringify(txn.recoveryResult) : null,
      failure_code: txn.failureCode
    });
  },

  get invoices() {
    const rows = sqlite.prepare('SELECT * FROM invoices ORDER BY overdue_days DESC').all();
    return rows.map(rowToInvoice);
  },
  set invoices(invs) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO invoices (
        id, buyer_name, buyer_gstin, amount, due_date, overdue_days, aging_bucket,
        status, ptp_date, contact_person, phone, email, items, merchant_id
      ) VALUES (
        @id, @buyer_name, @buyer_gstin, @amount, @due_date, @overdue_days, @aging_bucket,
        @status, @ptp_date, @contact_person, @phone, @email, @items, @merchant_id
      )
    `);

    const insertMany = sqlite.transaction((items) => {
      sqlite.prepare('DELETE FROM invoices').run();
      for (const inv of items) {
        insert.run({
          id: inv.id,
          buyer_name: inv.buyerName || inv.buyer_name,
          buyer_gstin: inv.buyerGstin || inv.buyer_gstin,
          amount: inv.amount,
          due_date: inv.dueDate || inv.due_date,
          overdue_days: inv.overdueDays || inv.overdue_days,
          aging_bucket: inv.agingBucket || inv.aging_bucket,
          status: inv.status,
          ptp_date: inv.ptpDate || inv.ptp_date,
          contact_person: inv.contactPerson || inv.contact_person,
          phone: inv.phone,
          email: inv.email,
          items: JSON.stringify(inv.items || []),
          merchant_id: inv.merchantId || inv.merchant_id || 'merchant_rzp_primary'
        });
      }
    });

    insertMany(invs);
  },

  updateInvoice(inv) {
    const stmt = sqlite.prepare(`
      UPDATE invoices SET
        status = @status,
        ptp_date = @ptp_date
      WHERE id = @id
    `);
    stmt.run({
      id: inv.id,
      status: inv.status,
      ptp_date: inv.ptpDate || null
    });
  },

  get disputes() {
    const rows = sqlite.prepare('SELECT * FROM disputes ORDER BY chargeback_date DESC').all();
    return rows.map(rowToDispute);
  },
  set disputes(disps) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO disputes (
        id, payment_id, amount, reason_code, card_network, issuer_bank, chargeback_date,
        evidence_deadline, customer_name, customer_phone, dossier_compiled, win_probability,
        evidence_items, status, merchant_id
      ) VALUES (
        @id, @payment_id, @amount, @reason_code, @card_network, @issuer_bank, @chargeback_date,
        @evidence_deadline, @customer_name, @customer_phone, @dossier_compiled, @win_probability,
        @evidence_items, @status, @merchant_id
      )
    `);

    const insertMany = sqlite.transaction((items) => {
      sqlite.prepare('DELETE FROM disputes').run();
      for (const d of items) {
        insert.run({
          id: d.id,
          payment_id: d.paymentId || d.payment_id,
          amount: d.amount,
          reason_code: d.reasonCode || d.reason_code,
          card_network: d.cardNetwork || d.card_network,
          issuer_bank: d.issuerBank || d.issuer_bank,
          chargeback_date: d.chargebackDate || d.chargeback_date,
          evidence_deadline: d.evidenceDeadline || d.evidence_deadline,
          customer_name: d.customerName || d.customer_name,
          customer_phone: d.customerPhone || d.customer_phone,
          dossier_compiled: d.dossierCompiled ? 1 : 0,
          win_probability: d.winProbability || d.win_probability,
          evidence_items: JSON.stringify(d.evidenceItems || d.evidence_items || {}),
          status: d.status,
          merchant_id: d.merchantId || d.merchant_id || 'merchant_rzp_primary'
        });
      }
    });

    insertMany(disps);
  },

  updateDispute(d) {
    const stmt = sqlite.prepare(`
      UPDATE disputes SET
        status = @status,
        dossier_compiled = @dossier_compiled
      WHERE id = @id
    `);
    stmt.run({
      id: d.id,
      status: d.status,
      dossier_compiled: d.dossierCompiled ? 1 : 0
    });
  },

  get policy() {
    const row = sqlite.prepare('SELECT * FROM policy LIMIT 1').get();
    return rowToPolicy(row);
  },
  set policy(p) {
    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO policy (
        id, max_discount_percentage, absolute_discount_cap_rupees,
        min_customer_ltv_for_discount, escalate_above_rupees,
        max_automatic_retries, enforce_mandate_limit_strict, merchant_id
      ) VALUES (
        'default_policy', @max_discount_percentage, @absolute_discount_cap_rupees,
        @min_customer_ltv_for_discount, @escalate_above_rupees,
        @max_automatic_retries, @enforce_mandate_limit_strict, 'merchant_rzp_primary'
      )
    `);
    stmt.run({
      max_discount_percentage: p.maxDiscountPercentage || p.max_discount_percentage || 8,
      absolute_discount_cap_rupees: p.absoluteDiscountCapRupees || p.maxDiscountRupeesCap || 250,
      min_customer_ltv_for_discount: p.minCustomerLtvForDiscount || p.minLtvForIncentive || 8000,
      escalate_above_rupees: p.escalateAboveRupees || p.requireHumanApprovalAboveAmount || 10000,
      max_automatic_retries: p.maxAutomaticRetries || 3,
      enforce_mandate_limit_strict: p.enforceMandateLimitStrict !== false ? 1 : 0
    });
  },

  get auditLogs() {
    const rows = sqlite.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all();
    return rows.map(rowToAuditLog);
  },
  set auditLogs(logs) {
    if (!logs || logs.length === 0) {
      sqlite.prepare('DELETE FROM audit_logs').run();
      return;
    }
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO audit_logs (
        id, audit_token, txn_id, customer_name, merchant, diagnosis, policy,
        policy_status, action_type, action_detail, payment_link, merkle_hash, timestamp, merchant_id
      ) VALUES (
        @id, @audit_token, @txn_id, @customer_name, @merchant, @diagnosis, @policy,
        @policy_status, @action_type, @action_detail, @payment_link, @merkle_hash, @timestamp, @merchant_id
      )
    `);
    const insertMany = sqlite.transaction((items) => {
      sqlite.prepare('DELETE FROM audit_logs').run();
      for (const l of items) {
        insert.run({
          id: l.id,
          audit_token: l.auditToken || l.audit_token,
          txn_id: l.txnId || l.txn_id,
          customer_name: l.customerName || l.customer_name,
          merchant: l.merchant,
          diagnosis: JSON.stringify(l.diagnosis || null),
          policy: JSON.stringify(l.policy || null),
          policy_status: l.policyStatus || l.policy_status,
          action_type: l.actionType || l.action_type,
          action_detail: l.actionDetail || l.action_detail,
          payment_link: l.paymentLink || l.payment_link,
          merkle_hash: l.merkleHash || l.merkle_hash || null,
          timestamp: l.timestamp || new Date().toISOString(),
          merchant_id: l.merchantId || l.merchant_id || 'merchant_rzp_primary'
        });
      }
    });
    insertMany(logs);
  },

  addAuditLog(entry) {
    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO audit_logs (
        id, audit_token, txn_id, customer_name, merchant, diagnosis, policy,
        policy_status, action_type, action_detail, payment_link, merkle_hash, timestamp, merchant_id
      ) VALUES (
        @id, @audit_token, @txn_id, @customer_name, @merchant, @diagnosis, @policy,
        @policy_status, @action_type, @action_detail, @payment_link, @merkle_hash, @timestamp, @merchant_id
      )
    `);
    stmt.run({
      id: entry.id,
      audit_token: entry.auditToken || entry.audit_token,
      txn_id: entry.txnId || entry.txn_id,
      customer_name: entry.customerName || entry.customer_name,
      merchant: entry.merchant,
      diagnosis: JSON.stringify(entry.diagnosis || null),
      policy: JSON.stringify(entry.policy || null),
      policy_status: entry.policyStatus || entry.policy_status,
      action_type: entry.actionType || entry.action_type,
      action_detail: entry.actionDetail || entry.action_detail,
      payment_link: entry.paymentLink || entry.payment_link,
      merkle_hash: entry.merkleHash || entry.merkle_hash || null,
      timestamp: entry.timestamp || new Date().toISOString(),
      merchant_id: entry.merchantId || entry.merchant_id || 'merchant_rzp_primary'
    });
  },

  get webhookEvents() {
    const rows = sqlite.prepare('SELECT * FROM webhook_events ORDER BY received_at DESC').all();
    return rows.map(r => ({
      id: r.id,
      eventType: r.event_type,
      payload: r.payload ? JSON.parse(r.payload) : {},
      receivedAt: r.received_at,
      merchantId: r.merchant_id
    }));
  },
  set webhookEvents(events) {
    sqlite.prepare('DELETE FROM webhook_events').run();
  },

  addWebhookEvent(event) {
    const stmt = sqlite.prepare(`
      INSERT INTO webhook_events (id, event_type, payload, received_at, merchant_id)
      VALUES (@id, @event_type, @payload, @received_at, @merchant_id)
    `);
    stmt.run({
      id: event.id || `evt_${Date.now().toString(36)}`,
      event_type: event.eventType || event.event_type,
      payload: JSON.stringify(event.payload || {}),
      received_at: event.receivedAt || event.received_at || new Date().toISOString(),
      merchant_id: event.merchantId || event.merchant_id || 'merchant_rzp_primary'
    });
  }
};

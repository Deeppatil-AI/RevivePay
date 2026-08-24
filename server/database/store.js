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

// Enable WAL mode for high concurrent write performance
try {
  sqlite.pragma('journal_mode = WAL');
} catch (e) {}

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
    event_id TEXT,
    event_type TEXT,
    payload TEXT,
    signature_verified INTEGER DEFAULT 1,
    status TEXT DEFAULT 'RECEIVED', -- RECEIVED, PROCESSING, PROCESSED, FAILED, IGNORED
    retry_count INTEGER DEFAULT 0,
    failure_reason TEXT,
    received_at TEXT NOT NULL,
    processed_at TEXT,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  -- Priority 1: Payment State Machine & Financial Transactions
  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL, -- CREATED, PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUND_PENDING, REFUNDED
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    sender TEXT NOT NULL,
    sender_account TEXT,
    receiver TEXT NOT NULL,
    receiver_account TEXT,
    payment_method TEXT NOT NULL, -- upi, card, netbanking
    idempotency_key TEXT UNIQUE,
    reference_id TEXT,
    failure_reason TEXT,
    fraud_score REAL DEFAULT 0,
    fraud_level TEXT DEFAULT 'LOW',
    fraud_decision TEXT DEFAULT 'ALLOW',
    fraud_reasons TEXT,
    refunded_amount REAL DEFAULT 0,
    metadata TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  -- Priority 2: Idempotency Protection Store
  CREATE TABLE IF NOT EXISTS idempotency_records (
    key TEXT PRIMARY KEY,
    request_path TEXT NOT NULL,
    request_hash TEXT NOT NULL,
    response_status INTEGER NOT NULL,
    response_body TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- Priority 6: Double-Entry Immutable Financial Ledger
  CREATE TABLE IF NOT EXISTS ledger_entries (
    id TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL,
    account_id TEXT NOT NULL,
    entry_type TEXT NOT NULL, -- DEBIT or CREDIT
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    balance_after REAL,
    description TEXT,
    created_at TEXT NOT NULL
  );

  -- Priority 7: Refund Lifecycle Store
  CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    reason TEXT,
    status TEXT NOT NULL, -- REFUND_REQUESTED, REFUND_PROCESSING, REFUNDED, REFUND_FAILED
    idempotency_key TEXT,
    failure_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );

  -- Priority 8: Event and Audit System (State Transitions)
  CREATE TABLE IF NOT EXISTS payment_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL, -- PAYMENT_CREATED, PAYMENT_PROCESSING, PAYMENT_SUCCESS, PAYMENT_FAILED, PAYMENT_CANCELLED, PAYMENT_REFUND_REQUESTED, PAYMENT_REFUNDED, FRAUD_DETECTED
    transaction_id TEXT NOT NULL,
    user_id TEXT DEFAULT 'merchant_rzp_primary',
    previous_state TEXT,
    new_state TEXT,
    metadata TEXT,
    timestamp TEXT NOT NULL
  );

  -- React Error Boundary and Client Exception Audit Trail
  CREATE TABLE IF NOT EXISTS error_logs (
    id TEXT PRIMARY KEY,
    view_name TEXT,
    message TEXT NOT NULL,
    stack TEXT,
    component_stack TEXT,
    user_agent TEXT,
    timestamp TEXT NOT NULL,
    merchant_id TEXT DEFAULT 'merchant_rzp_primary'
  );
`);

// Run non-destructive column migrations for existing SQLite tables
try {
  const columns = sqlite.prepare("PRAGMA table_info(webhook_events)").all().map(c => c.name);
  if (!columns.includes('status')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN status TEXT DEFAULT 'RECEIVED'");
  if (!columns.includes('event_id')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN event_id TEXT");
  if (!columns.includes('signature_verified')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN signature_verified INTEGER DEFAULT 1");
  if (!columns.includes('retry_count')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN retry_count INTEGER DEFAULT 0");
  if (!columns.includes('failure_reason')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN failure_reason TEXT");
  if (!columns.includes('processed_at')) sqlite.exec("ALTER TABLE webhook_events ADD COLUMN processed_at TEXT");
} catch (e) {}

// High-Performance Database Indexes
try {
  sqlite.exec(`
    CREATE INDEX IF NOT EXISTS idx_payments_merchant ON payments(merchant_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);
    CREATE INDEX IF NOT EXISTS idx_payments_idemp ON payments(idempotency_key);
    CREATE INDEX IF NOT EXISTS idx_ledger_txn ON ledger_entries(transaction_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_account ON ledger_entries(account_id);
    CREATE INDEX IF NOT EXISTS idx_refunds_payment ON refunds(payment_id);
    CREATE INDEX IF NOT EXISTS idx_webhook_status ON webhook_events(status);
    CREATE INDEX IF NOT EXISTS idx_webhook_event_id ON webhook_events(event_id);
    CREATE INDEX IF NOT EXISTS idx_idemp_key ON idempotency_records(key);
  `);
} catch (e) {}

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
    evidenceItems: r.evidence_items ? JSON.parse(r.evidence_items) : [],
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

export function rowToPayment(r) {
  if (!r) return null;
  return {
    id: r.id,
    status: r.status,
    amount: r.amount,
    currency: r.currency,
    sender: r.sender,
    senderAccount: r.sender_account,
    receiver: r.receiver,
    receiverAccount: r.receiver_account,
    paymentMethod: r.payment_method,
    idempotencyKey: r.idempotency_key,
    referenceId: r.reference_id,
    failureReason: r.failure_reason,
    fraudScore: r.fraud_score,
    fraudLevel: r.fraud_level,
    fraudDecision: r.fraud_decision,
    fraudReasons: r.fraud_reasons ? JSON.parse(r.fraud_reasons) : [],
    refundedAmount: r.refunded_amount || 0,
    metadata: r.metadata ? JSON.parse(r.metadata) : {},
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    merchantId: r.merchant_id
  };
}

export function rowToRefund(r) {
  if (!r) return null;
  return {
    id: r.id,
    paymentId: r.payment_id,
    amount: r.amount,
    currency: r.currency,
    reason: r.reason,
    status: r.status,
    idempotencyKey: r.idempotency_key,
    failureReason: r.failure_reason,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    merchantId: r.merchant_id
  };
}

export function rowToLedgerEntry(r) {
  if (!r) return null;
  return {
    id: r.id,
    transactionId: r.transaction_id,
    accountId: r.account_id,
    entryType: r.entry_type,
    amount: r.amount,
    currency: r.currency,
    balanceAfter: r.balance_after,
    description: r.description,
    createdAt: r.created_at
  };
}

export function rowToPaymentEvent(r) {
  if (!r) return null;
  return {
    id: r.id,
    eventType: r.event_type,
    transactionId: r.transaction_id,
    userId: r.user_id,
    previousState: r.previous_state,
    newState: r.new_state,
    metadata: r.metadata ? JSON.parse(r.metadata) : {},
    timestamp: r.timestamp
  };
}

// Global Database API Adapter
export const db = {
  // Subscriptions
  get subscriptions() {
    const rows = sqlite.prepare('SELECT * FROM subscriptions').all();
    return rows.map(rowToSubscription);
  },
  set subscriptions(txns) {
    const insert = sqlite.prepare(`
      INSERT OR REPLACE INTO subscriptions (
        id, mandate_id, rrn, customer_name, city, phone, email, merchant, category,
        plan_name, amount, bank, ifsc, customer_ltv, mandate_limit, retry_count,
        failure_code, failure_name, failure_category, failure_reason, failed_at,
        recovery_result, merchant_id
      ) VALUES (
        @id, @mandate_id, @rrn, @customer_name, @city, @phone, @email, @merchant, @category,
        @plan_name, @amount, @bank, @ifsc, @customer_ltv, @mandate_limit, @retry_count,
        @failure_code, @failure_name, @failure_category, @failure_reason, @failed_at,
        @recovery_result, @merchant_id
      )
    `);
    const insertMany = sqlite.transaction((items) => {
      sqlite.prepare('DELETE FROM subscriptions').run();
      for (const t of items) {
        insert.run({
          id: t.id,
          mandate_id: t.mandateId || t.mandate_id || null,
          rrn: t.rrn || null,
          customer_name: t.customerName || t.customer_name,
          city: t.city || 'Mumbai',
          phone: t.phone || '+91 98000 00000',
          email: t.email || 'customer@revivepay.io',
          merchant: t.merchant || 'Razorpay Merchant',
          category: t.category || t.merchantCategory || 'SaaS',
          plan_name: t.planName || t.plan_name || 'Standard Plan',
          amount: t.amount,
          bank: t.bank || 'SBI',
          ifsc: t.ifsc || 'SBIN0001234',
          customer_ltv: t.customerLtv || t.customer_ltv || 10000,
          mandate_limit: t.mandateLimit || t.mandate_limit || 15000,
          retry_count: t.retryCount || t.retry_count || 0,
          failure_code: t.failureCode || t.failure_code || 'NPCI_U30',
          failure_name: t.failureName || t.failure_name || 'Bank CBS Outage',
          failure_category: t.failureCategory || t.failure_category || 'INFRASTRUCTURE',
          failure_reason: t.failureReason || t.failure_reason || 'Simulated failure',
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
        retry_count = @retry_count,
        recovery_result = @recovery_result
      WHERE id = @id
    `);
    stmt.run({
      id: txn.id,
      retry_count: txn.retryCount || txn.retry_count || 0,
      recovery_result: txn.recoveryResult ? JSON.stringify(txn.recoveryResult) : null
    });
  },

  // Invoices
  get invoices() {
    const rows = sqlite.prepare('SELECT * FROM invoices').all();
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
          ptp_date: inv.ptpDate || inv.ptp_date || null,
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
      ptp_date: inv.ptpDate || inv.ptp_date || null
    });
  },

  // Disputes
  get disputes() {
    const rows = sqlite.prepare('SELECT * FROM disputes').all();
    return rows.map(rowToDispute);
  },
  set disputes(ds) {
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
          evidence_items: JSON.stringify(d.evidenceItems || d.evidence_items || []),
          status: d.status,
          merchant_id: d.merchantId || d.merchant_id || 'merchant_rzp_primary'
        });
      }
    });
    insertMany(ds);
  },

  updateDispute(d) {
    const stmt = sqlite.prepare(`
      UPDATE disputes SET
        dossier_compiled = @dossier_compiled,
        status = @status
      WHERE id = @id
    `);
    stmt.run({
      id: d.id,
      dossier_compiled: d.dossierCompiled ? 1 : 0,
      status: d.status
    });
  },

  // Policy
  get policy() {
    const row = sqlite.prepare('SELECT * FROM policy WHERE merchant_id = ?').get('merchant_rzp_primary');
    if (!row) {
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
      maxDiscountPercentage: row.max_discount_percentage,
      absoluteDiscountCapRupees: row.absolute_discount_cap_rupees,
      minCustomerLtvForDiscount: row.min_customer_ltv_for_discount,
      escalateAboveRupees: row.escalate_above_rupees,
      maxAutomaticRetries: row.max_automatic_retries,
      enforceMandateLimitStrict: Boolean(row.enforce_mandate_limit_strict)
    };
  },
  set policy(p) {
    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO policy (
        id, max_discount_percentage, absolute_discount_cap_rupees,
        min_customer_ltv_for_discount, escalate_above_rupees,
        max_automatic_retries, enforce_mandate_limit_strict, merchant_id
      ) VALUES (
        'policy_primary', @max_discount_percentage, @absolute_discount_cap_rupees,
        @min_customer_ltv_for_discount, @escalate_above_rupees,
        @max_automatic_retries, @enforce_mandate_limit_strict, 'merchant_rzp_primary'
      )
    `);
    stmt.run({
      max_discount_percentage: p.maxDiscountPercentage || p.max_discount_percentage || 8,
      absolute_discount_cap_rupees: p.absoluteDiscountCapRupees || p.absolute_discount_cap_rupees || 250,
      min_customer_ltv_for_discount: p.minCustomerLtvForDiscount || p.min_customer_ltv_for_discount || 8000,
      escalate_above_rupees: p.escalateAboveRupees || p.escalate_above_rupees || 10000,
      max_automatic_retries: p.maxAutomaticRetries || p.max_automatic_retries || 3,
      enforce_mandate_limit_strict: (p.enforceMandateLimitStrict || p.enforce_mandate_limit_strict) ? 1 : 0
    });
  },

  // Audit Logs
  get auditLogs() {
    const rows = sqlite.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC').all();
    return rows.map(rowToAuditLog);
  },
  set auditLogs(logs) {
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

  // Webhook Events
  get webhookEvents() {
    const rows = sqlite.prepare('SELECT * FROM webhook_events ORDER BY received_at DESC').all();
    return rows.map(r => ({
      id: r.id,
      eventId: r.event_id,
      eventType: r.event_type,
      payload: r.payload ? JSON.parse(r.payload) : {},
      signatureVerified: Boolean(r.signature_verified),
      status: r.status || 'RECEIVED',
      retryCount: r.retry_count || 0,
      failureReason: r.failure_reason,
      receivedAt: r.received_at,
      processedAt: r.processed_at,
      merchantId: r.merchant_id
    }));
  },
  set webhookEvents(events) {
    sqlite.prepare('DELETE FROM webhook_events').run();
  },

  getWebhookEventById(id) {
    const r = sqlite.prepare('SELECT * FROM webhook_events WHERE id = ?').get(id);
    if (!r) return null;
    return {
      id: r.id,
      eventId: r.event_id,
      eventType: r.event_type,
      payload: r.payload ? JSON.parse(r.payload) : {},
      signatureVerified: Boolean(r.signature_verified),
      status: r.status || 'RECEIVED',
      retryCount: r.retry_count || 0,
      failureReason: r.failure_reason,
      receivedAt: r.received_at,
      processedAt: r.processed_at,
      merchantId: r.merchant_id
    };
  },

  getWebhookEventByEventId(eventId) {
    if (!eventId) return null;
    const r = sqlite.prepare('SELECT * FROM webhook_events WHERE event_id = ?').get(eventId);
    if (!r) return null;
    return {
      id: r.id,
      eventId: r.event_id,
      eventType: r.event_type,
      payload: r.payload ? JSON.parse(r.payload) : {},
      signatureVerified: Boolean(r.signature_verified),
      status: r.status || 'RECEIVED',
      retryCount: r.retry_count || 0,
      failureReason: r.failure_reason,
      receivedAt: r.received_at,
      processedAt: r.processed_at,
      merchantId: r.merchant_id
    };
  },

  addWebhookEvent(event) {
    const stmt = sqlite.prepare(`
      INSERT INTO webhook_events (id, event_id, event_type, payload, signature_verified, status, retry_count, failure_reason, received_at, processed_at, merchant_id)
      VALUES (@id, @event_id, @event_type, @payload, @signature_verified, @status, @retry_count, @failure_reason, @received_at, @processed_at, @merchant_id)
    `);
    stmt.run({
      id: event.id || `evt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: event.eventId || event.event_id || null,
      event_type: event.eventType || event.event_type,
      payload: JSON.stringify(event.payload || {}),
      signature_verified: (event.signatureVerified !== undefined ? event.signatureVerified : event.signature_verified) ? 1 : 0,
      status: event.status || 'RECEIVED',
      retry_count: event.retryCount || event.retry_count || 0,
      failure_reason: event.failureReason || event.failure_reason || null,
      received_at: event.receivedAt || event.received_at || new Date().toISOString(),
      processed_at: event.processedAt || event.processed_at || null,
      merchant_id: event.merchantId || event.merchant_id || 'merchant_rzp_primary'
    });
    return this.getWebhookEventById(event.id);
  },

  updateWebhookEventStatus(id, { status, failureReason = null, processedAt = new Date().toISOString() }) {
    const stmt = sqlite.prepare(`
      UPDATE webhook_events SET
        status = @status,
        failure_reason = @failure_reason,
        processed_at = @processed_at
      WHERE id = @id
    `);
    stmt.run({
      id,
      status,
      failure_reason: failureReason,
      processed_at: processedAt
    });
    return this.getWebhookEventById(id);
  },

  // --- Priority 1 & 3: Payments Store ---
  get payments() {
    const rows = sqlite.prepare('SELECT * FROM payments ORDER BY created_at DESC').all();
    return rows.map(rowToPayment);
  },

  getPaymentById(id) {
    const row = sqlite.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    return rowToPayment(row);
  },

  getPaymentByIdempotencyKey(key) {
    if (!key) return null;
    const row = sqlite.prepare('SELECT * FROM payments WHERE idempotency_key = ?').get(key);
    return rowToPayment(row);
  },

  insertPayment(p) {
    const stmt = sqlite.prepare(`
      INSERT INTO payments (
        id, status, amount, currency, sender, sender_account, receiver, receiver_account,
        payment_method, idempotency_key, reference_id, failure_reason, fraud_score,
        fraud_level, fraud_decision, fraud_reasons, refunded_amount, metadata,
        created_at, updated_at, merchant_id
      ) VALUES (
        @id, @status, @amount, @currency, @sender, @sender_account, @receiver, @receiver_account,
        @payment_method, @idempotency_key, @reference_id, @failure_reason, @fraud_score,
        @fraud_level, @fraud_decision, @fraud_reasons, @refunded_amount, @metadata,
        @created_at, @updated_at, @merchant_id
      )
    `);
    stmt.run({
      id: p.id,
      status: p.status,
      amount: p.amount,
      currency: p.currency || 'INR',
      sender: p.sender,
      sender_account: p.senderAccount || p.sender_account || null,
      receiver: p.receiver,
      receiver_account: p.receiverAccount || p.receiver_account || null,
      payment_method: p.paymentMethod || p.payment_method || 'upi',
      idempotency_key: p.idempotencyKey || p.idempotency_key || null,
      reference_id: p.referenceId || p.reference_id || null,
      failure_reason: p.failureReason || p.failure_reason || null,
      fraud_score: p.fraudScore !== undefined ? p.fraudScore : (p.fraud_score || 0),
      fraud_level: p.fraudLevel || p.fraud_level || 'LOW',
      fraud_decision: p.fraudDecision || p.fraud_decision || 'ALLOW',
      fraud_reasons: JSON.stringify(p.fraudReasons || p.fraud_reasons || []),
      refunded_amount: p.refundedAmount || p.refunded_amount || 0,
      metadata: JSON.stringify(p.metadata || {}),
      created_at: p.createdAt || p.created_at || new Date().toISOString(),
      updated_at: p.updatedAt || p.updated_at || new Date().toISOString(),
      merchant_id: p.merchantId || p.merchant_id || 'merchant_rzp_primary'
    });
    return this.getPaymentById(p.id);
  },

  updatePayment(p) {
    const stmt = sqlite.prepare(`
      UPDATE payments SET
        status = @status,
        failure_reason = @failure_reason,
        reference_id = @reference_id,
        fraud_score = @fraud_score,
        fraud_level = @fraud_level,
        fraud_decision = @fraud_decision,
        fraud_reasons = @fraud_reasons,
        refunded_amount = @refunded_amount,
        metadata = @metadata,
        updated_at = @updated_at
      WHERE id = @id
    `);
    stmt.run({
      id: p.id,
      status: p.status,
      failure_reason: p.failureReason || p.failure_reason || null,
      reference_id: p.referenceId || p.reference_id || null,
      fraud_score: p.fraudScore !== undefined ? p.fraudScore : (p.fraud_score || 0),
      fraud_level: p.fraudLevel || p.fraud_level || 'LOW',
      fraud_decision: p.fraudDecision || p.fraud_decision || 'ALLOW',
      fraud_reasons: JSON.stringify(p.fraudReasons || p.fraud_reasons || []),
      refunded_amount: p.refundedAmount !== undefined ? p.refundedAmount : (p.refunded_amount || 0),
      metadata: JSON.stringify(p.metadata || {}),
      updated_at: new Date().toISOString()
    });
    return this.getPaymentById(p.id);
  },

  // --- Priority 2: Idempotency Records ---
  getIdempotencyRecord(key) {
    const row = sqlite.prepare('SELECT * FROM idempotency_records WHERE key = ?').get(key);
    if (!row) return null;
    return {
      key: row.key,
      requestPath: row.request_path,
      requestHash: row.request_hash,
      responseStatus: row.response_status,
      responseBody: JSON.parse(row.response_body),
      createdAt: row.created_at
    };
  },

  saveIdempotencyRecord({ key, requestPath, requestHash, responseStatus, responseBody }) {
    const stmt = sqlite.prepare(`
      INSERT OR REPLACE INTO idempotency_records (key, request_path, request_hash, response_status, response_body, created_at)
      VALUES (@key, @request_path, @request_hash, @response_status, @response_body, @created_at)
    `);
    stmt.run({
      key,
      request_path: requestPath,
      request_hash: requestHash,
      response_status: responseStatus,
      response_body: JSON.stringify(responseBody),
      created_at: new Date().toISOString()
    });
  },

  // --- Priority 6: Ledger Entries ---
  get ledgerEntries() {
    const rows = sqlite.prepare('SELECT * FROM ledger_entries ORDER BY created_at DESC').all();
    return rows.map(rowToLedgerEntry);
  },

  getLedgerEntriesByTxnId(txnId) {
    const rows = sqlite.prepare('SELECT * FROM ledger_entries WHERE transaction_id = ? ORDER BY created_at ASC').all(txnId);
    return rows.map(rowToLedgerEntry);
  },

  insertLedgerEntry(entry) {
    const stmt = sqlite.prepare(`
      INSERT INTO ledger_entries (id, transaction_id, account_id, entry_type, amount, currency, balance_after, description, created_at)
      VALUES (@id, @transaction_id, @account_id, @entry_type, @amount, @currency, @balance_after, @description, @created_at)
    `);
    stmt.run({
      id: entry.id,
      transaction_id: entry.transactionId || entry.transaction_id,
      account_id: entry.accountId || entry.account_id,
      entry_type: entry.entryType || entry.entry_type,
      amount: entry.amount,
      currency: entry.currency || 'INR',
      balance_after: entry.balanceAfter || entry.balance_after || 0,
      description: entry.description || null,
      created_at: entry.createdAt || entry.created_at || new Date().toISOString()
    });
  },

  // --- Priority 7: Refunds ---
  get refunds() {
    const rows = sqlite.prepare('SELECT * FROM refunds ORDER BY created_at DESC').all();
    return rows.map(rowToRefund);
  },

  getRefundById(id) {
    const row = sqlite.prepare('SELECT * FROM refunds WHERE id = ?').get(id);
    return rowToRefund(row);
  },

  getRefundsByPaymentId(paymentId) {
    const rows = sqlite.prepare('SELECT * FROM refunds WHERE payment_id = ? ORDER BY created_at DESC').all(paymentId);
    return rows.map(rowToRefund);
  },

  getRefundByIdempotencyKey(key) {
    if (!key) return null;
    const row = sqlite.prepare('SELECT * FROM refunds WHERE idempotency_key = ?').get(key);
    return rowToRefund(row);
  },

  insertRefund(r) {
    const stmt = sqlite.prepare(`
      INSERT INTO refunds (id, payment_id, amount, currency, reason, status, idempotency_key, failure_reason, created_at, updated_at, merchant_id)
      VALUES (@id, @payment_id, @amount, @currency, @reason, @status, @idempotency_key, @failure_reason, @created_at, @updated_at, @merchant_id)
    `);
    stmt.run({
      id: r.id,
      payment_id: r.paymentId || r.payment_id,
      amount: r.amount,
      currency: r.currency || 'INR',
      reason: r.reason || null,
      status: r.status,
      idempotency_key: r.idempotencyKey || r.idempotency_key || null,
      failure_reason: r.failureReason || r.failure_reason || null,
      created_at: r.createdAt || r.created_at || new Date().toISOString(),
      updated_at: r.updatedAt || r.updated_at || new Date().toISOString(),
      merchant_id: r.merchantId || r.merchant_id || 'merchant_rzp_primary'
    });
    return this.getRefundById(r.id);
  },

  updateRefund(r) {
    const stmt = sqlite.prepare(`
      UPDATE refunds SET
        status = @status,
        failure_reason = @failure_reason,
        updated_at = @updated_at
      WHERE id = @id
    `);
    stmt.run({
      id: r.id,
      status: r.status,
      failure_reason: r.failureReason || r.failure_reason || null,
      updated_at: new Date().toISOString()
    });
    return this.getRefundById(r.id);
  },

  // --- Priority 8: Payment Events ---
  get paymentEvents() {
    const rows = sqlite.prepare('SELECT * FROM payment_events ORDER BY timestamp DESC').all();
    return rows.map(rowToPaymentEvent);
  },

  getEventsByTxnId(txnId) {
    const rows = sqlite.prepare('SELECT * FROM payment_events WHERE transaction_id = ? ORDER BY timestamp ASC').all(txnId);
    return rows.map(rowToPaymentEvent);
  },

  insertPaymentEvent(evt) {
    const stmt = sqlite.prepare(`
      INSERT INTO payment_events (id, event_type, transaction_id, user_id, previous_state, new_state, metadata, timestamp)
      VALUES (@id, @event_type, @transaction_id, @user_id, @previous_state, @new_state, @metadata, @timestamp)
    `);
    stmt.run({
      id: evt.id || `pevt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      event_type: evt.eventType || evt.event_type,
      transaction_id: evt.transactionId || evt.transaction_id,
      user_id: evt.userId || evt.user_id || 'merchant_rzp_primary',
      previous_state: evt.previousState || evt.previous_state || null,
      new_state: evt.newState || evt.new_state || null,
      metadata: JSON.stringify(evt.metadata || {}),
      timestamp: evt.timestamp || new Date().toISOString()
    });
  },

  // --- React Error Boundary Logs ---
  get errorLogs() {
    return sqlite.prepare('SELECT * FROM error_logs ORDER BY timestamp DESC').all();
  },

  addErrorLog(entry) {
    const stmt = sqlite.prepare(`
      INSERT INTO error_logs (id, view_name, message, stack, component_stack, user_agent, timestamp, merchant_id)
      VALUES (@id, @view_name, @message, @stack, @component_stack, @user_agent, @timestamp, @merchant_id)
    `);
    stmt.run({
      id: entry.id || `err_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      view_name: entry.viewName || entry.view_name || 'unknown_view',
      message: entry.message || 'Unknown React error',
      stack: entry.stack || null,
      component_stack: entry.componentStack || entry.component_stack || null,
      user_agent: entry.userAgent || entry.user_agent || null,
      timestamp: entry.timestamp || new Date().toISOString(),
      merchant_id: entry.merchantId || entry.merchant_id || 'merchant_rzp_primary'
    });
  }
};

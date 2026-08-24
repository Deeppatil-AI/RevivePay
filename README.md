# Razorpay RevivePay Enterprise Sentinel

[![CI / Build & Test](https://github.com/Deeppatil-AI/RevivePay/actions/workflows/ci.yml/badge.svg)](https://github.com/Deeppatil-AI/RevivePay/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Razorpay AI Hackathon](https://img.shields.io/badge/Razorpay-AI%20Hackathon%202026-blue.svg)](https://razorpay.com)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](./Dockerfile)

> **Autonomous Revenue Recovery, B2B Accounts Receivable Chaser, and Chargeback Defense Sentinel built for the Razorpay Fintech Ecosystem.**

---

## 🎯 Problem → Solution → Architecture Capabilities

- **The Problem**: Indian subscription merchants and B2B enterprises lose significant recurring revenue to silent bank switch timeouts (SBI/HDFC midnight CBS maintenance), delayed B2B invoice clearances, and illegitimate friendly fraud chargebacks. Blind mandate retries trigger severe NPCI rate limits and bank bounce fines (₹45/bounce) while degrading merchant trust scores.
- **The Solution**: **RevivePay Sentinel** is an enterprise fintech platform featuring a strict **Payment State Machine**, **Idempotency Protection**, **Hybrid Fraud Risk Intelligence (V2 Feature Extraction Layer)**, **Double-Entry Financial Ledger**, and automated recovery workflows that intercept failed debits via simulated bank switch telemetry.
- **Simulated Recovery Performance**: In simulated sandbox benchmarks across realistic cohorts of 100+ recurring mandates, Sentinel achieves a **+68% recovery uplift** over naive retries, eliminates simulated bank bounce penalties by waiting for morning CBS recovery windows (08:15 AM IST), and maintains an immutable double-entry ledger with SHA-256 Merkle root compliance certificates.

---

## 🌐 Live Production Deployment & Endpoints

[![Live Production Demo](https://img.shields.io/badge/Live%20Production%20Demo-Render.com-0066FF?style=for-the-badge&logo=render&logoColor=white)](https://revivepay-9v36.onrender.com/)

- 🚀 **Live Production Application**: [https://revivepay-9v36.onrender.com/](https://revivepay-9v36.onrender.com/)
- 🩺 **Backend REST API Health**: [https://revivepay-9v36.onrender.com/api/health](https://revivepay-9v36.onrender.com/api/health)
- 📊 **Live Telemetry & Metrics**: [https://revivepay-9v36.onrender.com/api/metrics](https://revivepay-9v36.onrender.com/api/metrics)
- ⚖️ **Double-Entry Ledger Integrity**: [https://revivepay-9v36.onrender.com/api/analytics/ledger](https://revivepay-9v36.onrender.com/api/analytics/ledger)
- 💻 **Local Development**: `http://localhost:5173` (Vite) / `http://localhost:5000` (Node)
- 🐙 **GitHub Repository**: [https://github.com/Deeppatil-AI/RevivePay](https://github.com/Deeppatil-AI/RevivePay)

---

## 🏛️ Core Payment, Fraud & Ledger Modules

### 1. Payment State Machine (`server/services/paymentStateMachine.js`)
```
[CREATED] ──> [PENDING] ──> [PROCESSING] ──> [SUCCESS] ──> [REFUND_PENDING] ──> [REFUNDED]
   │             │               │
   └──> [CANCELLED]              └──> [FAILED]
```
- **Controlled Transitions**: Validated server-side via strict state tables.
- **Invalid Transitions Blocked**: Direct leaps or transitions from terminal states (`FAILED`, `CANCELLED`, `REFUNDED`) are strictly rejected.
- **Audit Tracking**: Every transition logs `previous_state`, `new_state`, metadata, and emits real-time WebSocket events.
- **UI & API Integration**: Invoked during direct checkout (`DirectCheckoutModal.jsx`), batch test runs (`BatchRunner.jsx`), and payment verification endpoints.

### 2. Idempotency Protection (`server/services/idempotencyService.js` & `server/middleware/idempotencyMiddleware.js`)
- Deterministic SHA-256 request payload hashing.
- Replays cached responses safely with `Idempotent-Replayed: true` header.
- Prevents duplicate payments caused by double clicks, network timeouts, or retries.
- **UI & API Integration**: Applied automatically to `POST /api/payments/create` and `POST /api/refunds/create`.

### 3. Double-Entry Financial Ledger (`server/services/ledgerService.js`)
Every successful transaction and refund records balanced double-entry movements in `ledger_entries`:
- **Payment Settlement**:
  - `DEBIT`: Sender Account (`- amount`)
  - `CREDIT`: Receiver/Merchant Account (`+ amount`)
- **Refund Reversal**:
  - `DEBIT`: Receiver/Merchant Account (`- refundAmount`)
  - `CREDIT`: Sender Account (`+ refundAmount`)
- Guaranteed mathematical equilibrium: \(\sum \text{Debits} = \sum \text{Credits}\).
- **UI & API Integration**: Exposed via `ExecutiveAnalytics.jsx`, verifiable at `GET /api/analytics/ledger`.

### 4. Fraud Detection Intelligence V2 (`server/services/fraudFeatureExtractor.js` & `server/services/fraudDetectionService.js`)
- **Feature Extraction Layer**: Extracts 9+ structured signals (`amount`, `amount_deviation_ratio`, `velocity_10m`, `failed_attempts_count`, `is_new_device`, `is_tor_vpn`, `unusual_location`, `hour_of_day`, `historical_fraud_ratio`).
- **Hybrid Scorer**: Combines deterministic rules with statistical anomaly scoring to return standardized decisions (`ALLOW` / `REVIEW` / `BLOCK`).
- **UI & API Integration**: Runs automatically during payment creation, displaying real-time risk scores in `DirectCheckoutModal.jsx` and `ExecutiveAnalytics.jsx`.

### 5. Webhook Reliability & Deduplication (`server/routes/webhookRoutes.js`)
- Lifecycle tracking: `RECEIVED` $\rightarrow$ `PROCESSING` $\rightarrow$ `PROCESSED` (or `FAILED`).
- Replay protection & deduplication: Identifies duplicate gateway events by `event_id` and safely returns cached status without reprocessing.

### 6. Background Job Queue (`server/services/backgroundQueue.js`)
- In-process asynchronous task manager handling non-blocking background operations (`WEBHOOK_RETRY`, `ANALYTICS_REFRESH`, `FRAUD_INVESTIGATION_LOG`).

### 7. Role-Based Access Control (`server/middleware/rbacMiddleware.js`)
- Roles: `ADMIN`, `MERCHANT`, `ANALYST`, `SUPPORT`.
- Enforces merchant data boundaries to prevent Insecure Direct Object References (IDOR).

---

## 🏆 Hackathon Tracks Alignment

| Track | Module | Key Capabilities |
| :--- | :--- | :--- |
| **Track 01: AI Growth & Agentic Commerce** | **Agentic UAP M2M Engine** | Autonomous machine-to-machine RFQ negotiation between AI Buyer Procurement Agents and Razorpay Merchant Sentinel under simulated NPCI UAP and x402 protocols. |
| **Track 02: AI Risk Manager / Chargebacks** | **DisputeShield Defense** | Ingests delivery OTP proof, 3DS 2.0 Auth RRNs, logistics tracking, and IP telemetry to compile Visa/NPCI legal evidence dossiers (Exportable as PDF). |
| **Track 03: AI Revenue Recovery** | **AutoPay Sentinel & Vernacular Voice/Chat** | Bank CBS downtime diagnosis, morning health window rescheduling, 1-click Razorpay UPI intent links in 5 Indian languages (Hindi, Tamil, Telugu, Kannada, Hinglish). |
| **Track 04: AI Finance Controller & Recon** | **B2B Receivables, PTP & RBI Certificate** | Overdue aging (1-30d, 31-60d, 60d+), 18% GST matching, Promise-to-Pay tracking, and SHA-256 Merkle root RBI compliance certificate (Exportable as PDF). |

---

## 🔬 Reality Check: Implemented vs. Simulated vs. Future Work

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **Payment State Machine** | **Fully Implemented** | Strict transitions, terminal state locking, SQLite persistence. |
| **Idempotency & Replay Protection** | **Fully Implemented** | SHA-256 request hashing, cached response replay header. |
| **Double-Entry Ledger** | **Fully Implemented** | Balanced Debit/Credit accounting with trial balance verification. |
| **Refund Workflow & Bounds** | **Fully Implemented** | Multi-stage refunds, over-refund prevention, ledger reversals. |
| **Webhook Signature & Dedup** | **Fully Implemented** | Real HMAC-SHA256 verification, duplicate event detection. |
| **Fraud Feature Extraction V2** | **Fully Implemented** | 9-feature extraction layer + hybrid risk aggregator. |
| **PDF & CSV Export** | **Fully Implemented** | Client-side jsPDF statutory certificate & CSV ledger export. |
| **React Error Boundary** | **Fully Implemented** | Isolated crash recovery UI + backend SQLite error logging. |
| **Bank CBS Outages** | **Simulated Testbed** | Real failure code emulation (`NPCI_U30`, `DECLINED_BY_BANK`) to demonstrate autonomous rescheduling logic. |
| **Agentic UAP Protocol** | **Simulated Harness** | Simulated machine-to-machine negotiation demonstrating future Autonomous Agent Commerce. |
| **Production ML Model** | **Future Extension** | Feature extraction layer is architected to feed future XGBoost/TensorFlow models. |

---

## 🔌 API Reference

### Payments & State Machine
- `POST /api/payments/create` — Validated payment creation with Idempotency & Fraud Scoring.
- `POST /api/payments/process/:id` — Advances payment from `PENDING` to `PROCESSING`.
- `POST /api/payments/verify/:id` — Server-side verification advancing to `SUCCESS` with Double-Entry Ledger recording.
- `POST /api/payments/cancel/:id` — Cancels a pending payment.
- `GET /api/payments/:id` — Detailed payment record with full event audit trail & ledger entries.

### Refunds
- `POST /api/refunds/create` — Multi-stage refund lifecycle (`REFUND_REQUESTED` → `REFUNDED`) with over-refund protection and double-entry reversal.
- `GET /api/refunds/payment/:paymentId` — Complete refund history for a transaction.

### Webhooks
- `POST /api/webhooks/razorpay` — Real Razorpay webhook listener with HMAC-SHA256 signature validation and deduplication.
- `POST /api/webhooks/simulate` — Injects test webhook events with valid cryptographic test signatures.
- `GET /api/webhooks/events` — Returns all ingested webhook events and processing states.

### Financial Analytics & Ledger Integrity
- `GET /api/analytics/transactions` — Volume, success rate %, failure rate %, average ticket size.
- `GET /api/analytics/fraud` — Fraud risk distribution (`LOW`, `MEDIUM`, `HIGH`) and blocked transaction logs.
- `GET /api/analytics/ledger` — Double-entry trial balance check and mathematical integrity status.

### Authentication & Observability
- `POST /api/auth/token` — Mint a signed JWT token for a merchant ID (requires `x-api-key` header).
- `GET /api/auth/verify` — Inspect current merchant token context.
- `GET /api/metrics` — Request count, 5xx error count, payment latencies, and background job metrics.
- `POST /api/errors` — Ingest frontend crash reports for audit logging.

---

## ⚡ Quick Start

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/Deeppatil-AI/RevivePay.git
cd RevivePay

# 2. Install dependencies
npm install

# 3. Seed SQLite Database
npm run seed

# 4. Run Comprehensive Unit Test Suite (Vitest)
npm test

# 5. Start Backend API (:5000) and Frontend (:5173)
# Terminal 1:
npm run server

# Terminal 2:
npm run dev
```

---

## 🧪 Automated Testing

```bash
npm test
```

All **50 unit tests** across **17 test suites** pass with 100% code integrity:
- `paymentStateMachine.test.js` (Lifecycle state transitions & terminal states)
- `idempotency.test.js` (Request hashing, cached response replay, conflict detection)
- `fraudDetection.test.js` & `fraudV2FeatureExtraction.test.js` (Feature vectors, risk scoring, decision mapping)
- `doubleEntryLedger.test.js` (Debit/Credit balance equality & trial balance verification)
- `refundWorkflow.test.js` & `concurrentRefundsAndAtomicity.test.js` (Over-refund bounds & ledger reversals)
- `paymentSecurity.test.js` (Server-side verification & high-risk payment blocking)
- `rbacAndSecurity.test.js` (Role enforcement & merchant IDOR protection)
- `webhookReliability.test.js` & `webhookSignature.test.js` (HMAC signatures & duplicate deduplication)
- `policyEngine.test.js` & `policyGating.test.js` (Policy guardrail governance)
- `metricsEndpoint.test.js` (Telemetry & observability shape verification)
- `authAndApiKey.test.js` (JWT token minting & API key enforcement)
- `errorLogging.test.js` (React ErrorBoundary backend exception logging)

---

## 🔒 Security Notes
- **Demo Mode vs. Production**: `AUTH_BYPASS_DEMO` is set to `true` by default for zero-friction evaluation.
- **Production Enforcement**: Set `AUTH_BYPASS_DEMO=false` and provide:
  - `DEMO_API_KEY`: Required header `x-api-key` to mint merchant tokens at `POST /api/auth/token`.
  - `JWT_SECRET`: Used to cryptographically sign and verify merchant session tokens.
  - `RAZORPAY_WEBHOOK_SECRET`: Required to validate inbound Razorpay HMAC-SHA256 signatures.

---

## 📜 License
MIT License • Built with ❤️ for the Razorpay AI Hackathon.

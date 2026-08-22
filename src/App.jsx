import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './components/LandingPage.jsx';
import Navbar from './components/Navbar.jsx';
import ChaosBanner from './components/ChaosBanner.jsx';
import BankTelemetryBar from './components/BankTelemetryBar.jsx';
import MetricsHero from './components/MetricsHero.jsx';
import BatchRunner from './components/BatchRunner.jsx';
import LiveAuditLedger from './components/LiveAuditLedger.jsx';
import B2BReceivablesView from './components/B2BReceivablesView.jsx';
import DisputeShieldView from './components/DisputeShieldView.jsx';
import WebhookSimulator from './components/WebhookSimulator.jsx';
import ExecutiveAnalytics from './components/ExecutiveAnalytics.jsx';

import HinglishRecoveryModal from './components/HinglishRecoveryModal.jsx';
import PolicyConfigModal from './components/PolicyConfigModal.jsx';
import TransactionDetailView from './components/TransactionDetailView.jsx';
import DirectCheckoutModal from './components/DirectCheckoutModal.jsx';
import VoiceCallModal from './components/VoiceCallModal.jsx';
import SplitPaymentModal from './components/SplitPaymentModal.jsx';
import AgenticCommerceModal from './components/AgenticCommerceModal.jsx';
import AuditCertificateModal from './components/AuditCertificateModal.jsx';
import AgentStudioModal from './components/AgentStudioModal.jsx';
import DemoTourModal from './components/DemoTourModal.jsx';
import LiveCliDrawer from './components/LiveCliDrawer.jsx';

import { generateFullBatch } from './data/syntheticBatch.js';
import { runDiagnosis } from './engine/diagnosisAgent.js';
import { schedulePredictiveRetry } from './engine/retryScheduler.js';
import { evaluatePolicyGating, DEFAULT_MERCHANT_POLICY } from './engine/policyGating.js';
import { RazorpayClient } from './engine/razorpayMockClient.js';
import { ApiService } from './services/api.js';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [transactions, setTransactions] = useState(() => generateFullBatch(3));
  const [policy, setPolicy] = useState(DEFAULT_MERCHANT_POLICY);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('batch'); // 'batch' | 'ledger' | 'invoices' | 'disputes' | 'webhooks' | 'analytics'
  
  // Execution loop states
  const [isRunning, setIsRunning] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2);
  const timerRef = useRef(null);

  // Modals state
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [activeHinglishTxn, setActiveHinglishTxn] = useState(null);
  const [activeDetailTxn, setActiveDetailTxn] = useState(null);
  const [activeCheckoutTxn, setActiveCheckoutTxn] = useState(null);
  const [activeVoiceItem, setActiveVoiceItem] = useState(null);
  const [activeSplitTxn, setActiveSplitTxn] = useState(null);
  const [isAgenticOpen, setIsAgenticOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  // Sync data with backend on load
  const syncWithBackend = async () => {
    try {
      const txRes = await ApiService.getTransactions();
      if (txRes && txRes.transactions) setTransactions(txRes.transactions);

      const polRes = await ApiService.getPolicy();
      if (polRes && polRes.policy) setPolicy(polRes.policy);

      const audRes = await ApiService.getAuditLogs();
      if (audRes && audRes.auditLogs) setAuditLogs(audRes.auditLogs);
    } catch (err) {
      console.log("Local standalone fallback:", err.message);
    }
  };

  useEffect(() => {
    syncWithBackend();
  }, []);

  // Process single transaction
  const processTransaction = async (txn) => {
    try {
      const res = await ApiService.processTransaction(txn.id);
      if (res && res.txn) {
        setTransactions((prev) => prev.map((t) => (t.id === txn.id ? res.txn : t)));
        if (res.auditEntry) setAuditLogs((prev) => [res.auditEntry, ...prev]);
        return;
      }
    } catch (err) {}

    const diagnosis = runDiagnosis(txn);
    const proposedAction = diagnosis.rootCauseCategory === "LIQUIDITY_TIMING" 
      ? "OFFER_RETENTION_DISCOUNT" 
      : "EXECUTE_RECOVERY";
    const policyResult = evaluatePolicyGating(txn, proposedAction, policy);

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

    setTransactions((prev) =>
      prev.map((t) => (t.id === txn.id ? { ...t, recoveryResult } : t))
    );

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

    setAuditLogs((prev) => [auditEntry, ...prev]);
  };

  // Batch runner loop
  useEffect(() => {
    if (isRunning) {
      const intervalMs = Math.max(200, 1500 / simulationSpeed);
      timerRef.current = setInterval(() => {
        const pendingTxns = transactions.filter((t) => !t.recoveryResult);
        if (pendingTxns.length === 0) {
          setIsRunning(false);
          clearInterval(timerRef.current);
          return;
        }
        processTransaction(pendingTxns[0]);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, simulationSpeed, transactions]);

  const handleStepBatch = () => {
    const pendingTxns = transactions.filter((t) => !t.recoveryResult);
    if (pendingTxns.length > 0) processTransaction(pendingTxns[0]);
  };

  const handleRunAllInstantly = async () => {
    setIsRunning(false);
    try {
      const res = await ApiService.processBatch();
      if (res && res.transactions) {
        setTransactions(res.transactions);
        const aud = await ApiService.getAuditLogs();
        if (aud.auditLogs) setAuditLogs(aud.auditLogs);
        return;
      }
    } catch (e) {}

    const pendingTxns = transactions.filter((t) => !t.recoveryResult);
    for (const t of pendingTxns) {
      await processTransaction(t);
    }
  };

  const handleResetBatch = async () => {
    setIsRunning(false);
    try {
      await ApiService.resetBatch();
    } catch (e) {}
    setTransactions(generateFullBatch(3));
    setAuditLogs([]);
  };

  const handleDirectPaymentSuccess = (txnId, amount) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === txnId) {
          return {
            ...t,
            recoveryResult: {
              status: "RECOVERED",
              diagnosis: t.recoveryResult?.diagnosis || runDiagnosis(t),
              policy: t.recoveryResult?.policy || evaluatePolicyGating(t, "RECOVER", policy),
              actionType: "DIRECT_RAZORPAY_CHECKOUT",
              actionDetail: `Manually recovered ₹${amount} via Razorpay Checkout.`,
              paymentLink: "https://rzp.io/i/manual_pay",
              processedAt: new Date().toISOString()
            }
          };
        }
        return t;
      })
    );
  };

  // Metrics
  const totalCount = transactions.length;
  const processedTxns = transactions.filter((t) => t.recoveryResult);
  const totalProcessed = processedTxns.length;
  const recoveredTxns = transactions.filter(
    (t) => t.recoveryResult && t.recoveryResult.status === "RECOVERED"
  );
  const recoveredCount = recoveredTxns.length;
  const totalAtRisk = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalRecovered = recoveredTxns.reduce(
    (acc, t) => acc + (t.recoveryResult?.policy?.finalPayableAmount || t.amount),
    0
  );
  const retriesPrevented = transactions.filter(
    (t) => t.recoveryResult && t.recoveryResult.status === "RESCHEDULED"
  ).length * 2;
  const escalationsCount = transactions.filter(
    (t) => t.recoveryResult && (t.recoveryResult.status === "ESCALATED" || t.recoveryResult.status === "BLOCKED")
  ).length;

  const stats = {
    totalCount,
    totalProcessed,
    recoveredCount,
    totalAtRisk,
    totalRecovered,
    retriesPrevented,
    escalationsCount,
    ledgerCount: auditLogs.length
  };

  // If current view is the landing page
  if (currentView === 'landing') {
    return (
      <LandingPage
        onLaunchConsole={() => setCurrentView('app')}
      />
    );
  }

  // Otherwise render the full Enterprise App & Sentinel Console
  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0c2340] flex flex-col selection:bg-[#0066FF] selection:text-white font-sans pb-16">
      
      {/* Top Navbar with Multi-Module Tabs */}
      <Navbar
        onOpenPolicy={() => setIsPolicyOpen(true)}
        onResetBatch={handleResetBatch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        stats={stats}
        onGoToLanding={() => setCurrentView('landing')}
        onOpenAgenticModal={() => setIsAgenticOpen(true)}
        onOpenCertModal={() => setIsCertOpen(true)}
        onOpenAgentStudio={() => setIsStudioOpen(true)}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
      />

      {/* Chaos Monkey Disaster Simulator Banner */}
      <ChaosBanner
        onChaosTriggered={syncWithBackend}
      />

      {/* Live Bank Telemetry Ticker */}
      <BankTelemetryBar />

      {/* Hero Metrics & Stats */}
      <MetricsHero stats={stats} />

      {/* Main Multi-Module Views */}
      <main className="flex-1">
        {activeTab === 'batch' && (
          <BatchRunner
            transactions={transactions}
            isRunning={isRunning}
            onStartBatch={() => setIsRunning(true)}
            onPauseBatch={() => setIsRunning(false)}
            onStepBatch={handleStepBatch}
            onRunAllInstantly={handleRunAllInstantly}
            simulationSpeed={simulationSpeed}
            setSimulationSpeed={setSimulationSpeed}
            onOpenHinglishChat={(txn) => setActiveHinglishTxn(txn)}
            onOpenTransactionDetails={(txn) => setActiveDetailTxn(txn)}
            onDirectTestPay={(txn) => setActiveCheckoutTxn(txn)}
          />
        )}

        {activeTab === 'ledger' && (
          <LiveAuditLedger auditLogs={auditLogs} />
        )}

        {activeTab === 'invoices' && (
          <B2BReceivablesView
            onOpenVoiceCall={(inv) => setActiveVoiceItem(inv)}
          />
        )}

        {activeTab === 'disputes' && (
          <DisputeShieldView />
        )}

        {activeTab === 'webhooks' && (
          <WebhookSimulator
            onWebhookDispatched={syncWithBackend}
          />
        )}

        {activeTab === 'analytics' && (
          <ExecutiveAnalytics stats={stats} />
        )}
      </main>

      {/* Real-time CLI Webhook Stream Drawer */}
      <LiveCliDrawer />

      {/* Demo Tour Modal */}
      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onSelectTab={(tabId) => setActiveTab(tabId)}
        onOpenAgentic={() => setIsAgenticOpen(true)}
        onOpenCert={() => setIsCertOpen(true)}
        onTriggerChaos={() => syncWithBackend()}
      />

      {/* Agent Studio Modal (Razorpay Vulcan & Claude SDK) */}
      <AgentStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />

      {/* Modals & Dialogs */}
      <PolicyConfigModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        policy={policy}
        onSavePolicy={async (newPolicy) => {
          setPolicy(newPolicy);
          try { await ApiService.savePolicy(newPolicy); } catch(e){}
        }}
      />

      <AgenticCommerceModal
        isOpen={isAgenticOpen}
        onClose={() => setIsAgenticOpen(false)}
        onSettlementComplete={syncWithBackend}
      />

      <AuditCertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
      />

      {activeHinglishTxn && (
        <HinglishRecoveryModal
          txn={activeHinglishTxn}
          onClose={() => setActiveHinglishTxn(null)}
          onPaymentSuccess={(id, amt) => handleDirectPaymentSuccess(id, amt)}
        />
      )}

      {activeDetailTxn && (
        <TransactionDetailView
          txn={activeDetailTxn}
          onClose={() => setActiveDetailTxn(null)}
          onOpenHinglishChat={(txn) => setActiveHinglishTxn(txn)}
          onDirectTestPay={(txn) => setActiveCheckoutTxn(txn)}
        />
      )}

      {activeCheckoutTxn && (
        <DirectCheckoutModal
          txn={activeCheckoutTxn}
          onClose={() => setActiveCheckoutTxn(null)}
          onSuccess={(id, amt) => {
            handleDirectPaymentSuccess(id, amt);
            setActiveCheckoutTxn(null);
          }}
        />
      )}

      {activeVoiceItem && (
        <VoiceCallModal
          targetItem={activeVoiceItem}
          onClose={() => setActiveVoiceItem(null)}
          onCommitmentAgreed={(id, date) => {
            setActiveVoiceItem(null);
            syncWithBackend();
          }}
        />
      )}

      {activeSplitTxn && (
        <SplitPaymentModal
          txn={activeSplitTxn}
          onClose={() => setActiveSplitTxn(null)}
          onSplitSuccess={(id, part1) => {
            handleDirectPaymentSuccess(id, part1);
          }}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-slate-700">
            Razorpay RevivePay Enterprise AI Platform • Subscriptions, B2B Invoices & Dispute Sentinel
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Powered by Razorpay Vulcan AI Foundation Model & Agent Studio • Express Backend Active (:5000)
          </span>
        </div>
      </footer>

    </div>
  );
}

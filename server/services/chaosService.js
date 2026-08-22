import { db } from '../database/store.js';
import { INDIAN_BANK_TELEMETRY } from '../../src/data/bankOutageSchedule.js';

let activeChaosMode = null;

export function triggerChaosOutage(bankKey = "SBI", scenario = "MIDNIGHT_CBS_LOCK") {
  activeChaosMode = {
    bankKey,
    scenario,
    triggeredAt: new Date().toISOString(),
    originalSuccessRate: INDIAN_BANK_TELEMETRY[bankKey]?.upiSuccessRateCurrent || 0.62,
    degradedSuccessRate: 0.0,
    impactSummary: `${bankKey} Core Banking System (CBS) forced offline for End-of-Day batch processing simulation.`
  };

  // Temporarily mutate bank telemetry
  if (INDIAN_BANK_TELEMETRY[bankKey]) {
    INDIAN_BANK_TELEMETRY[bankKey].status = "OUTAGE";
    INDIAN_BANK_TELEMETRY[bankKey].upiSuccessRateCurrent = 0.0;
    INDIAN_BANK_TELEMETRY[bankKey].statusReason = `CHAOS SIMULATION: ${scenario} active. High Switch Timeout Spike.`;
  }

  // Find all transactions matching this bank and reschedule them immediately
  let rescheduledCount = 0;
  db.subscriptions = db.subscriptions.map((txn) => {
    if (txn.bank === bankKey && (!txn.recoveryResult || txn.recoveryResult.status !== "RECOVERED")) {
      rescheduledCount++;
      return {
        ...txn,
        failureCode: "NPCI_U30",
        recoveryResult: {
          status: "RESCHEDULED",
          diagnosis: {
            rootCauseCategory: "CHAOS_CORE_BANKING_OUTAGE",
            confidenceScore: 0.99,
            detailedRationale: `Chaos Sentinel triggered: ${bankKey} server offline. Blind retries suppressed to prevent ₹${rescheduledCount * 45} in bank bounce penalties.`,
            recommendedStrategy: "AUTONOMOUS_SMART_RETRY"
          },
          policy: {
            status: "APPROVED",
            actionApproved: true,
            appliedDiscount: 0,
            finalPayableAmount: txn.amount,
            auditToken: `sha256_chaos_${Date.now().toString(36)}`,
            guardrailTriggered: null
          },
          actionType: "CHAOS_PREDICTIVE_RESCHEDULE",
          actionDetail: `Auto-shifted to Morning Health Window (08:15 AM IST) under RBI cooling rule.`,
          processedAt: new Date().toISOString()
        }
      };
    }
    return txn;
  });

  const auditEntry = {
    id: `audit_chaos_${Date.now().toString(36)}`,
    auditToken: `sha256_chaos_root_${Date.now().toString(36)}`,
    txnId: `CHAOS_ALERT_${bankKey}`,
    customerName: "Global Sentinel Alert",
    merchant: "Razorpay Network Monitor",
    diagnosis: {
      rootCauseCategory: "CATASTROPHIC_BANK_DOWNTIME",
      detailedRationale: `${bankKey} CBS downtime detected. Intercepted ${rescheduledCount} transactions before gateway degradation.`
    },
    policy: {
      status: "APPROVED",
      discountReason: "Disaster protocol executed. Prevented NPCI rate-limiting."
    },
    actionType: "MASS_DEBIT_SUSPENSION_AND_RESCHEDULE",
    actionDetail: `Rescheduled ${rescheduledCount} ${bankKey} debits to morning window. Total penalty fees saved: ₹${rescheduledCount * 45}.`,
    timestamp: new Date().toISOString()
  };
  db.addAuditLog(auditEntry);

  return { activeChaosMode, rescheduledCount, auditEntry };
}

export function resetChaosMode() {
  if (activeChaosMode && INDIAN_BANK_TELEMETRY[activeChaosMode.bankKey]) {
    INDIAN_BANK_TELEMETRY[activeChaosMode.bankKey].status = "HEALTHY";
    INDIAN_BANK_TELEMETRY[activeChaosMode.bankKey].upiSuccessRateCurrent = 0.94;
    INDIAN_BANK_TELEMETRY[activeChaosMode.bankKey].statusReason = "Normal gateway throughput restored.";
  }
  activeChaosMode = null;
  return { status: "RESTORED", message: "All bank gateway telemetry normalized." };
}

export function getChaosStatus() {
  return { activeChaosMode };
}

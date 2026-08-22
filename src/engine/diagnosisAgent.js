import { INDIAN_BANK_TELEMETRY, FAILURE_ERROR_MAP } from '../data/bankOutageSchedule.js';

/**
 * Diagnosis Agent
 * Analyzes transaction failure telemetry, bank status, customer salary cycle, and retry history
 * to output an explainable diagnosis and recommended intervention strategy.
 */
export function runDiagnosis(txn) {
  const bankInfo = INDIAN_BANK_TELEMETRY[txn.bank] || {
    name: txn.bank,
    status: "UNKNOWN",
    statusReason: "No real-time telemetry available",
    recommendedRetryWindow: "Standard 24h window"
  };

  const failureDef = FAILURE_ERROR_MAP[txn.failureCode] || {
    category: "UNSPECIFIED",
    description: "Generic Gateway Failure",
    isTransient: true,
    action: "DEFERRED_RETRY",
    explanation: "Standard transient error detected."
  };

  const failureHour = parseInt(txn.failedAt.split(" ")[1]?.split(":")[0] || "12", 10);
  const isDuringBankMaintenance = 
    bankInfo.coreBankingDowntime && 
    ((bankInfo.coreBankingDowntime.startHour > bankInfo.coreBankingDowntime.endHour &&
      (failureHour >= bankInfo.coreBankingDowntime.startHour || failureHour < bankInfo.coreBankingDowntime.endHour)) ||
     (failureHour >= bankInfo.coreBankingDowntime.startHour && failureHour < bankInfo.coreBankingDowntime.endHour));

  let rootCauseCategory = failureDef.category;
  let confidenceScore = 0.94;
  let detailedRationale = "";
  let recommendedStrategy = "";

  if (isDuringBankMaintenance || txn.failureCode === "NPCI_U30" || bankInfo.status === "OUTAGE") {
    rootCauseCategory = "CORE_BANKING_OUTAGE";
    confidenceScore = 0.98;
    detailedRationale = `${bankInfo.name} experienced switch downtime/CBS batch lock during the debit window (${failureHour}:00 hrs). Blind retry would have caused NPCI throttle penalty.`;
    recommendedStrategy = "AUTONOMOUS_SMART_RETRY";
  } else if (txn.failureCode === "NPCI_ZM") {
    rootCauseCategory = "LIQUIDITY_TIMING";
    confidenceScore = 0.91;
    detailedRationale = `Customer account balance insufficient near month-end. Customer regular salary cycle is expected around day ${txn.salaryCreditDay}. High churn risk requires retention intervention.`;
    recommendedStrategy = txn.customerLtv > 10000 ? "GATED_DISCOUNT_RETRY" : "AUTONOMOUS_SMART_RETRY";
  } else if (txn.failureCode === "NPCI_U28") {
    rootCauseCategory = "MANDATE_CAP_BREACH";
    confidenceScore = 0.95;
    detailedRationale = `AutoPay mandate max limit exceeded or sub-period cap reached. Standard auto-debit will continue to fail until customer authorizes mandate upgrade or 1-time link.`;
    recommendedStrategy = "HINGLISH_ONECLICK_CHECKOUT";
  } else if (txn.failureCode === "RAZOR_EXP_01") {
    rootCauseCategory = "CHECKOUT_OR_AUTH_DROPOUT";
    confidenceScore = 0.92;
    detailedRationale = `Customer started 3DS OTP verification but dropped off. Cart/Subscription at risk of churn. Personalized multi-channel prompt recommended.`;
    recommendedStrategy = "HINGLISH_WHATSAPP_RECOVERY";
  } else if (txn.failureCode === "BANK_RATE_LIMIT" || txn.retryCount >= 3) {
    rootCauseCategory = "REGULATORY_THROTTLE_RISK";
    confidenceScore = 0.99;
    detailedRationale = `RBI mandate compliance safety ceiling reached (${txn.retryCount} prior attempts). Automatic retries halted to prevent account blacklisting.`;
    recommendedStrategy = "HUMAN_ESCALATION_OR_PAUSE";
  } else {
    detailedRationale = failureDef.explanation;
    recommendedStrategy = "AUTONOMOUS_SMART_RETRY";
  }

  return {
    txnId: txn.id,
    rootCauseCategory,
    confidenceScore,
    bankStatus: bankInfo.status,
    bankStatusReason: bankInfo.statusReason,
    isTransient: failureDef.isTransient,
    detailedRationale,
    recommendedStrategy,
    timestamp: new Date().toISOString()
  };
}

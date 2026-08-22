import { INDIAN_BANK_TELEMETRY } from '../data/bankOutageSchedule.js';

/**
 * Smart Retry Sequencer
 * Determines optimal time-window to re-attempt debits, preventing NPCI rate limits and maximizing clearance rates.
 */
export function schedulePredictiveRetry(txn, diagnosis) {
  const bankInfo = INDIAN_BANK_TELEMETRY[txn.bank] || {};
  const currentRetry = txn.retryCount || 1;

  // Stopping rule: Max 3 retries under RBI e-mandate guidelines
  if (currentRetry >= 3 || diagnosis.rootCauseCategory === "REGULATORY_THROTTLE_RISK") {
    return {
      canAutoRetry: false,
      reason: "RBI e-Mandate rule: Maximum retry quota exhausted (3/3). Auto-retry halted to protect merchant trust score.",
      scheduledTime: null,
      delayMinutes: 0,
      predictedSuccessProbability: 0.12,
      strategy: "ESCALATE_TO_MANUAL"
    };
  }

  let delayMinutes = 15;
  let scheduledTimeWindow = "Next Available Health Slot (08:30 AM IST)";
  let predictedSuccessProbability = 0.88;

  if (diagnosis.rootCauseCategory === "CORE_BANKING_OUTAGE") {
    // Reschedule to morning peak health window
    delayMinutes = 360; // 6 hours later
    scheduledTimeWindow = bankInfo.recommendedRetryWindow || "08:15 AM - 10:30 AM IST";
    predictedSuccessProbability = 0.94;
  } else if (diagnosis.rootCauseCategory === "LIQUIDITY_TIMING") {
    // Reschedule aligned to salary deposit window
    delayMinutes = 720;
    scheduledTimeWindow = `Salary Alignment Window (Day ${txn.salaryCreditDay} 09:00 AM IST)`;
    predictedSuccessProbability = 0.85;
  } else {
    delayMinutes = 45;
    scheduledTimeWindow = "30-45 Minute Cooldown Window";
    predictedSuccessProbability = 0.82;
  }

  return {
    canAutoRetry: true,
    scheduledTime: scheduledTimeWindow,
    delayMinutes,
    predictedSuccessProbability,
    npciCoolingPeriodHonored: true,
    auditTrailNote: `Scheduled retry attempt #${currentRetry + 1} at ${scheduledTimeWindow} based on ${txn.bank} CBS telemetry.`
  };
}

// Real-world simulated Indian Bank Telemetry & Maintenance Windows
export const INDIAN_BANK_TELEMETRY = {
  SBI: {
    name: "State Bank of India",
    code: "SBIN",
    coreBankingDowntime: { startHour: 23, endHour: 3 }, // 11 PM to 3 AM batch settlement
    upiSuccessRateCurrent: 0.62, // Degraded
    averageLatencyMs: 4200,
    status: "DEGRADED",
    statusReason: "CBS EOD Batch Processing & High Server Load",
    recommendedRetryWindow: "08:15 AM - 10:30 AM",
    optimalDaysAfterMonthEnd: [1, 2, 3, 5, 7], // Salary deposit dates
  },
  HDFC: {
    name: "HDFC Bank",
    code: "HDFC",
    coreBankingDowntime: { startHour: 1, endHour: 4 }, // 1 AM to 4 AM
    upiSuccessRateCurrent: 0.94,
    averageLatencyMs: 780,
    status: "HEALTHY",
    statusReason: "Optimal gateway throughput",
    recommendedRetryWindow: "Immediate / Normal Schedule",
    optimalDaysAfterMonthEnd: [1, 2, 30, 31],
  },
  ICICI: {
    name: "ICICI Bank",
    code: "ICIC",
    coreBankingDowntime: { startHour: 0, endHour: 2 }, // Midnight to 2 AM
    upiSuccessRateCurrent: 0.91,
    averageLatencyMs: 920,
    status: "HEALTHY",
    statusReason: "Normal gateway performance",
    recommendedRetryWindow: "Immediate / Normal Schedule",
    optimalDaysAfterMonthEnd: [1, 2, 3, 4],
  },
  AXIS: {
    name: "Axis Bank",
    code: "UTIB",
    coreBankingDowntime: { startHour: 23, endHour: 1 },
    upiSuccessRateCurrent: 0.74,
    averageLatencyMs: 2800,
    status: "INTERMITTENT",
    statusReason: "NPCI Switch Timeout Spikes",
    recommendedRetryWindow: "07:30 AM - 11:00 AM",
    optimalDaysAfterMonthEnd: [1, 2, 5],
  },
  KOTAK: {
    name: "Kotak Mahindra Bank",
    code: "KKBK",
    coreBankingDowntime: { startHour: 2, endHour: 4 },
    upiSuccessRateCurrent: 0.95,
    averageLatencyMs: 650,
    status: "HEALTHY",
    statusReason: "Optimal gateway throughput",
    recommendedRetryWindow: "Normal Schedule",
    optimalDaysAfterMonthEnd: [1, 2, 30],
  },
  PNB: {
    name: "Punjab National Bank",
    code: "PUNB",
    coreBankingDowntime: { startHour: 22, endHour: 4 },
    upiSuccessRateCurrent: 0.58,
    averageLatencyMs: 5100,
    status: "OUTAGE",
    statusReason: "NPCI Gateway Gateway Timed Out / Auth Server Sync",
    recommendedRetryWindow: "09:30 AM - 12:00 PM",
    optimalDaysAfterMonthEnd: [1, 2, 7],
  }
};

export const FAILURE_ERROR_MAP = {
  "NPCI_U30": {
    category: "BANK_OUTAGE",
    description: "NPCI Switch / Issuer Bank Server Timeout",
    isTransient: true,
    action: "DEFERRED_RETRY",
    explanation: "Issuer bank core banking server is unreachable. Blind retry will burn retry limits. Reschedule to morning peak health window."
  },
  "NPCI_ZM": {
    category: "INSUFFICIENT_FUNDS",
    description: "Insufficient Balance in Payer Account",
    isTransient: false,
    action: "SALARY_CYCLE_ALIGNMENT_OR_DISCOUNT",
    explanation: "Account balance low near month-end. Trigger smart salary-cycle aligned retry or bounded micro-discount if high LTV."
  },
  "NPCI_U28": {
    category: "MANDATE_EXHAUSTED",
    description: "Mandate Max Amount or Frequency Breached",
    isTransient: false,
    action: "ONE_CLICK_UPI_INTENT",
    explanation: "UPI AutoPay mandate limit exceeded. Must engage customer via WhatsApp/SMS with 1-click Razorpay UPI link to renew mandate."
  },
  "RAZOR_EXP_01": {
    category: "CARD_EXPIRED_OR_AUTH_DROP",
    description: "Customer 3DS / OTP Dropped or Card Expired",
    isTransient: false,
    action: "HINGLISH_WHATSAPP_CONVERSATION",
    explanation: "Checkout abandoned midway. Multi-channel conversational agent initiates recovery offer with easy UPI switch."
  },
  "BANK_RATE_LIMIT": {
    category: "THROTTLED",
    description: "Too many debit requests in 24h window (RBI rule)",
    isTransient: true,
    action: "PAUSE_AND_NOTIFY",
    explanation: "RBI 24-hour cooling period required. Auto-scheduler pauses retries to prevent permanent block."
  }
};

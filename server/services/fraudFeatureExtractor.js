import { db } from '../database/store.js';

/**
 * Fraud Feature Extraction Layer (Version 2)
 * Extracts structured numerical and categorical feature vectors suitable for
 * both rule-based scoring and future machine learning anomaly models.
 */
export function extractFraudFeatures(txn, options = {}) {
  const amount = Number(txn.amount) || 0;
  const sender = txn.sender || 'unknown_sender';
  const metadata = txn.metadata || {};

  let velocity_10m = 0;
  let failed_attempts_count = 0;
  let successful_count = 0;
  let historical_avg_amount = amount;
  let amount_deviation_ratio = 1.0;
  let historical_fraud_ratio = 0.0;

  try {
    const allPayments = db.payments || [];
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const senderPayments = allPayments.filter(p => p.sender === sender && p.id !== txn.id);
    
    velocity_10m = senderPayments.filter(p => p.createdAt >= tenMinutesAgo).length;
    failed_attempts_count = senderPayments.filter(p => p.status === 'FAILED').length;
    
    const successfulPayments = senderPayments.filter(p => p.status === 'SUCCESS');
    successful_count = successfulPayments.length;

    if (successful_count > 0) {
      historical_avg_amount = successfulPayments.reduce((acc, p) => acc + p.amount, 0) / successful_count;
      amount_deviation_ratio = historical_avg_amount > 0 ? (amount / historical_avg_amount) : 1.0;
    }

    const totalSenderTxns = senderPayments.length;
    if (totalSenderTxns > 0) {
      const blockedOrFailed = senderPayments.filter(p => p.fraudDecision === 'BLOCK' || p.status === 'FAILED').length;
      historical_fraud_ratio = Number((blockedOrFailed / totalSenderTxns).toFixed(4));
    }
  } catch (e) {
    // Graceful fallback if database query fails
  }

  const hour_of_day = new Date().getHours();
  const is_off_hours = hour_of_day >= 1 && hour_of_day <= 4; // 1:00 AM - 4:59 AM IST maintenance / bot attack window

  return {
    amount,
    historical_avg_amount: Math.round(historical_avg_amount),
    amount_deviation_ratio: Number(amount_deviation_ratio.toFixed(2)),
    velocity_10m,
    failed_attempts_count,
    successful_count,
    historical_fraud_ratio,
    hour_of_day,
    is_off_hours,
    is_new_device: Boolean(metadata.isNewDevice || options.isNewDevice),
    is_tor_vpn: Boolean(metadata.isTorOrVpn || options.isTorOrVpn),
    unusual_location: Boolean(metadata.unusualLocation || options.unusualLocation),
    payment_method: txn.paymentMethod || 'upi'
  };
}

import { db, sqlite } from '../database/store.js';
import { logger } from '../logger.js';

export class LedgerService {
  /**
   * Records a balanced double-entry transaction for a successful payment
   * Debit: Sender Account (funds deducted)
   * Credit: Receiver/Merchant Account (funds credited)
   */
  static recordPaymentSettlement(payment) {
    if (!payment || payment.status !== 'SUCCESS') {
      throw new Error('Ledger settlement can only be executed for payments in SUCCESS state.');
    }

    const senderAcc = payment.senderAccount || `acc_user_${payment.sender.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const receiverAcc = payment.receiverAccount || `acc_merchant_${payment.receiver.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const now = new Date().toISOString();

    const debitEntry = {
      id: `ledg_dr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      transactionId: payment.id,
      accountId: senderAcc,
      entryType: 'DEBIT',
      amount: payment.amount,
      currency: payment.currency || 'INR',
      description: `Payment debit authorization from ${payment.sender} for order ${payment.id}`,
      createdAt: now
    };

    const creditEntry = {
      id: `ledg_cr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      transactionId: payment.id,
      accountId: receiverAcc,
      entryType: 'CREDIT',
      amount: payment.amount,
      currency: payment.currency || 'INR',
      description: `Payment credit settlement to ${payment.receiver} for order ${payment.id}`,
      createdAt: now
    };

    // Execute atomically inside an SQLite transaction
    const transactionRecord = sqlite.transaction(() => {
      db.insertLedgerEntry(debitEntry);
      db.insertLedgerEntry(creditEntry);
    });
    transactionRecord();

    logger.info({
      event: 'LEDGER_SETTLEMENT_RECORDED',
      transactionId: payment.id,
      amount: payment.amount,
      debitAccount: senderAcc,
      creditAccount: receiverAcc
    }, `Double-entry ledger created for payment ${payment.id}`);

    return { debitEntry, creditEntry };
  }

  /**
   * Records a balanced double-entry reversal for an executed refund
   * Debit: Receiver/Merchant Account (funds returned)
   * Credit: Sender Account (funds restored)
   */
  static recordRefundSettlement(refund, originalPayment) {
    const senderAcc = originalPayment.senderAccount || `acc_user_${originalPayment.sender.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const receiverAcc = originalPayment.receiverAccount || `acc_merchant_${originalPayment.receiver.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    const now = new Date().toISOString();

    const debitEntry = {
      id: `ledg_dr_rf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      transactionId: refund.id,
      accountId: receiverAcc,
      entryType: 'DEBIT',
      amount: refund.amount,
      currency: refund.currency || 'INR',
      description: `Refund debit from ${originalPayment.receiver} for refund ${refund.id} (original txn: ${originalPayment.id})`,
      createdAt: now
    };

    const creditEntry = {
      id: `ledg_cr_rf_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      transactionId: refund.id,
      accountId: senderAcc,
      entryType: 'CREDIT',
      amount: refund.amount,
      currency: refund.currency || 'INR',
      description: `Refund credit reimbursement to ${originalPayment.sender} for refund ${refund.id}`,
      createdAt: now
    };

    const transactionRecord = sqlite.transaction(() => {
      db.insertLedgerEntry(debitEntry);
      db.insertLedgerEntry(creditEntry);
    });
    transactionRecord();

    logger.info({
      event: 'LEDGER_REFUND_RECORDED',
      refundId: refund.id,
      originalPaymentId: originalPayment.id,
      amount: refund.amount
    }, `Double-entry ledger reversal recorded for refund ${refund.id}`);

    return { debitEntry, creditEntry };
  }

  /**
   * Verifies mathematical equilibrium of the ledger (Sum of Debits == Sum of Credits)
   */
  static verifyLedgerIntegrity() {
    const entries = db.ledgerEntries || [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const e of entries) {
      if (e.entryType === 'DEBIT') {
        totalDebits += e.amount;
      } else if (e.entryType === 'CREDIT') {
        totalCredits += e.amount;
      }
    }

    const difference = Math.abs(totalDebits - totalCredits);
    const isBalanced = difference < 0.0001;

    return {
      isBalanced,
      totalDebits: Math.round(totalDebits * 100) / 100,
      totalCredits: Math.round(totalCredits * 100) / 100,
      difference: Math.round(difference * 100) / 100,
      entryCount: entries.length
    };
  }

  /**
   * Computes balance for an individual account
   */
  static getAccountBalance(accountId) {
    const rows = sqlite.prepare('SELECT entry_type, amount FROM ledger_entries WHERE account_id = ?').all(accountId);
    let balance = 0;
    for (const r of rows) {
      if (r.entry_type === 'CREDIT') balance += r.amount;
      if (r.entry_type === 'DEBIT') balance -= r.amount;
    }
    return Math.round(balance * 100) / 100;
  }
}

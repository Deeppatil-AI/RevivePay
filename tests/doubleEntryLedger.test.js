import { describe, it, expect } from 'vitest';
import { LedgerService } from '../server/services/ledgerService.js';
import { db } from '../server/database/store.js';

describe('Priority 6: Double-Entry Transaction Ledger Architecture', () => {
  const payment = {
    id: `pay_ledg_test_${Date.now()}`,
    status: 'SUCCESS',
    amount: 5000,
    currency: 'INR',
    sender: 'Vikram Malhotra',
    senderAccount: 'acc_user_vikram',
    receiver: 'Razorpay RevivePay Merchant',
    receiverAccount: 'acc_merchant_rzp_primary'
  };

  it('creates balanced Debit and Credit entries on payment settlement', () => {
    const { debitEntry, creditEntry } = LedgerService.recordPaymentSettlement(payment);

    expect(debitEntry.entryType).toBe('DEBIT');
    expect(debitEntry.amount).toBe(5000);
    expect(debitEntry.accountId).toBe('acc_user_vikram');

    expect(creditEntry.entryType).toBe('CREDIT');
    expect(creditEntry.amount).toBe(5000);
    expect(creditEntry.accountId).toBe('acc_merchant_rzp_primary');
  });

  it('creates balanced reversal entries on refund settlement', () => {
    const refund = {
      id: `rfnd_test_${Date.now()}`,
      amount: 2000,
      currency: 'INR'
    };

    const { debitEntry, creditEntry } = LedgerService.recordRefundSettlement(refund, payment);

    expect(debitEntry.entryType).toBe('DEBIT');
    expect(debitEntry.amount).toBe(2000);
    expect(debitEntry.accountId).toBe('acc_merchant_rzp_primary');

    expect(creditEntry.entryType).toBe('CREDIT');
    expect(creditEntry.amount).toBe(2000);
    expect(creditEntry.accountId).toBe('acc_user_vikram');
  });

  it('guarantees ledger integrity (Sum of Debits equals Sum of Credits)', () => {
    const integrity = LedgerService.verifyLedgerIntegrity();
    expect(integrity.isBalanced).toBe(true);
    expect(integrity.difference).toBe(0);
    expect(integrity.totalDebits).toBe(integrity.totalCredits);
  });
});

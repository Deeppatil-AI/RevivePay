import { describe, it, expect } from 'vitest';
import { schedulePredictiveRetry } from '../src/engine/retryScheduler.js';

describe('Predictive Retry Scheduler', () => {
  const sbiTxn = {
    id: 'sub_tx_sbi_101',
    bank: 'SBI',
    retryCount: 1,
    salaryCreditDay: 1
  };

  it('reschedules Core Banking Outages to peak morning health window (08:15 AM IST)', () => {
    const diagnosis = { rootCauseCategory: 'CORE_BANKING_OUTAGE' };
    const plan = schedulePredictiveRetry(sbiTxn, diagnosis);

    expect(plan.canAutoRetry).toBe(true);
    expect(plan.predictedSuccessProbability).toBeGreaterThanOrEqual(0.9);
    expect(plan.scheduledTime).toContain('08:15 AM');
    expect(plan.npciCoolingPeriodHonored).toBe(true);
  });

  it('aligns Liquidity / Insufficient Funds failures to customer salary credit date', () => {
    const diagnosis = { rootCauseCategory: 'LIQUIDITY_TIMING' };
    const plan = schedulePredictiveRetry(sbiTxn, diagnosis);

    expect(plan.canAutoRetry).toBe(true);
    expect(plan.scheduledTime).toContain('Salary Alignment Window');
    expect(plan.delayMinutes).toBe(720);
  });

  it('enforces strict stopping rule on 3rd retry attempt', () => {
    const exhaustedTxn = { ...sbiTxn, retryCount: 3 };
    const diagnosis = { rootCauseCategory: 'CORE_BANKING_OUTAGE' };
    const plan = schedulePredictiveRetry(exhaustedTxn, diagnosis);

    expect(plan.canAutoRetry).toBe(false);
    expect(plan.strategy).toBe('ESCALATE_TO_MANUAL');
  });
});

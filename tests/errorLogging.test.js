import { describe, it, expect } from 'vitest';
import { db } from '../server/database/store.js';

describe('Step 2: Error Logging & React Error Boundary Store', () => {
  it('records client-side React exceptions into SQLite error_logs', () => {
    const errorEntry = {
      id: `err_test_${Date.now()}`,
      viewName: 'DisputeShield Chargeback Defense',
      message: 'Cannot read property of undefined (reading dataset)',
      stack: 'TypeError: Cannot read property...\n at DisputeShieldView.jsx:42',
      componentStack: '\n in DisputeShieldView\n in ErrorBoundary',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Vitest'
    };

    db.addErrorLog(errorEntry);

    const logs = db.errorLogs;
    const found = logs.find(l => l.id === errorEntry.id);

    expect(found).toBeDefined();
    expect(found.view_name).toBe('DisputeShield Chargeback Defense');
    expect(found.message).toMatch(/Cannot read property/);
  });
});

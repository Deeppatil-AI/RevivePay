import React from 'react';
import { INDIAN_BANK_TELEMETRY } from '../data/bankOutageSchedule.js';
import { Activity, Clock } from 'lucide-react';

export default function BankTelemetryBar() {
  const banks = Object.keys(INDIAN_BANK_TELEMETRY);

  return (
    <div className="bg-white border-b border-slate-200 py-2.5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2 text-slate-600 font-medium shrink-0">
          <Activity className="h-4 w-4 text-[#0066FF] animate-pulse" />
          <span className="text-[#0c2340] font-bold">Live Bank Gateways:</span>
        </div>

        {/* Bank Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {banks.map((bankKey) => {
            const b = INDIAN_BANK_TELEMETRY[bankKey];
            const isHealthy = b.status === "HEALTHY";
            const isDegraded = b.status === "DEGRADED" || b.status === "INTERMITTENT";

            return (
              <div
                key={bankKey}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-[11px] font-mono shrink-0 transition-all ${
                  isHealthy
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : isDegraded
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
                title={`${b.name}: ${b.statusReason} (Avg latency: ${b.averageLatencyMs}ms)`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  isHealthy ? 'bg-emerald-500' : isDegraded ? 'bg-amber-500 animate-ping' : 'bg-rose-500 animate-pulse'
                }`}></span>
                <span className="font-bold">{bankKey}</span>
                <span className="text-[10px] opacity-90 font-bold">{Math.round(b.upiSuccessRateCurrent * 100)}% SR</span>
              </div>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Clock className="h-3.5 w-3.5 text-[#0066FF]" />
          <span>NPCI AutoPay Switch: Connected</span>
        </div>

      </div>
    </div>
  );
}

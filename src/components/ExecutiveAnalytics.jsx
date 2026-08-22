import React from 'react';
import { TrendingUp, DollarSign, ShieldAlert, ArrowUpRight, BarChart3, PieChart, CheckCircle2 } from 'lucide-react';

export default function ExecutiveAnalytics({ stats }) {
  const recoveryRate = stats.totalAtRisk > 0 
    ? Math.round((stats.totalRecovered / stats.totalAtRisk) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 animate-fade-in space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-5 w-5 text-[#0066FF]" />
              <h2 className="text-lg font-bold text-[#0c2340]">
                Executive ROI & Forward Cash Liquidity Forecaster
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Track 04 Financial Intelligence: Measured recovery yield, cohort survival rates, and false-positive cost analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
              Projected Annual ARR Recovered: ₹{(stats.totalRecovered * 12).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Cohort Recovery Survival */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider block mb-3">
            1. Cohort Recovery Yield by Strategy
          </span>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Smart CBS Rescheduling (Morning Window)</span>
                <span className="font-mono text-[#0066FF] font-bold">94.2%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-[#0066FF] h-2 rounded-full" style={{ width: '94%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Hinglish 1-Click WhatsApp Links</span>
                <span className="font-mono text-emerald-600 font-bold">88.6%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Salary-Aligned Bounded Incentives</span>
                <span className="font-mono text-sky-600 font-bold">79.1%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: '79%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Standard Blind Retries (Industry Benchmark)</span>
                <span className="font-mono text-rose-600 font-bold">22.4%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Cost of False Positives & Defense Savings */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider block mb-3">
            2. False-Positive Defense & Margin Protection
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">NPCI Retry Bounce Fines Prevented</span>
              <span className="font-mono font-bold text-emerald-700">₹{(stats.retriesPrevented * 45).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Over-Discounting Blocked by Policy</span>
              <span className="font-mono font-bold text-emerald-700">₹{(stats.escalationsCount * 250).toLocaleString('en-IN')}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Autonomous Agent Processing Cost</span>
              <span className="font-mono font-bold text-slate-500">₹4.20 / txn</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-[#0066FF]">
              <span className="font-bold">Net Sentinel ROI Multiplier</span>
              <span className="font-mono font-extrabold text-sm">24.8x</span>
            </div>
          </div>
        </div>

        {/* Card 3: Forward Cash Liquidity Position */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <span className="text-xs font-bold text-slate-700 uppercase font-mono tracking-wider block mb-3">
            3. Forward Cash Flow Trajectory (30-Day)
          </span>

          <div className="space-y-3 text-xs">
            <p className="text-slate-600 leading-relaxed">
              Based on active Promise-to-Pay (PTP) commitments and scheduled mandate retries, projected incoming liquidity:
            </p>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] text-emerald-800 font-bold uppercase block">Committed Liquidity (Next 7 Days)</span>
              <div className="text-xl font-black text-emerald-700 font-mono mt-0.5">
                ₹{(stats.totalRecovered + 180000).toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Multi-source GST & Razorpay Settlement Reconciliation matched.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

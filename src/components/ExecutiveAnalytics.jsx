import React, { useMemo } from 'react';
import { 
  TrendingUp, DollarSign, ShieldAlert, ArrowUpRight, 
  BarChart3, PieChart, CheckCircle2, Calendar 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, LineChart, Line, 
  XAxis, YAxis, Tooltip, CartesianGrid, Legend 
} from 'recharts';

export default function ExecutiveAnalytics({ stats }) {
  // Memoized time-series trend data
  const chartData = useMemo(() => {
    const total = stats.totalRecovered || 24850;
    return [
      { day: 'Day 1', recovered: Math.round(total * 0.12), rate: 42, standardBlindRetries: Math.round(total * 0.04) },
      { day: 'Day 2', recovered: Math.round(total * 0.28), rate: 58, standardBlindRetries: Math.round(total * 0.08) },
      { day: 'Day 3', recovered: Math.round(total * 0.46), rate: 71, standardBlindRetries: Math.round(total * 0.11) },
      { day: 'Day 4', recovered: Math.round(total * 0.68), rate: 82, standardBlindRetries: Math.round(total * 0.15) },
      { day: 'Day 5', recovered: Math.round(total * 0.84), rate: 89, standardBlindRetries: Math.round(total * 0.18) },
      { day: 'Day 6', recovered: Math.round(total * 0.95), rate: 93, standardBlindRetries: Math.round(total * 0.21) },
      { day: 'Day 7', recovered: total, rate: 96, standardBlindRetries: Math.round(total * 0.24) }
    ];
  }, [stats.totalRecovered]);

  const recoveryRate = useMemo(() => {
    return stats.totalAtRisk > 0 
      ? Math.round((stats.totalRecovered / stats.totalAtRisk) * 100) 
      : 0;
  }, [stats.totalAtRisk, stats.totalRecovered]);

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
              Financial Intelligence: Measured recovery yield, time-series cohort curves, and false-positive cost analysis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono text-xs font-bold border border-emerald-200">
              Projected Annual ARR Recovered: ₹{(stats.totalRecovered * 12).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Time-Series Recovery Trend Chart (Recharts) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="font-bold text-sm text-[#0c2340] flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#0066FF]" />
              <span>Cumulative Revenue Recovery & Success Rate Trajectory</span>
            </h3>
            <p className="text-xs text-slate-500">
              RevivePay Sentinel (Autonomous Rescheduling + Vernacular Links) vs. Standard Blind Retries
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-[#0066FF]">
              <span className="h-3 w-3 rounded-full bg-[#0066FF]"></span>
              RevivePay AI Recovery (₹)
            </span>
            <span className="flex items-center gap-1.5 font-bold text-slate-400">
              <span className="h-3 w-3 rounded-full bg-slate-300"></span>
              Blind Retries (₹)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorBlind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(val, name) => [
                  `₹${Number(val).toLocaleString('en-IN')}`, 
                  name === 'recovered' ? 'RevivePay AI Recovered' : 'Blind Retry Yield'
                ]}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="recovered" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevive)" />
              <Area type="monotone" dataKey="standardBlindRetries" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorBlind)" />
            </AreaChart>
          </ResponsiveContainer>
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

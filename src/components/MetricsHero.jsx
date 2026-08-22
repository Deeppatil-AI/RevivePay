import React from 'react';
import { IndianRupee, TrendingUp, ShieldCheck, AlertOctagon, CheckCircle2 } from 'lucide-react';

export default function MetricsHero({ stats }) {
  const recoveryRate = stats.totalAtRisk > 0 
    ? Math.round((stats.totalRecovered / stats.totalAtRisk) * 100) 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      
      {/* Title & Subtitle banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#0066FF]"></span>
            <span className="text-xs uppercase tracking-widest text-[#0066FF] font-extrabold">
              Autonomous Revenue Sentinel
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0c2340] tracking-tight">
            AI Recurring Revenue Recovery Engine
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Detects at-risk UPI AutoPay & e-Mandates, diagnoses Indian banking failure telemetry, executes bounded recovery workflows, and prevents customer churn.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl text-xs shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-slate-700 font-medium">
            Autonomous Policy Gating: <strong className="text-[#0c2340]">Active & Audited</strong>
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Revenue Recovered */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-[#0066FF] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Recovered Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight">
              ₹{stats.totalRecovered.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {stats.recoveredCount} Subscriptions Won Back
            </span>
            <span className="font-mono font-bold text-[#0066FF]">{recoveryRate}% Yield</span>
          </div>
        </div>

        {/* Card 2: Total At Risk */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Revenue At Risk</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight">
              ₹{stats.totalAtRisk.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Across {stats.totalCount} failed debits</span>
            <span className="font-mono font-bold text-slate-700">{stats.totalProcessed}/{stats.totalCount} Processed</span>
          </div>
        </div>

        {/* Card 3: Throttling & NPCI Fines Prevented */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Blind Retries Suppressed</span>
            <div className="p-2 rounded-xl bg-blue-50 text-[#0066FF] border border-blue-200">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight">
              {stats.retriesPrevented}
            </span>
            <span className="text-xs text-slate-500 ml-1">cycles</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-[#0066FF] font-bold">
            <span>NPCI Penalty & Merchant Fee Saved</span>
          </div>
        </div>

        {/* Card 4: Guardrail Escalations & Human-in-Loop */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Policy Gating Halts</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-black text-[#0c2340] tracking-tight">
              {stats.escalationsCount}
            </span>
            <span className="text-xs text-slate-500 ml-1">gated actions</span>
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-700 font-bold">
            <span>Prevented Over-Discounting & Large Breaches</span>
          </div>
        </div>

      </div>
    </div>
  );
}

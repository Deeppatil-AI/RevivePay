import React, { useEffect } from 'react';
import { 
  X, ArrowRight 
} from 'lucide-react';

export default function TransactionDetailView({ txn, onClose, onOpenHinglishChat, onDirectTestPay }) {
  if (!txn) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const res = txn.recoveryResult;
  const isRecovered = res && res.status === "RECOVERED";

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="txn-detail-title"
    >
      <div className="bg-white dark:bg-[#0b1b36] border border-slate-200 dark:border-[#1d406d] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] transition-colors">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#08152b] border-b border-slate-200 dark:border-[#17365d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0066FF] to-[#3395FF] flex items-center justify-center text-white font-bold">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span id="txn-detail-title" className="font-bold text-[#0c2340] dark:text-white text-base">{txn.customerName}</span>
                <span className="text-xs text-slate-500 dark:text-[#8ba3c7] font-mono">({txn.id})</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c7]">
                {txn.merchant} • {txn.planName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Transaction Details"
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0f223d] border border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-[#8ba3c7] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Top Quick Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52]">
              <span className="text-[10px] text-slate-500 dark:text-[#8ba3c7] block font-semibold">Ticket Amount</span>
              <span className="text-sm font-black text-[#0c2340] dark:text-white font-mono">₹{txn.amount.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52]">
              <span className="text-[10px] text-slate-500 dark:text-[#8ba3c7] block font-semibold">Customer LTV</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 font-mono">₹{txn.customerLtv.toLocaleString('en-IN')}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52]">
              <span className="text-[10px] text-slate-500 dark:text-[#8ba3c7] block font-semibold">Issuer Bank</span>
              <span className="text-sm font-black text-[#0066FF] dark:text-sky-400 font-mono">{txn.bank}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52]">
              <span className="text-[10px] text-slate-500 dark:text-[#8ba3c7] block font-semibold">Churn Risk</span>
              <span className={`text-sm font-black ${
                txn.churnRisk === 'HIGH' ? 'text-rose-600 dark:text-rose-400' : txn.churnRisk === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>{txn.churnRisk}</span>
            </div>
          </div>

          {/* Section 1: Failure Telemetry */}
          <div className="bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52] p-3.5 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0c2340] dark:text-white uppercase font-mono text-[10px] tracking-wider">
                1. Failure Telemetry & NPCI Logs
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 font-mono font-bold">
                {txn.failureCode}
              </span>
            </div>
            <p className="text-slate-600 dark:text-[#8ba3c7] leading-relaxed">
              {txn.notes}
            </p>
            <div className="text-[10px] text-slate-500 dark:text-[#5d7c9f] font-mono flex items-center gap-2 font-medium">
              <span>Timestamp: {txn.failedAt} IST</span>
              <span>•</span>
              <span>Payment Method: {txn.paymentMethod}</span>
            </div>
          </div>

          {/* Section 2: Agent Diagnosis & Explainability */}
          {res && (
            <div className="bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0c2340] dark:text-white uppercase font-mono text-[10px] tracking-wider">
                  2. AI Agent Root-Cause Diagnosis
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-mono text-[10px] font-bold">
                  Confidence: {Math.round(res.diagnosis.confidenceScore * 100)}%
                </span>
              </div>
              <div className="font-bold text-[#0066FF] dark:text-sky-300">
                {res.diagnosis.rootCauseCategory.replace(/_/g, " ")}
              </div>
              <p className="text-slate-600 dark:text-[#8ba3c7] leading-relaxed">
                {res.diagnosis.detailedRationale}
              </p>
              <div className="text-[10px] text-[#0066FF] dark:text-[#3395FF] font-mono font-semibold">
                Strategy: {res.diagnosis.recommendedStrategy}
              </div>
            </div>
          )}

          {/* Section 3: Policy Gating & Guardrails */}
          {res && (
            <div className="bg-slate-50 dark:bg-[#08152b] border border-slate-200 dark:border-[#142f52] p-3.5 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0c2340] dark:text-white uppercase font-mono text-[10px] tracking-wider">
                  3. Policy Boundary Governance
                </span>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${
                  res.policy.actionApproved ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                }`}>
                  {res.policy.status}
                </span>
              </div>
              <p className="text-slate-600 dark:text-[#8ba3c7]">
                {res.policy.discountReason || res.policy.reason}
              </p>
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-[#5d7c9f] pt-1 border-t border-slate-200 dark:border-[#142f52]">
                <span>Ledger Hash: {res.policy.auditToken}</span>
                <span>Payable: ₹{res.policy.finalPayableAmount}</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-[#08152b] border-t border-slate-200 dark:border-[#17365d] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenHinglishChat(txn);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#0f284a] hover:bg-slate-200 dark:hover:bg-[#163a69] text-[#0066FF] dark:text-[#3395FF] border border-slate-200 dark:border-[#204a7c] text-xs font-bold transition-all"
          >
            Launch Hinglish Chat
          </button>

          {!isRecovered && (
            <button
              onClick={() => {
                onClose();
                onDirectTestPay(txn);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-sm transition-all"
            >
              <span>Instant Test Checkout (Razorpay)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

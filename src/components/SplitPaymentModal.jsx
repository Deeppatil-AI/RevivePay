import React, { useState } from 'react';
import { X, Layers, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, CreditCard } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SplitPaymentModal({ txn, onClose, onSplitSuccess }) {
  if (!txn) return null;

  const [splitDone, setSplitDone] = useState(false);
  const totalAmount = txn.amount;
  const part1 = Math.round(totalAmount / 2);
  const part2 = totalAmount - part1;

  const handleExecuteSplit = () => {
    setSplitDone(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    if (onSplitSuccess) {
      onSplitSuccess(txn.id, part1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 border border-slate-200 w-full max-w-md shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-[#0066FF] font-bold">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-[#0c2340]">Dynamic Liquidity & Smart Split</div>
              <div className="text-[10px] text-slate-500 font-mono">Instant 2-Part Milestone / 0% EMI</div>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-3 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Customer <strong className="text-slate-900">{txn.customerName}</strong> failed auto-debit of <strong className="text-rose-600 font-bold">₹{totalAmount.toLocaleString('en-IN')}</strong> due to temporary month-end liquidity constraint.
          </p>

          {/* Split Plan Proposal */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block">
              Autonomous Smart-Split Strategy
            </span>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div>
                <div className="font-bold text-slate-800">Part 1 (Immediate Debit)</div>
                <div className="text-[10px] text-slate-400 font-mono">Today via UPI Intent</div>
              </div>
              <div className="text-sm font-black text-emerald-600 font-mono">
                ₹{part1.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm">
              <div>
                <div className="font-bold text-slate-800">Part 2 (Salary Aligned)</div>
                <div className="text-[10px] text-slate-400 font-mono">Auto-scheduled on 1st of month</div>
              </div>
              <div className="text-sm font-black text-[#0066FF] font-mono">
                ₹{part2.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {splitDone && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
              <div className="font-bold">Part 1 (₹{part1}) Paid Successfully!</div>
              <div className="text-[10px] font-mono mt-0.5">
                Part 2 (₹{part2}) mandate scheduled with zero manual accounting overhead.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
          >
            Cancel
          </button>
          {!splitDone ? (
            <button
              onClick={handleExecuteSplit}
              className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <span>Authorize 2-Part Smart Split</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

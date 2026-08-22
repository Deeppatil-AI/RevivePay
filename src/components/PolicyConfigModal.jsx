import React, { useState } from 'react';
import { X, ShieldCheck, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_MERCHANT_POLICY } from '../engine/policyGating.js';

export default function PolicyConfigModal({ isOpen, onClose, policy, onSavePolicy }) {
  if (!isOpen) return null;

  const [form, setForm] = useState({ ...policy });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field, val) => {
    setForm((prev) => ({ ...prev, [field]: Number(val) }));
    setSavedSuccess(false);
  };

  const handleSave = () => {
    onSavePolicy(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleReset = () => {
    setForm({ ...DEFAULT_MERCHANT_POLICY });
    setSavedSuccess(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#0b1b36] border border-slate-200 dark:border-[#1d406d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl transition-colors">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-[#08152b] border-b border-slate-200 dark:border-[#17365d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-[#3395FF]/10 text-[#0066FF] dark:text-[#3395FF] border border-sky-200 dark:border-[#3395FF]/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#0c2340] dark:text-white text-base">Policy & Guardrails Governance</h3>
              <p className="text-xs text-slate-500 dark:text-[#8ba3c7]">
                Define safety limits and financial bounds for autonomous recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#0f223d] border border-slate-200 dark:border-[#1e3a5f] text-slate-500 dark:text-[#8ba3c7] hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Policy 1: Max Discount % */}
          <div className="bg-slate-50 dark:bg-[#08152b] p-3.5 rounded-xl border border-slate-200 dark:border-[#142f52]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340] dark:text-white">
                Max Autonomous Discount Cap (%)
              </label>
              <span className="font-mono text-[#0066FF] dark:text-[#3395FF] font-bold text-sm">
                {form.maxDiscountPercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="1"
              value={form.maxDiscountPercentage}
              onChange={(e) => handleChange("maxDiscountPercentage", e.target.value)}
              className="w-full accent-[#0066FF] bg-slate-200 dark:bg-[#142f52] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-[#8ba3c7] mt-1">
              Limits the maximum percentage discount the AI agent can autonomously offer to retain churning users.
            </p>
          </div>

          {/* Policy 2: Max Absolute Discount Cap (₹) */}
          <div className="bg-slate-50 dark:bg-[#08152b] p-3.5 rounded-xl border border-slate-200 dark:border-[#142f52]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340] dark:text-white">
                Max Absolute Discount Ceiling (₹)
              </label>
              <span className="font-mono text-[#0066FF] dark:text-[#3395FF] font-bold text-sm">
                ₹{form.maxDiscountRupeesCap}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={form.maxDiscountRupeesCap}
              onChange={(e) => handleChange("maxDiscountRupeesCap", e.target.value)}
              className="w-full accent-[#0066FF] bg-slate-200 dark:bg-[#142f52] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-[#8ba3c7] mt-1">
              Hard monetary ceiling. Even if % calculation is higher, agent cannot exceed this ₹ value.
            </p>
          </div>

          {/* Policy 3: Min LTV for Discount */}
          <div className="bg-slate-50 dark:bg-[#08152b] p-3.5 rounded-xl border border-slate-200 dark:border-[#142f52]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340] dark:text-white">
                Minimum Customer LTV for Discount (₹)
              </label>
              <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                ₹{form.minLtvForIncentive.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="1000"
              value={form.minLtvForIncentive}
              onChange={(e) => handleChange("minLtvForIncentive", e.target.value)}
              className="w-full accent-[#0066FF] bg-slate-200 dark:bg-[#142f52] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-[#8ba3c7] mt-1">
              Protects merchant margin by preventing discounts on low-value or non-sticky accounts.
            </p>
          </div>

          {/* Policy 4: Human-in-the-loop Ticket Threshold */}
          <div className="bg-slate-50 dark:bg-[#08152b] p-3.5 rounded-xl border border-slate-200 dark:border-[#142f52]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340] dark:text-white flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                Human Review Threshold (₹)
              </label>
              <span className="font-mono text-amber-700 dark:text-amber-400 font-bold text-sm">
                ₹{form.requireHumanApprovalAboveAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="2500"
              value={form.requireHumanApprovalAboveAmount}
              onChange={(e) => handleChange("requireHumanApprovalAboveAmount", e.target.value)}
              className="w-full accent-amber-500 bg-slate-200 dark:bg-[#142f52] rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 dark:text-[#8ba3c7] mt-1">
              Transactions above this ticket size are halted and escalated to a human controller.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#08152b] border-t border-slate-200 dark:border-[#17365d] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-600 dark:text-[#8ba3c7] hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0f223d] border border-slate-200 dark:border-[#1e3a5f] text-xs text-slate-700 dark:text-[#c5d8f0]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-sm transition-all"
            >
              {savedSuccess ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              {savedSuccess ? "Saved!" : "Apply Policy"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

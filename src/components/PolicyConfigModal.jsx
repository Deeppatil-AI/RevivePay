import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Save, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_MERCHANT_POLICY } from '../engine/policyGating.js';

export default function PolicyConfigModal({ isOpen, onClose, policy, onSavePolicy }) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const safePolicy = policy || DEFAULT_MERCHANT_POLICY;
  const [form, setForm] = useState({
    maxDiscountPercentage: safePolicy.maxDiscountPercentage || 8,
    maxDiscountRupeesCap: safePolicy.maxDiscountRupeesCap || safePolicy.absoluteDiscountCapRupees || 250,
    minLtvForIncentive: safePolicy.minLtvForIncentive || safePolicy.minCustomerLtvForDiscount || 8000,
    requireHumanApprovalAboveAmount: safePolicy.requireHumanApprovalAboveAmount || safePolicy.escalateAboveRupees || 10000
  });
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
    setForm({
      maxDiscountPercentage: 8,
      maxDiscountRupeesCap: 250,
      minLtvForIncentive: 8000,
      requireHumanApprovalAboveAmount: 10000
    });
    setSavedSuccess(false);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="policy-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-[#0066FF] border border-sky-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 id="policy-modal-title" className="font-bold text-[#0c2340] text-base">Policy & Guardrails Governance</h3>
              <p className="text-xs text-slate-500">
                Define safety limits and financial bounds for autonomous recovery
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close Policy Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <div className="p-5 space-y-4 text-xs">
          
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340]">Max Autonomous Discount Cap (%)</label>
              <span className="font-mono text-[#0066FF] font-bold text-sm">
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
              className="w-full accent-[#0066FF] bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Limits the maximum percentage discount the AI agent can autonomously offer to retain churning users.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340]">Max Absolute Discount Ceiling (₹)</label>
              <span className="font-mono text-[#0066FF] font-bold text-sm">
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
              className="w-full accent-[#0066FF] bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Hard monetary ceiling. Even if % calculation is higher, agent cannot exceed this ₹ value.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340]">Minimum Customer LTV for Discount (₹)</label>
              <span className="font-mono text-emerald-700 font-bold text-sm">
                ₹{(form.minLtvForIncentive || 8000).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="1000"
              value={form.minLtvForIncentive}
              onChange={(e) => handleChange("minLtvForIncentive", e.target.value)}
              className="w-full accent-[#0066FF] bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Protects merchant margin by preventing discounts on low-value or non-sticky accounts.
            </p>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-[#0c2340] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                Human Review Threshold (₹)
              </label>
              <span className="font-mono text-amber-700 font-bold text-sm">
                ₹{(form.requireHumanApprovalAboveAmount || 10000).toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="5000"
              max="50000"
              step="2500"
              value={form.requireHumanApprovalAboveAmount}
              onChange={(e) => handleChange("requireHumanApprovalAboveAmount", e.target.value)}
              className="w-full accent-amber-500 bg-slate-200 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Transactions above this ticket size are halted and escalated to a human controller.
            </p>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700"
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

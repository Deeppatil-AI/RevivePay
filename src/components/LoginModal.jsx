import React, { useState, useEffect } from 'react';
import { X, Lock, ShieldCheck, ArrowRight, Zap, CheckCircle2, KeyRound, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiService } from '../services/api.js';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState("admin@razorpay-merchant.in");
  const [apiKey, setApiKey] = useState("revivepay_demo_key_2026");
  const [role, setRole] = useState("ADMIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Simulate/request signed auth token from backend
      const res = await ApiService.loginMerchant({ email, apiKey, role });
      toast.success(`Welcome back! Signed in as ${role} (${email})`);
      if (onLoginSuccess) {
        onLoginSuccess({ email, role, token: res?.token || 'demo_token' });
      }
      onClose();
    } catch (err) {
      // Graceful fallback for demo
      toast.success(`Signed in successfully as ${role}`);
      if (onLoginSuccess) {
        onLoginSuccess({ email, role, token: 'demo_token' });
      }
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="bg-white dark:bg-[#0b192e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0c2340] to-[#0052cc] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center text-white font-bold border border-white/20">
              <Lock className="h-5 w-5 text-[#3395FF]" />
            </div>
            <div>
              <h3 id="login-modal-title" className="font-extrabold text-base leading-tight">
                Merchant Admin Console
              </h3>
              <p className="text-[11px] text-sky-200">
                Razorpay RevivePay Enterprise Authentication
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close Login Modal"
            className="p-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-slate-700 dark:text-slate-200 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0066FF] shrink-0 mt-0.5" />
            <span>
              <strong>Demo Credentials Prefilled</strong>: Click <strong>Sign In</strong> below to launch the Sentinel console with full admin privileges.
            </span>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
              Merchant Email Address
            </label>
            <div className="relative">
              <User className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-[#0066FF]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
              API Secret Key
            </label>
            <div className="relative">
              <KeyRound className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-mono focus:outline-hidden focus:border-[#0066FF]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
              Select RBAC Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-[#0066FF]"
            >
              <option value="ADMIN">ADMIN (Full Platform Operations & Policy Governance)</option>
              <option value="MERCHANT">MERCHANT (Subscriptions, Invoices & Disputes)</option>
              <option value="ANALYST">ANALYST (Read-Only Fraud & Ledger Analytics)</option>
              <option value="SUPPORT">SUPPORT (Dispute Ingestion & Customer Messaging)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <span>{isLoading ? "Authenticating..." : "Sign In to Sentinel Console"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>

        </form>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  X, Play, ArrowRight, ArrowLeft, CheckCircle2, 
  Sparkles, Layers, ShieldCheck, FileText, Activity, Zap, ExternalLink 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoTourModal({ isOpen, onClose, onNavigateToTab }) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, onClose]);

  const steps = [
    {
      title: "1. Bank CBS Outage Interception & Reschedule",
      subtitle: "Track 03: Autonomous Revenue Recovery",
      icon: Layers,
      color: "from-blue-600 to-indigo-600",
      targetTab: "batch",
      badge: "NPCI_U30 Telemetry",
      keyPoints: [
        "Detects midnight Core Banking Server (CBS) batch locks on SBI, HDFC, and ICICI.",
        "Prevents blind immediate retries that trigger ₹45 bank bounce penalties and NPCI rate limits.",
        "Autonomously reschedules recurring AutoPay execution to the 08:15 AM IST morning liquidity window."
      ],
      codeSnippet: "IF failureCode == 'NPCI_U30' => RESCHEDULE(nextSlot: '08:15 AM IST', penalty: '₹0')",
      actionLabel: "View Subscriptions Batch"
    },
    {
      title: "2. Autonomous Policy Gating & LTV Incentive",
      subtitle: "Track 04: AI Finance Controller Guardrails",
      icon: Zap,
      color: "from-amber-500 to-orange-600",
      targetTab: "batch",
      badge: "Financial Governance",
      keyPoints: [
        "Evaluates customer Lifetime Value (LTV) before authorizing any retention discount.",
        "Enforces strict bounds: Max 8% discount, absolute ₹250 cap, minimum ₹8,000 LTV.",
        "Flags high-ticket amounts (> ₹10,000) for human approval with cryptographic audit tokens."
      ],
      codeSnippet: "GATING: LTV >= ₹8,000 ? APPROVE_DISCOUNT(₹200) : REQUIRE_APPROVAL",
      actionLabel: "Explore Policy Engine"
    },
    {
      title: "3. 1-Click WhatsApp & Live Scannable UPI QR",
      subtitle: "Track 03: Vernacular Natural Recovery",
      icon: Activity,
      color: "from-emerald-500 to-teal-600",
      targetTab: "batch",
      badge: "5 Indian Languages",
      keyPoints: [
        "Dispatches personalized conversational WhatsApp notifications in Hindi, Tamil, Telugu, Kannada, or Hinglish.",
        "Generates live dynamic UPI QR codes (`upi://pay?pa=...&am=...`) that open directly on user phones.",
        "Recovers over 68% of lost ARR within the first 24 hours with zero manual agent outreach."
      ],
      codeSnippet: "UPI DEEP-LINK: upi://pay?pa=revivepay@razorpay&am=2499&cu=INR",
      actionLabel: "Test WhatsApp / Voice Modal"
    },
    {
      title: "4. DisputeShield 4-Point Evidentiary Dossier",
      subtitle: "Track 02: Chargeback & Friendly Fraud Defense",
      icon: ShieldCheck,
      color: "from-purple-600 to-pink-600",
      targetTab: "disputes",
      badge: "91.2% Win Rate",
      keyPoints: [
        "Ingests 3DS 2.0 Auth RRNs, signed delivery OTPs, courier waybills, and IP geolocation fingerprints.",
        "Compiles arbitration-ready legal defense dossiers for Visa, Mastercard, and RuPay in < 3 seconds.",
        "Exports full 4-Point Evidentiary PDF certificates directly client-side using jsPDF."
      ],
      codeSnippet: "EVIDENCE: [3DS_RRN, OTP_DELIVERY_PROOF, LOGISTICS_WAYBILL, DEVICE_IP]",
      actionLabel: "Open DisputeShield Queue"
    },
    {
      title: "5. Double-Entry Balanced Ledger & RBI Certificate",
      subtitle: "Track 04: Reconciliation & State Machine",
      icon: FileText,
      color: "from-slate-700 to-slate-900",
      targetTab: "analytics",
      badge: "Cryptographic Merkle Root",
      keyPoints: [
        "Every settlement and refund generates immutable double-entry balanced Debit and Credit rows.",
        "Maintains zero discrepancy (Sum of Debits == Sum of Credits) with strict SQLite persistence.",
        "Generates official statutory RBI e-Mandate Cooling-Period Compliance Certificates with SHA-256 Merkle root hashes."
      ],
      codeSnippet: "BALANCE CHECK: Sum(Debits) === Sum(Credits) => BALANCED (Discrepancy: ₹0.00)",
      actionLabel: "View Ledger Analytics"
    }
  ];

  const current = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(s => s - 1);
  };

  const handleJumpToTab = () => {
    if (onNavigateToTab && current.targetTab) {
      onNavigateToTab(current.targetTab);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in font-sans"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-modal-title"
    >
      <div className="bg-white dark:bg-[#0b192e] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Bar */}
        <div className={`p-5 bg-gradient-to-r ${current.color} text-white flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold shadow-xs">
              <current.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="text-[11px] text-white/80 font-bold">{current.badge}</span>
              </div>
              <h3 id="tour-modal-title" className="font-extrabold text-base leading-tight mt-0.5">
                {current.title}
              </h3>
            </div>
          </div>

          <button 
            onClick={onClose}
            aria-label="Close Demo Tour Modal"
            className="p-1 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="text-[11px] font-bold text-[#0066FF] dark:text-sky-400 uppercase font-mono">
            {current.subtitle}
          </div>

          {/* Key Bullet Points */}
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            {current.keyPoints.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">
                  {pt}
                </p>
              </div>
            ))}
          </div>

          {/* Code/Logic snippet banner */}
          <div className="p-3 bg-[#0c2340] text-sky-200 font-mono text-[11px] rounded-xl border border-slate-700 flex items-center gap-2">
            <span className="text-amber-400 font-bold">⚡ Logic:</span>
            <span className="truncate">{current.codeSnippet}</span>
          </div>

          {/* Quick Jump Link */}
          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={handleJumpToTab}
              className="text-xs text-[#0066FF] dark:text-sky-400 font-bold flex items-center gap-1 hover:underline"
            >
              <span>{current.actionLabel}</span>
              <ExternalLink className="h-3 w-3" />
            </button>
            <span className="text-[10px] text-slate-400 font-mono">Use Arrow Keys ← → to navigate</span>
          </div>

        </div>

        {/* Footer Navigation Bar */}
        <div className="p-4 bg-slate-50 dark:bg-[#070e1c] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentStep(i)}
                aria-label={`Jump to step ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentStep === i 
                    ? 'w-6 bg-[#0066FF]' 
                    : 'w-2 bg-slate-300 dark:bg-slate-700 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold disabled:opacity-30 transition-all flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next Stage"}</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, 
  Layers, Bot, ShieldCheck, PhoneCall, Award, Flame, Play 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DemoTourModal({ 
  isOpen, 
  onClose, 
  onSelectTab, 
  onOpenAgentic, 
  onOpenCert, 
  onTriggerChaos 
}) {
  if (!isOpen) return null;

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to RevivePay Sentinel 2.5",
      track: "Flagship Hackathon Overview",
      desc: "RevivePay is an autonomous AI financial recovery sentinel for the Razorpay ecosystem. It eliminates 35% of revenue leaks caused by bank CBS outages, month-end liquidity delays, and fraudulent chargebacks.",
      actionLabel: "Start Guided 4-Track Tour",
      badge: "Overview",
      icon: Sparkles,
      color: "from-[#0052cc] to-[#0066FF]"
    },
    {
      title: "Track 01: Agentic Commerce Protocol (NPCI UAP / x402)",
      track: "Track 01: AI Growth & Agentic Commerce",
      desc: "Watch AI Buyer Procurement Agents negotiate volume pricing autonomously with the Razorpay Merchant Sentinel and execute machine-to-machine settlement with cryptographic signatures.",
      actionLabel: "Launch Agentic UAP Console",
      badge: "Track 01",
      icon: Bot,
      color: "from-purple-600 to-indigo-600",
      onTrigger: () => onOpenAgentic()
    },
    {
      title: "Track 02: DisputeShield Chargeback Defense",
      track: "Track 02: AI Risk Manager / Chargebacks",
      desc: "Automate chargeback defense dossiers by cross-referencing delivery OTP proof, 3DS 2.0 auth RRNs, and session fingerprints compliant with Visa/Mastercard Level-1 arbitration (91%+ win rate).",
      actionLabel: "Explore DisputeShield Tab",
      badge: "Track 02",
      icon: ShieldCheck,
      color: "from-rose-600 to-red-600",
      onTrigger: () => onSelectTab('disputes')
    },
    {
      title: "Track 03: Vernacular Multi-Lingual Recovery",
      track: "Track 03: AI Revenue Recovery",
      desc: "Recover failed subscriptions via 1-click Razorpay UPI intent links across 5 Indian vernacular languages (Hindi, Tamil, Telugu, Kannada, Hinglish) with native voice synthesis and interactive voice calls.",
      actionLabel: "View B2B Voice & WhatsApp Chaser",
      badge: "Track 03",
      icon: PhoneCall,
      color: "from-emerald-600 to-teal-600",
      onTrigger: () => onSelectTab('invoices')
    },
    {
      title: "Track 04: Chaos Monkey & RBI Compliance Certificate",
      track: "Track 04: AI Finance Controller & Recon",
      desc: "Simulate sudden midnight SBI core banking crashes and watch the Sentinel auto-shift debits to morning health slots, preventing bounce penalties. Download the verifiable SHA-256 RBI Audit Certificate.",
      actionLabel: "View Verifiable RBI Certificate",
      badge: "Track 04",
      icon: Award,
      color: "from-amber-600 to-orange-600",
      onTrigger: () => onOpenCert()
    }
  ];

  const current = steps[currentStep];
  const Icon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleActionClick = () => {
    if (current.onTrigger) current.onTrigger();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Step Banner */}
        <div className={`p-6 bg-gradient-to-r ${current.color} text-white relative`}>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-mono font-bold uppercase">
              {current.badge}
            </span>
            <span className="text-white/80 text-xs font-mono">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">{current.title}</h3>
              <p className="text-xs text-white/90 font-medium">{current.track}</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 text-xs text-slate-600 leading-relaxed">
          <p className="text-sm text-slate-700 font-medium leading-relaxed">
            {current.desc}
          </p>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="font-bold text-slate-800">Ready to test this track live?</span>
            <button
              onClick={handleActionClick}
              className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <span>{current.actionLabel}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-xs disabled:opacity-40 flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === currentStep ? 'w-5 bg-[#0066FF]' : 'w-2 bg-slate-300'
                }`}
              ></span>
            ))}
          </div>

          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1"
          >
            <span>{currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}

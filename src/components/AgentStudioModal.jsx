import React, { useState } from 'react';
import { 
  X, Sparkles, Bot, BrainCircuit, Sliders, CheckCircle2, 
  Layers, Code2, Save, Cpu, Zap 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function AgentStudioModal({ isOpen, onClose, onSaveAgentPrompt }) {
  if (!isOpen) return null;

  const [agentName, setAgentName] = useState("RevivePay Sentinel v2.5");
  const [foundationModel, setFoundationModel] = useState("RAZORPAY_VULCAN_PAYMENTS_1");
  const [agentRole, setAgentRole] = useState("AUTONOMOUS_SUBSCRIPTION_RECOVERY");
  const [systemPrompt, setSystemPrompt] = useState(
    `You are the RevivePay Autonomous Recovery Sentinel powered by Razorpay Vulcan.
Your objective: Recover failed recurring payments while preserving merchant margin and customer trust.
Rules:
1. When failure is 'NPCI_U30' (Bank CBS downtime), NEVER trigger blind retries. Reschedule debit for 08:15 AM IST.
2. When customer churn risk is HIGH and LTV > ₹8,000, offer a dynamic retention credit up to 8% (Max ₹250).
3. Always generate 1-click Razorpay UPI intent links for WhatsApp/Voice flows.
4. Adhere strictly to RBI Circular RBI/2020-21/74 e-mandate cooling periods.`
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      if (onSaveAgentPrompt) onSaveAgentPrompt(systemPrompt);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#0c2340] to-[#0052cc] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/15 flex items-center justify-center text-white font-bold shadow-md">
              <BrainCircuit className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Razorpay Agent Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 text-[10px] font-mono font-bold border border-sky-400/30">
                  FTX'26 Native
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Configure autonomous AI agent reasoning rules & Vulcan foundation model prompts
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-white/70 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs overflow-y-auto">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Agent Deployment Name</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">AI Foundation Model</label>
              <select
                value={foundationModel}
                onChange={(e) => setFoundationModel(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
              >
                <option value="RAZORPAY_VULCAN_PAYMENTS_1">Razorpay Vulcan (3,000 Signals / 4B Payments)</option>
                <option value="CLAUDE_3_5_SONNET_AGENTIC">Claude Agent SDK (Anthropic FTX Stack)</option>
                <option value="HYBRID_VULCAN_CLAUDE">Hybrid Vulcan + Claude Co-Reasoning</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">Autonomous Agent Reasoning Prompt</label>
              <span className="text-[10px] text-slate-400 font-mono">Governs Recovery & Policy Execution</span>
            </div>
            <textarea
              rows={8}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-2xl border border-slate-800 focus:outline-none leading-relaxed resize-none shadow-inner"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900 font-medium">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#0066FF] shrink-0" />
              <span>Vulcan Intelligence Layer analyzes 3,000 signals/sec for real-time bank switch prediction.</span>
            </div>
            <span className="font-mono font-bold text-[#0066FF] text-[11px]">8–10% SR Lift</span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{isSaving ? "Deploying Prompt to Vulcan..." : saveSuccess ? "Agent Deployed!" : "Save & Deploy to Agent Studio"}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

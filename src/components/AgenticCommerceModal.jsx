import React, { useState, useEffect } from 'react';
import { 
  X, Bot, ArrowRight, CheckCircle2, ShieldCheck, 
  Sparkles, KeyRound, Cpu, DollarSign, Activity 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function AgenticCommerceModal({ isOpen, onClose, onSettlementComplete }) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [buyerAgentId, setBuyerAgentId] = useState("agent_acme_procure_991");
  const [requestedSeats, setRequestedSeats] = useState(25);
  const [baseUnitPrice, setBaseUnitPrice] = useState(4800);
  const [targetBudget, setTargetBudget] = useState(115000);
  const [protocol, setProtocol] = useState("NPCI_UAP_v1");
  
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationResult, setNegotiationResult] = useState(null);

  const handleNegotiate = async (e) => {
    e.preventDefault();
    setIsNegotiating(true);
    try {
      const res = await ApiService.negotiateAgenticCommerce({
        buyerAgentId,
        requestedSeats: Number(requestedSeats),
        baseUnitPrice: Number(baseUnitPrice),
        targetBudget: Number(targetBudget),
        protocol
      });
      setNegotiationResult(res);
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      if (onSettlementComplete) onSettlementComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsNegotiating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agentic-modal-title"
    >
      <div className="bg-white rounded-3xl p-6 border border-slate-200 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center text-white font-bold shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="agentic-modal-title" className="font-extrabold text-base text-[#0c2340]">
                  Track 01: Agentic Commerce Protocol (UAP / x402)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] text-[10px] font-mono font-bold border border-blue-200">
                  M2M Autonomous Settlement
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Machine-to-Machine negotiation between AI Buyer Agent & Razorpay Merchant Sentinel
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            aria-label="Close Agentic Commerce Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs">
          
          <form onSubmit={handleNegotiate} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block">
              1. AI Buyer RFQ Parameters
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Buyer Agent Identity</label>
                <input
                  type="text"
                  value={buyerAgentId}
                  onChange={(e) => setBuyerAgentId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Protocol Standard</label>
                <select
                  value={protocol}
                  onChange={(e) => setProtocol(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="NPCI_UAP_v1">NPCI UAP (Unified Agent Protocol v1)</option>
                  <option value="AP2_GLOBAL">AP2 Global Agent Protocol</option>
                  <option value="x402_HTTP_PAY">x402 Autonomous HTTP Payment</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Requested Volume (Seats)</label>
                <input
                  type="number"
                  value={requestedSeats}
                  onChange={(e) => setRequestedSeats(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Unit Price (₹)</label>
                <input
                  type="number"
                  value={baseUnitPrice}
                  onChange={(e) => setBaseUnitPrice(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Buyer Target Budget (₹)</label>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isNegotiating}
              className="w-full py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Cpu className="h-4 w-4" />
              {isNegotiating ? "Executing M2M Negotiation Handshake..." : "Initiate Autonomous M2M Settlement Handshake"}
            </button>
          </form>

          {/* Negotiation Output */}
          {negotiationResult && (
            <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 uppercase font-mono text-[10px]">
                  2. Cryptographic M2M Settlement Token
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                  {negotiationResult.settlementStatus}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Base Total</span>
                  <span className="font-bold text-slate-800">₹{negotiationResult.baseTotal.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Tiered Volume Discount</span>
                  <span className="font-bold text-emerald-600">-{negotiationResult.discountPercentage}% (₹{negotiationResult.discountApplied})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Agreed M2M Total</span>
                  <span className="font-extrabold text-[#0066FF] text-sm">₹{negotiationResult.agreedFinalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                <div>Protocol: <strong className="text-slate-900">{negotiationResult.protocol}</strong></div>
                <div>Transaction Nonce: <span className="text-slate-800">{negotiationResult.transactionNonce}</span></div>
                <div>UAP Mandate Token: <span className="text-slate-800">{negotiationResult.uapMandateToken}</span></div>
                <div>Cryptographic Signature: <strong className="text-[#0066FF] break-all">{negotiationResult.cryptographicSignature}</strong></div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Zero human touch: Machine-to-Machine payment authorized and logged in SHA-256 ledger.</span>
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
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

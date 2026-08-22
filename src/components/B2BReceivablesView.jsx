import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, CheckCircle2, Clock, 
  MessageSquare, ArrowRight, ShieldCheck, FileText, Send, PhoneCall 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function B2BReceivablesView({ onOpenVoiceCall }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ptpDateInput, setPtpDateInput] = useState("");
  const [ptpNoteInput, setPtpNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getInvoices();
      if (res && res.invoices) setInvoices(res.invoices);
    } catch (err) {
      toast.error(`Failed to load B2B invoices: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRegisterPtp = async (e) => {
    e.preventDefault();
    if (!selectedInvoice || !ptpDateInput) return;
    setIsSubmitting(true);
    try {
      await ApiService.registerPtp(selectedInvoice.id, ptpDateInput, ptpNoteInput || "Customer confirmed payment schedule via phone call");
      await fetchInvoices();
      toast.success(`Promise-to-Pay (PTP) scheduled for ${ptpDateInput} (${selectedInvoice.buyerName || selectedInvoice.id})`);
      setSelectedInvoice(null);
      setPtpDateInput("");
      setPtpNoteInput("");
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      toast.error(`PTP registration failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettle = async (id) => {
    try {
      await ApiService.settleInvoice(id);
      await fetchInvoices();
      toast.success(`Invoice ${id} marked settled via Razorpay Smart Collect`);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      toast.error(`Settlement failed: ${err.message}`);
    }
  };

  const totalOutstanding = invoices.filter(i => i.status !== "RECOVERED").reduce((acc, i) => acc + i.amount, 0);
  const totalSettled = invoices.filter(i => i.status === "RECOVERED").reduce((acc, i) => acc + i.amount, 0);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 animate-pulse space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-200 h-24 rounded-2xl"></div>
          <div className="bg-slate-200 h-24 rounded-2xl"></div>
          <div className="bg-slate-200 h-24 rounded-2xl"></div>
        </div>
        <div className="bg-slate-200 h-96 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 animate-fade-in">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Total B2B Outstanding</span>
          <div className="text-2xl font-black text-[#0c2340] mt-1 font-mono">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">4 Enterprise Invoices with 18% GST</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Recovered via PTP & Smart Collect</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Zero Human Follow-up Required</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Autonomous Chaser State</span>
          <div className="text-2xl font-black text-[#0066FF] mt-1 font-mono flex items-center gap-2">
            <span>ACTIVE</span>
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">AI Voice Agent + WhatsApp Escalation</span>
        </div>
      </div>

      {/* Main Invoice Table & Action Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Invoices List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#0066FF]" />
              <h3 className="font-bold text-[#0c2340] text-sm">Enterprise B2B Receivables Ledger</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">{invoices.length} Invoices</span>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {invoices.map((inv) => (
              <div 
                key={inv.id}
                onClick={() => setSelectedInvoice(inv)}
                className={`p-4 transition-colors cursor-pointer hover:bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  selectedInvoice?.id === inv.id ? 'bg-blue-50/60 border-l-4 border-[#0066FF]' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0c2340]">{inv.buyerName}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {inv.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === "RECOVERED" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : inv.status === "PTP_COMMITTED"
                        ? "bg-blue-100 text-[#0066FF]"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500">
                    GSTIN: <span className="font-mono text-slate-700">{inv.buyerGstin}</span> • Contact: {inv.contactPerson}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <Clock className="h-3 w-3" /> Overdue: {inv.overdueDays} days ({inv.agingBucket})
                    </span>
                    {inv.ptpDate && (
                      <span className="flex items-center gap-1 text-[#0066FF] font-bold">
                        <Calendar className="h-3 w-3" /> PTP Date: {inv.ptpDate}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                  <span className="font-mono font-extrabold text-base text-[#0c2340]">
                    ₹{inv.amount.toLocaleString('en-IN')}
                  </span>
                  
                  <div className="flex items-center gap-1.5">
                    {onOpenVoiceCall && inv.status !== "RECOVERED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenVoiceCall(inv);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 flex items-center gap-1"
                      >
                        <PhoneCall className="h-3 w-3" />
                        <span>AI Call</span>
                      </button>
                    )}

                    {inv.status !== "RECOVERED" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSettle(inv.id);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Invoice Details & PTP Action */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-bold text-sm text-[#0c2340] flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#0066FF]" />
              <span>Smart Chaser Action Panel</span>
            </h4>
          </div>

          {selectedInvoice ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="font-bold text-slate-700">{selectedInvoice.buyerName}</span>
                <p className="text-slate-500 font-mono text-[11px]">Invoice ID: {selectedInvoice.id}</p>
                <div className="font-mono text-base font-extrabold text-[#0c2340] pt-1">
                  ₹{selectedInvoice.amount.toLocaleString('en-IN')}
                </div>
              </div>

              {/* Items Breakdown */}
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">Invoice Line Items</span>
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-1">
                  {selectedInvoice.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 truncate pr-2">{item.desc}</span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">₹{item.rate.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register PTP Form */}
              <form onSubmit={handleRegisterPtp} className="space-y-3 pt-2">
                <span className="font-bold text-xs text-slate-800 block">Record Promise-to-Pay (PTP)</span>
                
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Committed Pay Date</label>
                  <input
                    type="date"
                    value={ptpDateInput}
                    onChange={(e) => setPtpDateInput(e.target.value)}
                    required
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Negotiation Notes</label>
                  <textarea
                    value={ptpNoteInput}
                    onChange={(e) => setPtpNoteInput(e.target.value)}
                    placeholder="e.g. CFO confirmed payment clearance on Friday post-payroll batch"
                    rows={2}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isSubmitting ? "Recording PTP..." : "Register PTP Commitment"}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Building2 className="h-8 w-8 mx-auto text-slate-300" />
              <p className="text-xs">Select any invoice from the ledger to inspect line items or trigger an AI Chaser action.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

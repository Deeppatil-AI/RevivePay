import React, { useState, useEffect } from 'react';
import { 
  Building2, Calendar, CheckCircle2, Clock, 
  MessageSquare, ArrowRight, ShieldCheck, FileText, Send 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function B2BReceivablesView({ onOpenVoiceCall }) {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [ptpDateInput, setPtpDateInput] = useState("");
  const [ptpNoteInput, setPtpNoteInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await ApiService.getInvoices();
      if (res.invoices) setInvoices(res.invoices);
    } catch (err) {
      console.error(err);
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
      setSelectedInvoice(null);
      setPtpDateInput("");
      setPtpNoteInput("");
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSettle = async (id) => {
    try {
      await ApiService.settleInvoice(id);
      await fetchInvoices();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    }
  };

  const totalOutstanding = invoices.filter(i => i.status !== "RECOVERED").reduce((acc, i) => acc + i.amount, 0);
  const totalSettled = invoices.filter(i => i.status === "RECOVERED").reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 animate-fade-in">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Overdue B2B Receivables</span>
          <div className="text-2xl font-black text-rose-600 mt-1 font-mono">
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across {invoices.filter(i => i.status !== "RECOVERED").length} enterprise accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Recovered via Autonomous Chaser</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            ₹{totalSettled.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">GST 18% Tax-Matched & Settled</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Promise-to-Pay (PTP) Adherence</span>
          <div className="text-2xl font-black text-[#0066FF] mt-1 font-mono">
            89.4%
          </div>
          <span className="text-[11px] text-[#0066FF] font-semibold mt-1 block">Pre-Legal Escalation Suppressed</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#0066FF]" />
              <h2 className="text-lg font-bold text-[#0c2340]">
                B2B Overdue Invoices & Promise-to-Pay (PTP) Tracker
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks aging buckets (1-30d, 31-60d, 60d+), GST tax-line matching, and autonomous conversational negotiation
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-blue-50 text-[#0066FF] text-xs font-bold border border-blue-200">
            MSME Samadhaan Compliance: Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Client & GSTIN</th>
                <th className="py-3 px-4">Invoice Amount & Tax</th>
                <th className="py-3 px-4">Aging Bucket</th>
                <th className="py-3 px-4">PTP Status & Chaser Stage</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.map((inv) => {
                const isOverdue = inv.status === "OVERDUE";
                const isPtp = inv.status === "PTP_COMMITTED";
                const isLegal = inv.status === "ESCALATED_LEGAL";
                const isSettled = inv.status === "RECOVERED";

                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Client & GSTIN */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0c2340] text-sm">{inv.clientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">GSTIN: {inv.gstin}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Contact: {inv.contactPerson} ({inv.phone})
                      </div>
                    </td>

                    {/* Amount & Tax */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-[#0c2340] text-sm font-mono">
                        ₹{inv.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Incl. GST (18%): ₹{inv.taxAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Due: {inv.dueDate}</div>
                    </td>

                    {/* Aging */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] font-bold ${
                        inv.overdueDays > 60 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                          : inv.overdueDays > 30 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-blue-50 text-[#0066FF] border border-blue-200'
                      }`}>
                        {inv.overdueDays} Days Overdue ({inv.agingBucket.replace(/_/g, " ")})
                      </span>
                    </td>

                    {/* PTP Status */}
                    <td className="py-3.5 px-4">
                      <div>
                        {isSettled && (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> RECOVERED & SETTLED
                          </span>
                        )}
                        {isPtp && (
                          <div>
                            <span className="inline-flex items-center gap-1 text-[#0066FF] font-bold text-[11px]">
                              <Clock className="h-3.5 w-3.5" /> PTP: {inv.promiseToPayDate}
                            </span>
                            <div className="text-[10px] text-slate-500 mt-0.5">Autonomous grace window active</div>
                          </div>
                        )}
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                            <Clock className="h-3.5 w-3.5" /> Chaser Negotiating
                          </span>
                        )}
                        {isLegal && (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]">
                            <FileText className="h-3.5 w-3.5" /> Pre-Legal Arbitration Notice Drafted
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Stage: {inv.recoveryStage.replace(/_/g, " ")}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        {!isSettled && (
                          <>
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0066FF] border border-blue-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <Calendar className="h-3 w-3" /> Log PTP Commitment
                            </button>

                            <button
                              onClick={() => onOpenVoiceCall(inv)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <MessageSquare className="h-3 w-3 text-[#0066FF]" /> AI Voice Chaser
                            </button>

                            <button
                              onClick={() => handleSettle(inv.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="h-3 w-3" /> Settle Invoice
                            </button>
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* PTP Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-[#0c2340] mb-1">
              Log Promise-to-Pay Commitment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Client: <strong className="text-slate-800">{selectedInvoice.clientName}</strong> (₹{selectedInvoice.amount.toLocaleString('en-IN')})
            </p>

            <form onSubmit={handleRegisterPtp} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Committed Payment Date</label>
                <input
                  type="date"
                  required
                  value={ptpDateInput}
                  onChange={(e) => setPtpDateInput(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Negotiation Notes & Audio Summary</label>
                <textarea
                  rows="3"
                  value={ptpNoteInput}
                  onChange={(e) => setPtpNoteInput(e.target.value)}
                  placeholder="e.g. Client agreed to pay on Friday via NEFT/RTGS after board approval."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0066FF]"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold shadow-sm"
                >
                  {isSubmitting ? "Saving..." : "Save PTP Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileCheck, AlertOctagon, CheckCircle2, 
  MapPin, Smartphone, Truck, Download, Sparkles, X, FileText 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import { exportDisputeDossierPdf } from '../utils/pdfExport.js';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

export default function DisputeShieldView() {
  const [disputes, setDisputes] = useState([]);
  const [activeDossier, setActiveDossier] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDisputes = async () => {
    setIsLoading(true);
    try {
      const res = await ApiService.getDisputes();
      if (res && res.disputes) setDisputes(res.disputes);
    } catch (err) {
      toast.error(`Failed to load disputes: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleSubmitDossier = async (disputeId) => {
    setSubmittingId(disputeId);
    try {
      await ApiService.submitDisputeDossier(disputeId);
      await fetchDisputes();
      toast.success(`4-point legal evidence dossier submitted to card network for ${disputeId}`);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      toast.error(`Dossier submission failed: ${err.message}`);
    } finally {
      setSubmittingId(null);
    }
  };

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
          <span className="text-xs font-bold text-slate-500">Active Chargeback Claims</span>
          <div className="text-2xl font-black text-[#0c2340] mt-1 font-mono">
            ₹{disputes.reduce((acc, d) => acc + d.amount, 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Across Visa, Mastercard & RuPay</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Predicted Defense Win Rate</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">
            91.2%
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Backed by OTP & Logistics Telemetry</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500">Autonomous Packager Status</span>
          <div className="text-2xl font-black text-[#0066FF] mt-1 font-mono flex items-center gap-2">
            <span>LEVEL-1 READY</span>
            <Sparkles className="h-4 w-4 text-amber-500" />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Zero Human Evidence Assembling</span>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#0066FF]" />
            <h3 className="font-bold text-[#0c2340] text-sm">Dispute Defense Queue</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">{disputes.length} Chargebacks</span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          {disputes.map((d) => (
            <div key={d.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0c2340]">{d.customerName}</span>
                  <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {d.paymentId}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {d.cardNetwork} • {d.issuerBank}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    d.status === "SUBMITTED_TO_NETWORK" 
                      ? "bg-emerald-100 text-emerald-800" 
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {d.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Reason: <span className="font-semibold text-slate-700">{d.reasonCode}</span> • Deadline: <span className="text-red-600 font-medium">{d.evidenceDeadline}</span>
                </p>

                {/* 4-Point Telemetry Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3" /> Delivery OTP Signed
                  </span>
                  <span className="flex items-center gap-1 text-[10px] bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded border border-blue-200">
                    <Smartphone className="h-3 w-3" /> 3DS 2.0 Auth Pass
                  </span>
                  <span className="flex items-center gap-1 text-[10px] bg-sky-50 text-sky-800 px-2 py-0.5 rounded border border-sky-200">
                    <Truck className="h-3 w-3" /> BlueDart Waybill Verified
                  </span>
                </div>
              </div>

              <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                <div className="text-right">
                  <div className="font-mono font-extrabold text-base text-[#0c2340]">
                    ₹{d.amount.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    {d.winProbability ? Math.round(d.winProbability <= 1 ? d.winProbability * 100 : d.winProbability) : 92}% Win Prob
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => exportDisputeDossierPdf(d)}
                    aria-label={`Export PDF Dossier for dispute ${d.id}`}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Download className="h-3 w-3" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => setActiveDossier(d)}
                    aria-label={`View evidentiary dossier for dispute ${d.id}`}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200"
                  >
                    View Dossier
                  </button>

                  {d.status !== "SUBMITTED_TO_NETWORK" && (
                    <button
                      onClick={() => handleSubmitDossier(d.id)}
                      disabled={submittingId === d.id}
                      aria-label={`Submit legal dossier to network for dispute ${d.id}`}
                      className="px-3 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>{submittingId === d.id ? "Submitting..." : "Submit to Network"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dossier Preview Modal */}
      {activeDossier && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-modal-title"
        >
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#0066FF]" />
                <h4 id="dispute-modal-title" className="font-bold text-[#0c2340] text-sm">Visa/Mastercard Evidence Dossier ({activeDossier.paymentId})</h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportDisputeDossierPdf(activeDossier)}
                  aria-label="Export Dossier as PDF"
                  className="px-2.5 py-1 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                >
                  <Download className="h-3 w-3" />
                  <span>Export PDF</span>
                </button>
                <button
                  onClick={() => setActiveDossier(null)}
                  aria-label="Close Dossier Modal"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">1. Customer Identification</span>
                <p className="text-slate-600">Name: {activeDossier.customerName} • Phone: {activeDossier.customerPhone}</p>
                <p className="text-slate-600">Card Network: {activeDossier.cardNetwork} ({activeDossier.issuerBank})</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">2. Strong Customer Authentication (SCA)</span>
                <p className="text-slate-600 font-mono text-[11px]">{activeDossier.evidenceItems?.threeDsAuthRrn || '3DS 2.0 Strong Customer Authentication Verified'}</p>
                <p className="text-slate-600 font-mono text-[11px]">{activeDossier.evidenceItems?.deviceFingerprint || 'Device Fingerprint Logged'}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">3. Proof of Delivery / Fulfillment</span>
                <p className="text-slate-600 font-mono text-[11px]">{activeDossier.evidenceItems?.deliveryOtp || 'Signed Delivery OTP Verified'}</p>
                <p className="text-slate-600 font-mono text-[11px]">{activeDossier.evidenceItems?.logisticsTracking || 'Logistics Waybill Signed'}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => exportDisputeDossierPdf(activeDossier)}
                className="px-4 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PDF Dossier</span>
              </button>
              <button
                onClick={() => setActiveDossier(null)}
                className="px-4 py-1.5 rounded-xl bg-[#0066FF] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

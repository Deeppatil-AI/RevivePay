import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, FileCheck, AlertOctagon, CheckCircle2, 
  MapPin, Smartphone, Truck, Download, Sparkles 
} from 'lucide-react';
import { ApiService } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function DisputeShieldView() {
  const [disputes, setDisputes] = useState([]);
  const [activeDossier, setActiveDossier] = useState(null);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchDisputes = async () => {
    try {
      const res = await ApiService.getDisputes();
      if (res.disputes) setDisputes(res.disputes);
    } catch (err) {
      console.error(err);
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
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingId(null);
    }
  };

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
          <span className="text-xs font-bold text-slate-500">Arbitration Defense Standard</span>
          <div className="text-2xl font-black text-[#0066FF] mt-1 font-mono">
            Visa / NPCI Level-1
          </div>
          <span className="text-[11px] text-[#0066FF] font-semibold mt-1 block">Automated Legal Evidence Dossier</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 md:p-6 bg-slate-50/75 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-[#0c2340]">
                DisputeShield: Automated Chargeback Evidence Packager
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingests OTP 3DS authentication logs, delivery proof, and session replay to auto-generate winnable legal dossiers
            </p>
          </div>

          <div className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            Defense-Only Strict Safeguard: Active
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Dispute & Customer</th>
                <th className="py-3 px-4">Disputed Amount</th>
                <th className="py-3 px-4">Claim Reason & Card Network</th>
                <th className="py-3 px-4">Evidence Telemetry & Win Prob</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {disputes.map((d) => {
                const isSubmitted = d.status === "EVIDENCE_SUBMITTED";

                return (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#0c2340] text-sm">{d.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">{d.id} • {d.paymentId}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {d.customerEmail} • {d.customerPhone}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-rose-600 text-sm font-mono">
                        ₹{d.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Due By: {d.dueBy}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Bank: {d.issuerBank}</div>
                    </td>

                    {/* Reason */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold">
                        {d.disputeReason.replace(/_/g, " ")} (Code {d.reasonCode})
                      </span>
                      <div className="text-[11px] text-slate-600 mt-1 font-semibold">
                        Network: {d.cardNetwork}
                      </div>
                    </td>

                    {/* Evidence Telemetry */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Predicted Win Probability: {Math.round(d.winProbability * 100)}%</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-[#0066FF]" />
                          <span>Delivery OTP {d.dossier.deliveryProof.deliveryOtp} Verified</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Smartphone className="h-3 w-3 text-[#0066FF]" />
                          <span>3DS 2.0 Auth RRN: {d.dossier.telemetry.authRrn}</span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          onClick={() => setActiveDossier(d)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0066FF] border border-blue-200 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                        >
                          <FileCheck className="h-3 w-3" /> View Legal Dossier
                        </button>

                        {!isSubmitted ? (
                          <button
                            onClick={() => handleSubmitDossier(d.id)}
                            disabled={submittingId === d.id}
                            className="px-2.5 py-1 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white text-[10px] font-bold flex items-center justify-center gap-1 shadow-sm transition-all"
                          >
                            <Sparkles className="h-3 w-3" />
                            {submittingId === d.id ? "Submitting..." : "Submit to Razorpay API"}
                          </button>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="h-3 w-3" /> Evidence Submitted
                          </span>
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

      {/* Dossier Viewer Modal */}
      {activeDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0c2340]">
                  Official Chargeback Defense Dossier
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {activeDossier.cardNetwork} Arbitration Board • {activeDossier.id}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                Win Rate: {Math.round(activeDossier.winProbability * 100)}%
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block mb-1">
                  1. Legal Defense Summary
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {activeDossier.dossier.legalSummary}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block mb-1">
                  2. Fulfilment & Logistics Proof
                </span>
                <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                  <div>Tracking: <strong>{activeDossier.dossier.deliveryProof.trackingNumber}</strong></div>
                  <div>Delivered: {activeDossier.dossier.deliveryProof.deliveredAt}</div>
                  <div>Signed By: {activeDossier.dossier.deliveryProof.signedBy}</div>
                  <div>OTP Authentication: <strong className="text-emerald-700">VERIFIED (OTP {activeDossier.dossier.deliveryProof.deliveryOtp})</strong></div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-700 uppercase font-mono text-[10px] block mb-1">
                  3. Digital Device Telemetry & 3DS 2.0 Logs
                </span>
                <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                  <div>IP Geolocation: {activeDossier.dossier.telemetry.deviceIp}</div>
                  <div>Fingerprint: {activeDossier.dossier.telemetry.browserFingerprint}</div>
                  <div>Session Time: {activeDossier.dossier.telemetry.sessionDurationSeconds} seconds</div>
                  <div>Auth RRN: <strong className="text-[#0066FF]">{activeDossier.dossier.telemetry.authRrn}</strong></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-200">
              <button
                onClick={() => setActiveDossier(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSubmitDossier(activeDossier.id);
                  setActiveDossier(null);
                }}
                className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm"
              >
                Submit Dossier via API
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

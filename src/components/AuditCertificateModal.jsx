import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Download, Printer, CheckCircle2, 
  Award, QrCode, Lock, FileText 
} from 'lucide-react';
import { ApiService } from '../services/api.js';

export default function AuditCertificateModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [cert, setCert] = useState(null);

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const res = await ApiService.getAuditCertificate();
        if (res && res.certificate) setCert(res.certificate);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCert();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-300 w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-[#0066FF]" />
            <span className="font-bold text-sm text-[#0c2340]">Official Statutory Audit Dossier</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Certificate</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-xs font-sans print:p-0">
          
          {/* Certificate Header Banner */}
          <div className="text-center pb-6 border-b-2 border-[#0c2340] space-y-1.5">
            <div className="h-12 w-12 mx-auto rounded-xl bg-[#0c2340] flex items-center justify-center text-white font-bold mb-2 shadow-md">
              <ShieldCheck className="h-7 w-7 text-[#0066FF]" />
            </div>
            <h2 className="text-xl font-black text-[#0c2340] tracking-tight uppercase">
              Statutory Certificate of e-Mandate Compliance & Revenue Recovery
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              In accordance with Reserve Bank of India Circular RBI/2020-21/74 & NPCI AutoPay Framework
            </p>
          </div>

          {cert ? (
            <div className="space-y-4">
              
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Certificate Identifier</span>
                  <span className="font-bold text-[#0c2340] text-sm">{cert.certificateId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Issued To</span>
                  <span className="font-bold text-slate-800">{cert.issuedTo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Issuance Timestamp</span>
                  <span className="text-slate-700">{new Date(cert.issuedAt).toLocaleString('en-IN')} IST</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Regulatory Validity</span>
                  <span className="font-bold text-emerald-700">Active (Valid until {cert.validUntil})</span>
                </div>
              </div>

              {/* Compliance Metrics */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700 font-mono text-[11px] uppercase">
                  Audited Cohort Metrics & Safe-Stopping Rules
                </div>
                <div className="p-4 grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Audited Transactions</span>
                    <span className="text-base font-black text-slate-900 font-mono">{cert.metrics.totalAuditedTransactions}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Net Recovered Revenue</span>
                    <span className="text-base font-black text-emerald-600 font-mono">₹{cert.metrics.totalRecoveredRupees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">Cooling Period Pass Rate</span>
                    <span className="text-base font-black text-[#0066FF] font-mono">{cert.metrics.coolingPeriodAdherence}</span>
                  </div>
                </div>
              </div>

              {/* Merkle Root Hash */}
              <div className="p-3 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Cryptographic Merkle Root Hash</span>
                <div className="break-all font-bold">{cert.metrics.merkleRootHash}</div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                {cert.verificationSignatures.map((sig, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{sig.status}</span>
                    </div>
                    <div className="font-bold text-slate-800">{sig.authority}</div>
                    <div className="text-[9px] text-slate-400 font-mono truncate">{sig.signature}</div>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 font-mono">
              Loading cryptographic certificate data...
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

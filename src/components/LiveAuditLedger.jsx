import React, { useState } from 'react';
import { 
  Activity, ShieldCheck, ShieldAlert, AlertTriangle, 
  CheckCircle2, Terminal, Copy, Check, Download 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveAuditLedger({ auditLogs }) {
  const [copiedId, setCopiedId] = useState(null);
  const [filterType, setFilterType] = useState("ALL");

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = (auditLogs || []).filter(log => {
    if (filterType === "ALL") return true;
    if (filterType === "APPROVED") return log.policyStatus === "APPROVED";
    if (filterType === "ESCALATED") return log.policyStatus === "ESCALATED";
    if (filterType === "STOPPED") return log.policyStatus === "BLOCKED";
    return true;
  });

  const handleDownloadCsv = () => {
    if (!filteredLogs.length) {
      toast.error('No ledger records available to export.');
      return;
    }

    try {
      const headers = ['Timestamp', 'Txn ID', 'Customer Name', 'Merchant', 'Diagnosis Category', 'Policy Status', 'Action Type', 'Action Detail', 'Audit Token'];
      const rows = filteredLogs.map(l => [
        `"${new Date(l.timestamp).toISOString()}"`,
        `"${l.txnId || ''}"`,
        `"${(l.customerName || '').replace(/"/g, '""')}"`,
        `"${(l.merchant || '').replace(/"/g, '""')}"`,
        `"${(l.diagnosis?.rootCauseCategory || '').replace(/"/g, '""')}"`,
        `"${l.policyStatus || ''}"`,
        `"${l.actionType || ''}"`,
        `"${(l.actionDetail || '').replace(/"/g, '""')}"`,
        `"${l.auditToken || ''}"`
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const filename = `revivepay_audit_ledger_${Date.now()}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${filteredLogs.length} ledger rows to ${filename}`);
    } catch (err) {
      toast.error(`CSV export failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Ledger Header */}
        <div className="p-4 md:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#0066FF]" />
              <h2 className="text-lg font-bold text-[#0c2340] tracking-tight">
                Explainable Decision Trail & Regulatory Audit Ledger
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Cryptographically stamped logs of every diagnosis, policy boundary evaluation, and dispatch
            </p>
          </div>

          {/* Action Tools: CSV Export & Filter Pills */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadCsv}
              aria-label="Download Visible Audit Ledger as CSV"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Download className="h-3.5 w-3.5 text-[#0066FF]" />
              <span>Download CSV</span>
            </button>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-200/70 border border-slate-200 p-1 rounded-xl text-xs">
              {["ALL", "APPROVED", "ESCALATED", "STOPPED"].map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFilterType(ft)}
                  aria-label={`Filter audit ledger by ${ft}`}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filterType === ft
                      ? 'bg-[#0066FF] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ledger Stream */}
        <div className="p-4 md:p-6 divide-y divide-slate-200 space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Activity className="h-8 w-8 text-slate-300 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-bold text-[#0c2340]">No agent decisions logged yet.</p>
              <p className="text-xs text-slate-500 mt-1">Start the batch runner on the main tab to see live decision telemetry.</p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isApproved = log.policyStatus === "APPROVED";
              const isEscalated = log.policyStatus === "ESCALATED";

              return (
                <div key={log.id} className="pt-4 first:pt-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    
                    {/* Timestamp & Txn */}
                    <div className="flex items-center gap-2.5">
                      {isApproved && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                      {isEscalated && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
                      {!isApproved && !isEscalated && <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />}

                      <span className="font-mono text-xs font-bold text-[#0c2340]">
                        {log.txnId}
                      </span>
                      <span className="text-slate-600 text-xs font-bold">
                        ({log.customerName} • {log.merchant})
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium">
                        {new Date(log.timestamp).toLocaleTimeString('en-IN')}
                      </span>
                    </div>

                    {/* Cryptographic Hash Token */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-600 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                        Token: {log.auditToken}
                      </span>
                      <button
                        onClick={() => copyToClipboard(log.auditToken, log.id)}
                        className="p-1 text-slate-400 hover:text-slate-700"
                        title="Copy Audit Hash"
                      >
                        {copiedId === log.id ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>

                  </div>

                  {/* Explainable Decision Details */}
                  <div className="mt-2.5 grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs">
                    
                    {/* Column 1: Diagnosis */}
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider mb-1">
                        1. Telemetry Diagnosis
                      </div>
                      <div className="font-bold text-[#0c2340]">
                        {log.diagnosis.rootCauseCategory.replace(/_/g, " ")}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {log.diagnosis.detailedRationale}
                      </p>
                    </div>

                    {/* Column 2: Policy Boundary & Governance */}
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider mb-1">
                        2. Policy Gating Evaluation
                      </div>
                      <div className={`font-bold ${
                        isApproved ? 'text-emerald-700' : isEscalated ? 'text-amber-700' : 'text-rose-700'
                      }`}>
                        {log.policyStatus}: {log.policy.discountReason || log.policy.reason || "Evaluated against bounds"}
                      </div>
                      {log.policy.appliedDiscount > 0 && (
                        <div className="text-[11px] text-emerald-800 font-mono mt-0.5 font-bold">
                          Approved Retention Incentive: ₹{log.policy.appliedDiscount} (Payable: ₹{log.policy.finalPayableAmount})
                        </div>
                      )}
                    </div>

                    {/* Column 3: Executed Action & Dispatch */}
                    <div>
                      <div className="text-[10px] uppercase font-mono text-slate-500 font-bold tracking-wider mb-1">
                        3. Razorpay Dispatch
                      </div>
                      <div className="font-bold text-[#0066FF] font-mono">
                        {log.actionType}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {log.actionDetail}
                      </p>
                      {log.paymentLink && (
                        <a 
                          href={log.paymentLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#0066FF] hover:underline font-mono text-[10px] block mt-1 font-semibold"
                        >
                          {log.paymentLink}
                        </a>
                      )}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

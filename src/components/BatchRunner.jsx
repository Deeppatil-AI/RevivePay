import React, { useState, useRef } from 'react';
import { 
  Play, Pause, FastForward, StepForward, Filter, Search, 
  MessageSquare, ShieldAlert, CheckCircle, Clock, 
  AlertTriangle, ArrowUpRight, Sparkles, Upload, RotateCcw 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function BatchRunner({
  transactions,
  isRunning,
  onStartBatch,
  onPauseBatch,
  onStepBatch,
  onRunAllInstantly,
  onResetBatch,
  simulationSpeed,
  setSimulationSpeed,
  onOpenHinglishChat,
  onOpenTransactionDetails,
  onDirectTestPay,
  onImportCustomTxns
}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        if (lines.length <= 1) {
          toast.error("CSV file is empty or missing headers");
          return;
        }

        const newTxns = lines.slice(1).map((line, idx) => {
          const parts = line.split(',').map(p => p.replace(/^"|"$/g, '').trim());
          const customerName = parts[0] || `Customer ${idx + 1}`;
          const amount = Number(parts[1]) || 1999;
          const bank = parts[2] || "SBI";
          const failureCode = parts[3] || "NPCI_U30";
          const merchant = parts[4] || "Razorpay Enterprise Merchant";
          const planName = parts[5] || "Annual AutoPay";

          return {
            id: `txn_csv_${Date.now()}_${idx}`,
            mandateId: `man_csv_${Date.now()}_${idx}`,
            rrn: `33819${Math.floor(100000 + Math.random() * 900000)}`,
            customerName,
            phone: "+91 98765 43210",
            email: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
            city: "Mumbai",
            merchant,
            category: "SAAS_B2B",
            merchantCategory: "SAAS_B2B",
            planName,
            amount,
            bank,
            ifsc: `${bank}0001234`,
            customerLtv: Math.max(amount * 4, 8000),
            mandateLimit: amount * 2,
            retryCount: 1,
            failureCode,
            failureName: failureCode === 'NPCI_U30' ? "Bank CBS Outage" : "Insufficient Liquidity",
            failureCategory: "INFRASTRUCTURE",
            failureReason: `Imported via CSV: ${failureCode}`,
            failedAt: new Date().toISOString(),
            recoveryResult: null
          };
        });

        if (onImportCustomTxns) {
          onImportCustomTxns(newTxns);
        }
        toast.success(`Imported ${newTxns.length} custom transactions from CSV!`);
      } catch (err) {
        toast.error(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const categories = [
    { id: "ALL", label: "All Sectors" },
    { id: "OTT_MEDIA", label: "OTT & Media" },
    { id: "SAAS_B2B", label: "B2B SaaS" },
    { id: "EDTECH", label: "EdTech" },
    { id: "BFSI_EMI", label: "BFSI / EMI" },
    { id: "FITNESS", label: "Fitness" }
  ];

  const filteredTxns = transactions.filter((t) => {
    const txnCat = t.category || t.merchantCategory;
    const matchesCat = selectedCategory === "ALL" || txnCat === selectedCategory;
    const matchesStatus = 
      selectedStatus === "ALL" || 
      (t.recoveryResult && t.recoveryResult.status === selectedStatus) ||
      (selectedStatus === "PENDING" && !t.recoveryResult);
    const matchesSearch = 
      t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bank.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12">
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Control Bar Header */}
        <div className="p-4 md:p-6 bg-slate-50/80 border-b border-slate-200 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-[#0c2340] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#0066FF]" />
              Batch Execution Simulator (Subscriptions & Mandates)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates autonomous multi-agent pipeline executing across real Indian subscription cohorts
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <button
                onClick={onStartBatch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-sm transition-all"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                Run Batch Auto-Pilot
              </button>
            ) : (
              <button
                onClick={onPauseBatch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-extrabold transition-all"
              >
                <Pause className="h-3.5 w-3.5 fill-black" />
                Pause Execution
              </button>
            )}

            <button
              onClick={onStepBatch}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-700 text-xs font-bold border border-slate-300 transition-all shadow-sm"
            >
              <StepForward className="h-3.5 w-3.5" />
              Step (1 Txn)
            </button>

            <button
              onClick={onRunAllInstantly}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#0066FF] text-xs font-bold border border-blue-200 transition-all shadow-sm"
            >
              <FastForward className="h-3.5 w-3.5" />
              Instant Full Batch
            </button>

            {onResetBatch && (
              <button
                onClick={onResetBatch}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                Reset Cohort
              </button>
            )}

            <button
              onClick={() => fileInputRef.current?.click()}
              aria-label="Upload custom CSV cohort"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all shadow-sm"
            >
              <Upload className="h-3.5 w-3.5 text-purple-600" />
              Import CSV
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCsvUpload}
              accept=".csv"
              className="hidden"
            />

            {/* Speed Selector */}
            <div className="flex items-center bg-slate-200/80 border border-slate-300 rounded-xl p-1 text-xs font-mono">
              <span className="px-2 text-slate-600 text-[10px] font-bold">Speed:</span>
              {[1, 2, 5].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-2 py-0.5 rounded-lg text-xs transition-all ${
                    simulationSpeed === spd
                      ? 'bg-[#0066FF] text-white font-bold'
                      : 'text-slate-700 hover:text-black'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-[11px] text-slate-500 font-bold mr-1 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              aria-label="Search transactions by customer, merchant, or bank"
              placeholder="Search customer, merchant, bank..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#0066FF] shadow-xs"
            />
          </div>

        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/90 text-slate-600 uppercase font-mono text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer & Merchant</th>
                <th className="py-3 px-4">Plan & Amount</th>
                <th className="py-3 px-4">Failure Telemetry</th>
                <th className="py-3 px-4">AI Diagnosis & Strategy</th>
                <th className="py-3 px-4">Policy Gating</th>
                <th className="py-3 px-4 text-right">Status & Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No transactions match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((txn) => {
                  const res = txn.recoveryResult;
                  const isRecovered = res && res.status === "RECOVERED";
                  const isRescheduled = res && res.status === "RESCHEDULED";
                  const isEscalated = res && res.status === "ESCALATED";
                  const isBlocked = res && res.status === "BLOCKED";

                  return (
                    <tr 
                      key={txn.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isRecovered ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Customer & Merchant */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div className="flex items-start gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                            {txn.customerName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-[#0c2340] flex items-center gap-1.5">
                              {txn.customerName}
                              <span className="text-[10px] text-slate-500 font-mono font-normal">({txn.city})</span>
                            </div>
                            <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                              <span className="font-semibold text-slate-800">{txn.merchant}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              LTV: ₹{txn.customerLtv?.toLocaleString('en-IN') || '24,000'} • {txn.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Plan & Amount */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <div className="font-extrabold text-[#0c2340] text-sm font-mono">
                          ₹{txn.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium truncate max-w-[140px]" title={txn.planName}>
                          {txn.planName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Limit: ₹{txn.mandateLimit?.toLocaleString('en-IN')}
                        </div>
                      </td>

                      {/* Failure Telemetry */}
                      <td className="py-3.5 px-4 min-w-[160px]">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[10px] font-bold">
                            {txn.failureCode}
                          </span>
                          <span className="text-slate-800 font-bold font-mono text-[11px]">
                            {txn.bank}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 max-w-xs truncate font-medium" title={txn.failureReason || txn.notes}>
                          {txn.failureReason || txn.notes}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          Attempt #{txn.retryCount || 1} of 3
                        </div>
                      </td>

                      {/* AI Diagnosis & Strategy */}
                      <td className="py-3.5 px-4 min-w-[180px]">
                        {res ? (
                          <div>
                            <div className="text-[11px] font-bold text-[#0c2340] flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0066FF]"></span>
                              {res.diagnosis.rootCauseCategory.replace(/_/g, " ")}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 max-w-xs line-clamp-1" title={res.diagnosis.detailedRationale}>
                              {res.diagnosis.detailedRationale}
                            </div>
                            <div className="text-[10px] text-[#0066FF] font-mono mt-1 font-bold">
                              Strategy: {res.diagnosis.recommendedStrategy.replace(/_/g, " ")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Awaiting Auto-Pilot...</span>
                        )}
                      </td>

                      {/* Policy Gating */}
                      <td className="py-3.5 px-4 min-w-[150px]">
                        {res ? (
                          <div>
                            {res.policy.actionApproved ? (
                              <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span>Policy Approved</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px]">
                                <ShieldAlert className="h-3.5 w-3.5" />
                                <span>{res.policy.guardrailTriggered || "Gated Action"}</span>
                              </div>
                            )}
                            {res.policy.appliedDiscount > 0 && (
                              <div className="text-[10px] text-emerald-800 font-mono mt-0.5 font-bold">
                                -₹{res.policy.appliedDiscount} Incentive Applied
                              </div>
                            )}
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]" title={res.policy.auditToken}>
                              {res.policy.auditToken}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Status & Actions */}
                      <td className="py-3.5 px-4 text-right min-w-[190px]">
                        <div className="flex flex-col items-end gap-1.5">
                          {isRecovered && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle className="h-3 w-3" /> RECOVERED (₹{txn.amount})
                            </span>
                          )}
                          {isRescheduled && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-200 text-[10px] font-bold">
                              <Clock className="h-3 w-3" /> RESCHEDULED (08:15 AM)
                            </span>
                          )}
                          {isEscalated && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                              <AlertTriangle className="h-3 w-3" /> HUMAN ESCALATED
                            </span>
                          )}
                          {isBlocked && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                              <ShieldAlert className="h-3 w-3" /> STOPPED (NPCI)
                            </span>
                          )}
                          {!res && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                              PENDING
                            </span>
                          )}

                          {/* Action Buttons in a clean group */}
                          <div className="flex items-center gap-1 mt-0.5">
                            <button
                              onClick={() => onOpenHinglishChat(txn)}
                              aria-label={`Open WhatsApp recovery outreach for ${txn.customerName}`}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0066FF] border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <MessageSquare className="h-3 w-3" />
                              WhatsApp
                            </button>

                            <button
                              onClick={() => onOpenTransactionDetails(txn)}
                              aria-label={`View transaction details for ${txn.id}`}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold flex items-center gap-1 transition-all"
                            >
                              <ArrowUpRight className="h-3 w-3" />
                              Details
                            </button>

                            {!isRecovered && (
                              <button
                                onClick={() => onDirectTestPay(txn)}
                                aria-label={`Execute test payment for ${txn.customerName}`}
                                className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-bold transition-all"
                              >
                                Test Pay
                              </button>
                            )}
                          </div>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}

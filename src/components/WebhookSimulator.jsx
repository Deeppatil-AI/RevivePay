import React, { useState } from 'react';
import { Radio, Send, CheckCircle2, Terminal, Code2, Sparkles, RefreshCw } from 'lucide-react';
import { ApiService } from '../services/api.js';

export default function WebhookSimulator({ onWebhookDispatched }) {
  const [eventType, setEventType] = useState("payment.failed");
  const [customerName, setCustomerName] = useState("Rohan Sharma");
  const [amount, setAmount] = useState(2999);
  const [bank, setBank] = useState("SBI");
  const [failureCode, setFailureCode] = useState("NPCI_U30");
  const [merchant, setMerchant] = useState("StreamFlix India");
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);

  const failureOptions = [
    { code: "NPCI_U30", label: "NPCI_U30 (Issuer Bank CBS Server Downtime / Midnight Batch Lock)" },
    { code: "NPCI_ZM", label: "NPCI_ZM (Insufficient Funds / Month-End Balance Crunch)" },
    { code: "NPCI_U28", label: "NPCI_U28 (Mandate Limit or Frequency Cap Breached)" },
    { code: "RAZOR_EXP_01", label: "RAZOR_EXP_01 (3DS OTP Dropped / Card Session Timeout)" }
  ];

  const handleSimulate = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await ApiService.simulateWebhook({
        eventType,
        customerName,
        amount: Number(amount),
        bank,
        failureCode,
        merchant,
        planName: "4K UHD Annual AutoPay"
      });
      setLastResponse(res);
      if (onWebhookDispatched) onWebhookDispatched();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 pb-12 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Header */}
        <div className="p-4 md:p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-[#0066FF] animate-pulse" />
              <h2 className="text-lg font-bold text-[#0c2340]">
                Live Webhook Ingestion & Custom Event Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulates real-time Razorpay Webhook delivery (`/api/webhooks/razorpay`) and triggers autonomous Sentinel Agent workflows
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-[#0066FF] font-mono font-semibold">
            Webhook Endpoint: :5000/api/webhooks/razorpay
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Form Column */}
          <form onSubmit={handleSimulate} className="lg:col-span-6 space-y-4 text-xs">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Webhook Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="payment.failed">payment.failed</option>
                  <option value="subscription.halted">subscription.halted</option>
                  <option value="mandate.notification_failed">mandate.notification_failed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Issuer Bank</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                >
                  <option value="SBI">State Bank of India (SBI)</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="AXIS">Axis Bank</option>
                  <option value="PNB">Punjab National Bank (PNB)</option>
                  <option value="KOTAK">Kotak Mahindra Bank</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ticket Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">NPCI / Gateway Failure Error Code</label>
              <select
                value={failureCode}
                onChange={(e) => setFailureCode(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
              >
                {failureOptions.map((opt) => (
                  <option key={opt.code} value={opt.code}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Merchant Account</label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:border-[#0066FF]"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full py-3 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Send className="h-4 w-4" />
              {isSending ? "Dispatching Webhook to Agent..." : "Trigger Simulated Webhook Event"}
            </button>

          </form>

          {/* Response Payload Column */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Code2 className="h-4 w-4 text-[#0066FF]" />
                Backend Agent Execution Output
              </span>
              <span className="text-[10px] font-mono text-slate-400">JSON Payload</span>
            </div>

            <div className="flex-1 bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-auto max-h-[340px] border border-slate-800 shadow-inner">
              {lastResponse ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(lastResponse, null, 2)}</pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <Terminal className="h-8 w-8 mb-2 text-slate-700" />
                  <p>Awaiting custom webhook dispatch...</p>
                  <p className="text-[10px] text-slate-600 mt-1">Configure event parameters on the left and trigger to see live agent resolution.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

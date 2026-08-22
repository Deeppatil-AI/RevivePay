import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Smartphone, CreditCard, Landmark, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function DirectCheckoutModal({ txn, onClose, onSuccess }) {
  if (!txn) return null;

  const [activeMethod, setActiveMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const discount = txn.recoveryResult?.policy?.appliedDiscount || 0;
  const payableAmount = txn.amount - discount;

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsDone(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        if (onSuccess) onSuccess(txn.id, payableAmount);
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#ffffff] text-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative font-sans">
        
        {/* Razorpay Standard Checkout Header */}
        <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-bold text-white text-sm">
              ₹
            </div>
            <div>
              <div className="font-bold text-sm leading-tight">{txn.merchant}</div>
              <div className="text-[11px] text-sky-200">Razorpay Trusted Business</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-sky-200">Amount to Pay</div>
            <div className="font-extrabold text-base text-white">₹{payableAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {isDone ? (
          <div className="p-8 text-center bg-white">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Payment ID: pay_{Math.random().toString(36).substring(2, 11)}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-2">
              Subscription renewed for {txn.customerName}
            </p>
          </div>
        ) : (
          <div className="p-5 bg-slate-50">
            
            {/* Payment Method Selector */}
            <div className="flex gap-2 mb-4 bg-slate-200 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveMethod("upi")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "upi" ? 'bg-white text-[#0c2340] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-[#3395FF]" />
                UPI / QR
              </button>
              <button
                onClick={() => setActiveMethod("card")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "card" ? 'bg-white text-[#0c2340] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-[#3395FF]" />
                Cards
              </button>
              <button
                onClick={() => setActiveMethod("netbanking")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "netbanking" ? 'bg-white text-[#0c2340] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Landmark className="h-3.5 w-3.5 text-[#3395FF]" />
                Netbanking
              </button>
            </div>

            {/* Method Details */}
            {activeMethod === "upi" && (
              <div className="space-y-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-bold text-slate-800 mb-2">Select UPI App</div>
                  <div className="grid grid-cols-4 gap-2">
                    {["Google Pay", "PhonePe", "Paytm", "CRED"].map((app) => (
                      <div
                        key={app}
                        onClick={handlePayNow}
                        className="p-2.5 rounded-lg border border-slate-200 hover:border-[#3395FF] hover:bg-sky-50 text-center cursor-pointer transition-all"
                      >
                        <div className="h-6 w-6 rounded-full bg-slate-100 mx-auto mb-1 flex items-center justify-center text-[10px] font-bold text-slate-700">
                          {app.charAt(0)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 block truncate">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 text-center">
                  <div className="text-xs font-semibold text-slate-700 mb-1">Scan UPI QR to Pay</div>
                  <div className="w-24 h-24 bg-slate-100 border border-dashed border-slate-300 rounded-lg mx-auto flex items-center justify-center text-slate-400">
                    <QrCode className="h-12 w-12 text-[#0c2340]" />
                  </div>
                </div>
              </div>
            )}

            {activeMethod === "card" && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Card Number (4111 2222 3333 4444)"
                  className="w-full p-2 border border-slate-300 rounded-lg text-slate-900"
                  defaultValue="4111 2222 3333 4444"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="p-2 border border-slate-300 rounded-lg text-slate-900"
                    defaultValue="12/28"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    className="p-2 border border-slate-300 rounded-lg text-slate-900"
                    defaultValue="123"
                  />
                </div>
              </div>
            )}

            {activeMethod === "netbanking" && (
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs">
                <select className="w-full p-2 border border-slate-300 rounded-lg text-slate-900">
                  <option>HDFC Bank</option>
                  <option>State Bank of India</option>
                  <option>ICICI Bank</option>
                  <option>Axis Bank</option>
                  <option>Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full mt-4 py-3 rounded-xl bg-[#0c2340] hover:bg-[#143863] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="h-4 w-4 text-[#3395FF]" />
              {isProcessing ? "Processing Securely..." : `Pay ₹${payableAmount.toLocaleString('en-IN')}`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Secured by Razorpay • 256-bit Encryption</span>
            </div>

          </div>
        )}

        {/* Close button on top right */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 text-slate-300 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

      </div>
    </div>
  );
}

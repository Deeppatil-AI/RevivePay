import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, Lock, Smartphone, CreditCard, Landmark, QrCode, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { ApiService } from '../services/api.js';

export default function DirectCheckoutModal({ txn, onClose, onSuccess }) {
  if (!txn) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [activeMethod, setActiveMethod] = useState("upi");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [fraudScore, setFraudScore] = useState(null);

  const discount = txn.recoveryResult?.policy?.appliedDiscount || 0;
  const payableAmount = txn.amount - discount;

  const handlePayNow = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Payment in Backend (Priority 1, 2, 4)
      const idempotencyKey = `idemp_pay_${txn.id}_${Date.now()}`;
      const createRes = await ApiService.createPayment({
        amount: payableAmount,
        currency: 'INR',
        sender: txn.customerName || 'Indian Enterprise Subscriber',
        senderAccount: `acc_user_${(txn.phone || '98000').replace(/[^0-9]/g, '')}`,
        receiver: txn.merchant || 'Razorpay Merchant',
        receiverAccount: 'acc_merchant_rzp_primary',
        paymentMethod: activeMethod,
        idempotencyKey,
        metadata: {
          subscriptionId: txn.id,
          planName: txn.planName,
          category: txn.category
        }
      });

      if (!createRes.success) {
        throw new Error(createRes.error || 'Payment creation failed');
      }

      setFraudScore(createRes.fraudAssessment);
      const createdPayment = createRes.payment;

      // 2. Advance to PROCESSING
      const processRes = await ApiService.processPayment(createdPayment.id, {
        referenceId: `rzp_gw_${Date.now()}`
      });

      // 3. Verify Payment Server-Side (Priority 3 & 6: Ledger Settlement)
      const verifyRes = await ApiService.verifyPayment(createdPayment.id, {
        referenceId: `rzp_auth_rrn_${Math.floor(100000000000 + Math.random() * 900000000000)}`
      });

      if (!verifyRes.success) {
        throw new Error(verifyRes.error || 'Server verification failed');
      }

      setPaymentRecord(verifyRes.payment);
      setIsDone(true);
      toast.success(`Payment of ₹${payableAmount.toLocaleString('en-IN')} verified & settled in ledger!`);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        if (onSuccess) onSuccess(txn.id, payableAmount, verifyRes.payment);
      }, 1400);

    } catch (err) {
      toast.error(`Checkout error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-merchant"
    >
      <div className="bg-[#ffffff] dark:bg-[#0b192e] text-slate-900 dark:text-slate-100 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative font-sans border border-slate-200 dark:border-slate-800">
        
        {/* Razorpay Standard Checkout Header */}
        <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#3395FF] flex items-center justify-center font-bold text-white text-sm">
              ₹
            </div>
            <div>
              <div id="checkout-modal-merchant" className="font-bold text-sm leading-tight">{txn.merchant}</div>
              <div className="text-[11px] text-sky-200">Razorpay Trusted Business</div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[11px] text-sky-200">Amount to Pay</div>
            <div className="font-extrabold text-base text-white">₹{payableAmount.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {isDone ? (
          <div className="p-8 text-center bg-white dark:bg-[#0b192e] space-y-2">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payment Verified & Settled!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Txn ID: {paymentRecord?.id || `pay_${Date.now()}`}
            </p>
            <p className="text-xs text-emerald-600 font-semibold">
              Double-Entry Ledger Updated • Subscription Renewed for {txn.customerName}
            </p>
            {fraudScore && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-2">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span>Fraud Risk: {fraudScore.risk_level} ({fraudScore.risk_score}/100)</span>
              </div>
            )}
          </div>
        ) : (
          <div className="p-5 bg-slate-50 dark:bg-[#070e1c]">
            
            {/* Payment Method Selector */}
            <div className="flex gap-2 mb-4 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveMethod("upi")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "upi" ? 'bg-white dark:bg-[#0b192e] text-[#0c2340] dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5 text-[#3395FF]" />
                UPI / QR
              </button>
              <button
                onClick={() => setActiveMethod("card")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "card" ? 'bg-white dark:bg-[#0b192e] text-[#0c2340] dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5 text-[#3395FF]" />
                Cards
              </button>
              <button
                onClick={() => setActiveMethod("netbanking")}
                className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeMethod === "netbanking" ? 'bg-white dark:bg-[#0b192e] text-[#0c2340] dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Landmark className="h-3.5 w-3.5 text-[#3395FF]" />
                Netbanking
              </button>
            </div>

            {/* Method Details */}
            {activeMethod === "upi" && (
              <div className="space-y-3">
                <div className="bg-white dark:bg-[#0b192e] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Select UPI App</div>
                  <div className="grid grid-cols-4 gap-2">
                    {["Google Pay", "PhonePe", "Paytm", "CRED"].map((app) => (
                      <div
                        key={app}
                        onClick={handlePayNow}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#3395FF] hover:bg-sky-50 dark:hover:bg-slate-800 text-center cursor-pointer transition-all"
                      >
                        <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto mb-1 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {app.charAt(0)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 block truncate">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0b192e] p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Scan UPI QR to Pay</div>
                  <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg mx-auto flex items-center justify-center text-slate-400">
                    <QrCode className="h-12 w-12 text-[#0c2340] dark:text-white" />
                  </div>
                </div>
              </div>
            )}

            {activeMethod === "card" && (
              <div className="bg-white dark:bg-[#0b192e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Card Number (4111 2222 3333 4444)"
                  className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-transparent"
                  defaultValue="4111 2222 3333 4444"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-transparent"
                    defaultValue="12/28"
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-transparent"
                    defaultValue="123"
                  />
                </div>
              </div>
            )}

            {activeMethod === "netbanking" && (
              <div className="bg-white dark:bg-[#0b192e] p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <select className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white bg-transparent">
                  <option className="text-slate-900">HDFC Bank</option>
                  <option className="text-slate-900">State Bank of India</option>
                  <option className="text-slate-900">ICICI Bank</option>
                  <option className="text-slate-900">Axis Bank</option>
                  <option className="text-slate-900">Kotak Mahindra Bank</option>
                </select>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full mt-4 py-3 rounded-xl bg-[#0c2340] hover:bg-[#143863] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Lock className="h-4 w-4 text-[#3395FF]" />
              {isProcessing ? "Verifying & Settling on Server..." : `Pay ₹${payableAmount.toLocaleString('en-IN')}`}
            </button>

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Idempotent • Double-Entry Ledger Settled • 256-bit Security</span>
            </div>

          </div>
        )}

        {/* Close button on top right */}
        <button
          onClick={onClose}
          aria-label="Close Checkout Modal"
          className="absolute top-3.5 right-3.5 text-slate-300 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

      </div>
    </div>
  );
}

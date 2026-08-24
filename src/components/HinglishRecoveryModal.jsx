import React, { useState, useEffect } from 'react';
import { 
  X, Send, CheckCircle2, Sparkles, Volume2, ArrowRight, Languages, QrCode 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export default function HinglishRecoveryModal({ txn, onClose, onPaymentSuccess }) {
  if (!txn) return null;

  const [paymentDone, setPaymentDone] = useState(false);
  const [selectedLang, setSelectedLang] = useState("hinglish"); // hinglish, hindi, tamil, telugu, kannada, english

  const payableAmount = txn.recoveryResult?.policy?.appliedDiscount > 0
    ? txn.amount - txn.recoveryResult.policy.appliedDiscount
    : txn.amount;

  const discount = txn.recoveryResult?.policy?.appliedDiscount || 0;
  const firstName = txn.customerName.split(" ")[0];

  const vernacularTemplates = {
    hinglish: [
      `Namaste ${firstName} ji! 🙏 Hum ${txn.merchant} ki support team se hain. Aapka ₹${txn.amount.toLocaleString('en-IN')} ka subscription auto-renewal (${txn.planName}) ${txn.bank} bank ke server issue ki wajah se complete nahi ho paya.`,
      discount > 0
        ? `Aapke continuous support ke liye humne ek special ₹${discount} discount apply kiya hai! Aapka discounted amount sirf ₹${payableAmount.toLocaleString('en-IN')} hai. 🚀`
        : `Service uninterrupted rakhne ke liye aap niche diye gaye secure Razorpay UPI button se 1-click me complete kar sakte hain.`
    ],
    hindi: [
      `नमस्ते ${firstName} जी! 🙏 हम ${txn.merchant} की टीम से हैं। आपका ₹${txn.amount.toLocaleString('en-IN')} का ऑटो-रिन्यूअल पेमेंट बैंक सर्वर लोड के कारण पूरा नहीं हो सका।`,
      discount > 0
        ? `आपके लिए ₹${discount} की विशेष छूट लागू की गई है। अब आपको केवल ₹${payableAmount.toLocaleString('en-IN')} का भुगतान करना है।`
        : `अपनी सेवा बिना रुकावट जारी रखने के लिए नीचे दिए गए सुरक्षित रेजरपे यूपीआई बटन पर क्लिक करें।`
    ],
    tamil: [
      `வணக்கம் ${firstName}! 🙏 உங்கள் ${txn.merchant} சந்தா புதுப்பித்தல் ₹${txn.amount.toLocaleString('en-IN')} வங்கி சர்வர் பிரச்சனையால் நிலுவையில் உள்ளது.`,
      discount > 0
        ? `உங்களுக்காக சிறப்பு தள்ளுபடி ₹${discount} வழங்கப்பட்டுள்ளது. நீங்கள் செலுத்த வேண்டிய தொகை ₹${payableAmount.toLocaleString('en-IN')} மட்டுமே.`
        : `உடனடி புதுப்பித்தலுக்கு கீழே உள்ள Razorpay UPI பொத்தானை கிளிக் செய்யவும்.`
    ],
    telugu: [
      `నమస్కారం ${firstName} గారు! 🙏 మీ ${txn.merchant} సబ్‌స్క్రిప్షన్ పునరుద్ధరణ ₹${txn.amount.toLocaleString('en-IN')} బ్యాంక్ సర్వర్ సమస్య కారణంగా పెండింగ్‌లో ఉంది.`,
      discount > 0
        ? `మీ కోసం ప్రత్యేకంగా ₹${discount} తగ్గింపు వర్తించబడింది. మీరు చెల్లించాల్సిన మొత్తం ₹${payableAmount.toLocaleString('en-IN')} మాత్రమే.`
        : `సర్వీస్ కొనసాగించడానికి కింద ఉన్న Razorpay UPI బటన్ ద్వారా పే చేయండి.`
    ],
    kannada: [
      `ನಮಸ್ಕಾರ ${firstName} ಅವರೇ! 🙏 ನಿಮ್ಮ ${txn.merchant} ಚಂದಾದಾರಿಕೆ ನವೀಕರಣ ₹${txn.amount.toLocaleString('en-IN')} ಬ್ಯಾಂಕ್ ಸರ್ವರ್ ಸಮಸ್ಯೆಯಿಂದ ವಿಫಲವಾಗಿದೆ.`,
      discount > 0
        ? `ನಿಮಗಾಗಿ ವಿಶೇಷ ₹${discount} ರಿಯಾಯಿತಿ ನೀಡಲಾಗಿದೆ. ಪಾವತಿಸಬೇಕಾದ ಮೊತ್ತ ₹${payableAmount.toLocaleString('en-IN')} ಮಾತ್ರ.`
        : `ತಡೆರಹಿತ ಸೇವೆಗಾಗಿ ಕೆಳಗಿನ Razorpay UPI ಲಿಂಕ್ ಬಳಸಿ.`
    ],
    english: [
      `Hello ${firstName}! We noticed your subscription renewal of ₹${txn.amount.toLocaleString('en-IN')} for ${txn.planName} failed due to a temporary ${txn.bank} downtime issue.`,
      discount > 0
        ? `We've applied an exclusive ₹${discount} retention credit! Your final payable amount is ₹${payableAmount.toLocaleString('en-IN')}.`
        : `To keep your service uninterrupted, complete your payment securely via 1-click Razorpay UPI below.`
    ]
  };

  const [messages, setMessages] = useState([
    { sender: "bot", time: "10:14 AM", text: vernacularTemplates.hinglish[0] },
    { sender: "bot", time: "10:14 AM", text: vernacularTemplates.hinglish[1] }
  ]);

  const [inputMsg, setInputMsg] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // When language changes, update template message
  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    const tmpl = vernacularTemplates[lang] || vernacularTemplates.hinglish;
    setMessages([
      { sender: "bot", time: "Just now", text: tmpl[0] },
      { sender: "bot", time: "Just now", text: tmpl[1] }
    ]);
  };

  const handleSimulatedPay = () => {
    setPaymentDone(true);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

    const followUp = {
      sender: "bot",
      time: "Just now",
      text: `✅ Payment of ₹${payableAmount.toLocaleString('en-IN')} received successfully via Razorpay UPI! Subscription active.`
    };
    setMessages((prev) => [...prev, followUp]);

    if (onPaymentSuccess) onPaymentSuccess(txn.id, payableAmount);
  };

  const handleSendCustom = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const userMsg = { sender: "user", time: "Just now", text: inputMsg };
    setMessages((prev) => [...prev, userMsg]);
    setInputMsg("");

    setTimeout(() => {
      setMessages((prev) => [...prev, {
        sender: "bot",
        time: "Just now",
        text: `Dhanyawad! Humne best rate ₹${payableAmount.toLocaleString('en-IN')} lock kiya hai. Aap direct 1-click se complete kar sakte hain.`
      }]);
    }, 600);
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && messages.length > 0) {
      setIsSpeaking(true);
      const textToSpeak = messages[0].text;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recovery-modal-title"
    >
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              WA
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span id="recovery-modal-title" className="font-bold text-[#0c2340] text-sm">{txn.merchant} Auto-Recover</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-mono border border-emerald-200 font-bold">
                  Verified Agent
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Customer: {txn.customerName} ({txn.phone})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeak}
              aria-label="Listen to Vernacular Speech"
              title="Listen to Vernacular Speech"
              className={`p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 transition-all ${
                isSpeaking ? 'bg-[#0066FF] text-white animate-pulse' : 'bg-white'
              }`}
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-900">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Vernacular Language Selector Bar */}
        <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold scrollbar-none">
          <span className="text-slate-500 flex items-center gap-1 shrink-0 mr-1 text-[10px]">
            <Languages className="h-3 w-3 text-[#0066FF]" /> Language:
          </span>
          {[
            { id: 'hinglish', label: 'Hinglish' },
            { id: 'hindi', label: 'हिंदी (Hindi)' },
            { id: 'tamil', label: 'தமிழ் (Tamil)' },
            { id: 'telugu', label: 'తెలుగు (Telugu)' },
            { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
            { id: 'english', label: 'English' }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLangChange(lang.id)}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-all ${
                selectedLang === lang.id
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Conversation Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 bg-slate-50 text-xs">
          <div className="text-center my-1">
            <span className="bg-white text-slate-500 px-2.5 py-0.5 rounded-full text-[10px] font-mono border border-slate-200 shadow-sm">
              End-to-End Encrypted via Razorpay Connect
            </span>
          </div>

          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === "bot" ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${
                  m.sender === "bot"
                    ? "bg-white text-[#0c2340] border border-slate-200"
                    : "bg-[#0066FF] text-white"
                }`}
              >
                <p className="leading-relaxed whitespace-pre-line font-medium">{m.text}</p>
                <span className="text-[9px] opacity-70 block text-right mt-1 font-mono">
                  {m.time}
                </span>
              </div>
            </div>
          ))}

          {!paymentDone && (
            <div className="p-3.5 rounded-2xl bg-white border border-blue-200 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#0c2340] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#0066FF]" />
                  Razorpay 1-Click Instant Recovery
                </span>
                <span className="text-xs font-black text-emerald-600 font-mono">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 mb-3">
                Plan: <strong className="text-slate-800">{txn.planName}</strong> • UPI AutoPay mandate renewal.
              </div>

              {/* Dynamic QR Display */}
              <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <div className="text-[10px] font-bold text-slate-600 mb-1.5 flex items-center justify-center gap-1">
                  <QrCode className="h-3 w-3 text-[#0066FF]" />
                  <span>Scan with GPay / PhonePe / Paytm</span>
                </div>
                <div className="p-2 bg-white rounded-lg inline-block border border-slate-200 shadow-xs mx-auto">
                  <QRCodeSVG 
                    value={`upi://pay?pa=revivepay@razorpay&pn=${encodeURIComponent(txn.merchant || 'Razorpay Merchant')}&am=${payableAmount}&cu=INR&tn=Invoice-${txn.id}`} 
                    size={96}
                    level="M"
                  />
                </div>
              </div>

              <button
                onClick={handleSimulatedPay}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Pay ₹{payableAmount.toLocaleString('en-IN')} via UPI Intent</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {paymentDone && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-center">
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
              <div className="font-bold">Subscription Successfully Renewed!</div>
              <div className="text-[10px] font-mono mt-0.5">
                Amount ₹{payableAmount} credited to {txn.merchant}
              </div>
            </div>
          )}
        </div>

        {/* Reply Box */}
        <form onSubmit={handleSendCustom} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type custom reply..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-[#0c2340] placeholder-slate-400 focus:outline-none focus:border-[#0066FF]"
          />
          <button
            type="submit"
            className="p-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white transition-all"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>

      </div>
    </div>
  );
}

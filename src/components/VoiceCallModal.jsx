import React, { useState, useEffect } from 'react';
import { 
  X, Phone, PhoneOff, Mic, Volume2, Sparkles, 
  CheckCircle2, User, Bot, Activity 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VoiceCallModal({ targetItem, onClose, onCommitmentAgreed }) {
  if (!targetItem) return null;

  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [sentiment, setSentiment] = useState("NEUTRAL"); // FRUSTRATED -> NEUTRAL -> REASSURED
  const [transcript, setTranscript] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const customerName = targetItem.customerName || targetItem.contactPerson || "Customer";
  const amount = targetItem.amount || 3200;
  const merchantName = targetItem.merchant || targetItem.clientName || "Razorpay Merchant";

  useEffect(() => {
    let timer;
    if (callActive) {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const startCall = () => {
    setCallActive(true);
    setTranscript([
      {
        speaker: "bot",
        text: `Namaste ${customerName.split(" ")[0]} ji! Mai ${merchantName} ki AI finance desk se bol rahi hoon. Aapka ₹${amount.toLocaleString('en-IN')} ka payment pending hai, kya hum isko UPI se clear kar sakte hain?`
      }
    ]);

    // Simulate customer interactive response after 3 seconds
    setTimeout(() => {
      setTranscript((prev) => [
        ...prev,
        {
          speaker: "customer",
          text: `Haanji, actually hamare account me thoda liquidity mismatch chal raha hai. Kya hum Friday tak pay kar sakte hain?`
        }
      ]);
      setSentiment("NEUTRAL");

      // AI Bot negotiates PTP commitment
      setTimeout(() => {
        setTranscript((prev) => [
          ...prev,
          {
            speaker: "bot",
            text: `Bilkul ${customerName.split(" ")[0]} ji! Humne aapka Promise-to-Pay (PTP) Friday ke liye record kar diya hai aur direct Razorpay payment link aapke WhatsApp par bhej diya hai.`
          }
        ]);
        setSentiment("REASSURED");
      }, 2500);
    }, 2500);
  };

  const endCall = () => {
    setCallActive(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    if (onCommitmentAgreed) {
      onCommitmentAgreed(targetItem.id, "Friday (Simulated PTP Confirmed)");
    }
  };

  const speakLatest = () => {
    if ('speechSynthesis' in window && transcript.length > 0) {
      setIsSpeaking(true);
      const text = transcript[transcript.length - 1].text;
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utt);
    }
  };

  const formatSec = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-modal-title"
    >
      <div className="bg-white rounded-3xl p-6 border border-slate-200 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Call Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center text-[#0066FF] font-bold">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <div id="voice-modal-title" className="font-bold text-sm text-[#0c2340]">AI Voice Recovery Agent</div>
              <div className="text-[10px] text-slate-500 font-mono">Hinglish Natural Dialect • Low Latency</div>
            </div>
          </div>

          <button 
            onClick={onClose} 
            aria-label="Close Voice Agent Modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Call Center Status */}
        <div className="py-6 text-center">
          <div className="relative inline-block mx-auto mb-3">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {customerName.charAt(0)}
            </div>
            {callActive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div className="font-extrabold text-base text-[#0c2340]">{customerName}</div>
          <div className="text-xs text-slate-500 font-mono mt-0.5">
            Amount Due: <strong className="text-rose-600 font-bold">₹{amount.toLocaleString('en-IN')}</strong>
          </div>

          {callActive ? (
            <div className="mt-2 text-xs font-bold text-emerald-600 font-mono">
              In Call: {formatSec(callDuration)}
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400 font-mono">
              Ready to connect
            </div>
          )}

          {/* Audio Waveform Simulation */}
          {callActive && (
            <div className="flex items-center justify-center gap-1 my-3 h-8">
              {[12, 28, 16, 32, 24, 38, 18, 26, 14, 30, 20].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#0066FF] rounded-full animate-pulse"
                  style={{ height: `${h}px`, animationDelay: `${i * 100}ms` }}
                ></div>
              ))}
            </div>
          )}

          {/* Sentiment Gauge */}
          {callActive && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-semibold">
              <Activity className="h-3.5 w-3.5 text-[#0066FF]" />
              <span>Customer Sentiment:</span>
              <span className={`font-bold ${
                sentiment === 'REASSURED' ? 'text-emerald-600' : 'text-amber-600'
              }`}>{sentiment}</span>
            </div>
          )}
        </div>

        {/* Live Conversation Transcript */}
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 overflow-y-auto space-y-2.5 text-xs min-h-[140px] max-h-[200px]">
          {transcript.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              Click Start Voice Call to initiate autonomous conversation.
            </div>
          ) : (
            transcript.map((t, idx) => (
              <div key={idx} className={`flex ${t.speaker === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[85%] rounded-2xl p-2.5 font-medium ${
                  t.speaker === 'bot' 
                    ? 'bg-white border border-slate-200 text-[#0c2340]' 
                    : 'bg-[#0066FF] text-white'
                }`}>
                  <div className="text-[9px] font-bold uppercase opacity-75 mb-0.5">
                    {t.speaker === 'bot' ? 'RevivePay AI' : customerName.split(" ")[0]}
                  </div>
                  <p>{t.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 mt-3 border-t border-slate-200">
          {callActive && (
            <button
              onClick={speakLatest}
              title="Play Hinglish Audio Synthesis"
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs flex items-center gap-1.5"
            >
              <Volume2 className="h-4 w-4" />
              <span>Listen</span>
            </button>
          )}

          {!callActive ? (
            <button
              onClick={startCall}
              className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <Phone className="h-4 w-4 fill-white" />
              <span>Start Autonomous Voice Call</span>
            </button>
          ) : (
            <button
              onClick={endCall}
              className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <PhoneOff className="h-4 w-4" />
              <span>Confirm PTP & End Call</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

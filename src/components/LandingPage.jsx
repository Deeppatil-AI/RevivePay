import React, { useState, useEffect } from 'react';
import { 
  Zap, ArrowRight, CheckCircle2, ShieldCheck, Activity, Terminal, 
  Code2, Copy, Check, ChevronDown, MessageSquare, 
  Layers, Building2, TrendingUp, Star, 
  Smartphone, QrCode, Sliders, Sparkles, BarChart3, Lock 
} from 'lucide-react';

export default function LandingPage({ onLaunchConsole }) {
  // Rotating hero headline
  const heroHeadlines = [
    "Stop losing 35% recurring revenue to bank downtime & payment failures.",
    "Autonomous UPI AutoPay & Mandate Recovery Sentinel.",
    "Convert failed subscriptions into recovered ARR on autopilot.",
    "Hinglish conversational recovery with zero margin leakage."
  ];
  const [headlineIdx, setHeadlineIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeadlineIdx((prev) => (prev + 1) % heroHeadlines.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Developer code tab switcher
  const [activeCodeLang, setActiveCodeLang] = useState("node");
  const [copiedCode, setCopiedCode] = useState(false);

  const codeSnippets = {
    node: `import { RevivePay } from '@razorpay/revivepay-sdk';

const revive = new RevivePay({
  apiKey: import.meta.env.VITE_RAZORPAY_KEY || 'rzp_test_sec_99481',
  policy: { maxDiscountCap: 250, autoEscalateAbove: 10000 }
});

// Autonomous webhook listener
app.post('/webhooks/razorpay', async (req, res) => {
  const result = await revive.handleWebhook(req.body);
  console.log('Recovery Status:', result.recoveryStatus); // RESCHEDULED_CBS
  res.json({ status: 'ACK_200' });
});`,
    python: `from revivepay import RevivePaySentinel

sentinel = RevivePaySentinel(api_key="rzp_test_sec_99481")

# Diagnose telemetry & reschedule retry
recovery = sentinel.diagnose_and_recover(
    payment_id="pay_Kx882190",
    bank="SBI",
    failure_code="NPCI_U30"
)

print(f"Scheduled health slot: {recovery.scheduled_slot}")
# Output: Scheduled health slot: 08:15 AM - 10:30 AM IST`,
    curl: `curl -X POST https://api.revivepay.io/v1/recover \\
  -H "Authorization: Bearer rzp_test_sec_99481" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payment_id": "pay_Kx882190",
    "error_code": "NPCI_U30",
    "customer": { "name": "Aarav Sharma", "bank": "SBI" },
    "policy": { "max_discount_pct": 8 }
  }'`,
    php: `$revive = new \\Razorpay\\RevivePay('rzp_test_sec_99481');

$recovery = $revive->recover([
    'payment_id' => 'pay_Kx882190',
    'bank' => 'HDFC',
    'failure_code' => 'NPCI_ZM',
    'customer_ltv' => 24000
]);

echo $recovery->action; // HINGLISH_ONECLICK_WHATSAPP`
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Industry use-case tab
  const [activeIndustryTab, setActiveIndustryTab] = useState("ott");
  const industryData = {
    ott: {
      title: "OTT & Digital Media Subscriptions",
      stat: "+42% Churn Reduction",
      pitch: "Streaming platforms lose subscribers when midnight renewal debits hit SBI/HDFC core banking downtime. RevivePay reschedules to morning windows and sends 1-click WhatsApp recovery links before suspension.",
      badge: "Netflix India, Hotstar, SonyLIV"
    },
    saas: {
      title: "B2B SaaS & Cloud Software",
      stat: "+38% ARR Recovered",
      pitch: "Automate overdue receivables with 18% GST tax-line matching, autonomous Promise-to-Pay (PTP) tracking, and multi-channel conversational follow-ups for enterprise invoices.",
      badge: "Zoho One, Freshworks, Postman"
    },
    edtech: {
      title: "EdTech & Live Upskilling Batches",
      stat: "+51% EMI Retention",
      pitch: "Prevent students from losing course access due to month-end stipend delays. Smart-split monthly course fees into 2-part milestone payments or instant 0% EMI.",
      badge: "PhysicsWallah, Scaler, Unacademy"
    },
    bfsi: {
      title: "BFSI, Lending & Insurance EMIs",
      stat: "₹18M+ Bounce Fines Saved",
      pitch: "Ensure strict compliance with RBI e-Mandate Circular RBI/2020-21/74. Suppress blind retries to prevent customer bank bounce charges and protect merchant trust scores.",
      badge: "Bajaj Finserv, HDFC Life, Digit"
    }
  };

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      q: "How does RevivePay integrate with our existing Razorpay account?",
      a: "RevivePay integrates seamlessly via Razorpay Webhooks and REST APIs. Simply plug in your Razorpay API Key and subscribe to payment.failed and subscription.halted webhooks. No core application code rewrite required."
    },
    {
      q: "Is RevivePay compliant with RBI guidelines on e-Mandates & Tokenization?",
      a: "Yes, 100%. RevivePay strictly adheres to RBI Circular RBI/2020-21/74 and NPCI AutoPay standards. It honors 24-48h pre-debit notifications, enforces mandatory cooling periods, and limits retries to a maximum of 3 attempts per cycle."
    },
    {
      q: "How does the AI know when an Indian bank is down?",
      a: "RevivePay maintains a real-time bank telemetry engine tracking core-banking End-of-Day (CBS) maintenance windows, NPCI switch latencies, and gateway error codes for SBI, HDFC, ICICI, Axis, PNB, and Kotak."
    },
    {
      q: "Can the AI give away unauthorized discounts to customers?",
      a: "Never. RevivePay features a strict Policy & Guardrails Governance Engine. Merchants configure hard percentage caps (e.g. max 8%), absolute rupee ceilings (e.g. max ₹250), and minimum customer LTV requirements. Every transaction is stamped with a SHA-256 cryptographic audit token."
    },
    {
      q: "What is DisputeShield and how does it win chargebacks?",
      a: "DisputeShield auto-compiles 4-point evidentiary dossiers (logistics tracking, delivery OTP verification, 3DS 2.0 auth RRN, device fingerprinting) compliant with Visa Level-1 and NPCI arbitration standards, achieving a 91%+ win rate."
    },
    {
      q: "How does Hinglish Conversational Recovery work?",
      a: "When automated debits exhaust, RevivePay dispatches personalized WhatsApp messages in natural Hinglish with embedded 1-click Razorpay UPI Intent links, allowing customers to approve payments via GPay/PhonePe in under 5 seconds."
    }
  ];

  // Testimonials
  const testimonials = [
    {
      quote: "RevivePay helped us recover ₹4.2 Crores in annual recurring subscriptions that were previously lost to midnight SBI/HDFC downtime. The ROI was visible in the first 48 hours.",
      author: "Aditya Mukherjee",
      title: "VP of Growth & Monetization",
      company: "StreamFlix India",
      avatar: "A"
    },
    {
      quote: "The Promise-to-Pay tracker and GST matching cut our B2B invoice collection cycle from 44 days down to 14 days. It pays for itself 20x over.",
      author: "Sneha Raman",
      title: "Chief Financial Officer",
      company: "CloudKraft DevOps",
      avatar: "S"
    },
    {
      quote: "DisputeShield automated our entire chargeback defense workflow. Our dispute win rate went from 34% to 92% backed by OTP and session replay proof.",
      author: "Vikram Singhania",
      title: "Head of Risk & Fraud Ops",
      company: "HyperGro E-Commerce",
      avatar: "V"
    }
  ];
  const [testiIdx, setTestiIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestiIdx((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#0c2340] font-sans selection:bg-[#0066FF] selection:text-white">
      
      {/* 1. STICKY TOP NAV */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-[#0c2340]">Razorpay</span>
                <span className="bg-blue-50 text-[#0066FF] text-xs font-bold px-2 py-0.5 rounded-md border border-blue-200">
                  RevivePay AI
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">Enterprise Revenue Sentinel</span>
            </div>
          </div>

          {/* Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-[#0066FF] transition-colors">Products & Sentinel</a>
            <a href="#developers" className="hover:text-[#0066FF] transition-colors">Developers & APIs</a>
            <a href="#industries" className="hover:text-[#0066FF] transition-colors">Solutions & BFSI</a>
            <a href="#faq" className="hover:text-[#0066FF] transition-colors">Pricing & FAQs</a>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onLaunchConsole('batch')}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-[#0066FF] hidden sm:flex items-center gap-1 transition-colors"
            >
              <Lock className="h-3 w-3 text-slate-400" />
              <span>Merchant Login</span>
            </button>
            <button
              onClick={() => onLaunchConsole('batch')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-extrabold shadow-md hover:shadow-lg transition-all"
            >
              <span>Launch Live App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-4 lg:px-8 overflow-hidden bg-gradient-to-b from-blue-50/40 via-white to-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#0066FF] text-xs font-bold shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Autonomous AI Revenue Recovery</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#0c2340] tracking-tight leading-[1.12] min-h-[120px] md:min-h-[140px] transition-all">
              {heroHeadlines[headlineIdx]}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Powered by real-time Indian banking telemetry, RBI-compliant predictive mandate retries, Hinglish conversational WhatsApp recovery, and bounded margin guardrails.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                onClick={() => onLaunchConsole('batch')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-sm font-bold shadow-md hover:shadow-xl flex items-center justify-center gap-2 transition-all"
              >
                <span>Launch Live Sentinel Demo</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 text-sm font-bold border border-slate-300 shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span>Explore Features</span>
              </a>
            </div>

            {/* Quick Proof Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                RBI Circular Compliant
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Zero Bank Bounce Penalties
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                91%+ Dispute Defense Rate
              </span>
            </div>

          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-xs text-[#0c2340]">Autonomous Sentinel Active</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-[#0066FF] px-2 py-0.5 rounded-md font-bold">
                  94.2% Yield
                </span>
              </div>

              <div className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Total Enterprise Revenue Recovered
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                    ● Live Counter
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#0c2340] font-mono mt-1 tracking-tight">
                  ₹4,28,49,200
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mt-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>+₹1,84,500 recovered today across 184 enterprise subscriptions</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#0066FF]"></span>
                    <div>
                      <div className="font-bold text-slate-800">SBI Midnight CBS Downtime</div>
                      <div className="text-[10px] text-slate-500">Auto-rescheduled to 08:15 AM Window</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    Recovered
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <div>
                      <div className="font-bold text-slate-800">WhatsApp Hinglish UPI Intent</div>
                      <div className="text-[10px] text-slate-500">StreamFlix Annual 4K (₹1,499)</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-[#0066FF] bg-blue-50 px-2 py-0.5 rounded">
                    1-Click Paid
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <div>
                      <div className="font-bold text-slate-800">Policy Gating Ceilings</div>
                      <div className="text-[10px] text-slate-500">Hard ₹250 Discount Cap Enforced</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    Audited
                  </span>
                </div>
              </div>

              <button
                onClick={onLaunchConsole}
                className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Open Full Interactive Sentinel</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

            </div>
          </div>

        </div>
      </section>

      {/* 3. TRUST BAR */}
      <section className="py-8 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Trusted by Leaders in OTT, SaaS, EdTech & Indian Fintech
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-75 font-black text-slate-700 text-base tracking-tight">
            <span>StreamFlix India</span>
            <span>Zoho One</span>
            <span>PhysicsWallah</span>
            <span>Cult.fit</span>
            <span>Bajaj Finserv</span>
            <span>Freshworks</span>
            <span>Blue Tokai</span>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT GRID */}
      <section id="features" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Core Sentinel Modules
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c2340] tracking-tight">
            Everything You Need to Plug Recurring Revenue Leaks
          </h2>
          <p className="text-sm text-slate-600">
            Engineered specifically for the Indian payments ecosystem with deep Razorpay API integration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center font-bold">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">UPI AutoPay Sentinel</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects bank core banking batch outages (SBI/HDFC midnight locks) and reschedules retries to morning peak health slots without burning NPCI penalty fees.
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>Test Batch Runner</span> &rarr;
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">Hinglish WhatsApp Recovery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Personalized multi-channel messages in natural Hinglish with embedded 1-click Razorpay UPI intent links for instant 5-second customer renewals.
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>View Chat Simulator</span> &rarr;
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">B2B Receivables & PTP Chaser</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Overdue invoice aging buckets (1-30d, 31-60d, 60d+) with 18% GST matching and autonomous Promise-to-Pay (PTP) scheduling before legal escalation.
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>Explore Receivables</span> &rarr;
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">DisputeShield Defense</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ingests delivery OTP logs, 3DS 2.0 auth RRNs, and session telemetry to compile official Visa/NPCI legal evidence dossiers (91%+ win rate).
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>See Dispute Packager</span> &rarr;
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sliders className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">Policy & Margin Guardrails</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Hard financial ceilings (Max 8% discount, ₹250 absolute cap, ₹10k human review threshold) preventing unauthorized margin leakage.
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>Configure Policy</span> &rarr;
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-[#0066FF] hover:shadow-md transition-all space-y-3">
            <div className="h-12 w-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Activity className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0c2340]">Cryptographic Audit Ledger</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every single rupee action produces a verifiable SHA-256 stamped audit record with full explainability for RBI compliance audits.
            </p>
            <button onClick={onLaunchConsole} className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-1">
              <span>View Audit Stream</span> &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* 5. DEVELOPERS SECTION */}
      <section id="developers" className="py-20 bg-slate-900 text-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-5 space-y-5">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
              Developer-First Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Webhook Endpoint. Infinite Recovery Workflows.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Plug into your existing Razorpay Node, Python, PHP, or cURL pipeline in under 5 minutes. Real-time HMAC-SHA256 signature verification and asynchronous agent orchestration out of the box.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>REST API + Webhook listener on port 5000</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Zero latency async agent dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Full TypeScript definitions & SDK support</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onLaunchConsole('webhooks')}
                className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs shadow-md transition-all"
              >
                Test in Live Webhook Simulator
              </button>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#0b1528] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
            <div className="bg-[#080f1e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {["node", "python", "curl", "php"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveCodeLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      activeCodeLang === lang
                        ? 'bg-[#0066FF] text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={copyCodeToClipboard}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Copy code"
              >
                {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <pre className="p-5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed max-h-[360px]">
              {codeSnippets[activeCodeLang]}
            </pre>
          </div>

        </div>
      </section>

      {/* 6. NO-CODE SECTION */}
      <section className="py-20 px-4 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            No-Code Merchant Suite
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c2340] tracking-tight">
            Built for Finance, Ops & Growth Teams Too
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
            <Smartphone className="h-6 w-6 text-[#0066FF] mb-2" />
            <h4 className="font-bold text-sm text-[#0c2340]">1-Click UPI Intent Links</h4>
            <p className="text-xs text-slate-600 mt-1">Pre-configured WhatsApp and SMS payment links with zero friction.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
            <QrCode className="h-6 w-6 text-[#0066FF] mb-2" />
            <h4 className="font-bold text-sm text-[#0c2340]">Smart Dynamic UPI QR</h4>
            <p className="text-xs text-slate-600 mt-1">Self-expiring secure QR codes embedded directly in recovery emails.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
            <Sliders className="h-6 w-6 text-[#0066FF] mb-2" />
            <h4 className="font-bold text-sm text-[#0c2340]">Visual Policy Sliders</h4>
            <p className="text-xs text-slate-600 mt-1">Control discount ceilings and human-in-the-loop review thresholds visually.</p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
            <BarChart3 className="h-6 w-6 text-[#0066FF] mb-2" />
            <h4 className="font-bold text-sm text-[#0c2340]">Executive ARR Dashboard</h4>
            <p className="text-xs text-slate-600 mt-1">Track exact rupee recovery yield, cohort survival, and forward cash flow.</p>
          </div>
        </div>
      </section>

      {/* 7. INDUSTRY USE-CASE TABS */}
      <section id="industries" className="py-20 bg-slate-50 border-y border-slate-200 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Tailored Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0c2340] tracking-tight">
              Optimized for Every Indian Subscription Model
            </h2>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'ott', label: 'OTT & Streaming' },
              { id: 'saas', label: 'B2B SaaS & Cloud' },
              { id: 'edtech', label: 'EdTech & Upskilling' },
              { id: 'bfsi', label: 'BFSI & Insurance EMIs' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveIndustryTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeIndustryTab === tab.id
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-[#0066FF] uppercase font-mono">
                  {industryData[activeIndustryTab].badge}
                </span>
                <h3 className="text-xl font-bold text-[#0c2340] mt-0.5">
                  {industryData[activeIndustryTab].title}
                </h3>
              </div>
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-black text-sm border border-emerald-200">
                {industryData[activeIndustryTab].stat}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed py-4">
              {industryData[activeIndustryTab].pitch}
            </p>

            <button
              onClick={onLaunchConsole}
              className="mt-2 px-5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <span>Explore Industry Workflow in App</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

        </div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="py-20 px-4 lg:px-8 max-w-5xl mx-auto text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Customer Impact
        </span>
        <h2 className="text-3xl font-extrabold text-[#0c2340] tracking-tight mt-3 mb-10">
          What Growth & Finance Leaders Say
        </h2>

        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 shadow-sm">
          <div className="flex justify-center mb-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 text-amber-400 fill-amber-400" />
            ))}
          </div>

          <blockquote className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed italic max-w-3xl mx-auto min-h-[70px]">
            "{testimonials[testiIdx].quote}"
          </blockquote>

          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#0066FF] text-white font-bold flex items-center justify-center">
              {testimonials[testiIdx].avatar}
            </div>
            <div className="text-left">
              <div className="font-bold text-sm text-[#0c2340]">{testimonials[testiIdx].author}</div>
              <div className="text-xs text-slate-500">{testimonials[testiIdx].title} • <strong>{testimonials[testiIdx].company}</strong></div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setTestiIdx(idx)}
                className={`h-2 rounded-full transition-all ${
                  testiIdx === idx ? 'w-6 bg-[#0066FF]' : 'w-2 bg-slate-300'
                }`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* 9. STATS BAND */}
      <section className="py-14 bg-[#0c2340] text-white px-4 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl md:text-4xl font-black text-emerald-400 font-mono">₹450M+</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">Revenue Won Back</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-[#0066FF] font-mono">94.2%</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">CBS Reschedule Clearance</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-amber-400 font-mono">91.4%</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">Dispute Defense Win Rate</div>
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-white font-mono">100%</div>
            <div className="text-xs text-slate-300 mt-1 font-medium">RBI Circular Compliance</div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION */}
      <section id="faq" className="py-20 px-4 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0066FF] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-[#0c2340] tracking-tight">
            Everything You Need to Know
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#0c2340] hover:text-[#0066FF] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180 text-[#0066FF]' : 'text-slate-400'}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 11. FINAL CTA */}
      <section className="py-16 px-4 lg:px-8 bg-gradient-to-r from-[#0052cc] to-[#0066FF] text-white text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Ready to Stop Losing 35% of Your Recurring Revenue?
          </h2>
          <p className="text-base text-blue-100 max-w-2xl mx-auto">
            Experience the live interactive Sentinel with real Indian banking telemetry, Hinglish recovery, and policy guardrails today.
          </p>
          <button
            onClick={onLaunchConsole}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#0052cc] text-sm font-extrabold shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 mx-auto transition-all"
          >
            <span>Launch Live RevivePay Platform Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* 12. MEGA FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-4 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white font-bold">
                <Zap className="h-4 w-4" />
              </div>
              <span className="font-black text-white text-base">Razorpay RevivePay AI</span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Autonomous recurring revenue recovery sentinel for Indian merchants. Built on Razorpay's API ecosystem.
            </p>
            <div className="font-mono text-[11px] text-slate-500">
              Compliant with RBI Circular RBI/2020-21/74 & NPCI AutoPay Framework.
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Products</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white">AutoPay Sentinel</a></li>
              <li><a href="#features" className="hover:text-white">Hinglish Conversational</a></li>
              <li><a href="#features" className="hover:text-white">B2B Receivables Chaser</a></li>
              <li><a href="#features" className="hover:text-white">DisputeShield</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Developers</h5>
            <ul className="space-y-2">
              <li><a href="#developers" className="hover:text-white">REST API Documentation</a></li>
              <li><a href="#developers" className="hover:text-white">Webhook Simulator</a></li>
              <li><a href="#developers" className="hover:text-white">SDK Libraries (Node/Py)</a></li>
              <li><a href="#features" className="hover:text-white">Audit Trail Verifier</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Company</h5>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Security & RBI Compliance</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© 2026 Razorpay RevivePay AI Sentinel. All rights reserved.</span>
          <span className="font-mono text-slate-500">Designed for Razorpay AI Hackathon • Tracks 01, 02, 03 & 04</span>
        </div>
      </footer>

    </div>
  );
}

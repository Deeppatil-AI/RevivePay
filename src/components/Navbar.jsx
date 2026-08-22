import React, { useState } from 'react';
import { 
  Zap, Activity, Sliders, RefreshCw, Layers, 
  Building2, ShieldCheck, Radio, BarChart3, Globe, 
  Bot, Award, Menu, X, Sparkles 
} from 'lucide-react';

export default function Navbar({ 
  onOpenPolicy, 
  onResetBatch, 
  activeTab, 
  setActiveTab, 
  stats, 
  onGoToLanding,
  onOpenAgenticModal,
  onOpenCertModal,
  onStartDemoTour
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'batch', label: 'Subscriptions Batch', icon: Layers, count: `${stats.totalProcessed}/${stats.totalCount}` },
    { id: 'ledger', label: 'Decision Audit Trail', icon: Activity, count: stats.ledgerCount },
    { id: 'invoices', label: 'B2B Receivables & PTP', icon: Building2, tag: 'Track 03/04' },
    { id: 'disputes', label: 'DisputeShield', icon: ShieldCheck, tag: 'Track 02' },
    { id: 'webhooks', label: 'Live Webhook Tester', icon: Radio, tag: 'API :5000' },
    { id: 'analytics', label: 'ROI & Cash Forecast', icon: BarChart3, tag: 'Track 04' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      
      {/* Upper Global Header */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        
        {/* Brand & Track */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center shadow-md shrink-0">
            <Zap className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-[#0c2340] tracking-tight">Razorpay</span>
              <span className="bg-blue-50 text-[#0066FF] text-[11px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                RevivePay AI Sentinel
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono hidden sm:block">
              Autonomous Revenue Recovery, B2B Chaser & Dispute Defense
            </p>
          </div>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          
          {/* Quick Demo Tour */}
          <button
            onClick={onStartDemoTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold shadow-sm transition-all animate-pulse"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">60s Demo Tour</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={onOpenAgenticModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Agentic UAP</span>
          </button>

          <button
            onClick={onOpenCertModal}
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-sm"
          >
            <Award className="h-3.5 w-3.5" />
            <span>RBI Certificate</span>
          </button>

          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0066FF] text-xs font-bold transition-all"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Website</span>
          </button>

          <button
            onClick={onOpenPolicy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all"
          >
            <Sliders className="h-3.5 w-3.5 text-[#0066FF]" />
            <span className="hidden sm:inline">Policy</span>
          </button>

          <button
            onClick={onResetBatch}
            title="Reset Simulation Data"
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

      </div>

      {/* Secondary Multi-Module Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'bg-slate-100/70 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.tag && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066FF] border border-blue-200'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Actions Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200 p-3 space-y-2 text-xs">
          <button
            onClick={() => { onOpenAgenticModal(); setMobileMenuOpen(false); }}
            className="w-full py-2 px-3 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center justify-between"
          >
            <span>Track 01: Agentic Commerce Protocol (UAP)</span>
            <Bot className="h-4 w-4" />
          </button>
          <button
            onClick={() => { onOpenCertModal(); setMobileMenuOpen(false); }}
            className="w-full py-2 px-3 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-between"
          >
            <span>Official RBI Compliance Audit Certificate</span>
            <Award className="h-4 w-4" />
          </button>
        </div>
      )}

    </header>
  );
}

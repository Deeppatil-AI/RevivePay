import React, { useState } from 'react';
import { 
  Zap, Activity, RefreshCw, Layers, 
  Building2, ShieldCheck, Radio, BarChart3, Globe, 
  Bot, Award, Menu, X 
} from 'lucide-react';

export default function Navbar({ 
  onResetBatch, 
  activeTab, 
  setActiveTab, 
  stats, 
  onGoToLanding,
  onOpenAgenticModal,
  onOpenCertModal 
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
      
      {/* Brand & Top Action Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 border-b border-slate-100">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center shadow-md shrink-0">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#0c2340] tracking-tight">Razorpay</span>
              <span className="bg-blue-50 text-[#0066FF] text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border border-blue-200">
                RevivePay
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono hidden md:block">
              Autonomous Revenue Recovery, B2B Chaser & Dispute Defense
            </p>
          </div>
        </div>

        {/* Desktop Global Action Tools */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onOpenAgenticModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Agentic UAP</span>
          </button>

          <button
            onClick={onOpenCertModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all shadow-sm"
          >
            <Award className="h-3.5 w-3.5" />
            <span>RBI Certificate</span>
          </button>

          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#0066FF] text-xs font-bold transition-all"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Website</span>
          </button>

          <button
            onClick={onResetBatch}
            title="Reset Simulation Data"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={onResetBatch}
            title="Reset Cohort"
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#0066FF]" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Desktop Horizontal Navigation Tabs */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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

      {/* Mobile Drawer Menu (Collapsed below md) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-50 border-t border-slate-200 p-3 space-y-2 text-xs animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto">
          
          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-200">
            <button
              onClick={() => { onOpenAgenticModal(); setMobileMenuOpen(false); }}
              className="py-2 px-2.5 rounded-xl bg-purple-50 text-purple-700 font-bold border border-purple-200 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Agentic UAP</span>
            </button>

            <button
              onClick={() => { onOpenCertModal(); setMobileMenuOpen(false); }}
              className="py-2 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Award className="h-3.5 w-3.5" />
              <span>RBI Audit</span>
            </button>

            <button
              onClick={() => { onGoToLanding(); setMobileMenuOpen(false); }}
              className="col-span-2 py-2 px-2.5 rounded-xl bg-blue-50 text-[#0066FF] font-bold border border-blue-200 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>View Marketing Website</span>
            </button>
          </div>

          {/* Mobile Tab Items List */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block">
              Sentinel Modules
            </span>

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
                  className={`w-full py-2.5 px-3 rounded-xl font-bold flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-[#0066FF] text-white shadow-sm' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.tag && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066FF]'
                      }`}>
                        {item.tag}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}

    </header>
  );
}

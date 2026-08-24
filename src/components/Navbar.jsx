import React, { useState } from 'react';
import { 
  Zap, Activity, RefreshCw, Layers, 
  Building2, ShieldCheck, Radio, BarChart3, Globe, 
  Bot, Award, Menu, X, Sun, Moon 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar({ 
  onResetBatch, 
  activeTab, 
  setActiveTab, 
  stats, 
  onGoToLanding,
  onOpenAgenticModal,
  onOpenCertModal,
  onOpenTour
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'batch', label: 'Subscriptions Batch', icon: Layers, count: `${stats.totalProcessed}/${stats.totalCount}` },
    { id: 'ledger', label: 'Decision Audit Trail', icon: Activity, count: stats.ledgerCount },
    { id: 'invoices', label: 'B2B Receivables & PTP', icon: Building2, tag: 'Track 03/04' },
    { id: 'disputes', label: 'DisputeShield', icon: ShieldCheck, tag: 'Track 02' },
    { id: 'webhooks', label: 'Live Webhook Tester', icon: Radio, tag: 'API :5000' },
    { id: 'analytics', label: 'ROI & Cash Forecast', icon: BarChart3, tag: 'Track 04' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0b192e] border-b border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
      
      {/* Brand & Top Action Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
        
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-tr from-[#0052cc] to-[#0066FF] flex items-center justify-center shadow-md shrink-0">
            <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-white fill-white" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-sm sm:text-base text-[#0c2340] dark:text-white tracking-tight">Razorpay</span>
              <span className="bg-blue-50 text-[#0066FF] dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md border border-blue-200">
                RevivePay
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden md:block truncate">
              Autonomous Revenue Recovery, B2B Chaser & Dispute Defense
            </p>
          </div>
        </div>

        {/* Desktop Global Action Tools (Visible on md and up) */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenTour}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0052cc] to-[#0066FF] hover:from-[#0047b3] hover:to-[#0052cc] text-white text-xs font-black transition-all shadow-md animate-pulse"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>60s Pitch Tour</span>
          </button>

          <button
            onClick={onOpenAgenticModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/50 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="h-3.5 w-3.5" />
            <span>Agentic UAP</span>
          </button>

          <button
            onClick={onOpenCertModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition-all shadow-sm"
          >
            <Award className="h-3.5 w-3.5" />
            <span>RBI Certificate</span>
          </button>

          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-[#0066FF] dark:text-blue-300 text-xs font-bold transition-all"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Website</span>
          </button>

          <button
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
          >
            {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-slate-600" />}
          </button>

          <button
            onClick={onResetBatch}
            aria-label="Reset Simulation Data"
            title="Reset Simulation Data"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Single Mobile Hamburger Menu Toggle (Below md) */}
        <div className="flex md:hidden items-center shrink-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5 text-[#0066FF]" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Desktop Horizontal Navigation Tabs (Hidden on mobile) */}
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
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
                {item.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
                {item.tag && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066FF] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
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
        <div className="md:hidden bg-white dark:bg-[#0b192e] border-t border-slate-200 dark:border-slate-800 p-3 space-y-2.5 text-xs animate-fade-in shadow-xl max-h-[85vh] overflow-y-auto w-full">
          
          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => { onOpenAgenticModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Bot className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Agentic UAP</span>
            </button>

            <button
              onClick={() => { onOpenCertModal(); setMobileMenuOpen(false); }}
              className="py-2.5 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Award className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">RBI Certificate</span>
            </button>

            <button
              onClick={() => { onGoToLanding(); setMobileMenuOpen(false); }}
              className="py-2.5 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0066FF] dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Website</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={toggleTheme}
                aria-label={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 shadow-sm"
              >
                {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
                <span className="text-[10px]">{isDark ? 'Light' : 'Dark'}</span>
              </button>

              <button
                onClick={() => { onResetBatch(); setMobileMenuOpen(false); }}
                aria-label="Reset Simulation Data"
                className="py-2.5 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1 shadow-sm"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="text-[10px]">Reset</span>
              </button>
            </div>
          </div>

          {/* Mobile Vertical Navigation List */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 block">
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
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.count !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {item.count}
                      </span>
                    )}
                    {item.tag && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0066FF] dark:bg-blue-950 dark:text-blue-300'
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

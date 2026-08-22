import React, { useState } from 'react';
import { AlertTriangle, Flame, RotateCcw, ShieldCheck, Zap } from 'lucide-react';
import { ApiService } from '../services/api.js';
import confetti from 'canvas-confetti';

export default function ChaosBanner({ onChaosTriggered }) {
  const [activeChaos, setActiveChaos] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTriggerChaos = async (bankKey, scenario) => {
    setIsLoading(true);
    try {
      const res = await ApiService.triggerChaos(bankKey, scenario);
      if (res && res.activeChaosMode) {
        setActiveChaos(res.activeChaosMode);
        if (onChaosTriggered) onChaosTriggered();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChaos = async () => {
    setIsLoading(true);
    try {
      await ApiService.resetChaos();
      setActiveChaos(null);
      if (onChaosTriggered) onChaosTriggered();
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border-b px-4 lg:px-8 py-2.5 transition-all text-xs font-sans ${
      activeChaos 
        ? 'bg-rose-50 border-rose-200 text-rose-900' 
        : 'bg-amber-50/70 border-amber-200 text-amber-900'
    }`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-lg shrink-0 ${activeChaos ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
            {activeChaos ? <Flame className="h-4 w-4 animate-bounce" /> : <AlertTriangle className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-bold flex items-center gap-2">
              <span>Chaos Monkey Disaster Simulator</span>
              {activeChaos && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold animate-pulse">
                  CRITICAL OUTAGE ACTIVE: {activeChaos.bankKey} (0% SR)
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-80">
              {activeChaos 
                ? activeChaos.impactSummary 
                : "Simulate sudden Indian core banking downtime spikes to test Sentinel autonomous resilience."}
            </p>
          </div>
        </div>

        {/* Action Trigger Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!activeChaos ? (
            <>
              <button
                onClick={() => handleTriggerChaos("SBI", "MIDNIGHT_CBS_LOCK")}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Simulate SBI Midnight Crash</span>
              </button>

              <button
                onClick={() => handleTriggerChaos("PNB", "SWITCH_TIMEOUT_BURST")}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Simulate PNB Switch Spike</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleResetChaos}
              disabled={isLoading}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Normal Bank Telemetry</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

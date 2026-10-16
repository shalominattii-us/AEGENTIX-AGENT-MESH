import React, { useState, useRef, useEffect } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  AlertTriangle, 
  Key, 
  Wallet, 
  Sparkles, 
  Globe, 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  Monitor, 
  Mic, 
  Download,
  ChevronDown,
  Layers,
  Activity
} from 'lucide-react';
import { SovereignSeal } from './SovereignSeal';
import { AuthIndicator } from './AuthIndicator';
import { LLMStatus } from '../types';

interface HeaderProps {
  isAutopilot: boolean;
  onToggleAutopilot: () => void;
  onOpenWalletModal: () => void;
  onOpenPromptModal: () => void;
  onOpenTocModal?: () => void;
  onOpenExportModal?: () => void;
  onTriggerStressTest: () => void;
  isStressTesting: boolean;
  connectedWallet: { address: string; type: string } | null;
  gasPriceGwei: number;
  lastSyncTime: string;
  llmStatus?: LLMStatus | null;
  isExpandedCanvas?: boolean;
  onToggleExpandedCanvas?: () => void;
  onOpenDeviceMapping?: () => void;
  onOpenSpaceBunny?: () => void;
  onOpenLounge?: () => void;
  onOpenMedical?: () => void;
  onOpenPinnacle?: () => void;
  onOpenLedger?: () => void;
  onOpenTrading?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isAutopilot,
  onToggleAutopilot,
  onOpenWalletModal,
  onOpenPromptModal,
  onOpenTocModal,
  onOpenExportModal,
  onTriggerStressTest,
  isStressTesting,
  connectedWallet,
  gasPriceGwei,
  lastSyncTime,
  llmStatus,
  isExpandedCanvas,
  onToggleExpandedCanvas,
  onOpenDeviceMapping,
  onOpenSpaceBunny,
  onOpenLounge,
  onOpenMedical,
  onOpenPinnacle,
  onOpenLedger,
  onOpenTrading,
}) => {
  const [isAppsDropdownOpen, setIsAppsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsAppsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-5 py-2 w-full max-w-full overflow-x-clip">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between gap-2 lg:gap-4">
        {/* Zone 1: Brand Mark with Sovereign Seal */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <SovereignSeal size={36} />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-white uppercase">Aegentix</span>
              <span className="text-[10px] sm:text-xs text-cyan-400 font-medium tracking-wide">Sovereign OS</span>
              <span className="hidden sm:inline px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[9px] font-bold">
                CANONICAL
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden xl:block">
              Governance &middot; Continuity &middot; Cross-Exchange Orchestrator
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation & Telemetry (Visible on ultra-wide screens to protect button framing) */}
        <div className="hidden 2xl:flex items-center gap-3 text-xs text-slate-400 font-mono shrink">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Gas: {gasPriceGwei} Gwei</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span>actor-001 [SOVEREIGN]</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1" title={llmStatus?.cooldownReason || 'Autonomous decision engine'}>
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-300">
              {llmStatus?.inCooldown ? 'Core Algo' : 'Gemini 3.8 / Sovereign'}
            </span>
          </div>
        </div>

        {/* Zone 3: Actions & Controls - Tightly Framed & Non-Overflowing */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 justify-end">
          {/* Modular Auth Indicator */}
          <AuthIndicator />

          {/* Autopilot Master Switch / Standby Toggle */}
          <button
            onClick={onToggleAutopilot}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
              isAutopilot
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-800/90 text-amber-300 hover:text-white border border-amber-500/40 shadow-sm shadow-amber-950/20'
            }`}
            title={isAutopilot ? 'Autopilot Active (Click to set Standby)' : 'Currently on Standby (Click to activate Autopilot)'}
          >
            <span className={`w-2 h-2 rounded-full ${isAutopilot ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'}`} />
            <span className="whitespace-nowrap">{isAutopilot ? 'AUTOPILOT ON' : 'STANDBY'}</span>
          </button>

          {/* Table of Contents Modal */}
          {onOpenTocModal && (
            <button
              onClick={onOpenTocModal}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 hover:from-cyan-500/30 hover:to-indigo-500/30 text-cyan-300 border border-cyan-500/40 rounded text-xs font-mono font-medium transition-all cursor-pointer"
              title="Open 34 Subsystems Table of Contents"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Index</span>
            </button>
          )}

          {/* Export Code / App Bundle */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 hover:from-emerald-500/30 hover:to-cyan-500/30 text-emerald-300 border border-emerald-500/40 rounded text-xs font-mono font-medium transition-all cursor-pointer"
              title="Export Full Codebase"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Export</span>
            </button>
          )}

          {/* Triage vs Focus Canvas Toggle */}
          {onToggleExpandedCanvas && (
            <button
              onClick={onToggleExpandedCanvas}
              className={`hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-all border cursor-pointer ${
                isExpandedCanvas
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 font-bold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
              title={isExpandedCanvas ? 'Return to 3-column triage layout' : 'Expand active canvas to full width'}
            >
              {isExpandedCanvas ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden lg:inline">Triage</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden lg:inline">Focus</span>
                </>
              )}
            </button>
          )}

          {/* Flash Crash Stress Test */}
          <button
            onClick={onTriggerStressTest}
            disabled={isStressTesting}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs font-mono transition-colors disabled:opacity-50 cursor-pointer"
            title="Simulate sudden market crash to test autonomous circuit breakers"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden xl:inline">{isStressTesting ? 'Sim...' : 'Stress'}</span>
          </button>

          {/* Quick Apps Menu Dropdown - Consolidates all 7 secondary apps without exploding header width */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsAppsDropdownOpen(!isAppsDropdownOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-medium transition-all cursor-pointer"
              title="Quick Launch Secondary Ecosystem Apps"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Apps</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isAppsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAppsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0D111A] border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 text-xs font-mono space-y-1 backdrop-blur-xl animate-in fade-in slide-in-from-top-1">
                <div className="px-2 py-1 text-[10px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800 pb-1.5 mb-1">
                  Ecosystem Quick Launch
                </div>

                {onOpenLounge && (
                  <button
                    onClick={() => { onOpenLounge(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🌿</span>
                      <span>Captain&apos;s Lounge &amp; Visor</span>
                    </span>
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">FPV</span>
                  </button>
                )}

                {onOpenSpaceBunny && (
                  <button
                    onClick={() => { onOpenSpaceBunny(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🐰</span>
                      <span>Space Bunny Stealth Chat</span>
                    </span>
                    <span className="text-[9px] px-1 bg-fuchsia-500/20 text-fuchsia-400 rounded">AI</span>
                  </button>
                )}

                {onOpenDeviceMapping && (
                  <button
                    onClick={() => { onOpenDeviceMapping(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🖥️</span>
                      <span>Desktop &amp; Device Mapping</span>
                    </span>
                    <span className="text-[9px] px-1 bg-cyan-500/20 text-cyan-400 rounded">IO</span>
                  </button>
                )}

                {onOpenMedical && (
                  <button
                    onClick={() => { onOpenMedical(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🩺</span>
                      <span>Medical Recruiter Enclave</span>
                    </span>
                    <span className="text-[9px] px-1 bg-rose-500/20 text-rose-400 rounded">HIPAA</span>
                  </button>
                )}

                {onOpenPinnacle && (
                  <button
                    onClick={() => { onOpenPinnacle(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>🏛️</span>
                      <span>Pinnacle Derivatives</span>
                    </span>
                    <span className="text-[9px] px-1 bg-amber-500/20 text-amber-400 rounded">B2B</span>
                  </button>
                )}

                {onOpenTrading && (
                  <button
                    onClick={() => { onOpenTrading(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>📈</span>
                      <span>29 Institutional Exchanges</span>
                    </span>
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-400 rounded">Desk</span>
                  </button>
                )}

                {onOpenLedger && (
                  <button
                    onClick={() => { onOpenLedger(); setIsAppsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span>💼</span>
                      <span>Sovereign Ledger</span>
                    </span>
                    <span className="text-[9px] px-1 bg-purple-500/20 text-purple-400 rounded">Mantis</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Wallet / API Connection */}
          <button
            onClick={onOpenWalletModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-950 hover:bg-cyan-300 rounded text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {connectedWallet
                ? `${connectedWallet.address.slice(0, 6)}...${connectedWallet.address.slice(-4)}`
                : 'Connect'}
            </span>
            <span className="sm:hidden font-mono text-[10px]">Wallet</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

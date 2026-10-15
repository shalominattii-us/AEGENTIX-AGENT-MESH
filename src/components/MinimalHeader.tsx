import React from 'react';
import {
  Globe,
  Shield,
  Activity,
  Layers,
  Fuel,
  Terminal,
  Cpu,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import { SovereignSeal } from './SovereignSeal';

interface MinimalHeaderProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  gasPriceGwei: number;
  gasTankUsd: number;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  currentTab,
  onSelectTab,
  gasPriceGwei,
  gasTankUsd,
}) => {
  const primaryNavItems = [
    { id: 'SOVEREIGN_ORIGIN_NODE', label: 'Origin Node', tag: 'Primary Root' },
    { id: 'ZERO_CAP_FLYWHEEL', label: 'Gas Reserves', tag: `$${gasTankUsd.toFixed(0)}` },
    { id: 'NEXUS_REGISTRY', label: 'Skill Matrix', tag: '2,710' },
    { id: 'TRADING_COMMAND', label: 'Execution', tag: 'Live' },
    { id: 'PORTAL_LANDING', label: 'Overview', tag: null },
  ];

  return (
    <header className="border-b border-white/[0.06] bg-[#090A0F]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Anchor */}
        <div 
          onClick={() => onSelectTab('SOVEREIGN_ORIGIN_NODE')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-white/20 transition-colors">
            <Shield className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white">AEGENTIX</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                Sovereign Core
              </span>
            </div>
          </div>
        </div>

        {/* Clean Center Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
          {primaryNavItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-sm border border-white/[0.08]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <span>{item.label}</span>
                {item.tag && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-white/10 text-white' : 'bg-white/[0.04] text-zinc-400'
                  }`}>
                    {item.tag}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Gas: {gasPriceGwei} Gwei</span>
          </div>

          <a
            href="http://localhost:8890/ui"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <span>Bastet UI</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default MinimalHeader;

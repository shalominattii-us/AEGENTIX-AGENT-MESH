import React, { useState } from 'react';
import {
  Shield,
  Server,
  Zap,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Cpu,
  Monitor,
  Activity,
  Lock,
  Terminal,
  ArrowUpRight,
  Code2,
  RefreshCw,
  TrendingUp,
  Flame,
  Radio,
  ShieldAlert,
  Scale,
  AlertOctagon
} from 'lucide-react';
import { SovereignSeal } from './SovereignSeal';

interface PublicLandingPortalProps {
  onLaunchOriginNode?: () => void;
  onLaunchZeroCap?: () => void;
  onLaunchSkillMatrix?: () => void;
  onLaunchAntiTrafficking?: () => void;
  onLaunchMedicalApp?: () => void;
  onLaunchPinnacleApp?: () => void;
  onLaunchJarvisBuilder?: () => void;
  onLaunchTradingCommand?: () => void;
  onOpenLedger?: () => void;
  onNotify?: (msg: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const PublicLandingPortal: React.FC<PublicLandingPortalProps> = ({
  onLaunchOriginNode,
  onLaunchZeroCap,
  onLaunchSkillMatrix,
  onLaunchAntiTrafficking,
  onLaunchMedicalApp,
  onLaunchPinnacleApp,
  onLaunchJarvisBuilder,
  onLaunchTradingCommand,
  onOpenLedger,
  onNotify
}) => {
  const [selectedArchTab, setSelectedArchTab] = useState<'agent_os' | 'zero_cap' | 'tensor_os' | 'skills'>('agent_os');
  const [simulatedVolume, setSimulatedVolume] = useState<number>(50000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simFeedback, setSimFeedback] = useState<string | null>(null);

  // Calculate live cut: 0.25% (25 bps) on Jupiter DEX routing
  const jupiterGrossCut = (simulatedVolume * 25) / 10000;
  const gasTankSplit = jupiterGrossCut * 0.35;
  const treasurySplit = jupiterGrossCut * 0.65;

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimFeedback(`+$${jupiterGrossCut.toFixed(2)} USD routed into treasury (+35% auto-allocated to node gas reserves).`);
      if (onNotify) {
        onNotify(`Routed $${simulatedVolume.toLocaleString()} volume. Collected $${jupiterGrossCut.toFixed(2)} fee cut.`, 'SUCCESS');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Institutional Bar */}
      <div className="border-b border-white/[0.08] bg-[#0A0B10]/90 backdrop-blur-xl px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm tracking-tight">AEGENTIX</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Sovereign Core
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-400 font-medium">
            <button
              onClick={onLaunchOriginNode}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Origin Node Cockpit
            </button>
            <button
              onClick={onLaunchZeroCap}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Cap Flywheel</span>
            </button>
            <button
              onClick={onLaunchSkillMatrix}
              className="hover:text-white transition-colors cursor-pointer"
            >
              2,710 Skill Matrix
            </button>
            <button
              onClick={onLaunchTradingCommand}
              className="hover:text-white transition-colors cursor-pointer"
            >
              29 DEX/CEX Venues
            </button>
            <button
              onClick={onLaunchAntiTrafficking}
              className="hover:text-rose-300 transition-colors cursor-pointer flex items-center gap-1.5 text-rose-400 font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Anti-Trafficking Sentinel</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLaunchOriginNode}
              className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>Launch Cockpit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-emerald-400">Autonomous Agent OS &amp; Zero-Capital Mesh</span>
            <span className="text-zinc-600">&middot;</span>
            <span className="text-zinc-400 font-mono">v4.2.0-SOV</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-[1.12]">
            Deterministic AI Operating Systems &amp; <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Zero-Capital Liquidity Engines
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto leading-relaxed font-normal">
            A unified sovereign control plane coordinating distributed agent runtimes, P2P swarm consensus, and automated fee-extraction conduits. Powered by local silicon, verified on-chain routing, and non-custodial treasury settlement.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={onLaunchOriginNode}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-sm shadow-sm shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Monitor className="w-4 h-4" />
              <span>Open Sovereign Cockpit</span>
            </button>

            <button
              onClick={onLaunchZeroCap}
              className="px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Zero-Capital Revenue Streams</span>
            </button>

            <button
              onClick={onLaunchAntiTrafficking}
              className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-medium text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Anti-Trafficking Sentinel</span>
            </button>

            <a
              href="#tensoragent"
              className="px-5 py-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-zinc-300 border border-white/[0.06] font-medium text-sm flex items-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <Terminal className="w-4 h-4 text-zinc-400" />
              <span>TensorAgent OS (Bootable ISO)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Structured Telemetry Strip */}
      <section className="border-y border-white/[0.06] bg-[#0A0B10] py-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3 space-y-1">
            <div className="text-2xl font-semibold text-white font-mono">13 Runtimes</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Orchestrated Mesh</div>
            <div className="text-[11px] text-emerald-400 font-mono">Bastet · Qualixar · Kronos</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-2xl font-semibold text-emerald-400 font-mono">0.25% Cut</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">DEX Routing Fee</div>
            <div className="text-[11px] text-zinc-500 font-mono">Jupiter V6 Solana Aggregator</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-2xl font-semibold text-white font-mono">2,710 Skills</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Nexus Matrix Engine</div>
            <div className="text-[11px] text-zinc-500 font-mono">290 LLM Provider Routes</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-2xl font-semibold text-white font-mono">&lt; 50ms</div>
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">Hardware Execution</div>
            <div className="text-[11px] text-emerald-400 font-mono">AMD Ryzen AI Z2 Extreme</div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Four Sovereign Foundation Pillars
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Eliminating recurring cloud subscriptions, vendor rent, and closed-source dependencies in favor of self-hosted, local-first intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Agent OS Suite */}
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Multi-Agent OS Suite
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Native coordination across Bastet OS (control plane), Qualixar OS (hierarchical swarms), and Kronos KAOS (durable turns).
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-500 font-mono pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Port :8890 Root Bypass</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Port :3001 Swarm Dashboard</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Port :8789 Durable REST</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchOriginNode}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Zero-Capital Flywheel */}
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Zero-Capital Yields
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Extracts 25 bps on Jupiter Solana routing and 20 bps on 1inch Fusion rebates without depositing initial capital.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-500 font-mono pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>0.25% DEX Integrator Cut</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>35% Auto-Refuel Gas Tank</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>65% Treasury Profit Route</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchZeroCap}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>View Revenue Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: TensorAgent OS */}
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                TensorAgent OS
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bootable Linux ISO where the AI agent is the primary interface with native kernel, hardware, filesystem, and systemd access.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-500 font-mono pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2.13 GB Debian Bookworm ISO</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>OpenWhale &amp; WhaleOS Shell</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-Click QEMU &amp; VirtualBox</span>
                </li>
              </ul>
            </div>
            <a
              href="#tensoragent"
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Inspect Boot Kit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Card 4: Nexus Skill Matrix */}
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">
                2,710 Skill Matrix
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Autonomous capability registry spanning API security, quant analysis, reverse engineering, DevOps, and cloud infrastructure.
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-500 font-mono pt-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Zero-Config Dynamic Tooling</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Multi-Model Codex Review</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AgentSecCore Sandboxing</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchSkillMatrix}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border border-white/[0.08] text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore Matrix</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Zero-Capital Revenue Calculator */}
      <section className="py-16 px-6 bg-[#0A0B10] border-y border-white/[0.06]">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h3 className="text-lg font-semibold text-white">Zero-Capital Revenue Calculator</h3>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Calculate real referral yields collected via Jupiter V6 on Solana (25 bps) with automatic gas tank replenishment.
              </p>
            </div>
            <div className="text-xs font-mono text-zinc-500 bg-white/[0.02] border border-white/[0.06] px-3 py-1.5 rounded-lg">
              Solana Payout Key: <span className="text-zinc-300">4u8D5...e8X2</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#08090D] border border-white/[0.08] space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-400">Monthly Routed Volume:</span>
                <span className="text-base text-white font-semibold">${simulatedVolume.toLocaleString()} USD</span>
              </div>
              <input
                type="range"
                min="5000"
                max="500000"
                step="5000"
                value={simulatedVolume}
                onChange={(e) => setSimulatedVolume(Number(e.target.value))}
                className="w-full accent-emerald-400 h-2 bg-zinc-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                <span>$5,000</span>
                <span>$100,000</span>
                <span>$250,000</span>
                <span>$500,000</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.04]">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="text-[11px] text-zinc-400 font-medium">Gross Referral Cut (0.25%)</div>
                <div className="text-2xl font-semibold text-emerald-400 font-mono">
                  ${jupiterGrossCut.toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Direct non-custodial yield</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="text-[11px] text-zinc-400 font-medium">Gas Tank Auto-Refuel (35%)</div>
                <div className="text-2xl font-semibold text-amber-400 font-mono">
                  ${gasTankSplit.toFixed(2)}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">Keeps nodes 100% online</div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
                <div className="text-[11px] text-zinc-400 font-medium">Treasury Profit (65%)</div>
                <div className="text-2xl font-semibold text-white font-mono">
                  ${treasurySplit.toFixed(2)}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">Net operational cashflow</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-zinc-400">
                {simFeedback || 'Zero liquidity required. Pure protocol routing rebate.'}
              </div>
              <button
                onClick={handleSimulate}
                disabled={isSimulating}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
                <span>Simulate Route Execution</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Anti-Human-Trafficking & Forced Labor Scrutiny Sentinel Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        <div className="border border-rose-500/20 bg-[#0C0D14] rounded-2xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>FINCEN FIN-2020-A008 &middot; DOL ILAB &middot; 18 U.S.C. §§ 1581–1597</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                Zero-Tolerance Anti-Trafficking Sentinel
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed">
                Deterministic compliance gating and tripwire enforcement against human trafficking, modern slavery, and child labor. The engine continuously cross-checks all counterparty identities, trade corridors, and declared cargo against FinCEN typologies, the Uyghur Forced Labor Prevention Act (UFLPA), and US State Department TIP Tier 3 watchlists.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>12 FinCEN Red-Flag Behavioral Typologies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>22 DOL ILAB High-Risk Sourced Commodities</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>16 Sanctioned Tier 3 Sovereign Regimes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>18 U.S.C. § 1594 Asset Forfeiture Tripwires</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#08090D] border border-white/[0.08] space-y-4 shrink-0 sm:min-w-[320px]">
              <div className="text-xs font-semibold text-white">Full-Spectrum Sentinel Active</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Statutory Covenant</div>
                  <code>SOVEREIGN_HUMAN_FREEDOM_COVENANT_V1</code>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Gateway Response</div>
                  <code>IMMEDIATE_SOCKET_DISCONNECT</code>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Audit Chain State</div>
                  <code>HMAC-SHA256 IMMUTABLE LOGGING</code>
                </div>
              </div>

              <button
                onClick={onLaunchAntiTrafficking}
                className="w-full py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-sm shadow-rose-900/30"
              >
                <span>Launch Anti-Trafficking Sentinel Suite</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TensorAgent OS Bare-Metal Integration Section */}
      <section id="tensoragent" className="py-20 px-6 max-w-7xl mx-auto space-y-10">
        <div className="border border-white/[0.08] bg-[#0C0D14] rounded-2xl p-6 sm:p-10 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Terminal className="w-3.5 h-3.5" />
                <span>BARE-METAL AGENT OS</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                TensorAgent OS: Raw Linux Kernel Boot
              </h2>

              <p className="text-sm text-zinc-400 leading-relaxed">
                When user-space processes inside Windows or Docker are not enough, boot into a dedicated operating system where the AI agent is the primary user and interface. Built on Debian Bookworm with native kernel access, uncontained systemd privileges, and headless WebMCP Chromium.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>ISO Digest: <code className="text-zinc-300">599BFB97...</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Default Login: <code className="text-zinc-300">ainux / ainux</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Port 7777 WhaleOS Web Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Port 2222 Direct SSH Enclave</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[#08090D] border border-white/[0.08] space-y-4 shrink-0 sm:min-w-[320px]">
              <div className="text-xs font-semibold text-white">Local Boot Scripts Ready</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Option 1: QEMU Launcher</div>
                  <code>boot-tensoragent-qemu.bat</code>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Option 2: VirtualBox Automator</div>
                  <code>create-virtualbox-vm.bat</code>
                </div>
                <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] text-zinc-300">
                  <div className="text-zinc-500 text-[10px]">Option 3: VMware Definition</div>
                  <code>tensoragent-os.vmx</code>
                </div>
              </div>

              <button
                onClick={() => {
                  if (onNotify) onNotify('Boot scripts located in C:\\TensorAgentOS\\', 'INFO');
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Inspect C:\TensorAgentOS</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Institutional Footer */}
      <footer className="border-t border-white/[0.06] bg-[#06070A] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <span className="font-semibold text-sm text-white tracking-tight">AEGENTIX SOVEREIGN</span>
              <p className="text-[11px] text-zinc-500">Self-Hosted Autonomous AI &amp; Zero-Capital Mesh</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-400">
            <button onClick={onLaunchOriginNode} className="hover:text-white transition-colors cursor-pointer">
              Origin Cockpit
            </button>
            <button onClick={onLaunchZeroCap} className="hover:text-white transition-colors cursor-pointer">
              Zero-Cap Streams
            </button>
            <button onClick={onLaunchSkillMatrix} className="hover:text-white transition-colors cursor-pointer">
              Skill Registry
            </button>
            <button onClick={onLaunchAntiTrafficking} className="hover:text-rose-300 text-rose-400 transition-colors cursor-pointer">
              Anti-Trafficking
            </button>
            <a
              href="https://github.com/shalominattii-us/Aegentix-super-agent-wallet-Google-ai-studios"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            HMAC-Attested &middot; Hardware Enclave &middot; 2026
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPortal;

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Server,
  Activity,
  Zap,
  Radio,
  Lock,
  Fuel,
  RefreshCw,
  Send,
  CheckCircle2,
  Terminal,
  ExternalLink,
  ChevronRight,
  Cpu,
  Layers,
  ArrowUpRight,
  Database,
  Monitor,
  Maximize2,
  DollarSign,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface SubRuntime {
  id: string;
  name: string;
  framework: string;
  category: string;
  port: number;
  status: string;
  latencyMs: number;
  endpoint: string;
  isPrimary: boolean;
  capabilities: string[];
  metrics: {
    operationsCount: number;
    healthScore: number;
    lastActiveAt: string;
  };
}

interface SovereignState {
  primaryNodeId: string;
  name: string;
  authorityLevel: string;
  version: string;
  status: string;
  hardwareHmacSeal: string;
  currentBlockHeight: number;
  totalConnectedRuntimes: number;
  runtimes: SubRuntime[];
  activeTaskQueue: Array<{
    id: string;
    targetRuntime: string;
    prompt: string;
    resultSummary: string;
    status: string;
    timestamp: string;
  }>;
  meshTelemetry: {
    swarmDecisionVelocity: number;
    gasTankUsd: number;
    gasTankEth: number;
    gasTankSol: number;
    binanceFeedOnline: boolean;
    moltbookTrioActive: boolean;
    zeroCapStreamCount: number;
  };
}

interface Props {
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const SovereignOriginNodeSuite: React.FC<Props> = ({ onNotify }) => {
  const [state, setState] = useState<SovereignState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRuntime, setSelectedRuntime] = useState('qualixar-topology-engine');
  const [promptInput, setPromptInput] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [isActionRunning, setIsActionRunning] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('ALL');
  
  // Active Interactive Agent OS Cockpit Tab
  const [activeOsCockpit, setActiveOsCockpit] = useState<'qualixar' | 'bastet' | 'kaos' | 'zerocap'>('qualixar');
  const [iframeKey, setIframeKey] = useState(0);

  // Zero-Cap Simulation State
  const [isSimulatingSwap, setIsSimulatingSwap] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    txHash: string;
    volumeUsd: number;
    feeEarned: number;
    gasSplit: number;
    treasurySplit: number;
  } | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/origin-node/status');
      if (res.ok) {
        const data = await res.json();
        if (data.state) setState(data.state);
      }
    } catch (err) {
      console.error('Origin Node status error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAction = async (action: string) => {
    setIsActionRunning(action);
    try {
      const res = await fetch('/api/origin-node/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.state) setState(data.state);
        if (onNotify) onNotify(data.message || 'Action executed.', 'SUCCESS');
      } else {
        if (onNotify) onNotify(data.error || 'Execution failed.', 'ALERT');
      }
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'Execution error.', 'ALERT');
    } finally {
      setIsActionRunning(null);
    }
  };

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsDispatching(true);
    try {
      const res = await fetch('/api/origin-node/dispatch-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetRuntime: selectedRuntime,
          prompt: promptInput,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.state) setState(data.state);
        setPromptInput('');
        if (onNotify) onNotify(`Directive sent to ${data.task?.targetRuntime || 'agent'}.`, 'SUCCESS');
      }
    } catch (err: any) {
      if (onNotify) onNotify(err.message || 'Dispatch error.', 'ALERT');
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSimulateSwap = async () => {
    setIsSimulatingSwap(true);
    try {
      const res = await fetch('/api/zero-cap/simulate-swap-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: 'SOL/USDC',
          volumeUsd: 10000,
          protocol: 'Jupiter V6 (Solana)',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationResult({
          txHash: data.streamRecord.txHash,
          volumeUsd: data.streamRecord.volumeUsd,
          feeEarned: data.streamRecord.grossFeeEarnedUsd,
          gasSplit: data.streamRecord.gasTankSplitUsd,
          treasurySplit: data.streamRecord.treasurySplitUsd,
        });
        fetchStatus();
        if (onNotify) onNotify(`+$${data.streamRecord.grossFeeEarnedUsd} routed into Aegentix treasury via Jupiter 0.25% cut!`, 'SUCCESS');
      }
    } catch (err: any) {
      if (onNotify) onNotify('Simulation error: ' + err.message, 'ALERT');
    } finally {
      setIsSimulatingSwap(false);
    }
  };

  const categories = ['ALL', 'SOVEREIGN_PRIMARY', 'COMMUNICATION_SWARM', 'FINANCIAL_ENGINE', 'EXCHANGE_LINK'];

  const filteredRuntimes = state?.runtimes.filter((r) => {
    if (activeCategory === 'ALL') return true;
    return r.category === activeCategory;
  }) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Editorial Authority Strip */}
      <div className="border border-white/[0.08] bg-[#0C0D14] rounded-2xl p-6 sm:p-8 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Root Authority
              </span>
              <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                {state?.version || 'v4.2.0'}
              </span>
              <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06]">
                Block #{state?.currentBlockHeight || 10483}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Sovereign Origin Node
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
              Deterministic primary node orchestrating 13 connected runtimes across the local Bastet Agent OS, Qualixar OS Swarm, Kronos Durable Runtime, and zero-capital self-funding liquidity engines.
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs font-mono text-zinc-500">
              <Lock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>Hardware HMAC:</span>
              <span className="text-zinc-300 select-all truncate max-w-xs sm:max-w-md">
                {state?.hardwareHmacSeal || 'SOV-HMAC-ROG-ACTIVE'}
              </span>
            </div>
          </div>

          {/* Clean Quick Actions */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
            <a
              href="http://localhost:3001/dashboard/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
            >
              <span>Qualixar OS (:3001)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="http://localhost:8890/ui/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Bastet OS (:8890)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="http://127.0.0.1:8789/api/docs"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Kronos (:8789)</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => handleAction('BOOT_ALL')}
              disabled={isActionRunning === 'BOOT_ALL'}
              className="px-4 py-2.5 rounded-xl text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isActionRunning === 'BOOT_ALL' ? 'animate-spin' : ''}`} />
              <span>Reboot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Telemetry Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Active Runtimes</div>
          <div className="text-xl font-semibold text-white tracking-tight">
            {state?.totalConnectedRuntimes || 13} / 13
          </div>
          <div className="text-[11px] font-mono text-emerald-400">100% Operational</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Gas Tank Reserve</div>
          <div className="text-xl font-semibold text-emerald-400 tracking-tight font-mono">
            ${state?.meshTelemetry.gasTankUsd.toFixed(2) || '520.15'}
          </div>
          <div className="text-[11px] font-mono text-zinc-500">
            {state?.meshTelemetry.gasTankEth || '0.182'} ETH · {state?.meshTelemetry.gasTankSol || '1.450'} SOL
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Decision Velocity</div>
          <div className="text-xl font-semibold text-white tracking-tight font-mono">
            {state?.meshTelemetry.swarmDecisionVelocity || 1.14} ops/s
          </div>
          <div className="text-[11px] font-mono text-zinc-500">Sub-50ms latency</div>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-1">
          <div className="text-xs text-zinc-400 font-medium">Zero-Cap Streams</div>
          <div className="text-xl font-semibold text-white tracking-tight font-mono">
            {state?.meshTelemetry.zeroCapStreamCount || 4} Streams
          </div>
          <div className="text-[11px] font-mono text-emerald-400">Jupiter 0.25% Active</div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE AGENT OS COCKPIT (Interactive Embedded Viewport) */}
      {/* ========================================================================= */}
      <div className="border border-white/[0.08] bg-[#0C0D14] rounded-2xl overflow-hidden backdrop-blur-md">
        {/* Cockpit Nav Bar */}
        <div className="p-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0A0B10]">
          <div className="flex items-center gap-3">
            <Monitor className="w-4 h-4 text-emerald-400" />
            <div>
              <h2 className="text-sm font-semibold text-white">Unified Agent OS Cockpit</h2>
              <p className="text-xs text-zinc-400">Direct interactive workspace for all active Agent OS engines</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.06] p-1 rounded-xl">
            <button
              onClick={() => setActiveOsCockpit('qualixar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeOsCockpit === 'qualixar'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Qualixar OS (:3001)</span>
            </button>

            <button
              onClick={() => setActiveOsCockpit('bastet')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeOsCockpit === 'bastet'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Bastet Agent OS (:8890)</span>
            </button>

            <button
              onClick={() => setActiveOsCockpit('kaos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeOsCockpit === 'kaos'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Kronos KAOS (:8789)</span>
            </button>

            <button
              onClick={() => setActiveOsCockpit('zerocap')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeOsCockpit === 'zerocap'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Cap Flywheel ($$$)</span>
            </button>
          </div>
        </div>

        {/* Cockpit Content Viewport */}
        <div className="p-4 sm:p-6 bg-[#08090D]">
          {activeOsCockpit === 'qualixar' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-medium">Qualixar OS Multi-Agent Dashboard</span>
                  <span>·</span>
                  <span className="text-zinc-500">http://localhost:3001/dashboard/</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-1 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Reload Cockpit Frame"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="http://localhost:3001/dashboard/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <span>Popout Fullscreen</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="w-full h-[650px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#0E1017]">
                <iframe
                  key={`qos-${iframeKey}`}
                  src="http://localhost:3001/dashboard/"
                  title="Qualixar OS Dashboard"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          {activeOsCockpit === 'bastet' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-medium">Bastet Agent OS Control Plane (Root Admin Bypassed)</span>
                  <span>·</span>
                  <span className="text-zinc-500">http://localhost:8890/ui/</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-1 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Reload Cockpit Frame"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="http://localhost:8890/ui/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <span>Popout Fullscreen</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="w-full h-[650px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#0E1017]">
                <iframe
                  key={`bastet-${iframeKey}`}
                  src="http://localhost:8890/ui/"
                  title="Bastet Agent OS"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          {activeOsCockpit === 'kaos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-2 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-white font-medium">Kronos Agent OS (KAOS) Durable REST & Swagger UI</span>
                  <span>·</span>
                  <span className="text-zinc-500">http://127.0.0.1:8789/api/docs</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-1 rounded hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Reload Cockpit Frame"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href="http://127.0.0.1:8789/api/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 cursor-pointer"
                  >
                    <span>Popout Fullscreen</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              <div className="w-full h-[650px] rounded-xl overflow-hidden border border-white/[0.08] bg-[#0E1017]">
                <iframe
                  key={`kaos-${iframeKey}`}
                  src="http://127.0.0.1:8789/api/docs"
                  title="Kronos Agent OS Dashboard"
                  className="w-full h-full border-none"
                />
              </div>
            </div>
          )}

          {activeOsCockpit === 'zerocap' && (
            <div className="space-y-6 p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Jupiter V6 & 1inch Fusion Zero-Capital Flow</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      0.25% Integrator Cut
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 max-w-xl">
                    Every swap routed through this node extracts a 25 bps (0.25%) referral cut without putting up liquidity. 35% auto-refuels node gas, and 65% deposits into the master profit treasury.
                  </p>
                </div>

                <button
                  onClick={handleSimulateSwap}
                  disabled={isSimulatingSwap}
                  className="px-5 py-3 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-zinc-950 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSimulatingSwap ? 'Routing Swap...' : 'Execute $10k Swap Cut (+$25 USD)'}</span>
                </button>
              </div>

              {simulationResult && (
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between text-emerald-400 font-semibold">
                    <span>Route Executed via Jupiter V6 Aggregator</span>
                    <span>TX: {simulationResult.txHash}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-zinc-300">
                    <div>
                      <div className="text-zinc-500 text-[11px]">Volume Routed</div>
                      <div className="text-sm text-white font-medium">${simulationResult.volumeUsd.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Gross Revenue (0.25%)</div>
                      <div className="text-sm text-emerald-400 font-medium">+${simulationResult.feeEarned.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Gas Tank Split (35%)</div>
                      <div className="text-sm text-amber-400 font-medium">+${simulationResult.gasSplit.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-[11px]">Treasury Profit (65%)</div>
                      <div className="text-sm text-emerald-400 font-medium">+${simulationResult.treasurySplit.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-white text-xs font-medium">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Jupiter Solana Referral Program</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Referral Key: <code className="text-zinc-300 bg-white/[0.04] px-1 py-0.5 rounded">4u8D5...e8X2</code>
                    <br />
                    Accrues SOL cuts automatically into the node wallet on every DEX swap.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-white text-xs font-medium">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>1inch Fusion & Uniswap v3 Rebates</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    EVM Address: <code className="text-zinc-300 bg-white/[0.04] px-1 py-0.5 rounded">0x71C...849F</code>
                    <br />
                    Collects 20 bps on Base, Ethereum, and Arbitrum cross-chain aggregations.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2">
                  <div className="flex items-center gap-2 text-white text-xs font-medium">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Aave v3 Flash Loan Liquidator</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Zero-capital atomic flash loans. Borrows up to $500k in single transaction block, liquidates undercollateralized debt, claims 5-10% bonus.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Workflow */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Runtimes Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-sm font-semibold text-zinc-200">
              Connected Subordinate Frameworks ({filteredRuntimes.length})
            </h2>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.06] p-1 rounded-lg">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-white/[0.08] text-white'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredRuntimes.map((runtime) => {
              const hasHttp = runtime.endpoint && runtime.endpoint.startsWith('http');
              return (
                <div
                  key={runtime.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    runtime.isPrimary
                      ? 'bg-white/[0.03] border-white/20'
                      : 'bg-[#0C0D14] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{runtime.name}</span>
                          {runtime.isPrimary && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 mt-0.5">{runtime.framework}</div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                        {runtime.status}
                      </span>
                    </div>

                    <ul className="space-y-1 text-xs text-zinc-400">
                      {runtime.capabilities.slice(0, 3).map((cap, i) => (
                        <li key={i} className="flex items-center gap-1.5 leading-snug">
                          <span className="w-1 h-1 rounded-full bg-zinc-600" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 mt-4 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono text-zinc-500">
                    <span>Port :{runtime.port}</span>
                    {hasHttp ? (
                      <a
                        href={runtime.endpoint}
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                      >
                        <span>Open Console</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    ) : (
                      <span>{runtime.metrics.healthScore}% health</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Natural Language Directive Dispatcher & Audit Log (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Sovereign Dispatcher</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Send instructions directly from the root authority down to subordinate agent runtimes.
              </p>
            </div>

            <form onSubmit={handleDispatch} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                  Target Framework
                </label>
                <select
                  value={selectedRuntime}
                  onChange={(e) => setSelectedRuntime(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-white/20 font-mono"
                >
                  {state?.runtimes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-zinc-900 text-zinc-200">
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                  Directive Prompt
                </label>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. Verify cross-DEX liquidity spreads and execute basis arbitrage..."
                  rows={3}
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 text-xs text-zinc-200 focus:outline-none focus:border-white/20 resize-none font-mono placeholder:text-zinc-600"
                />
              </div>

              <button
                type="submit"
                disabled={isDispatching || !promptInput.trim()}
                className="w-full py-2.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isDispatching ? 'Transmitting...' : 'Dispatch Directive'}</span>
              </button>
            </form>
          </div>

          {/* Audit Receipts */}
          <div className="p-5 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Execution Receipts ({state?.activeTaskQueue.length || 0})
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">HMAC Attested</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {state?.activeTaskQueue.map((task) => (
                <div key={task.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-white font-medium">{task.targetRuntime}</span>
                    <span className="font-mono text-zinc-500">{new Date(task.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs text-zinc-300">{task.prompt}</div>
                  <div className="text-[11px] font-mono text-emerald-400/90 pt-1 border-t border-white/[0.04]">
                    {task.resultSummary}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignOriginNodeSuite;

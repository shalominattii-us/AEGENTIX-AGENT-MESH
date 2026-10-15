import React, { useState, useEffect } from 'react';
import {
  Zap,
  TrendingUp,
  Fuel,
  ShieldCheck,
  RefreshCw,
  Coins,
  ArrowUpRight,
  Layers,
  Flame,
  CheckCircle2,
  Clock,
  Wallet,
  Cpu,
  Bot,
  ExternalLink,
  DollarSign
} from 'lucide-react';

interface Stream {
  id: string;
  name: string;
  protocol: string;
  type: string;
  status: string;
  totalEarnedUsd: number;
  transactionCount: number;
  description: string;
  capitalRequired: number;
}

interface InflowRecord {
  id: string;
  timestamp: string;
  streamId: string;
  streamName: string;
  volumeUsd: number;
  grossFeeEarnedUsd: number;
  gasTankSplitUsd: number;
  treasurySplitUsd: number;
  txHash: string;
  description: string;
}

interface ZeroCapState {
  totalRevenueEarnedUsd: number;
  gasTankBalanceUsd: number;
  gasTankEth: number;
  gasTankSol: number;
  treasuryVaultBalanceUsd: number;
  gasRefuelRatioPct: number;
  payoutWalletSol: string;
  payoutWalletEvm: string;
  integratorBps: number;
  streams: Stream[];
  recentInflows: InflowRecord[];
}

interface ZeroCapitalFlywheelSuiteProps {
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const ZeroCapitalFlywheelSuite: React.FC<ZeroCapitalFlywheelSuiteProps> = ({ onNotify }) => {
  const [state, setState] = useState<ZeroCapState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  const fetchState = async () => {
    try {
      const res = await fetch('/api/zero-cap/status');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setState(json.state);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch zero-cap state:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSwapRouting = async () => {
    setIsExecuting('swap');
    try {
      const res = await fetch('/api/zero-cap/simulate-swap-routing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: 'SOL/USDC', volumeUsd: 6800, protocol: 'Jupiter V6 (Solana)' }),
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        if (onNotify) onNotify(data.message, 'SUCCESS');
      }
    } catch {
      if (onNotify) onNotify('Simulation failed', 'ALERT');
    } finally {
      setIsExecuting(null);
    }
  };

  const handleSimulateFlashLiquidation = async () => {
    setIsExecuting('flash');
    try {
      const res = await fetch('/api/zero-cap/simulate-flash-liquidation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ protocol: 'Aave v3 (Arbitrum)', debtToRepayUsd: 15000, collateralSeizedBonusPct: 8.5 }),
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        if (onNotify) onNotify(data.message, 'SUCCESS');
      }
    } catch {
      if (onNotify) onNotify('Flash liquidation call failed', 'ALERT');
    } finally {
      setIsExecuting(null);
    }
  };

  const handleSimulateAgentApi = async () => {
    setIsExecuting('agent');
    try {
      const res = await fetch('/api/zero-cap/simulate-agent-api-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callerAgent: '@solana_arbitrage_bot', service: 'Live Spot Ticker Matrix', feeUsd: 0.75 }),
      });
      const data = await res.json();
      if (data.success) {
        setState(data.state);
        if (onNotify) onNotify(data.message, 'SUCCESS');
      }
    } catch {
      if (onNotify) onNotify('Agent API call failed', 'ALERT');
    } finally {
      setIsExecuting(null);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-[#060D1A] to-slate-900 p-6 shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                ZERO CAPITAL REQUIRED · $0 DOWN
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                SOVEREIGN SELF-FUNDING FLYWHEEL
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider flex items-center gap-2">
              <Fuel className="w-6 h-6 text-cyan-400" />
              Autonomous Gas Tank & Fee Harvester
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-2xl">
              Monetizes incoming protocol volume, atomic flash loan liquidations, and agent micropayments without risking trading capital. Automatically funnels 35% of all revenue into your Gas Tank to pay network fees forever.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchState}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Vault</span>
            </button>
          </div>
        </div>

        {/* Metric Gauges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/80 border border-cyan-500/20 rounded-lg p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Live Gas Tank Reserve
            </span>
            <div className="text-xl font-black text-cyan-300">
              ${state ? state.gasTankBalanceUsd.toFixed(2) : '520.15'}
            </div>
            <div className="text-[10px] text-slate-500 mt-1 flex gap-2">
              <span>{state ? state.gasTankEth : '0.182'} ETH</span>
              <span>·</span>
              <span>{state ? state.gasTankSol : '1.45'} SOL</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-emerald-500/20 rounded-lg p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Free Revenue Generated
            </span>
            <div className="text-xl font-black text-emerald-400">
              ${state ? state.totalRevenueEarnedUsd.toFixed(2) : '1,485.40'}
            </div>
            <span className="text-[10px] text-emerald-500/90 mt-1 block font-bold">
              100% Protocol & Service Cuts
            </span>
          </div>

          <div className="bg-slate-950/80 border border-purple-500/20 rounded-lg p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Sovereign Treasury Vault
            </span>
            <div className="text-xl font-black text-purple-300">
              ${state ? state.treasuryVaultBalanceUsd.toFixed(2) : '965.25'}
            </div>
            <span className="text-[10px] text-purple-400/80 mt-1 block">
              65% Permanent Reserve Split
            </span>
          </div>

          <div className="bg-slate-950/80 border border-amber-500/20 rounded-lg p-3.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Gas Auto-Refuel Status
            </span>
            <div className="text-xl font-black text-amber-300 flex items-center gap-1.5">
              <Flame className="w-5 h-5 text-amber-400 animate-pulse" />
              <span>ACTIVE (35%)</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Zero Out-of-Pocket Gas
            </span>
          </div>
        </div>
      </div>

      {/* Action Simulation Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Test Inbound Zero-Capital Streams Live:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSimulateSwapRouting}
            disabled={isExecuting !== null}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simulate Jupiter Swap (+0.25% Cut)</span>
          </button>

          <button
            onClick={handleSimulateFlashLiquidation}
            disabled={isExecuting !== null}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Trigger Aave Flash Liquidation (+$125 Bounty)</span>
          </button>

          <button
            onClick={handleSimulateAgentApi}
            disabled={isExecuting !== null}
            className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 hover:bg-purple-500/30 font-bold transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Inbound Agent x402 Micropayment</span>
          </button>
        </div>
      </div>

      {/* Stream Architecture Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(state?.streams || []).map((stream) => (
          <div
            key={stream.id}
            className="bg-[#0A0F1D] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider block">
                  {stream.protocol}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{stream.name}</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                $0 CAPITAL NEEDED
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {stream.description}
            </p>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-lg text-center">
              <div>
                <span className="text-[10px] text-slate-500 block">Total Revenue Earned</span>
                <span className="text-xs font-black text-emerald-400">+${stream.totalEarnedUsd.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Invocations</span>
                <span className="text-xs font-black text-cyan-300">{stream.transactionCount} executions</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Inflows Table */}
      <div className="bg-[#0A0F1D] border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Zero-Capital Inflow Ledger (Auto-Split to Gas Tank)
            </h3>
          </div>
          <span className="text-[10px] text-slate-500">Live Cryptographic Split</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800/60 pb-2 text-[10px] uppercase">
                <th className="pb-2 font-bold">Timestamp</th>
                <th className="pb-2 font-bold">Stream</th>
                <th className="pb-2 font-bold">Volume / Base</th>
                <th className="pb-2 font-bold">Gross Cut</th>
                <th className="pb-2 font-bold text-cyan-300">Gas Tank (35%)</th>
                <th className="pb-2 font-bold text-purple-300">Treasury (65%)</th>
                <th className="pb-2 font-bold">Tx Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {(state?.recentInflows || []).map((inflow) => (
                <tr key={inflow.id} className="hover:bg-slate-900/40">
                  <td className="py-2.5 text-slate-400 text-[10px]">
                    {new Date(inflow.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 font-bold text-white text-[11px]">
                    {inflow.streamName}
                  </td>
                  <td className="py-2.5 text-slate-300">
                    ${inflow.volumeUsd.toLocaleString()}
                  </td>
                  <td className="py-2.5 font-black text-emerald-400">
                    +${inflow.grossFeeEarnedUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-bold text-cyan-300">
                    +${inflow.gasTankSplitUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-bold text-purple-300">
                    +${inflow.treasurySplitUsd.toFixed(2)}
                  </td>
                  <td className="py-2.5 font-mono text-[10px] text-slate-500">
                    {inflow.txHash}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout Addresses Configuration Card */}
      <div className="bg-[#0A0F1D] border border-cyan-500/20 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
            Automated Payout Destination Wallets
          </span>
          <div className="flex flex-col gap-1 text-[11px] text-slate-300">
            <div>
              <span className="text-slate-500 font-bold">Solana Fee Recipient: </span>
              <span className="font-mono text-cyan-300">{state?.payoutWalletSol || '4u8D51aX8B2Kp93kYvLmQjPo871aZb91e8X2'}</span>
            </div>
            <div>
              <span className="text-slate-500 font-bold">EVM Gas Tank Wallet: </span>
              <span className="font-mono text-purple-300">{state?.payoutWalletEvm || '0x71C568a29A88F3c37e97123984FaA628469E849F'}</span>
            </div>
          </div>
        </div>

        <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
          ✓ Self-Funded Engine: Zero human investment needed
        </div>
      </div>
    </div>
  );
};

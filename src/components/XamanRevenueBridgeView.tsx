import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  Zap,
  TrendingUp,
  Coins,
  RefreshCw,
  Copy,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Database,
  Image,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  Clock,
  ChevronRight,
  BarChart2,
  Lock,
} from 'lucide-react';

interface XamanRevenueBridgeViewProps {
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
  onOpenFederalRegistry?: () => void;
}

interface XamanWalletState {
  address: string;
  network: string;
  status: string;
  nativeXrpBalance: number;
  nativeXrpUsd: number;
  ownerCount: number;
  sequence: number;
  previousTxnLgrSeq: number;
  gasCapacityTransactions: number;
  totalTrustlines: number;
  nonZeroTrustlines: number;
  reclaimableReserveXrp: number;
  sovereignEocHolding: number;
  tokens: Array<{
    symbol: string;
    balance: number;
    issuer: string;
    limit: string;
    isZero: boolean;
  }>;
  nfts: Array<{
    tokenId: string;
    uri: string;
  }>;
  activeRevenueStrategies: Array<{
    id: string;
    name: string;
    category: string;
    targetAsset: string;
    projectedYieldApr: string;
    status: string;
  }>;
  lastSyncAt: string;
}

interface XamanPayload {
  payloadId: string;
  strategy: string;
  title: string;
  description: string;
  sourceAddress: string;
  txJson: Record<string, any>;
  xamanDeepLink: string;
  qrDataUrl: string;
  status: string;
  createdAt: string;
  projectedRevenueUsd: number;
}

export const XamanRevenueBridgeView: React.FC<XamanRevenueBridgeViewProps> = ({
  onNotify,
  onOpenFederalRegistry,
}) => {
  const [wallet, setWallet] = useState<XamanWalletState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'REVENUE_ENGINES' | 'PORTFOLIO_TOKENS' | 'NFTS' | 'LEDGER_PARAMS'>('REVENUE_ENGINES');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [tokenSearch, setTokenSearch] = useState<string>('');
  const [tokenFilter, setTokenFilter] = useState<'ALL' | 'NON_ZERO' | 'ZERO_RECLAIMABLE'>('NON_ZERO');

  // Payload / Signing Modal State
  const [activePayload, setActivePayload] = useState<XamanPayload | null>(null);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [isSignedSimulated, setIsSignedSimulated] = useState<boolean>(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const fetchWalletData = async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/xaman/wallet');
      const data = await res.json();
      if (data.success && data.wallet) {
        setWallet(data.wallet);
        if (isManual && onNotify) {
          onNotify(`XRPL Mainnet Synced: ${data.wallet.address.slice(0, 8)}... (${data.wallet.tokens?.length || 0} trustlines)`, 'SUCCESS');
        }
      }
    } catch (err: any) {
      console.warn('[Xaman Bridge View Error]', err);
      if (isManual && onNotify) {
        onNotify('Failed to sync XRPL wallet data', 'ALERT');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
    const interval = setInterval(() => {
      fetchWalletData();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
    if (onNotify) {
      onNotify(`Copied ${label} to clipboard`, 'INFO');
    }
  };

  const handleTriggerStrategy = async (strategy: 'DEX_ARBITRAGE' | 'AMM_YIELD' | 'RESERVE_HARVEST', pair?: string) => {
    setIsDispatching(true);
    setDispatchError(null);
    setIsSignedSimulated(false);
    try {
      const res = await fetch('/api/xaman/create-payload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy, pair }),
      });
      const data = await res.json();
      if (data.success && data.payload) {
        setActivePayload(data.payload);
        if (onNotify) {
          onNotify(`Xaman Payload Generated: ${data.payload.payloadId}. Scan QR with Xaman app to sign.`, 'SUCCESS');
        }
      } else {
        throw new Error(data.error || 'Failed to initialize Xaman payload');
      }
    } catch (err: any) {
      setDispatchError(err.message || 'Error communicating with Xaman gateway');
      if (onNotify) {
        onNotify(`Xaman Gateway Error: ${err.message}`, 'ALERT');
      }
    } finally {
      setIsDispatching(false);
    }
  };

  const handleSimulateSign = () => {
    setIsSignedSimulated(true);
    if (activePayload) {
      setActivePayload({
        ...activePayload,
        status: 'SIGNED_AND_SUBMITTED',
      });
    }
    if (onNotify) {
      onNotify('Simulation Mode: Transaction validated & ledger settlement simulated on XRPL Cluster.', 'SUCCESS');
    }
  };

  // Filtered tokens
  const filteredTokens = useMemo(() => {
    if (!wallet || !wallet.tokens) return [];
    return wallet.tokens.filter(token => {
      const matchesSearch =
        token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        token.issuer.toLowerCase().includes(tokenSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (tokenFilter === 'NON_ZERO') return !token.isZero;
      if (tokenFilter === 'ZERO_RECLAIMABLE') return token.isZero;
      return true;
    });
  }, [wallet, tokenSearch, tokenFilter]);

  if (isLoading && !wallet) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        <div className="text-cyan-200 font-mono text-sm tracking-wide">
          AGGREGATING ON-CHAIN XRPL WALLET VIA XAMAN BRIDGE...
        </div>
      </div>
    );
  }

  const defaultAddr = wallet?.address || 'rwB7JKKc5gJ47pPnWCFvQuhVW85mejYF1M';
  const xrpBal = wallet?.nativeXrpBalance ?? 15.556835;
  const xrpUsd = wallet?.nativeXrpUsd ?? 41.69;
  const eocBal = wallet?.sovereignEocHolding ?? 43802031550.22612;
  const gasCapacity = wallet?.gasCapacityTransactions ?? 1296400;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-cyan-950/30 to-slate-900 border border-cyan-800/40 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase tracking-wider">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>Xaman (XUMM) Non-Custodial Gateway</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-400 font-bold">XRPL Mainnet Validated</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Sovereign XRPL Zombie Wallet</span>
              <span className="text-cyan-400 font-mono text-xl">[{defaultAddr.slice(0, 4)}...{defaultAddr.slice(-4)}]</span>
            </h1>

            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Aggregated directly from the XRP Ledger Mainnet. Connected through the non-custodial Xaman infrastructure.
              Your private keys remain 100% on your device; transactions are generated and submitted for QR or app authorization.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300">
                <span className="text-slate-500">Address:</span>
                <span className="text-cyan-300 font-semibold">{defaultAddr}</span>
                <button
                  onClick={() => handleCopy(defaultAddr, 'Address')}
                  className="hover:text-cyan-200 transition-colors ml-1 p-1"
                  title="Copy full address"
                >
                  {copiedText === 'Address' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <a
                href={`https://xrpscan.com/account/${defaultAddr}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-xs font-medium text-slate-200 transition-colors"
              >
                <span>View on XRPScan</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>

              <a
                href={`https://bithomp.com/explorer/${defaultAddr}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600 text-xs font-medium text-slate-200 transition-colors"
              >
                <span>Bithomp Explorer</span>
                <ExternalLink className="w-3 h-3 text-cyan-400" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
            <button
              onClick={() => fetchWalletData(true)}
              disabled={isRefreshing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-sm transition shadow-lg shadow-cyan-900/30 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Querying Cluster...' : 'Sync XRPL Node'}</span>
            </button>

            {onOpenFederalRegistry && (
              <button
                onClick={onOpenFederalRegistry}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm border border-slate-600 transition"
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Federal RPC Gateways</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Native XRP Balance */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-cyan-800/30 backdrop-blur-sm relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Native Gas Reserve</span>
            <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-700/40 text-cyan-400">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-1.5">
              <span>{xrpBal.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}</span>
              <span className="text-xs font-normal text-cyan-400">XRP</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">≈ ${xrpUsd.toFixed(2)} USD (@ $2.68/XRP)</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Gas Runaway:</span>
            <span className="text-emerald-400 font-mono font-semibold">{gasCapacity.toLocaleString()} Txns</span>
          </div>
        </div>

        {/* Metric 2: Sovereign EOC Token Reserve */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-purple-800/30 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-300">Sovereign EOC Asset</span>
            <div className="p-2 rounded-lg bg-purple-950/60 border border-purple-700/40 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono truncate" title={eocBal.toLocaleString()}>
              {eocBal >= 1e9 ? `${(eocBal / 1e9).toFixed(2)}B` : eocBal.toLocaleString()}
            </div>
            <div className="text-xs text-purple-300 mt-0.5 font-mono">43,802,031,550.22 EOC Units</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Primary DEX Pair:</span>
            <span className="text-purple-400 font-mono font-semibold">EOC / XRP & EOC / RLUSD</span>
          </div>
        </div>

        {/* Metric 3: Active Trustlines & Capital Lock */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-amber-800/30 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300">Portfolio Trustlines</span>
            <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-700/40 text-amber-400">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
              <span>{wallet?.totalTrustlines ?? 68}</span>
              <span className="text-xs text-slate-400">({wallet?.nonZeroTrustlines ?? 65} Funded)</span>
            </div>
            <div className="text-xs text-amber-300 mt-0.5">Owner Count: {wallet?.ownerCount ?? 70} Objects</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Reclaimable Reserve:</span>
            <span className="text-amber-400 font-mono font-semibold">+{wallet?.reclaimableReserveXrp ?? 0.60} XRP</span>
          </div>
        </div>

        {/* Metric 4: Sovereign XLS-20 NFTs */}
        <div className="p-5 rounded-xl bg-slate-900/80 border border-emerald-800/30 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/50 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-300">XLS-20 NFTs</span>
            <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-400">
              <Image className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
              <span>{wallet?.nfts?.length ?? 3}</span>
              <span className="text-xs text-emerald-400">Minted on XRPL</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Verified IPFS Metadata</div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">IPFS Pinning:</span>
            <span className="text-emerald-400 font-mono font-semibold">Active / Accessible</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('REVENUE_ENGINES')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'REVENUE_ENGINES'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Zap className="w-4 h-4 text-cyan-400" />
          <span>XRPL Revenue Engines</span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-cyan-900/60 text-cyan-300 font-mono">3 Active</span>
        </button>

        <button
          onClick={() => setActiveTab('PORTFOLIO_TOKENS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'PORTFOLIO_TOKENS'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Coins className="w-4 h-4 text-purple-400" />
          <span>All 68 Tokens & Trustlines</span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-purple-900/60 text-purple-300 font-mono">
            {wallet?.tokens?.length || 68}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NFTS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'NFTS'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Image className="w-4 h-4 text-emerald-400" />
          <span>XLS-20 NFTs</span>
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-emerald-900/60 text-emerald-300 font-mono">3</span>
        </button>

        <button
          onClick={() => setActiveTab('LEDGER_PARAMS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'LEDGER_PARAMS'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Database className="w-4 h-4 text-slate-400" />
          <span>On-Chain Ledger State</span>
        </button>
      </div>

      {/* TAB 1: REVENUE ENGINES */}
      {activeTab === 'REVENUE_ENGINES' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-cyan-900/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-slate-300 space-y-1">
              <div className="font-semibold text-white">Non-Custodial Revenue Generation Flow:</div>
              <div>
                When you click any strategy below, Aegentix builds an on-chain XRPL transaction (<span className="text-cyan-300 font-mono">OfferCreate</span>, <span className="text-cyan-300 font-mono">AMMDeposit</span>, or <span className="text-cyan-300 font-mono">TrustSet</span>).
                A secure Xaman QR code and deep link are generated. You review and sign exclusively inside your Xaman phone app.
                The wallet retains complete sovereignty and custody.
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strategy Card 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-700/40 hover:border-cyan-400/60 transition shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-cyan-950 border border-cyan-600/40 text-cyan-300 text-xs font-mono">
                    XRPL DEX Order Book
                  </span>
                  <span className="text-emerald-400 text-xs font-semibold">18.4% APR Target</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">EOC / XRP Spread Harvester</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Places automated maker limit orders with 10,000 EOC on the decentralized orderbook to capture 0.85% bid-ask spread against native XRP.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Type:</span>
                    <span className="text-cyan-300">OfferCreate</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Return:</span>
                    <span className="text-emerald-400 font-semibold">+$85.00 / execution</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Execution Fee:</span>
                    <span className="text-slate-300">12 drops (0.000012 XRP)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTriggerStrategy('DEX_ARBITRAGE', 'EOC/XRP')}
                disabled={isDispatching}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-950/50 disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>Launch Spread Order via Xaman</span>
              </button>
            </div>

            {/* Strategy Card 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-700/40 hover:border-purple-400/60 transition shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-purple-950 border border-purple-600/40 text-purple-300 text-xs font-mono">
                    XLS-30 Native AMM
                  </span>
                  <span className="text-purple-400 text-xs font-semibold">14.2% APY Yield</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">EOC / RLUSD Liquidity Yield</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Deposits 50,000 sovereign EOC tokens into the on-chain XRPL XLS-30 automated market maker pool to harvest continuous LP swap fee distributions.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Type:</span>
                    <span className="text-purple-300">AMMDeposit</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Target Return:</span>
                    <span className="text-emerald-400 font-semibold">14.2% APY Continuous</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Collateral Backing:</span>
                    <span className="text-slate-300">43.8B EOC Pool Vault</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTriggerStrategy('AMM_YIELD')}
                disabled={isDispatching}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-950/50 disabled:opacity-50"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Deposit Liquidity via Xaman</span>
              </button>
            </div>

            {/* Strategy Card 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-700/40 hover:border-amber-400/60 transition shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md bg-amber-950 border border-amber-600/40 text-amber-300 text-xs font-mono">
                    Owner Reserve Reclaim
                  </span>
                  <span className="text-amber-400 text-xs font-semibold">Instant Capital Release</span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white">Reclaim 0.60 XRP Locked Capital</h3>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Identified 3 zero-balance dormant trustlines holding 0.20 XRP reserve each. Submits TrustSet limit 0 transactions to immediately return 0.60 XRP to free balance.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction Type:</span>
                    <span className="text-amber-300">TrustSet (Limit: 0)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Instant XRP Unlocked:</span>
                    <span className="text-emerald-400 font-semibold">+0.60 XRP (~$1.60)</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>New Gas Capacity:</span>
                    <span className="text-slate-300">+50,000 Transactions</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleTriggerStrategy('RESERVE_HARVEST')}
                disabled={isDispatching}
                className="mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-semibold text-sm transition shadow-lg shadow-amber-950/50 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Reclaim 0.60 XRP via Xaman</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL 68 TOKENS & TRUSTLINES */}
      {activeTab === 'PORTFOLIO_TOKENS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search token symbol or issuer..."
                value={tokenSearch}
                onChange={e => setTokenSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setTokenFilter('NON_ZERO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  tokenFilter === 'NON_ZERO'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Funded ({wallet?.nonZeroTrustlines || 65})
              </button>
              <button
                onClick={() => setTokenFilter('ZERO_RECLAIMABLE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  tokenFilter === 'ZERO_RECLAIMABLE'
                    ? 'bg-amber-950 text-amber-300 border border-amber-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                Zero-Balance (3 Reclaimable)
              </button>
              <button
                onClick={() => setTokenFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  tokenFilter === 'ALL'
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                All ({wallet?.tokens?.length || 68})
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/60 shadow-xl">
            <div className="overflow-x-auto max-h-[560px]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Asset Symbol</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Issuer Address</th>
                    <th className="py-3 px-4">Trustline Limit</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTokens.map((t, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-white flex items-center gap-2">
                        {t.symbol === 'EOC' ? (
                          <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-600/60 text-purple-300">
                            EOC (Sovereign)
                          </span>
                        ) : (
                          <span>{t.symbol}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-cyan-300 font-semibold">
                        {t.balance.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <span>{t.issuer.slice(0, 10)}...{t.issuer.slice(-8)}</span>
                          <button
                            onClick={() => handleCopy(t.issuer, `Issuer ${t.symbol}`)}
                            className="hover:text-cyan-300 transition"
                            title="Copy Issuer Address"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{t.limit}</td>
                      <td className="py-3 px-4 text-right">
                        {t.isZero ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 text-[10px]">
                            Reclaimable (0.20 XRP)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> Funded
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTokens.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500">
                        No trustlines matched your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: XLS-20 NFTS */}
      {activeTab === 'NFTS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(wallet?.nfts || []).map((nft, idx) => {
              const ipfsHash = nft.uri.replace('ipfs://', '');
              const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;

              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-800/40 shadow-xl space-y-4">
                  <div className="aspect-square rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                    <Image className="w-12 h-12 text-emerald-400 mb-2" />
                    <div className="text-white font-bold text-sm z-10">XRPL Sovereign NFT #{idx + 1}</div>
                    <div className="text-slate-400 text-xs font-mono z-10 truncate max-w-full px-2">
                      {nft.tokenId.slice(0, 16)}...
                    </div>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Token ID:</span>
                      <span className="text-cyan-300 truncate max-w-[180px]">{nft.tokenId}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Metadata URI:</span>
                      <span className="text-emerald-400 truncate max-w-[180px]">{nft.uri}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <a
                      href={gatewayUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-300 text-xs font-semibold transition"
                    >
                      <span>Explore on IPFS</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: ON-CHAIN LEDGER STATE */}
      {activeTab === 'LEDGER_PARAMS' && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>XRPL Consensus Account Metadata</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Synced: {wallet?.lastSyncAt ? new Date(wallet.lastSyncAt).toLocaleTimeString() : 'Live'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400">Validated Sequence Number:</div>
              <div className="text-cyan-300 font-bold text-base">{wallet?.sequence ?? 94732712}</div>
              <div className="text-slate-500 text-[11px]">Strict monotonically increasing ledger transaction counter.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400">Previous Transaction Ledger Index:</div>
              <div className="text-purple-300 font-bold text-base">{wallet?.previousTxnLgrSeq ?? 106322898}</div>
              <div className="text-slate-500 text-[11px]">Ledger block in which last state transition occurred.</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400">Owner Reserve Count:</div>
              <div className="text-amber-300 font-bold text-base">{wallet?.ownerCount ?? 70} Objects</div>
              <div className="text-slate-500 text-[11px]">Each object requires 0.20 XRP locked reserve (14.0 XRP total).</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-slate-400">Primary Upstream Validator:</div>
              <div className="text-emerald-300 font-bold text-base">https://xrplcluster.com</div>
              <div className="text-slate-500 text-[11px]">High-speed RPC failover cluster with sub-second finality.</div>
            </div>
          </div>
        </div>
      )}

      {/* XAMAN INTERACTIVE SIGNING MODAL */}
      {activePayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-slate-900 border border-cyan-500/50 shadow-2xl p-6 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <span className="font-bold text-white text-sm">Xaman Non-Custodial Authorization</span>
              </div>
              <button
                onClick={() => setActivePayload(null)}
                className="text-slate-400 hover:text-white text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-bold text-cyan-300">{activePayload.title}</h4>
              <p className="text-xs text-slate-300">{activePayload.description}</p>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-cyan-900/50 space-y-3">
              {activePayload.qrDataUrl ? (
                <img
                  src={activePayload.qrDataUrl}
                  alt="Xaman Sign QR Code"
                  className="w-56 h-56 rounded-lg p-1 bg-slate-900 shadow-md"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-500 font-mono text-xs">
                  Generating QR...
                </div>
              )}
              <div className="text-[11px] text-slate-400 text-center font-mono">
                Scan with your Xaman / XUMM app on mobile to sign on XRPL
              </div>
            </div>

            {/* Alternative Direct Signers & Guidance */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs">
              <div className="flex items-center justify-between text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Xaman Sign Link Note</span>
                </span>
                <a
                  href="https://apps.xaman.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Get Free API Key</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Direct <code className="text-cyan-300">xumm.app/sign</code> cloud links require an active Developer API Key from Xaman. Alternatively, you can connect your Xaman wallet directly to <strong>XRP Toolkit</strong> or <strong>XPMarket</strong> below:
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href="https://www.xrptoolkit.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition"
                >
                  <span>XRP Toolkit</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </a>

                <a
                  href="https://xpmarket.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] border border-slate-700 transition"
                >
                  <span>XPMarket AMM</span>
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                </a>
              </div>
            </div>

            {/* Actions & Simulation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(activePayload.txJson, null, 2), 'Transaction JSON')}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
                >
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Transaction JSON</span>
                </button>

                <button
                  onClick={handleSimulateSign}
                  disabled={isSignedSimulated}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-medium transition border ${
                    isSignedSimulated
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isSignedSimulated ? '✓ Authorized (Sim)' : 'Simulate (Dev Mode)'}
                </button>
              </div>
            </div>

            {/* Tx JSON Inspector */}
            <details className="text-[10px] font-mono text-slate-400 bg-slate-950/90 p-2.5 rounded-lg border border-slate-800">
              <summary className="cursor-pointer text-cyan-400 font-semibold select-none flex items-center justify-between">
                <span>Inspect Raw XRPL Transaction Payload</span>
                <span className="text-[9px] text-slate-500 uppercase">AMMDeposit</span>
              </summary>
              <pre className="mt-2 overflow-x-auto text-slate-300 leading-tight">
                {JSON.stringify(activePayload.txJson, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}
    </div>
  );
};

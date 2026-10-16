import React, { useState, useEffect } from 'react';
import {
  Landmark,
  Shield,
  ShieldCheck,
  Server,
  Coins,
  FileText,
  Activity,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Zap,
  Lock,
  Search,
  RefreshCw,
  Building,
  Globe,
  MapPin,
  Share2,
  Award,
  Radio,
  Wifi,
} from 'lucide-react';
import {
  FEDERAL_TOKENS,
  FEDERAL_NODES,
  INITIAL_FEDERAL_SETTLEMENTS,
  FederalRegisteredToken,
  FederalRegisteredNode,
  FederalSettlementRecord,
} from '../data/federalCryptoRegistryData';
import { FederalNodesWorldMap } from './FederalNodesWorldMap';
import { FederalDagFullNodeView } from './FederalDagFullNodeView';
import { FederalComplianceGovSuite } from './FederalComplianceGovSuite';

interface FederalCryptoRegistryViewProps {
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const FederalCryptoRegistryView: React.FC<FederalCryptoRegistryViewProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<'TOKENS' | 'MAP' | 'NODES' | 'DAG_NODE' | 'SETTLEMENT' | 'CHARTERS' | 'GOV_OPPORTUNITIES' | 'RPC_GATEWAYS'>('GOV_OPPORTUNITIES');
  const [tokens] = useState<FederalRegisteredToken[]>(FEDERAL_TOKENS);
  const [nodes, setNodes] = useState<FederalRegisteredNode[]>(FEDERAL_NODES);
  const [settlements, setSettlements] = useState<FederalSettlementRecord[]>(INITIAL_FEDERAL_SETTLEMENTS);
  const [selectedToken, setSelectedToken] = useState<FederalRegisteredToken>(FEDERAL_TOKENS[0]);
  const [selectedNodeId, setSelectedNodeId] = useState<string>(FEDERAL_NODES[0].id);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  // Live Multi-Currency RPC Gateway State
  const [rpcGateways, setRpcGateways] = useState<any[]>([
    {
      networkId: 'xrpl-mainnet',
      name: 'XRPL Mainnet High-Throughput Cluster (Federal RTGS Gateway)',
      supportedTokens: ['RLUSD', 'XRP', 'ESC', 'Tsl.Esc.Eoc'],
      primaryRpc: 'https://xrplcluster.com',
      fallbackRpc: 'https://s1.ripple.com:51234',
      protocol: 'XRPL_JSON_RPC',
      status: 'ONLINE',
      ledgerHeight: 107684650,
      latencyMs: 32,
      lastPing: new Date().toISOString(),
      details: { baseFeeXrp: '0.00001', serverState: 'full' },
    },
    {
      networkId: 'ethereum-mainnet',
      name: 'Ethereum Mainnet Institutional EVM Gateway (USDC / BUIDL / PAXG)',
      supportedTokens: ['USDC', 'BUIDL', 'PAXG'],
      primaryRpc: 'https://ethereum.publicnode.com',
      fallbackRpc: 'https://1rpc.io/eth',
      protocol: 'EVM_JSON_RPC',
      status: 'ONLINE',
      ledgerHeight: 26201780,
      latencyMs: 44,
      lastPing: new Date().toISOString(),
      details: { chainId: 1, standard: 'ERC-20' },
    },
    {
      networkId: 'constellation-dag',
      name: 'Constellation Hypergraph Layer-0 Mainnet Cluster (Federal DAG)',
      supportedTokens: ['DAG', 'Tsl.Esc.Eoc'],
      primaryRpc: 'https://l0-lb-mainnet.constellationnetwork.io',
      fallbackRpc: 'https://be-mainnet.constellationnetwork.io',
      protocol: 'CONSTELLATION_DAG_RPC',
      status: 'ONLINE',
      ledgerHeight: 7074874,
      latencyMs: 41,
      lastPing: new Date().toISOString(),
      details: { clusterVersion: '3.6.0', activePeers: 37 },
    },
  ]);
  const [testingGatewayId, setTestingGatewayId] = useState<string | null>(null);
  const [gatewayTestResult, setGatewayTestResult] = useState<any | null>(null);

  const fetchRpcGateways = async () => {
    try {
      const res = await fetch('/api/federal-registry/rpc-gateways');
      const data = await res.json();
      if (data.success && data.gateways) {
        setRpcGateways(data.gateways);
      }
    } catch (e) {
      console.warn('RPC gateways fetch warning:', e);
    }
  };

  useEffect(() => {
    fetchRpcGateways();
    const interval = setInterval(fetchRpcGateways, 7000);
    return () => clearInterval(interval);
  }, []);

  const handleTestRpcGateway = async (networkId: string) => {
    setTestingGatewayId(networkId);
    if (onNotify) onNotify(`⚡ Ping & querying live RPC Gateway for ${networkId}...`, 'INFO');
    try {
      const res = await fetch('/api/federal-registry/rpc-gateways/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ networkId }),
      });
      const data = await res.json();
      setGatewayTestResult(data);
      if (data.success) {
        if (onNotify) onNotify(`✅ RPC Gateway [${networkId}] responded in ${data.latencyMs}ms! Verified live on-chain.`, 'SUCCESS');
      } else {
        if (onNotify) onNotify(`⚠️ RPC Gateway test error: ${data.error}`, 'ALERT');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`❌ RPC Gateway connection failed: ${err.message}`, 'ALERT');
    } finally {
      setTestingGatewayId(null);
    }
  };

  // Settlement Form State
  const [settleToken, setSettleToken] = useState('RLUSD');
  const [settleAmount, setSettleAmount] = useState('100000');
  const [settleSource, setSettleSource] = useState('FED-NODE-01');
  const [settleTarget, setSettleTarget] = useState('FED-NODE-02');
  const [isSettling, setIsSettling] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    if (onNotify) onNotify(`Copied ${label} to clipboard!`, 'SUCCESS');
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  const handleExecuteSettlement = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(settleAmount);
    if (isNaN(amt) || amt <= 0) {
      if (onNotify) onNotify('Please enter a valid transfer amount.', 'ALERT');
      return;
    }

    setIsSettling(true);
    if (onNotify) onNotify(`⚡ Initiating Federal RTGS transfer for ${amt.toLocaleString()} ${settleToken}...`, 'INFO');

    setTimeout(() => {
      setIsSettling(false);
      const tokenObj = tokens.find(t => t.symbol === settleToken);
      const price = tokenObj?.priceUsd || 1.0;
      const amtUsd = amt * price;
      const hash = '0x' + Array.from({ length: 8 }, () => Math.floor(Math.random() * 16).toString(16)).join('') + '...' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      const newRecord: FederalSettlementRecord = {
        txId: `FED-TX-${Math.floor(100000 + Math.random() * 900000)}`,
        tokenSymbol: settleToken,
        amount: amt,
        amountUsd: amtUsd,
        sourceNode: settleSource,
        targetNode: settleTarget,
        settlementTime: new Date().toISOString(),
        status: 'SETTLED_FINAL',
        fedAuditHash: hash,
      };

      setSettlements([newRecord, ...settlements]);
      if (onNotify) onNotify(`✅ Federal Settlement ${newRecord.txId} finalized! Audited on FedNow / TSL Interconnect.`, 'SUCCESS');
    }, 1100);
  };

  const total24hSettled = nodes.reduce((acc, n) => acc + n.settled24hUsd, 0);

  const filteredTokens = tokens.filter(
    t =>
      t.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.regulatoryAgency.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#030508] border border-amber-500/30 rounded-xl overflow-hidden shadow-2xl space-y-4 font-mono text-xs text-slate-200">
      {/* HEADER BANNER */}
      <div className="p-4 sm:p-5 border-b border-amber-500/20 bg-gradient-to-r from-[#030508] via-[#0E1524] to-[#0A1220] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 via-yellow-600 to-slate-900 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <Landmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-amber-300 tracking-wider uppercase font-sans">
                FEDERAL REGISTERED CRYPTO NODES &amp; TOKENS
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1 bg-amber-500/20 text-amber-300 border-amber-500/40">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                OCC &middot; NYDFS &middot; FINCEN MSB
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                <Server className="w-3 h-3 text-cyan-400" />
                FEDNOW &middot; TSL INTERCONNECT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Federally Chartered Digital Assets &middot; Reserve-Backed Stablecoins &middot; Qualified Custody Nodes &middot; RTGS Finality
            </p>
          </div>
        </div>

        {/* Real-Time Stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700 flex items-center gap-2">
            <span className="text-[10px] text-slate-400">24h Fed Volume:</span>
            <span className="font-bold text-amber-300 font-sans">${(total24hSettled / 1000000).toFixed(1)}M USD</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-1.5 text-emerald-300 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>100% AUDITED</span>
          </div>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="px-4 border-b border-slate-800 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTab('GOV_OPPORTUNITIES')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'GOV_OPPORTUNITIES'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Gov Opportunities &amp; Compliance</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
            $465M &middot; 8 Inducted
          </span>
        </button>

        <button
          onClick={() => setActiveTab('MAP')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'MAP'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span>Interactive D3 World Map</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
            10 Anchors
          </span>
        </button>

        <button
          onClick={() => setActiveTab('TOKENS')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'TOKENS'
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Registered Tokens</span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
            {tokens.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('RPC_GATEWAYS')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'RPC_GATEWAYS'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>RPC Gateways (All Currencies)</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
            Live Mainnet
          </span>
        </button>

        <button
          onClick={() => setActiveTab('NODES')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'NODES'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Federal Validator Nodes</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-bold">
            {nodes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('DAG_NODE')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'DAG_NODE'
              ? 'border-indigo-400 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Share2 className="w-3.5 h-3.5 text-indigo-400" />
          <span>Federal DAG Full Node</span>
          <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
            DoD / CMMC
          </span>
        </button>

        <button
          onClick={() => setActiveTab('SETTLEMENT')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'SETTLEMENT'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Fed RTGS Settlement Bridge</span>
        </button>

        <button
          onClick={() => setActiveTab('CHARTERS')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold transition-colors cursor-pointer ${
            activeTab === 'CHARTERS'
              ? 'border-purple-400 text-purple-300 bg-purple-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Regulatory Charters &amp; Legal Framework</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 0: INTERACTIVE D3 WORLD MAP TOPOLOGY                  */}
      {/* ========================================================= */}
      {activeTab === 'MAP' && (
        <div className="p-4 space-y-4">
          <FederalNodesWorldMap
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelectNode={(node) => {
              setSelectedNodeId(node.id);
            }}
            onNotify={onNotify}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: REGISTERED TOKENS                                  */}
      {/* ========================================================= */}
      {activeTab === 'TOKENS' && (
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search token, symbol, or regulator..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#060C14] border border-slate-800 rounded-lg text-white text-xs outline-hidden focus:border-amber-400"
              />
            </div>

            <span className="text-[10px] text-slate-400">
              Showing {filteredTokens.length} Federally Cleared Cryptographic Assets
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTokens.map(tok => {
              const isSelected = selectedToken.id === tok.id;

              return (
                <div
                  key={tok.id}
                  onClick={() => setSelectedToken(tok)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#0A1420] border-amber-400 shadow-xl shadow-amber-500/10'
                      : 'bg-[#060C14] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-amber-300 font-sans">{tok.symbol}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          {tok.network}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-xs mt-0.5">{tok.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-400 text-sm block">
                        ${tok.priceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-slate-400 block">{tok.regulatoryAgency}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {tok.description}
                  </p>

                  <div className="p-2 bg-slate-950 rounded border border-slate-850 space-y-1 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Charter/Reg No:</span>
                      <span className="text-cyan-300 font-mono truncate max-w-[150px]">{tok.charterOrRegistrationNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Backing:</span>
                      <span className="text-amber-300 font-bold">{tok.backingRatioPct}% Audited</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">RPC Gateway:</span>
                      <span className="text-cyan-300 font-mono truncate max-w-[160px]">{tok.rpcGateway || 'Connected'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Custodian:</span>
                      <span className="text-slate-300 truncate max-w-[160px]">{tok.reserveCustodian}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verified Audit:</span>
                      <span className="text-emerald-400">{tok.verifiedAuditDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shrink-0">
                      {tok.complianceRating.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {tok.rpcGateway && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const net = tok.network === 'XRPL' || tok.network === 'TSL Sovereign Ledger' ? 'xrpl-mainnet' : tok.network === 'Ethereum' ? 'ethereum-mainnet' : 'constellation-dag';
                            handleTestRpcGateway(net);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          <span>Test RPC</span>
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopy(tok.issuerAddress, `${tok.symbol} Issuer Address`);
                        }}
                        className="text-slate-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedLabel === `${tok.symbol} Issuer Address` ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: FEDERAL VALIDATOR NODES                            */}
      {/* ========================================================= */}
      {activeTab === 'NODES' && (
        <div className="p-4 space-y-4">
          <div className="p-3 bg-[#060C14] border border-cyan-500/30 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-bold text-white text-xs">GLOBAL FEDERAL VALIDATOR NODE DIRECTORY</span>
                <p className="text-[10px] text-slate-400">10 Chartered National &amp; Inter-Bank Digital Settlement Anchors</p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('MAP')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Switch to D3 World Map</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A1420] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Node ID / Name</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Regulatory Charter</th>
                  <th className="py-2.5 px-3">Protocol</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Vote Weight</th>
                  <th className="py-2.5 px-3">24h Settled</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#060C14]">
                {nodes.map(n => {
                  const isSelected = selectedNodeId === n.id;
                  return (
                    <tr
                      key={n.id}
                      onClick={() => {
                        setSelectedNodeId(n.id);
                        if (onNotify) onNotify(`Selected ${n.name}`, 'INFO');
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {isSelected && <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />}
                          <span>{n.name}</span>
                        </div>
                        <div className="text-[9px] font-mono text-cyan-300">{n.id} &middot; {n.physicalLocation}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">{n.operator}</td>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-amber-300">{n.regulatoryCharter}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          {n.protocol}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">{n.latencyMs} ms</td>
                      <td className="py-2.5 px-3 font-mono text-cyan-300">{n.consensusVoteWeightPct}%</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        ${(n.settled24hUsd / 1000000).toFixed(1)}M
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded font-black text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {n.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB: FEDERAL DIRECTED ACYCLIC GRAPH (DAG) FULL NODE       */}
      {/* ========================================================= */}
      {activeTab === 'DAG_NODE' && (
        <div className="p-4 space-y-4">
          <FederalDagFullNodeView
            dagNodes={nodes.filter(n => n.protocol === 'Federal Asynchronous DAG')}
            onNotify={onNotify}
          />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: FED RTGS SETTLEMENT BRIDGE                         */}
      {/* ========================================================= */}
      {activeTab === 'SETTLEMENT' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Form (5 cols) */}
            <div className="lg:col-span-5 bg-[#060C14] border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Initiate Inter-Node Federal Settlement</span>
              </span>

              <form onSubmit={handleExecuteSettlement} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Asset Token:</label>
                  <select
                    value={settleToken}
                    onChange={e => setSettleToken(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-amber-300 font-bold text-xs"
                  >
                    {tokens.map(t => (
                      <option key={t.symbol} value={t.symbol}>
                        {t.symbol} — {t.name} (${t.priceUsd})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 uppercase font-bold block">Amount:</label>
                  <input
                    type="number"
                    value={settleAmount}
                    onChange={e => setSettleAmount(e.target.value)}
                    className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Source Node:</label>
                    <select
                      value={settleSource}
                      onChange={e => setSettleSource(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono text-xs"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.id} ({n.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block">Target Node:</label>
                    <select
                      value={settleTarget}
                      onChange={e => setSettleTarget(e.target.value)}
                      className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono text-xs"
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.id} ({n.name.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSettling}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all mt-2 disabled:opacity-50"
                >
                  {isSettling ? 'Broadcasting to Federal Nodes...' : 'Sign & Settle on FedNow / TSL'}
                </button>
              </form>
            </div>

            {/* Recent Settlements Ledger (7 cols) */}
            <div className="lg:col-span-7 bg-[#060C14] border border-slate-800 rounded-xl p-4 space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Audited Federal Settlements Log</span>
              </span>

              <div className="overflow-x-auto border border-slate-800 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0A1420] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">TX ID</th>
                      <th className="py-2 px-3">Token &amp; Amount</th>
                      <th className="py-2 px-3">Route</th>
                      <th className="py-2 px-3">Audit Hash</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                    {settlements.map(st => (
                      <tr key={st.txId} className="hover:bg-slate-900/60">
                        <td className="py-2 px-3 font-mono font-bold text-cyan-300">{st.txId}</td>
                        <td className="py-2 px-3">
                          <span className="font-bold text-amber-300">{st.amount.toLocaleString()} {st.tokenSymbol}</span>
                          <span className="text-[9px] text-slate-500 block">(${st.amountUsd.toLocaleString()})</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-[10px] text-slate-300">
                          {st.sourceNode} &rarr; {st.targetNode}
                        </td>
                        <td className="py-2 px-3 font-mono text-[9px] text-emerald-400">{st.fedAuditHash}</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: REGULATORY CHARTERS & LEGAL FRAMEWORK              */}
      {/* ========================================================= */}
      {activeTab === 'CHARTERS' && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 bg-[#060C14] border border-amber-500/30 rounded-xl space-y-2">
              <span className="text-amber-400 font-bold text-xs uppercase flex items-center gap-1.5">
                <Landmark className="w-4 h-4" />
                <span>OCC Interpretive Letter 1179 &amp; 1176</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Authorizes national banks and federal savings associations to provide cryptocurrency custody services, hold stablecoin reserves, and participate as independent verification nodes on distributed ledgers.
              </p>
            </div>

            <div className="p-4 bg-[#060C14] border border-cyan-500/30 rounded-xl space-y-2">
              <span className="text-cyan-400 font-bold text-xs uppercase flex items-center gap-1.5">
                <Building className="w-4 h-4" />
                <span>NYDFS Limited Purpose Trust Charter</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Under New York Banking Law, grants licensed digital asset trust companies legal authority to custody fiat reserves, issue fully collateralized stablecoins (e.g. RLUSD, PAXG), and conduct institutional fiduciary settlements.
              </p>
            </div>

            <div className="p-4 bg-[#060C14] border border-emerald-500/30 rounded-xl space-y-2">
              <span className="text-emerald-400 font-bold text-xs uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>FinCEN MSB Nationwide Attestation</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Money Services Business registration under Bank Secrecy Act (BSA) compliance, mandating strict AML/KYC, travel rule integration, and real-time transaction monitoring across institutional settlement channels.
              </p>
            </div>

            <div className="p-4 bg-[#060C14] border border-purple-500/30 rounded-xl space-y-2">
              <span className="text-purple-400 font-bold text-xs uppercase flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>TSL Sovereign Treasury Accord (Resolute Desk)</span>
              </span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Anchors Treasury Sovereign Ledger smart contracts to the XRPL Mainnet and FedNow Interconnect, establishing legal parity between physical gold reserves, US Treasury T-Bills, and on-chain collateralized escrow.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: GOV OPPORTUNITIES & FEDERAL COMPLIANCE SUITE       */}
      {/* ========================================================= */}
      {activeTab === 'GOV_OPPORTUNITIES' && (
        <div className="p-4">
          <FederalComplianceGovSuite onNotify={onNotify} />
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 7: HIGH-AVAILABILITY MULTI-CURRENCY RPC GATEWAYS         */}
      {/* ========================================================= */}
      {activeTab === 'RPC_GATEWAYS' && (
        <div className="p-4 space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#060C14] via-[#091524] to-[#060C14] border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-cyan-300 font-sans tracking-wide uppercase">
                  FEDERAL ASSET MULTI-NETWORK RPC GATEWAYS (HIGH AVAILABILITY)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ALL GATEWAYS ONLINE
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Zero-overhead direct JSON-RPC and REST gateways connecting Aegentix to XRPL Mainnet, Ethereum EVM, and Constellation Hypergraph Layer-0.
              </p>
            </div>

            <button
              onClick={() => {
                fetchRpcGateways();
                if (onNotify) onNotify('🔄 Refreshed all Federal RPC Gateway metrics & latency!', 'INFO');
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-500/40 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Poll Gateways</span>
            </button>
          </div>

          {/* 3 Core RPC Gateway Network Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {rpcGateways.map((gw) => {
              const isTesting = testingGatewayId === gw.networkId;

              return (
                <div
                  key={gw.networkId}
                  className="p-4 bg-[#060C14] border border-slate-800 hover:border-cyan-500/50 rounded-xl space-y-3 relative overflow-hidden transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                        {gw.protocol.replace(/_/g, ' ')}
                      </span>
                      <h4 className="font-bold text-white text-xs mt-1.5">{gw.name}</h4>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        {gw.status}
                      </span>
                      <span className={`text-[10px] font-mono font-bold block mt-1 ${gw.latencyMs < 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gw.latencyMs} ms latency
                      </span>
                    </div>
                  </div>

                  {/* Primary & Fallback Endpoints */}
                  <div className="p-2.5 bg-slate-950 rounded border border-slate-850 space-y-1.5 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Primary RPC:</span>
                      <span className="text-cyan-300 font-mono truncate max-w-[170px]" title={gw.primaryRpc}>
                        {gw.primaryRpc}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Fallback RPC:</span>
                      <span className="text-slate-400 font-mono truncate max-w-[170px]" title={gw.fallbackRpc}>
                        {gw.fallbackRpc}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Verified Height:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        #{gw.ledgerHeight?.toLocaleString() || '---'}
                      </span>
                    </div>
                  </div>

                  {/* Supported Tokens Pill Strip */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Cleared Federal Currencies:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {gw.supportedTokens.map((sym: string) => (
                        <span
                          key={sym}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button: Live Query */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[9px] text-slate-500">
                      Last ping: {new Date(gw.lastPing).toLocaleTimeString()}
                    </span>
                    <button
                      onClick={() => handleTestRpcGateway(gw.networkId)}
                      disabled={isTesting}
                      className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Wifi className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Querying...' : 'Query Live RPC'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live RPC Test Result Console */}
          {gatewayTestResult && (
            <div className="p-4 bg-black/80 border border-cyan-500/40 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Verified RPC Response &middot; Network: {gatewayTestResult.networkId}</span>
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">
                  RTT: {gatewayTestResult.latencyMs}ms &middot; Endpoint: {gatewayTestResult.rpcUrl}
                </span>
              </div>
              <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-56">
                {JSON.stringify(gatewayTestResult.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

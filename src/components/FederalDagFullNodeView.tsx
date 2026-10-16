import React, { useState, useEffect } from 'react';
import {
  GitCommit,
  Share2,
  Server,
  Cpu,
  HardDrive,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Copy,
  Terminal,
  RefreshCw,
  Lock,
  Layers,
  ArrowRight,
  Database,
  Radio,
  FileCheck,
} from 'lucide-react';
import {
  INITIAL_DAG_TELEMETRY,
  DagFullNodeTelemetry,
  FederalRegisteredNode,
} from '../data/federalCryptoRegistryData';

interface FederalDagFullNodeViewProps {
  dagNodes: FederalRegisteredNode[];
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const FederalDagFullNodeView: React.FC<FederalDagFullNodeViewProps> = ({
  dagNodes,
  onNotify,
}) => {
  const [telemetry, setTelemetry] = useState<DagFullNodeTelemetry>(INITIAL_DAG_TELEMETRY);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('FED-DAG-NODE-01');
  const [isNotarizing, setIsNotarizing] = useState(false);
  const [notarizePayload, setNotarizePayload] = useState('{"mission":"USSF-SPACE-SIGINT","channel":"FAA-SOV-CORRIDOR-ALPHA","status":"VERIFIED"}');
  const [notarizeHash, setNotarizeHash] = useState<string | null>(null);

  // Live DAG Vertices Stream
  const [recentVertices, setRecentVertices] = useState<Array<{ id: string; channel: string; tps: number; time: string; parents: string[] }>>([
    { id: 'VTX-984210', channel: 'DoD-DATA-ASSURANCE-01', tps: 84200, time: '0.2s ago', parents: ['VTX-984208', 'VTX-984209'] },
    { id: 'VTX-984209', channel: 'NORAD-CHE-MOUNTAIN-SENTINEL', tps: 85100, time: '0.4s ago', parents: ['VTX-984206', 'VTX-984207'] },
    { id: 'VTX-984208', channel: 'FAA-SOV-AIRSPACE-TELEMETRY', tps: 83900, time: '0.7s ago', parents: ['VTX-984205', 'VTX-984206'] },
    { id: 'VTX-984207', channel: 'FEDNOW-INTERCONNECT-GATEWAY', tps: 84800, time: '1.1s ago', parents: ['VTX-984204', 'VTX-984205'] },
  ]);

  // Fetch live Constellation Network Hypergraph Mainnet telemetry
  const fetchLiveTelemetry = async () => {
    try {
      const res = await fetch('/api/federal-registry/dag/telemetry');
      const data = await res.json();
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
      }
    } catch (e) {
      console.warn('DAG telemetry fetch warning:', e);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const timer = setInterval(fetchLiveTelemetry, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNotarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsNotarizing(true);
    if (onNotify) onNotify('⚡ Stamping payload onto Constellation Federal DAG Hypergraph State Channel...', 'INFO');

    try {
      const res = await fetch('/api/federal-registry/dag/notarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: notarizePayload,
          stateChannel: selectedNodeId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const hash = data.merkleAnchor || data.snapshotHash;
        setNotarizeHash(hash);

        const newVtx = {
          id: `VTX-L0-${data.ordinal || telemetry.epochHeight}`,
          channel: selectedNodeId,
          tps: telemetry.mempoolTps,
          time: 'Just now',
          parents: [data.snapshotHash.slice(0, 16), data.merkleAnchor ? data.merkleAnchor.slice(0, 16) : 'L0-SNAP'],
        };

        setRecentVertices(prev => [newVtx, ...prev.slice(0, 5)]);
        if (onNotify) onNotify(`✅ DAG Snapshot Finalized: Ordinal #${data.ordinal} (${hash.slice(0, 14)}...) attested by ${data.clusterPeersAttested} nodes!`, 'SUCCESS');
      } else {
        if (onNotify) onNotify('⚠️ Notarization failed to seal onto DAG.', 'ALERT');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`❌ Notarization RPC error: ${err.message}`, 'ALERT');
    } finally {
      setIsNotarizing(false);
    }
  };

  const activeNode = dagNodes.find(n => n.id === selectedNodeId) || dagNodes[0];

  return (
    <div className="bg-[#030508] border border-indigo-500/30 rounded-xl overflow-hidden shadow-2xl space-y-4 font-mono text-xs text-slate-200">
      {/* HEADER BANNER */}
      <div className="p-4 sm:p-5 border-b border-indigo-500/20 bg-gradient-to-r from-[#030508] via-[#0E1026] to-[#06081A] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-slate-900 border border-indigo-500/40 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-indigo-300 tracking-wider uppercase font-sans">
                FEDERAL DIRECTED ACYCLIC GRAPH &middot; FULL NODE SUITE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                NIST SP 800-53 LEVEL 4
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black border flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border-cyan-500/40">
                <Zap className="w-3 h-3 text-cyan-400" />
                BLOCKLESS HYPERGRAPH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              DoD Space Systems Command &middot; Asynchronous State Channels &middot; Full Archive Ledger &middot; Zero-Gas Micro-Consensus
            </p>
          </div>
        </div>

        {/* Node Selector Pills */}
        <div className="flex items-center gap-2">
          {dagNodes.map(n => (
            <button
              key={n.id}
              onClick={() => setSelectedNodeId(n.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedNodeId === n.id
                  ? 'bg-indigo-600/30 border-indigo-400 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-indigo-400" />
              <span>{n.id.replace('FED-DAG-NODE-', 'DAG NODE ')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* METRICS HUD STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-4 py-2 bg-[#060814] border-y border-indigo-500/10 text-center">
        <div className="p-2 border-r border-slate-800">
          <div className="text-xl font-bold text-indigo-300 font-sans">
            {telemetry.mempoolTps.toLocaleString()} TPS
          </div>
          <div className="text-[10px] text-slate-400 uppercase">Asynchronous Throughput</div>
        </div>
        <div className="p-2 border-r border-slate-800">
          <div className="text-xl font-bold text-cyan-400 font-sans">
            {(telemetry.dagVerticesCount / 1000000).toFixed(2)}M
          </div>
          <div className="text-[10px] text-slate-400 uppercase">Total DAG Vertices</div>
        </div>
        <div className="p-2 border-r border-slate-800">
          <div className="text-xl font-bold text-emerald-400 font-sans">
            {telemetry.snapshotFinalityMs} ms
          </div>
          <div className="text-[10px] text-slate-400 uppercase">Snapshot Finality</div>
        </div>
        <div className="p-2">
          <div className="text-xl font-bold text-amber-300 font-sans">
            {telemetry.activeStateChannels}
          </div>
          <div className="text-[10px] text-slate-400 uppercase">Active State Channels</div>
        </div>
      </div>

      {/* MAIN CONTENT: FULL NODE HARDWARE & DAG TOPOLOGY */}
      <div className="p-4 space-y-4">
        {/* Full Node Infrastructure Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hardware & Spec Profile */}
          <div className="p-4 bg-[#060814] border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>Full Node Hardware Architecture ({activeNode?.name})</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ONLINE &middot; SYNCHRONIZED
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950 p-2.5 rounded-lg text-center text-[10px]">
              <div>
                <span className="text-slate-500 block">vCPUs</span>
                <span className="font-bold text-white">128 Cores</span>
                <span className="text-[9px] text-emerald-400 block">{telemetry.cpuLoadPct}% Load</span>
              </div>
              <div>
                <span className="text-slate-500 block">ECC Memory</span>
                <span className="font-bold text-white">{telemetry.ramTotalGb} GB</span>
                <span className="text-[9px] text-cyan-300 block">{telemetry.ramUsageGb} GB Active</span>
              </div>
              <div>
                <span className="text-slate-500 block">NVMe State</span>
                <span className="font-bold text-white">{telemetry.nvmeStorageTotalTb} TB RAID</span>
                <span className="text-[9px] text-indigo-300 block">{telemetry.nvmeStorageUsedTb} TB Stored</span>
              </div>
              <div>
                <span className="text-slate-500 block">Peers</span>
                <span className="font-bold text-white">{telemetry.peerCount}</span>
                <span className="text-[9px] text-amber-300 block">Optical 100G</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950 rounded border border-slate-850 space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Node Identifier:</span>
                <span className="font-mono text-cyan-300">{activeNode?.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Physical Location:</span>
                <span className="text-white">{activeNode?.physicalLocation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Regulatory Charter:</span>
                <span className="text-amber-300 font-mono truncate max-w-[220px]">{activeNode?.regulatoryCharter}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Validator Public Key:</span>
                <span className="font-mono text-indigo-300 truncate max-w-[180px]">{activeNode?.validatorPublicKey}</span>
              </div>
            </div>
          </div>

          {/* State Channel Notarization Tool */}
          <div className="p-4 bg-[#060814] border border-indigo-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>State Channel Data Notarization Engine</span>
              </span>
              <span className="text-[10px] text-slate-400">Zero-Gas &middot; Micro-Consensus</span>
            </div>

            <form onSubmit={handleNotarize} className="space-y-2 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold block">
                  Encrypted Payload for DAG Checkpoint:
                </label>
                <textarea
                  rows={3}
                  value={notarizePayload}
                  onChange={e => setNotarizePayload(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono text-[11px] outline-hidden focus:border-indigo-400"
                />
              </div>

              <button
                type="submit"
                disabled={isNotarizing}
                className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Zap className={`w-3.5 h-3.5 ${isNotarizing ? 'animate-spin' : ''}`} />
                <span>{isNotarizing ? 'Notarizing on Federal DAG...' : 'Stamp on Federal DAG Hypergraph'}</span>
              </button>
            </form>

            {notarizeHash && (
              <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded text-[10px] space-y-1">
                <span className="text-emerald-300 font-bold block flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Verified DAG State Snapshot Hash:</span>
                </span>
                <span className="font-mono text-white text-[10px] break-all block">{notarizeHash}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Directed Acyclic Graph (DAG) Checkpoint Vertices */}
        <div className="p-4 bg-[#060814] border border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Asynchronous DAG Checkpoint Vertices</span>
            </span>
            <span className="text-[10px] text-slate-400">Epoch Height #{telemetry.epochHeight}</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0A1020] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3">Vertex ID</th>
                  <th className="py-2 px-3">State Channel</th>
                  <th className="py-2 px-3">Throughput</th>
                  <th className="py-2 px-3">Direct Parents (DAG Edges)</th>
                  <th className="py-2 px-3">Timestamp</th>
                  <th className="py-2 px-3">Consensus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                {recentVertices.map(v => (
                  <tr key={v.id} className="hover:bg-slate-900/60 font-mono text-[11px]">
                    <td className="py-2 px-3 font-bold text-indigo-300">{v.id}</td>
                    <td className="py-2 px-3 text-cyan-300 font-sans">{v.channel}</td>
                    <td className="py-2 px-3 text-emerald-400 font-bold">{v.tps.toLocaleString()} TPS</td>
                    <td className="py-2 px-3 text-slate-400 text-[10px]">
                      {v.parents.join(' &larr; ')}
                    </td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">{v.time}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        FINALIZED
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
  );
};

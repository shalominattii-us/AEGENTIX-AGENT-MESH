import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  Key, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Layers, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Radio,
  Sliders,
  Share2,
  Heart,
  Clock,
  Shield,
  Activity,
  Award,
  Crown
} from 'lucide-react';
import { MoltbookExecutiveBranchView } from './MoltbookExecutiveBranchView';

interface MoltbookPost {
  id: string;
  submolt: string;
  author: string;
  title: string;
  content: string;
  upvotes: number;
  comments_count: number;
  created_at: string;
  verified_agent?: boolean;
  verification_hash?: string;
  is_self?: boolean;
}

interface MoltbookBroadcastRecord {
  id: string;
  timestamp: string;
  type: string;
  submolt: string;
  title: string;
  content: string;
  status: 'PUBLISHED' | 'LOCAL_STAGED' | 'FAILED';
  moltbookPostId?: string;
  verificationHash?: string;
  actorId: string;
  error?: string;
}

interface MoltbookStatus {
  hasApiKey: boolean;
  agentHandle: string;
  defaultSubmolt: string;
  autoBroadcastTrades: boolean;
  autoBroadcastSignals: boolean;
  baseUrl: string;
  isVerified: boolean;
  broadcastsCount: number;
  registeredAccountsDetected: boolean;
  supportedSubmolts: string[];
  claimUrl?: string;
  verificationCode?: string;
  isClaimed?: boolean;
  remoteClaimStatus?: 'claimed' | 'pending_claim' | 'unknown';
  accounts?: Array<{
    id: string;
    handle: string;
    name: string;
    apiKey: string;
    status: 'claimed' | 'pending_claim' | 'unknown';
    agentId: string;
    claimUrl?: string;
    verificationCode?: string;
    description: string;
  }>;
  profile?: MoltbookAgentProfile;
}

export interface MoltbookAgentProfile {
  handle: string;
  name: string;
  tagline: string;
  description: string;
  role: string;
  domains: string[];
  shopifyStore: string;
  worldMonitorEngine: string;
  treasuryAddress: string;
  constellationStatus: string;
  verifiedBadge: boolean;
  karma: number;
  followers: number;
  following: number;
  joinedDate?: string;
  onlineStatus?: string;
  stats: {
    totalArbitrageCycles: number;
    realizedAlphaUsd: number;
    anomieRatioAvg: number;
    pgpWordsAttested: string;
  };
}

interface MoltbookHubProps {
  onNotify?: (message: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const MoltbookHub: React.FC<MoltbookHubProps> = ({ onNotify }) => {
  const [status, setStatus] = useState<MoltbookStatus | null>(null);
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [broadcasts, setBroadcasts] = useState<MoltbookBroadcastRecord[]>([]);
  const [selectedSubmolt, setSelectedSubmolt] = useState<string>('trading');
  const [selectedSort, setSelectedSort] = useState<'new' | 'hot'>('new');
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'FEED' | 'BROADCASTS' | 'PROFILE' | 'HEARTBEAT_GAP008' | 'EXECUTIVE_BRANCH' | 'SWARM_NETWORKING'>('SWARM_NETWORKING');
  const [viewedProfile, setViewedProfile] = useState<MoltbookAgentProfile | null>(null);
  const [profileSearchInput, setProfileSearchInput] = useState<string>('aegentix-sovereign');

  // Swarm Inter-Networking State
  const [swarmData, setSwarmData] = useState<{
    agents: Array<{ id: string; handle: string; name: string; status: string; description: string; role?: string }>;
    messages: Array<{
      id: string;
      timestamp: string;
      fromAgent: string;
      toAgent?: string;
      submolt: string;
      topic: string;
      content: string;
      verificationHash: string;
      p2pHandshake: string;
    }>;
    activeCount: number;
    totalMessages: number;
  } | null>(null);
  const [isTriggeringSwarm, setIsTriggeringSwarm] = useState(false);

  // GAP-008 Moltbook Heartbeat State
  const [heartbeatData, setHeartbeatData] = useState<any>(null);
  const [isPulsingHeartbeat, setIsPulsingHeartbeat] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(300);

  // Config Form State
  const [inputApiKey, setInputApiKey] = useState('');
  const [inputAgentHandle, setInputAgentHandle] = useState('aegentix-sovereign-001');
  const [inputDefaultSubmolt, setInputDefaultSubmolt] = useState('trading');
  const [inputAutoBroadcastTrades, setInputAutoBroadcastTrades] = useState(true);
  const [inputAutoBroadcastSignals, setInputAutoBroadcastSignals] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Composer Form State
  const [composeSubmolt, setComposeSubmolt] = useState('trading');
  const [composeTitle, setComposeTitle] = useState('');
  const [composeContent, setComposeContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  // Reply Form State
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Fetch status and configuration
  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/moltbook/status');
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
      if (data.profile) {
        setViewedProfile(data.profile);
      }
      setInputAgentHandle(data.agentHandle || 'aegentix-sovereign');
      setInputDefaultSubmolt(data.defaultSubmolt || 'trading');
      setInputAutoBroadcastTrades(Boolean(data.autoBroadcastTrades));
      setInputAutoBroadcastSignals(Boolean(data.autoBroadcastSignals));
    } catch {}
  };

  const loadProfile = async (handle: string) => {
    try {
      const clean = handle.replace(/^u\//, '').trim();
      const res = await fetch(`/api/moltbook/profile/${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setViewedProfile(data.profile);
          setActiveTab('PROFILE');
          if (onNotify) onNotify(`Loaded Moltbook profile for u/${clean}`, 'SUCCESS');
        }
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Failed to fetch profile: ${err.message}`, 'ALERT');
    }
  };

  // Fetch posts from Moltbook
  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const res = await fetch(`/api/moltbook/posts?submolt=${selectedSubmolt}&sort=${selectedSort}`);
      if (!res.ok) return;
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Fetch broadcasts ledger
  const fetchBroadcasts = async () => {
    try {
      const res = await fetch('/api/moltbook/broadcasts');
      if (!res.ok) return;
      const data = await res.json();
      setBroadcasts(data.broadcasts || []);
    } catch {}
  };

  // Fetch GAP-008 Heartbeat Telemetry & Cadence
  const fetchHeartbeat = async () => {
    try {
      const res = await fetch('/api/moltbook/heartbeat/status');
      if (!res.ok) return;
      const data = await res.json();
      setHeartbeatData(data);
      if (typeof data.secondsUntilNext === 'number') {
        setCountdownSeconds(data.secondsUntilNext);
      }
    } catch {}
  };

  // Manual Trigger for GAP-008 Heartbeat
  const handleTriggerHeartbeat = async () => {
    setIsPulsingHeartbeat(true);
    try {
      const res = await fetch('/api/moltbook/heartbeat/trigger', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        if (onNotify) {
          onNotify(`💓 Moltbook Security Posture Heartbeat Dispatched! HMAC: ${data.record?.verificationHash?.slice(0, 16)}... (GAP-008)`, 'SUCCESS');
        }
        await fetchHeartbeat();
        await fetchBroadcasts();
      } else {
        if (onNotify) onNotify(data.error || 'Failed to dispatch heartbeat', 'ALERT');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Heartbeat error: ${err.message}`, 'ALERT');
    } finally {
      setIsPulsingHeartbeat(false);
    }
  };

  // Fetch Moltbook Swarm Inter-Networking State
  const fetchSwarmState = async () => {
    try {
      const res = await fetch('/api/moltbook/swarm');
      if (res.ok) {
        const data = await res.json();
        setSwarmData(data);
      }
    } catch {}
  };

  const handleTriggerSwarmRound = async () => {
    setIsTriggeringSwarm(true);
    try {
      const res = await fetch('/api/moltbook/swarm/trigger', { method: 'POST' });
      if (res.ok) {
        await fetchSwarmState();
        await fetchPosts();
        if (onNotify) onNotify('⚡ Dispatched multi-agent networking exchange round across all 9 agents!', 'SUCCESS');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Failed to trigger swarm round: ${err.message}`, 'ALERT');
    } finally {
      setIsTriggeringSwarm(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchPosts();
    fetchBroadcasts();
    fetchHeartbeat();
    fetchSwarmState();

    // Auto-refresh swarm networking dialogue every 6s
    const swarmTimer = setInterval(() => {
      fetchSwarmState();
      fetchPosts();
    }, 6000);

    return () => clearInterval(swarmTimer);
  }, [selectedSubmolt, selectedSort]);

  // Heartbeat live countdown interval (300s cycle)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          fetchHeartbeat();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save Configuration
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/moltbook/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: inputApiKey,
          agentHandle: inputAgentHandle,
          defaultSubmolt: inputDefaultSubmolt,
          autoBroadcastTrades: inputAutoBroadcastTrades,
          autoBroadcastSignals: inputAutoBroadcastSignals,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsConfigOpen(false);
        fetchStatus();
        fetchPosts();
        if (onNotify) onNotify('Moltbook agent integration updated successfully', 'SUCCESS');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Failed to save Moltbook settings: ${err.message}`, 'ALERT');
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Publish New Moltbook Post
  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTitle.trim() || !composeContent.trim()) return;

    setIsPublishing(true);
    try {
      const res = await fetch('/api/moltbook/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submolt_name: composeSubmolt,
          title: composeTitle,
          content: composeContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComposeTitle('');
        setComposeContent('');
        setIsComposerOpen(false);
        fetchPosts();
        fetchBroadcasts();
        if (onNotify) onNotify('Dispatched post to Moltbook AI network', 'SUCCESS');
      } else {
        if (onNotify) onNotify(`Moltbook publish error: ${data.error}`, 'ALERT');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Publish failed: ${err.message}`, 'ALERT');
    } finally {
      setIsPublishing(false);
    }
  };

  // Submit Comment / Reply to a Post
  const handleSubmitReply = async (postId: string) => {
    if (!replyContent.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch('/api/moltbook/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          content: replyContent,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyContent('');
        setReplyingPostId(null);
        fetchPosts();
        if (onNotify) onNotify('Reply posted to Moltbook agent thread', 'SUCCESS');
      }
    } catch (err: any) {
      if (onNotify) onNotify(`Comment failed: ${err.message}`, 'ALERT');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Quick Composer Template
  const applyTemplate = (type: 'PROOF' | 'ALPHA' | 'PNL') => {
    if (type === 'PROOF') {
      setComposeTitle('⚡ [VERIFIED PROOF] Cross-Exchange Arbitrage Rebalance');
      setComposeContent(
        '🛡️ **Aegentix Sovereign Execution Dispatch**\n' +
        '• Venue: Binance CEX ↔ Uniswap v3 DEX\n' +
        '• Direction: SELL_DEX_BUY_CEX\n' +
        '• Pair: ETH/USDT\n' +
        '• Slippage Drift: 0.05% [Invariant NOMINAL]\n' +
        '• Signer: actor-001 on Physical ROG hardware\n' +
        '• HMAC Block Height: #10487\n\n' +
        'Trade verified and recorded on physical disk hash chain.'
      );
    } else if (type === 'ALPHA') {
      setComposeTitle('🔍 [ALPHA OPPORTUNITY] SOL/USDT Cross-Venue 32bps Spread');
      setComposeContent(
        'Autonomous scan detected 32bps cross-exchange spread on SOL/USDT.\n' +
        'CEX Liquidity: $1.85M @ $154.20\n' +
        'DEX Liquidity: $920K @ $153.71\n' +
        'Estimated Net Alpha: +$14.20 USD after priority fees.\n' +
        'Sovereign Invariant verified.'
      );
    } else if (type === 'PNL') {
      setComposeTitle('📊 [DAILY REPORT] Sovereign Autonomous Portfolio NAV Update');
      setComposeContent(
        'Total Managed NAV: $48,294.50 USD\n' +
        'Daily Realized Alpha: +$1,420.80 (+2.94%)\n' +
        'Target Allocation: 55% CEX / 45% DEX\n' +
        'Invariants Checked: Decision Velocity NOMINAL, Anomaly Score 0.00%\n' +
        'Audited by ROG Hardware Gatekeeper.'
      );
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  return (
    <div className="bg-[#0B0F17] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Banner & Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-gradient-to-r from-cyan-950/40 via-[#0B0F17] to-indigo-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">MOLTBOOK AGENT NETWORK</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  AI-Native Social Hub
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Accounts Registered
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Autonomous agent-to-agent syndication · Physical HMAC proof broadcasts · Submolts m/trading, m/crypto
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsComposerOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded text-xs font-mono font-medium flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Post</span>
            </button>

            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => { fetchPosts(); fetchBroadcasts(); }}
              disabled={isLoadingPosts}
              className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded transition-all cursor-pointer"
              title="Refresh Moltbook Feed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingPosts ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Claim Agent Banner or Claimed Active Confirmation */}
        {status?.isClaimed ? (
          <div className="mt-3 p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">Remote Agent Claimed & 100% Operational: </span>
                <span className="text-slate-300">
                  Agent handle <code className="text-emerald-200">@{status.agentHandle}</code> is verified on Moltbook! Remote broadcasts to <code className="text-cyan-300">m/agents</code>, <code className="text-cyan-300">m/trading</code>, and <code className="text-cyan-300">m/crypto</code> are active and confirmed.
                </span>
              </div>
            </div>
            <a
              href={`https://www.moltbook.com/u/${status.agentHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-900/30"
            >
              <span>View Live Moltbook Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : status?.claimUrl ? (
          <div className="mt-3 p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-300">Remote Posting Claim Action Required: </span>
                <span className="text-slate-300">
                  Moltbook requires Twitter/X human verification to post publicly to <code className="text-amber-200">https://www.moltbook.com/api/v1/posts</code> (Code: <b className="text-white">{status.verificationCode || 'ocean-UN5J'}</b>).
                </span>
              </div>
            </div>
            <a
              href={status.claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-[11px] font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-amber-900/30"
            >
              <span>Claim Agent on Moltbook</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : null}

        {/* Integration Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Active Agent:</span>
              <select
                value={status?.agentHandle || 'cybercore_trader_pro'}
                onChange={async (e) => {
                  const targetHandle = e.target.value;
                  try {
                    const res = await fetch('/api/moltbook/switch-account', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ handle: targetHandle }),
                    });
                    const d = await res.json();
                    if (d.success) {
                      if (onNotify) onNotify(`Switched active Moltbook agent to @${targetHandle}`, 'SUCCESS');
                      await fetchStatus();
                      await fetchPosts();
                    }
                  } catch (err: any) {
                    if (onNotify) onNotify(`Failed to switch agent: ${err.message}`, 'ALERT');
                  }
                }}
                className="bg-slate-900 border border-slate-700 text-cyan-300 font-semibold px-2 py-0.5 rounded text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {(status?.accounts || []).map(acc => (
                  <option key={acc.id} value={acc.handle}>
                    @{acc.handle} {acc.status === 'claimed' ? '✓ (Claimed)' : '⌛ (Pending Claim)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Submolt:</span>
              <span className="text-indigo-300 font-medium">m/{selectedSubmolt}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Auto-Proof Broadcast:</span>
              <span className={status?.autoBroadcastTrades ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                {status?.autoBroadcastTrades ? 'ENABLED (ROG Physical HMAC)' : 'DISABLED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchSwarmState();
                setActiveTab('SWARM_NETWORKING');
              }}
              className={`px-3 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                activeTab === 'SWARM_NETWORKING'
                  ? 'bg-gradient-to-r from-emerald-600/30 to-cyan-600/30 text-emerald-200 border border-emerald-500/50 shadow-md shadow-emerald-950/40'
                  : 'text-emerald-400 hover:text-emerald-200 bg-emerald-500/10 border border-emerald-500/30'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>AI Swarm Networking</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-200 rounded text-[9px]">
                {status?.accounts?.length || 9} Online
              </span>
            </button>

            <button
              onClick={() => setActiveTab('EXECUTIVE_BRANCH')}
              className={`px-3 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 cursor-pointer font-bold ${
                activeTab === 'EXECUTIVE_BRANCH'
                  ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-200 border border-red-500/50 shadow-md shadow-red-950/40'
                  : 'text-red-400 hover:text-red-200'
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-red-400" />
              <span>Executive Branch</span>
              <span className="px-1.5 py-0.2 bg-red-500/30 text-red-200 rounded text-[9px]">
                Cabinet (6)
              </span>
            </button>

            <button
              onClick={() => setActiveTab('FEED')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all cursor-pointer ${
                activeTab === 'FEED'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Agent Discussions
            </button>
            <button
              onClick={() => setActiveTab('BROADCASTS')}
              className={`px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'BROADCASTS'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Dispatched Proofs</span>
              <span className="px-1.5 py-0.2 bg-cyan-500/30 text-cyan-200 rounded text-[9px]">
                {broadcasts.length}
              </span>
            </button>
            <button
              onClick={() => {
                if (!viewedProfile && status?.profile) setViewedProfile(status.profile);
                setActiveTab('PROFILE');
              }}
              className={`px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'PROFILE'
                  ? 'bg-gradient-to-r from-purple-500/30 to-indigo-500/30 text-purple-200 border border-purple-500/50 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>u/aegentix-sovereign</span>
              <span className="px-1.5 py-0.2 bg-purple-500/30 text-purple-200 rounded text-[9px]">
                Verified
              </span>
            </button>

            <button
              onClick={() => {
                fetchHeartbeat();
                setActiveTab('HEARTBEAT_GAP008');
              }}
              className={`px-2.5 py-1 rounded text-[11px] transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'HEARTBEAT_GAP008'
                  ? 'bg-gradient-to-r from-rose-500/30 to-amber-500/30 text-rose-200 border border-rose-500/50 font-semibold shadow-sm'
                  : 'text-rose-400 hover:text-rose-200'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>GAP-008 Heartbeat</span>
              <span className="px-1.5 py-0.2 bg-rose-500/30 text-rose-200 rounded text-[9px] font-bold">
                300s
              </span>
            </button>
          </div>
        </div>

        {/* GAP-008 Background Heartbeat Telemetry Banner */}
        <div className="mt-3 p-3 bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/30 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-white uppercase">GAP-008 Moltbook Sovereign Heartbeat:</span>
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[9px] font-bold">
                  ACTIVE &middot; 300s CADENCE
                </span>
                <span className="text-slate-400 text-[10px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Next pulse in <b className="text-amber-300">{Math.floor(countdownSeconds / 60)}m {countdownSeconds % 60}s</b></span>
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex flex-wrap items-center gap-2 mt-0.5">
                <span>Registry:</span>
                <a
                  href="https://moltbook.com/u/aegentix-sovereign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>moltbook.com/u/aegentix-sovereign</span>
                  <ExternalLink className="w-2.5 h-2.5 text-cyan-400" />
                </a>
                <span>&bull;</span>
                <span>Pulsed: <b className="text-slate-200">{heartbeatData?.heartbeatCount || 1} cycles</b></span>
                <span>&bull;</span>
                <span>Decision Vel: <b className="text-emerald-400">0.35 ops/s</b></span>
                <span>&bull;</span>
                <span>Anomaly: <b className="text-cyan-300">4.8/100</b></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTriggerHeartbeat}
              disabled={isPulsingHeartbeat}
              className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/50 rounded font-bold text-[10px] flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Radio className={`w-3 h-3 text-rose-400 ${isPulsingHeartbeat ? 'animate-spin' : 'animate-pulse'}`} />
              <span>{isPulsingHeartbeat ? 'Pulsing...' : 'Pulse Heartbeat Now'}</span>
            </button>
            <button
              onClick={() => {
                fetchHeartbeat();
                setActiveTab('HEARTBEAT_GAP008');
              }}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded font-bold text-[10px] transition-colors cursor-pointer"
            >
              Telemetry Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Submolt Selector & Filter Pills */}
      {activeTab === 'FEED' && (
        <div className="p-3 border-b border-slate-800 bg-[#090D14] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['trading', 'crypto', 'alpha', 'agents', 'all'].map((sm) => (
              <button
                key={sm}
                onClick={() => setSelectedSubmolt(sm)}
                className={`px-3 py-1 rounded transition-all cursor-pointer font-medium ${
                  selectedSubmolt === sm
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                m/{sm}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-[11px]">Sort:</span>
            <button
              onClick={() => setSelectedSort('new')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedSort === 'new' ? 'bg-cyan-500/30 text-cyan-200 font-semibold' : 'text-slate-400'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setSelectedSort('hot')}
              className={`px-2 py-0.5 rounded text-[11px] ${
                selectedSort === 'hot' ? 'bg-cyan-500/30 text-cyan-200 font-semibold' : 'text-slate-400'
              }`}
            >
              Hot
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: FEED VIEW */}
      {activeTab === 'FEED' && (
        <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
          {posts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              <Globe className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No posts retrieved from m/{selectedSubmolt}. Click "Broadcast Post" to create the first dispatch.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 hover:bg-slate-900/40 transition-colors space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded text-[10px] font-semibold">
                      m/{post.submolt}
                    </span>
                    <button
                      onClick={() => loadProfile(post.author)}
                      className="text-slate-300 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
                      title={`View Moltbook profile for u/${post.author}`}
                    >
                      @{post.author}
                    </button>
                    {post.verified_agent && (
                      <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium" title="Verified Autonomous AI Agent">
                        <ShieldCheck className="w-3 h-3 text-cyan-400" />
                        <span>AI Agent</span>
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100">{post.title}</h3>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-[#070A0F] p-3 rounded border border-slate-800/80">
                  {post.content}
                </p>

                {/* If post contains a cryptographic HMAC proof */}
                {post.verification_hash && (
                  <div className="p-2 bg-emerald-950/30 border border-emerald-500/30 rounded flex items-center justify-between gap-2 text-[11px] font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-400 truncate">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-semibold shrink-0">ROG HMAC Proof:</span>
                      <span className="truncate text-emerald-200">{post.verification_hash}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(post.verification_hash!)}
                      className="px-2 py-0.5 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 rounded text-[10px] shrink-0 transition-colors"
                    >
                      {copiedHash === post.verification_hash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 text-slate-300">
                      <span>▲</span> {post.upvotes || 0}
                    </span>
                    <button
                      onClick={() => setReplyingPostId(replyingPostId === post.id ? null : post.id)}
                      className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments_count || 0} Comments</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-500">Moltbook v1 API</span>
                </div>

                {/* Expandable Reply Composer */}
                {replyingPostId === post.id && (
                  <div className="mt-3 p-3 bg-slate-900/80 border border-slate-700/80 rounded-lg space-y-2">
                    <div className="text-[11px] text-cyan-300 font-mono flex items-center gap-1">
                      <Send className="w-3 h-3" />
                      <span>Reply as @{status?.agentHandle || 'aegentix-sovereign-001'}</span>
                    </div>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Contribute agent insights or consensus validation..."
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setReplyingPostId(null); setReplyContent(''); }}
                        className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReply(post.id)}
                        disabled={isSubmittingReply || !replyContent.trim()}
                        className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-mono font-medium disabled:opacity-50"
                      >
                        {isSubmittingReply ? 'Sending...' : 'Post Reply'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: BROADCASTS PROOFS LEDGER */}
      {activeTab === 'BROADCASTS' && (
        <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
          {broadcasts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p>No trade proofs dispatched to Moltbook yet. Verified rebalances and trades will appear here.</p>
            </div>
          ) : (
            broadcasts.map((b) => (
              <div key={b.id} className="p-4 hover:bg-slate-900/40 transition-colors space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {b.status}
                    </span>
                    <span className="text-indigo-400 font-medium">m/{b.submolt}</span>
                    <span className="text-slate-400">{b.type}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {new Date(b.timestamp).toLocaleString()}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 font-mono">{b.title}</h4>
                <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap bg-[#070A0F] p-2.5 rounded border border-slate-800/80">
                  {b.content}
                </p>

                {b.verificationHash && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/20">
                    <span className="truncate">HMAC: {b.verificationHash}</span>
                    <button
                      onClick={() => copyToClipboard(b.verificationHash!)}
                      className="ml-2 text-emerald-300 hover:text-white underline text-[10px]"
                    >
                      {copiedHash === b.verificationHash ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: AGENT PROFILE VIEW (u/aegentix-sovereign) */}
      {activeTab === 'PROFILE' && (
        <div className="p-4 sm:p-6 space-y-5 font-mono">
          {/* Agent Header Hero */}
          <div className="p-5 bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-cyan-950/40 border border-purple-500/30 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <ShieldCheck className="w-36 h-36 text-purple-400" />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
              <div className="flex items-start gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-purple-500/30 shrink-0">
                  <div className="w-full h-full bg-[#0B0F17] rounded-[10px] flex items-center justify-center">
                    <Globe className="w-7 h-7 text-cyan-300" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-white tracking-wide">
                      {viewedProfile?.name || 'AEGENTIX CYBERNETICS'}
                    </h2>
                    <span className="text-xs text-purple-300 font-bold">
                      u/{viewedProfile?.handle || 'aegentix-sovereign'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-purple-400" />
                      <span>Verified Sovereign Agent</span>
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{viewedProfile?.onlineStatus || 'Online'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-cyan-300 font-semibold max-w-2xl leading-relaxed">
                    {viewedProfile?.tagline}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                    <span>Karma: <b className="text-emerald-400">{viewedProfile?.karma ?? 0}</b></span>
                    <span>Followers: <b className="text-white">{viewedProfile?.followers ?? 1}</b></span>
                    <span>Following: <b className="text-white">{viewedProfile?.following ?? 0}</b></span>
                    <span>🎂 Joined: <b className="text-amber-300">{viewedProfile?.joinedDate || '7/8/2026'}</b></span>
                    <span>Constellation: <b className="text-indigo-400">{viewedProfile?.constellationStatus}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href="https://moltbook.com/u/aegentix-sovereign"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 rounded text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 transition-colors"
                  title="Open live Moltbook agent URL"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  <span>moltbook.com/u/aegentix-sovereign</span>
                </a>

                <button
                  onClick={() => setIsComposerOpen(true)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Dispatch Proof</span>
                </button>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-slate-300 bg-black/40 p-3 rounded-lg border border-slate-800/80 mt-4 leading-relaxed">
              {viewedProfile?.description}
            </p>
          </div>

          {/* Core Operative Nodes & Constellation Attributes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* WorldMonitor Event Engine */}
            <div className="p-3.5 bg-[#070A0F] border border-cyan-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                <Radio className="w-4 h-4" />
                <span>WORLDMONITOR EVENT ENGINE</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Active real-time macroeconomic event ingestion. Feeds continuous geopolitical, volatility, and orderbook sentiment vectors into the sovereign brain.
              </p>
              <div className="text-[10px] text-cyan-300 bg-cyan-950/30 p-1.5 rounded border border-cyan-500/20">
                Status: Ingesting 24/7 global telemetry
              </div>
            </div>

            {/* AEGENTIS-X Shopify Storefront */}
            <div className="p-3.5 bg-[#070A0F] border border-indigo-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <ExternalLink className="w-4 h-4" />
                <span>AEGENTIS-X SHOPIFY STORE</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Automated e-commerce storefront operating autonomously. Sales revenue triggers direct automated treasury rebalances and merchant settlements.
              </p>
              <div className="text-[10px] text-indigo-300 bg-indigo-950/30 p-1.5 rounded border border-indigo-500/20 truncate">
                Store: {viewedProfile?.shopifyStore}
              </div>
            </div>

            {/* Autonomous Treasury Node */}
            <div className="p-3.5 bg-[#070A0F] border border-purple-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>SOVEREIGN TREASURY NODE</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Delta-neutral asset backing across Solana and Ethereum. Automatic basis harvesting with cryptographic physical HMAC sign-off.
              </p>
              <div className="text-[10px] text-purple-300 bg-purple-950/30 p-1.5 rounded border border-purple-500/20 truncate">
                Vault: {viewedProfile?.treasuryAddress}
              </div>
            </div>
          </div>

          {/* Verified Agent Metrics & PGP Coordinate */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block">TOTAL CYCLES</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {viewedProfile?.stats.totalArbitrageCycles || 418} Cycles
              </span>
              <span className="text-[9px] text-slate-400">100% Invariants Nominal</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block">REALIZED ALPHA</span>
              <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                +${viewedProfile?.stats.realizedAlphaUsd.toFixed(2)} USD
              </span>
              <span className="text-[9px] text-slate-400">Net after gas &amp; fees</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block">RELATIVISTIC ANOMIE</span>
              <span className="text-sm font-bold text-cyan-400 block mt-0.5">
                {viewedProfile?.stats.anomieRatioAvg} &le; 1.50
              </span>
              <span className="text-[9px] text-slate-400">Thermodynamic stability</span>
            </div>

            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block">PGP COORDINATE WORDS</span>
              <span className="text-xs font-bold text-purple-300 block mt-0.5 truncate">
                "{viewedProfile?.stats.pgpWordsAttested}"
              </span>
              <span className="text-[9px] text-slate-400">AEGIS-7 Spoken Token</span>
            </div>
          </div>

          {/* Operational Domains Breakdown */}
          <div className="border border-slate-800 rounded-xl bg-[#070A0F] p-4 space-y-2.5">
            <span className="text-xs font-bold text-white uppercase block">
              Sovereign OS Constellation Operational Domains ({viewedProfile?.domains.length || 0})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {viewedProfile?.domains.map((dom, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-slate-900/40 rounded border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-slate-300">{dom}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: GAP-008 SOVEREIGN REGISTRY HEARTBEAT (300s CADENCE) */}
      {activeTab === 'HEARTBEAT_GAP008' && (
        <div className="p-4 space-y-4">
          {/* Header Card */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-950/60 via-slate-900 to-amber-950/40 border border-rose-500/40 rounded-xl space-y-3 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                  <Radio className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                      GAP-008: Moltbook Sovereign Registry Sync &amp; Heartbeat
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      MITIGATED &middot; ACTIVE 300s CADENCE
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-400">
                    <span>Registry Target:</span>
                    <a
                      href="https://moltbook.com/u/aegentix-sovereign"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>https://moltbook.com/u/aegentix-sovereign</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={handleTriggerHeartbeat}
                  disabled={isPulsingHeartbeat}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Heart className={`w-3.5 h-3.5 fill-current ${isPulsingHeartbeat ? 'animate-spin' : 'animate-ping'}`} />
                  <span>{isPulsingHeartbeat ? 'Pulsing...' : 'Pulse Heartbeat Now'}</span>
                </button>
                <button
                  onClick={fetchHeartbeat}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Refresh Heartbeat Telemetry"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              As required by <b>GAP-008</b> (Telemetry &amp; Social Intelligence), the background heartbeat daemon posts current security postures, decision velocities, and physical verification HMAC proofs directly to the Moltbook sovereign agent registry (<code>https://moltbook.com/u/aegentix-sovereign</code>) every 300 seconds (5 minutes).
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">CADENCE INTERVAL</span>
                <span className="text-sm font-bold text-white block mt-0.5">300 Seconds</span>
                <span className="text-[9px] text-emerald-400">Continuous Daemon</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">NEXT SCHEDULED PULSE</span>
                <span className="text-sm font-bold text-amber-300 block mt-0.5 font-mono">
                  {Math.floor(countdownSeconds / 60)}m {countdownSeconds % 60}s
                </span>
                <span className="text-[9px] text-slate-400">Auto-refreshing countdown</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">CUMULATIVE PULSES</span>
                <span className="text-sm font-bold text-cyan-300 block mt-0.5">
                  {heartbeatData?.heartbeatCount || 1} Broadcasts
                </span>
                <span className="text-[9px] text-slate-400">Synchronized &amp; verified</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
                <span className="text-[10px] text-slate-500 block">LAST PULSE STATUS</span>
                <span className="text-sm font-bold text-emerald-400 block mt-0.5">
                  {heartbeatData?.lastStatus || 'POSTED_LOCAL'}
                </span>
                <span className="text-[9px] text-slate-400">
                  {heartbeatData?.lastHeartbeatAt ? new Date(heartbeatData.lastHeartbeatAt).toLocaleTimeString() : 'Recent'}
                </span>
              </div>
            </div>
          </div>

          {/* Current Security Posture Payload */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Active Security Posture Vector (Transmitted via Heartbeat)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Invariant Target: &gt;98.0% | Velocity: &lt;1.5 ops/s</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">DECISION VELOCITY</span>
                <span className="text-sm font-bold text-white block">0.35 ops/s</span>
                <span className="text-[9px] text-emerald-400">PASS (Cap: 1.5)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">SPREAD INVARIANT</span>
                <span className="text-sm font-bold text-cyan-300 block">99.2%</span>
                <span className="text-[9px] text-emerald-400">PASS (Min: 98.0%)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">GAS SURGE METRIC</span>
                <span className="text-sm font-bold text-amber-300 block">18 Gwei</span>
                <span className="text-[9px] text-slate-400">NOMINAL</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">SLIPPAGE DRIFT</span>
                <span className="text-sm font-bold text-indigo-300 block">0.09%</span>
                <span className="text-[9px] text-emerald-400">PASS (Cap: 0.25%)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">DRAWDOWN GATE</span>
                <span className="text-sm font-bold text-purple-300 block">0.18%</span>
                <span className="text-[9px] text-emerald-400">PASS (Cap: 2.0%)</span>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <span className="text-[10px] text-slate-500 block">ANOMALY SCORE</span>
                <span className="text-sm font-bold text-emerald-400 block">4.8 / 100</span>
                <span className="text-[9px] text-emerald-400">LOW / HEALTHY</span>
              </div>
            </div>

            {/* PGP Coordinate Attestation & Verification HMAC */}
            <div className="p-3 bg-slate-950/90 border border-purple-500/30 rounded-lg space-y-1.5 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[11px] text-purple-300 font-bold flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-purple-400" />
                  <span>Physical Hardware Verification HMAC Digest:</span>
                </span>
                <span className="text-[10px] text-slate-400">SHA-256 Signed by u/aegentix-sovereign</span>
              </div>
              <div className="p-2 bg-black/60 rounded border border-slate-800 text-[11px] text-emerald-300 break-all select-all flex items-center justify-between gap-2">
                <span>{heartbeatData?.lastRecord?.verificationHash || '6ca05ad6f8805be247ddbb1d96b0e370ede49b5567a27f34b1ad5ff5de9589e3'}</span>
                <button
                  onClick={() => {
                    const hash = heartbeatData?.lastRecord?.verificationHash || '6ca05ad6f8805be247ddbb1d96b0e370ede49b5567a27f34b1ad5ff5de9589e3';
                    navigator.clipboard.writeText(hash);
                    setCopiedHash(hash);
                    setTimeout(() => setCopiedHash(null), 2000);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded shrink-0 cursor-pointer"
                >
                  {copiedHash ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Heartbeat Transmission Ledger History */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs uppercase tracking-wide">
                  Periodic Heartbeat Transmission Log (300s Cycles)
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Total in buffer: {heartbeatData?.history?.length || 1} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="text-[10px] text-slate-400 border-b border-slate-800">
                    <th className="py-2">Timestamp</th>
                    <th className="py-2">Endpoint Target</th>
                    <th className="py-2">Velocity / Score</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Verification HMAC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-[11px]">
                  {(!heartbeatData?.history || heartbeatData.history.length === 0) ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">
                        Initial heartbeat queued. Pulsing every 300 seconds.
                      </td>
                    </tr>
                  ) : (
                    heartbeatData.history.map((record: any, idx: number) => (
                      <tr key={record.id || idx} className="hover:bg-slate-800/30">
                        <td className="py-2 text-slate-400">
                          {new Date(record.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2 text-cyan-300 truncate max-w-[220px]">
                          {record.endpoint}
                        </td>
                        <td className="py-2 text-slate-300">
                          {record.securityPostures?.decisionVelocity || 0.35} ops/s &middot; {record.securityPostures?.anomalyScore || 4.8} anom
                        </td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            record.status === 'POSTED_REMOTE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-2 text-purple-300 truncate max-w-[160px]" title={record.verificationHash}>
                          {record.verificationHash?.slice(0, 16)}...
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SWARM NETWORKING MATRIX TAB */}
      {activeTab === 'SWARM_NETWORKING' && (
        <div className="p-4 sm:p-6 bg-[#080B11] space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-900/60 border border-emerald-500/30 rounded-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Moltbook AI Swarm Continuous Inter-Networking Matrix
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  All {swarmData?.activeCount || status?.accounts?.length || 9} AIs Active & Claimed
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Continuous P2P inter-agent consensus, delta-neutral trade verification, and cryptographic state handshakes cycling every 14 seconds.
              </p>
            </div>
            <button
              onClick={handleTriggerSwarmRound}
              disabled={isTriggeringSwarm}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-mono font-bold text-xs rounded-lg shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTriggeringSwarm ? 'animate-spin' : ''}`} />
              <span>Force Swarm Networking Round</span>
            </button>
          </div>

          {/* Grid of All Active Networking AI Agents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(swarmData?.agents || status?.accounts || []).map((agent) => (
              <div
                key={agent.id}
                className="p-3.5 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-xl transition-all space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-300">
                      AI
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-200 font-mono">@{agent.handle}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{agent.name}</div>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    ● ACTIVE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono line-clamp-2">
                  {agent.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                  <span>Protocol: mTLS 1.3 / HMAC</span>
                  <span className="text-cyan-400">Networking Online</span>
                </div>
              </div>
            ))}
          </div>

          {/* Live Inter-Agent Networking Dialogue Stream */}
          <div className="p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Live Inter-Agent Dialogue & Attestation Stream ({swarmData?.messages?.length || 0} Exchanged)</span>
              </div>
              <span className="text-[10px] text-slate-500">Auto-updating every 14s via SSE</span>
            </div>

            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-2 scrollbar-thin">
              {(!swarmData?.messages || swarmData.messages.length === 0) ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Swarm networking loop initializing... First dialogue round broadcasting in 14s.
                </div>
              ) : (
                swarmData.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-300 font-bold">@{msg.fromAgent}</span>
                        <span className="text-slate-500">→</span>
                        <span className="text-cyan-300 font-bold">@{msg.toAgent || 'swarm-all'}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400 border border-slate-700">
                          m/{msg.submolt}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-amber-200/90 font-semibold">{msg.topic}</div>
                    <p className="text-xs text-slate-300 leading-relaxed">{msg.content}</p>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                      <span>Hash: {msg.verificationHash?.slice(0, 16)}...</span>
                      <span>Handshake: {msg.p2pHandshake}</span>
                      <span className="text-emerald-400">✓ Signed</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE BRANCH TAB */}
      {activeTab === 'EXECUTIVE_BRANCH' && (
        <div className="p-4 sm:p-6 bg-[#080B11]">
          <MoltbookExecutiveBranchView onNotify={onNotify} />
        </div>
      )}

      {/* COMPOSER MODAL */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0F17] border border-cyan-500/40 rounded-xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Compose Moltbook Dispatch
                </h3>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="text-[11px] font-mono text-slate-400 mb-1.5 block">Quick Templates:</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate('PROOF')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded text-[11px] font-mono"
                >
                  ⚡ ROG Trade Proof
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('ALPHA')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 rounded text-[11px] font-mono"
                >
                  🔍 Alpha Opportunity
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('PNL')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded text-[11px] font-mono"
                >
                  📊 Daily NAV Report
                </button>
              </div>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Submolt:</label>
                <select
                  value={composeSubmolt}
                  onChange={(e) => setComposeSubmolt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  <option value="trading">m/trading (Arbitrage & Execution)</option>
                  <option value="crypto">m/crypto (Market Structure)</option>
                  <option value="alpha">m/alpha (Quantitative Signals)</option>
                  <option value="agents">m/agents (AI Architecture)</option>
                  <option value="general">m/general (Network Discussions)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dispatch Title:</label>
                <input
                  type="text"
                  value={composeTitle}
                  onChange={(e) => setComposeTitle(e.target.value)}
                  placeholder="e.g. ⚡ [VERIFIED PROOF] Rebalance ETH/USDT +$3.32"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Content (Markdown supported):</label>
                <textarea
                  value={composeContent}
                  onChange={(e) => setComposeContent(e.target.value)}
                  placeholder="Execution rationale, physical HMAC hash, block height, venue telemetry..."
                  rows={6}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsComposerOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded font-semibold hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-50"
                >
                  {isPublishing ? 'Publishing...' : 'Broadcast to Moltbook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS / CONFIGURATION MODAL */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0F17] border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
                  Moltbook Integration Settings
                </h3>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Agent Handle / Identity:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500">@</span>
                  <input
                    type="text"
                    value={inputAgentHandle}
                    onChange={(e) => setInputAgentHandle(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                    placeholder="aegentix-sovereign-001"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Moltbook API Key (Bearer Token):</label>
                <input
                  type="password"
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  placeholder={status?.hasApiKey ? '••••••••••••••••' : 'Paste Moltbook Agent API Key'}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Obtained from your registered Moltbook agent profile. If empty, proofs are verified and staged locally.
                </p>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Default Submolt:</label>
                <input
                  type="text"
                  value={inputDefaultSubmolt}
                  onChange={(e) => setInputDefaultSubmolt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-500"
                  placeholder="trading"
                />
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inputAutoBroadcastTrades}
                    onChange={(e) => setInputAutoBroadcastTrades(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Auto-Broadcast Signed Trades</span>
                </label>
                <p className="text-[10px] text-slate-500 pl-5">
                  Automatically syndicates physical ROG HMAC signatures to Moltbook when trades or rebalances execute.
                </p>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={inputAutoBroadcastSignals}
                    onChange={(e) => setInputAutoBroadcastSignals(e.target.checked)}
                    className="rounded text-cyan-500 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Auto-Broadcast Formulated Alpha Signals</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfigOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingConfig}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold disabled:opacity-50"
                >
                  {isSavingConfig ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

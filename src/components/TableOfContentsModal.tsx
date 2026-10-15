import React, { useState, useMemo } from 'react';
import {
  X,
  Search,
  BookOpen,
  Activity,
  Cpu,
  Boxes,
  Gamepad2,
  Crosshair,
  Atom,
  ShieldAlert,
  Brain,
  Sliders,
  Trophy,
  BarChart3,
  Radio,
  Music,
  Network,
  Bot,
  HardDrive,
  Mail,
  Scale,
  Globe,
  Share2,
  Folder,
  Landmark,
  Plane,
  Coins,
  TrendingUp,
  HeartPulse,
  Award,
  Flag,
  Github,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Rocket,
  Monitor,
  Building2,
  Sparkles
} from 'lucide-react';

export interface TocItem {
  id: string;
  name: string;
  category: 'Core & Spatial' | 'Autonomous AI' | 'Trading & DEX' | 'Federal & Gov' | 'Security & Risk' | 'Workspace & Comms';
  badge: string;
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const SYSTEM_TOC_ITEMS: TocItem[] = [
  // Core & Spatial
  {
    id: 'LIVE_TELEMETRY',
    name: 'Live NAV & Telemetry Nav Suite',
    category: 'Core & Spatial',
    badge: 'Real-Time SSE',
    badgeColor: 'cyan',
    icon: Activity,
    description: 'High-frequency live net asset value (NAV) visualizer, multi-asset time series, and volatility streaming.',
  },
  {
    id: 'AEGENTIS_OS',
    name: 'AEGENTIS-X Sovereign OS Suite',
    category: 'Core & Spatial',
    badge: '5-Layer AXL',
    badgeColor: 'indigo',
    icon: Cpu,
    description: '5-Layer architecture kernel with Autonomous Execution Language (AXL) IDE, state inspection, and runtime trace.',
  },
  {
    id: 'ROG_CREATOR_SYSTEM',
    name: 'ROG Ally X Creator Compatibility (CCA)',
    category: 'Core & Spatial',
    badge: 'Handheld Optimized',
    badgeColor: 'rose',
    icon: Gamepad2,
    description: 'Hardware handheld telemetry bridge, dual back paddle keymaps, 24GB LPDDR5X memory telemetry, and ROG creator canvas.',
  },
  {
    id: 'HALO_CE_VISOR',
    name: 'Halo CE Visor HUD / FPV Radar',
    category: 'Core & Spatial',
    badge: 'HUD & 360° Vision',
    badgeColor: 'emerald',
    icon: Crosshair,
    description: 'First-person tactical radar visor, shield harmonics tracking, target reticle lock, and spatial sector telemetry.',
  },
  {
    id: 'CYBERNETICS',
    name: 'Cybernetic Core & Memory Engine',
    category: 'Core & Spatial',
    badge: 'Autonomous Watchdog',
    badgeColor: 'violet',
    icon: Atom,
    description: 'Distributed memory deduplication, hygiene watchdog, event logging, and cybernetic feedback loops.',
  },
  {
    id: 'DEVICE_SANDBOX_MAPPING',
    name: 'AI Studio Desktop & Device Sandbox Mapping',
    category: 'Core & Spatial',
    badge: 'Sandbox Mapped',
    badgeColor: 'cyan',
    icon: Monitor,
    description: 'Bi-directional mapping between AI Studio cloud container sandbox (/app/applet) and physical desktop/device with CLI daemon and mount points.',
  },

  // Autonomous AI
  {
    id: 'HERDR',
    name: 'Herdr Cluster Decentralized Compute',
    category: 'Autonomous AI',
    badge: 'mTLS Swarm Mesh',
    badgeColor: 'emerald',
    icon: Boxes,
    description: 'Decentralized peer-to-peer compute worker pool, distributed matrix solver, and dynamic worker allocation.',
  },
  {
    id: 'OODA_LOOP',
    name: 'Autonomous OODA Cycle Suite',
    category: 'Autonomous AI',
    badge: 'Sense-Decide-Act',
    badgeColor: 'amber',
    icon: Brain,
    description: 'Full autonomous loop telemetry: Scrape & Observe, Orient & Analyze, Decide & Verify, and Execute & Log.',
  },
  {
    id: 'AGENT_MESH',
    name: 'P2P Bilateral Agent Mesh',
    category: 'Autonomous AI',
    badge: 'Topology Visualizer',
    badgeColor: 'cyan',
    icon: Network,
    description: 'Interactive peer-to-peer node graph, bilateral mTLS handshake monitor, and real-time inter-agent messaging.',
  },
  {
    id: 'AGENTS_OF_CHAOS',
    name: 'Agents of Chaos MoE Swarm',
    category: 'Autonomous AI',
    badge: 'Stress & Chaos Testing',
    badgeColor: 'red',
    icon: Bot,
    description: 'Mixture of Experts (MoE) adversary swarm running automated fuzzing, fault-injection drills, and stress scenarios.',
  },
  {
    id: 'SYMPHONY',
    name: 'Symphony Cyber DAW & Sonification',
    category: 'Autonomous AI',
    badge: 'Harmonic Telemetry',
    badgeColor: 'purple',
    icon: Music,
    description: 'Real-time telemetry audio synthesizer, 8-track Web Audio sequencer, and harmonic volatility sonification.',
  },
  {
    id: 'RESEARCHER',
    name: 'Gemini Multi-Agent Market Intelligence',
    category: 'Autonomous AI',
    badge: 'Qualitative Alpha',
    badgeColor: 'blue',
    icon: Sliders,
    description: 'Gemini 3.8 / 3.1 Flash market narrative analysis, sentiment triage, and autonomous thesis generation.',
  },
  {
    id: 'META_COGNITIVE',
    name: 'Meta-Cognitive Reflexive Engine',
    category: 'Autonomous AI',
    badge: 'Meta Level 2',
    badgeColor: 'cyan',
    icon: Brain,
    description: 'Recursive self-inspection, epistemic confidence calibration, bias dampening, and sovereign metadata manifest.',
  },
  {
    id: 'SPACE_BUNNY_ALPHA',
    name: 'Space Bunny Alpha Stealth Model',
    category: 'Autonomous AI',
    badge: '1M Context Stealth',
    badgeColor: 'purple',
    icon: Rocket,
    description: 'Anonymous stealth AI model with 1,000,000 token context window, adjustable reasoning effort, self-verification, and Solana/EVM stealth arbitrage.',
  },
  {
    id: 'NEXUS_REGISTRY',
    name: 'Nexus Skill Registry & NRCP Engine',
    category: 'Autonomous AI',
    badge: '2,710+ Skills',
    badgeColor: 'indigo',
    icon: Sparkles,
    description: 'Autonomous skill pack discovery, NRCP command protocol, and dynamic agent ingestion engine for Aegentix, Grok, and Claude.',
  },

  // Trading & DEX
  {
    id: 'PORTFOLIO_GROWTH_PLAN',
    name: 'Portfolio Growth Chart Plan & Sovereign Credentials',
    category: 'Trading & DEX',
    badge: 'Growth Plan + Credentials',
    badgeColor: 'cyan',
    icon: TrendingUp,
    description: 'Deterministic compounding growth model, milestone roadmap, and authorized credentials across all exchanges and CyberGym testbeds.',
  },
  {
    id: 'TOP_SIGNALS',
    name: 'Top Alpha Signals Leaderboard',
    category: 'Trading & DEX',
    badge: 'Ranked Opportunities',
    badgeColor: 'amber',
    icon: Trophy,
    description: 'Curated high-confidence arbitrage and delta-neutral trading opportunities scored by return vs. risk profile.',
  },
  {
    id: 'PINNACLE_DERIVATIVES',
    name: 'Pinnacle Derivatives // Public Gateway',
    category: 'Trading & DEX',
    badge: 'Public B2B & Institutional',
    badgeColor: 'amber',
    icon: Building2,
    description: 'Public-facing corporate entity of Aegentix. Custom tailored business models, prospective revenue growth charts, Grade AAA delta-neutral signals, strict US-Federal compliance, and zero-trafficking certification.',
  },
  {
    id: 'TRADING_COMMAND',
    name: 'Institutional Trading Desk',
    category: 'Trading & DEX',
    badge: 'Multi-Venue Execution',
    badgeColor: 'emerald',
    icon: TrendingUp,
    description: 'Institutional order router, real-time depth book visualizer, TWAP/VWAP execution, and exchange API gateways.',
  },
  {
    id: 'AUTOHEDGE',
    name: 'AutoHedge Swarm Delta-Neutral Desk',
    category: 'Trading & DEX',
    badge: 'Delta-Neutral Yield',
    badgeColor: 'teal',
    icon: BarChart3,
    description: 'Automated dual-exchange funding rate arbitrage between Binance/Coinbase and dYdX/Hyperliquid.',
  },
  {
    id: 'OMNICYBERDEX',
    name: 'OmniCyber DEX Multi-Chain Aggregator',
    category: 'Trading & DEX',
    badge: 'Cross-Chain Swaps',
    badgeColor: 'sky',
    icon: Coins,
    description: 'Cross-chain decentralized liquidity routing across Ethereum, Arbitrum, Solana, and Base with zero-slippage routes.',
  },
  {
    id: 'LEDGER',
    name: 'Double-Entry Sovereign Ledger',
    category: 'Trading & DEX',
    badge: 'Audited & Immutable',
    badgeColor: 'slate',
    icon: Share2,
    description: 'Double-entry accounting transaction records, Mantis engine verification, and complete cryptographic proofs.',
  },
  {
    id: 'ALL_FEEDS',
    name: 'Autonomous Signals Live Feed',
    category: 'Trading & DEX',
    badge: 'Continuous Firehose',
    badgeColor: 'indigo',
    icon: Radio,
    description: 'Unfiltered high-velocity stream of all algorithmic signals, trigger conditions, and execution attestations.',
  },

  // Federal & Gov
  {
    id: 'GOV_OPPORTUNITIES',
    name: 'Federal Compliance & SAM.gov Suite',
    category: 'Federal & Gov',
    badge: 'FedRAMP High ATO',
    badgeColor: 'blue',
    icon: Flag,
    description: 'Continuous audit of 1,164 NIST SP 800-53 Rev 5 controls, SAM UEI contract tracker, and CMMC 2.0 Level 3 posture.',
  },
  {
    id: 'DAG_FEDERAL_NODE_STATUS',
    name: 'DAG Federal Full Node Ledger',
    category: 'Federal & Gov',
    badge: 'Gov & Node Integrity',
    badgeColor: 'emerald',
    icon: Award,
    description: 'Directed Acyclic Graph node topology, federal block height monitor, consensus health, and latency matrix.',
  },
  {
    id: 'FEDERAL_CRYPTO',
    name: 'Federal Crypto Asset Registry & AML Gateway',
    category: 'Federal & Gov',
    badge: 'OCC / FinCEN Compliant',
    badgeColor: 'amber',
    icon: Landmark,
    description: 'Classified asset registry, OCC Letter 1176 parity verification, travel rule compliance, and custody tracking.',
  },
  {
    id: 'SOVEREIGN_COMMAND',
    name: 'Sovereign Executive Cockpit',
    category: 'Federal & Gov',
    badge: 'Commander Console',
    badgeColor: 'purple',
    icon: Layers,
    description: 'Executive authority console, global kill-switches, geopolitical risk dial, and multi-tier override controls.',
  },
  {
    id: 'FAA_SOV_LICENSE',
    name: 'FAA Sovereign Airspace Clearance & UAV Hub',
    category: 'Federal & Gov',
    badge: 'FAA-SOV Class-A',
    badgeColor: 'sky',
    icon: Plane,
    description: 'Autonomous airspace flight credentials, UAV corridor licensing, ADS-B telemetry stream, and mission sign-offs.',
  },
  {
    id: 'AGENTIC_AMERICA',
    name: 'Agentic America & CyberGym Drills',
    category: 'Federal & Gov',
    badge: 'National Readiness',
    badgeColor: 'red',
    icon: Flag,
    description: 'Digital sovereignty initiative, American technological independence roadmap, and CyberGym sparring drills.',
  },
  {
    id: 'CYBERGYM_PROGRESSION',
    name: 'CyberGym Agent Progression System',
    category: 'Federal & Gov',
    badge: '17 Achievements',
    badgeColor: 'amber',
    icon: Award,
    description: 'Measurable capabilities, evidence artifacts, unlockable behaviors, 8-role lineage graph, and 9-stage Gym verification pipeline for NSF research.',
  },

  // Security & Risk
  {
    id: 'AEGIS_CIPHER',
    name: 'Aegis-7 Post-Quantum Cipher Protocol',
    category: 'Security & Risk',
    badge: 'Kyber-1024 PQ',
    badgeColor: 'cyan',
    icon: ShieldAlert,
    description: 'Post-quantum key encapsulation, ChaCha20-Poly1305 authenticated symmetric encryption, and cipher key rotation.',
  },
  {
    id: 'ENDPOINT_SECURITY',
    name: 'Agent Zero-Trust Endpoint Security',
    category: 'Security & Risk',
    badge: 'FIPS 140-3 HW',
    badgeColor: 'red',
    icon: ShieldAlert,
    description: 'Kernel-level behavioral monitoring, enclave boundary enforcement, attestation checks, and anomaly lockdown.',
  },
  {
    id: 'RISK_DASHBOARD',
    name: 'Institutional Risk Management & Invariants',
    category: 'Security & Risk',
    badge: 'VaR & Stress Test',
    badgeColor: 'rose',
    icon: Scale,
    description: 'Value-at-Risk (VaR 99%), max drawdown guardrails, liquidity depth analysis, and autonomous capital circuit breakers.',
  },
  {
    id: 'HEATMAP',
    name: 'Regulatory Compliance Heatmap',
    category: 'Security & Risk',
    badge: 'Jurisdiction Risk Matrix',
    badgeColor: 'amber',
    icon: Scale,
    description: 'Live global matrix of SEC, CFTC, MiCA, and FATF regulatory postures categorized across all major trading assets.',
  },

  // Workspace & Comms
  {
    id: 'MOLTBOOK',
    name: 'Moltbook P2P Social Intelligence Hub',
    category: 'Workspace & Comms',
    badge: 'm/trading & m/crypto',
    badgeColor: 'indigo',
    icon: Globe,
    description: 'Autonomous agent social feed, community sentiment parsing, alpha dispatching, and agent reputation scoring.',
  },
  {
    id: 'GOOGLE_DRIVE',
    name: 'Google Drive Manifest Catalog & Evidence',
    category: 'Workspace & Comms',
    badge: '1P OAuth Aggregator',
    badgeColor: 'blue',
    icon: HardDrive,
    description: 'Audited cloud storage synchronization, compliance proof archiving, PDF report generation, and evidence locks.',
  },
  {
    id: 'GMAIL',
    name: 'Gmail FedRAMP Inbox Intelligence',
    category: 'Workspace & Comms',
    badge: 'OAuth Mail Enclave',
    badgeColor: 'red',
    icon: Mail,
    description: 'Secure inbox reader, autonomous email classification, regulatory alert parsing, and stakeholder notifications.',
  },
  {
    id: 'GITHUB_FORGE',
    name: 'Sovereign GitHub Forge & Monorepo Hub',
    category: 'Workspace & Comms',
    badge: '88 Repositories',
    badgeColor: 'slate',
    icon: Github,
    description: 'Ecosystem repository browser, submodule orchestrator, CI/CD pipeline triggers, and commit attestation signatures.',
  },
  {
    id: 'HEALTHCARE_NET',
    name: 'Sovereign Healthcare & HIPAA Enclave',
    category: 'Workspace & Comms',
    badge: 'HIPAA & BAA Certified',
    badgeColor: 'emerald',
    icon: HeartPulse,
    description: 'Decentralized patient medical data records, zero-knowledge health record exchange, and biometric verification.',
  },
  {
    id: 'USER_PROFILE_MAP',
    name: 'Eagle User Profile & Global Node Map',
    category: 'Workspace & Comms',
    badge: 'Geopolitical Topology',
    badgeColor: 'amber',
    icon: Folder,
    description: 'Interactive world map of active sovereign nodes, geopolitical risk regions, operator profiles, and authority level.',
  },
  {
    id: 'SOVEREIGN_PORTAL',
    name: 'Sovereign Escrow & Cross-Chain Gateway',
    category: 'Workspace & Comms',
    badge: 'Atomic Settlement',
    badgeColor: 'cyan',
    icon: ExternalLink,
    description: 'Multi-signature sovereign escrow gateway, time-locked atomic settlements, and fiat on/off-ramp liquidity rails.',
  },
  {
    id: 'KOLIBRI_PLATFORM',
    name: 'Kolibri Offline Platform & Sovereign Knowledge Hub',
    category: 'Workspace & Comms',
    badge: 'kolibri@0.18.0',
    badgeColor: 'emerald',
    icon: BookOpen,
    description: 'Open-source offline-first learning platform, decentralized educational channel repository, and air-gapped facility synchronization.',
  },
];

interface TableOfContentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tabId: any) => void;
}

export const TableOfContentsModal: React.FC<TableOfContentsModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    const cats = ['ALL'];
    SYSTEM_TOC_ITEMS.forEach((item) => {
      if (!cats.includes(item.category)) cats.push(item.category);
    });
    return cats;
  }, []);

  const filteredItems = useMemo(() => {
    return SYSTEM_TOC_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.badge.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-[#0B0F17] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0E131F]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
                  Table of Contents &middot; Sovereign System Index
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {SYSTEM_TOC_ITEMS.length} Subsystems
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Complete directory of all operational modules, analytical suites, and hardware bridges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#090D14] space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table of contents by title, description, or badge (e.g. 'OODA', 'ROG', 'FedRAMP', 'DEX', 'Mesh')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#0E131F] border border-slate-700/70 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-mono scrollbar-thin">
            {categories.map((cat) => {
              const count = cat === 'ALL' 
                ? SYSTEM_TOC_ITEMS.length 
                : SYSTEM_TOC_ITEMS.filter(i => i.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-md shrink-0 transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-cyan-500 text-black font-bold shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedCategory === cat ? 'bg-black/20 text-black font-bold' : 'bg-slate-900 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Directory Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 bg-[#080B10] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`group cursor-pointer p-3.5 rounded-lg border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-cyan-950/30 border-cyan-500/60 ring-1 ring-cyan-500/40 shadow-md shadow-cyan-500/10'
                      : 'bg-[#0E131F]/90 border-slate-800/80 hover:border-slate-600 hover:bg-[#121928]'
                  }`}
                >
                  <div>
                    {/* Top Row: Icon + Category + Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${
                          isActive 
                            ? 'bg-cyan-500/20 text-cyan-300' 
                            : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-700'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                          {item.category}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        item.badgeColor === 'cyan' ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' :
                        item.badgeColor === 'emerald' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                        item.badgeColor === 'indigo' ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30' :
                        item.badgeColor === 'amber' ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' :
                        item.badgeColor === 'red' || item.badgeColor === 'rose' ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' :
                        'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {item.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className={`text-sm font-bold tracking-tight mb-1.5 transition-colors ${
                      isActive ? 'text-cyan-300' : 'text-slate-100 group-hover:text-cyan-400'
                    }`}>
                      {item.name}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Action Row */}
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-500">
                      {isActive ? 'Current View' : 'Click to Navigate'}
                    </span>
                    <div className={`flex items-center gap-1 font-semibold ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-300'
                    }`}>
                      <span>Launch</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-12 text-center">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-mono text-slate-400">No subsystems match "{searchQuery}"</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
                className="mt-2 text-xs font-mono text-cyan-400 hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0E131F] flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AEGENTIX Sovereign Ecosystem &middot; 34 Active Systems Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
          >
            Close Index (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

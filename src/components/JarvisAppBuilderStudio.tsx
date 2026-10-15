import React, { useState, useEffect } from 'react';
import {
  Wand2,
  Layout,
  Plus,
  Trash2,
  Copy,
  Download,
  Eye,
  Code2,
  Sparkles,
  Layers,
  Sliders,
  DollarSign,
  HeartPulse,
  Building2,
  FileText,
  Play,
  CheckCircle2,
  MoveUp,
  MoveDown,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  ArrowRight,
  RefreshCw,
  Share2
} from 'lucide-react';

export type BlockType = 
  | 'HERO_BANNER'
  | 'METRIC_KPI'
  | 'CONTRACTOR_CARD'
  | 'ESCROW_STREAM'
  | 'CLAIMS_PROCESSOR'
  | 'PAYMENT_FORM'
  | 'TRANSACTION_TABLE'
  | 'COMPLIANCE_BADGE';

export interface AppBlock {
  id: string;
  type: BlockType;
  title: string;
  subtitle?: string;
  props: Record<string, any>;
}

const TEMPLATE_APPS: { id: string; name: string; description: string; blocks: AppBlock[] }[] = [
  {
    id: 'medical-recruiting',
    name: 'Nurse & Physician Fast-Pay Staffing',
    description: 'Instant contractor onboarding, HIPAA credential check, and sub-second stream draws.',
    blocks: [
      {
        id: 'block-1',
        type: 'HERO_BANNER',
        title: 'Mercy & Sovereign Healthcare Staffing Portal',
        subtitle: 'Decoupled HIPAA-compliant medical recruiter ledger. Zero Stripe. 100% FedNow & Fedwire.',
        props: { badge: 'TSL LEVEL 4 ENCLAVE', color: 'rose' }
      },
      {
        id: 'block-2',
        type: 'METRIC_KPI',
        title: 'Active Recruiter Liquidity Buffer',
        props: {
          metrics: [
            { label: 'Total Vault Escrow', value: '$62,500,000.00', change: '+100% Collateralized' },
            { label: 'Active Placements', value: '4 Placed', change: '100% Verified NPI' },
            { label: 'Stream Disbursed (24h)', value: '$12,450.00', change: 'FedNow Instant' }
          ]
        }
      },
      {
        id: 'block-3',
        type: 'ESCROW_STREAM',
        title: 'Live Contractor Stream Payroll',
        props: {
          contractorName: 'Sarah Jenkins, RN',
          role: 'ICU Charge Nurse',
          streamBalance: 3765.50,
          ratePerHour: 75.00,
          settlementRail: 'FedNow Instant'
        }
      },
      {
        id: 'block-4',
        type: 'CLAIMS_PROCESSOR',
        title: 'Automated Hospital Claims Batch Adjudication',
        props: {
          pendingClaims: 18,
          avgClaimValue: '$32.50',
          autoDisburse: true
        }
      }
    ]
  },
  {
    id: 'b2b-derivatives',
    name: 'Pinnacle Institutional B2B Gateway',
    description: 'Client-facing treasury, 25 industries benchmark, and structured yield simulator.',
    blocks: [
      {
        id: 'b2b-1',
        type: 'HERO_BANNER',
        title: 'Pinnacle Derivatives LLC // Enterprise Treasury',
        subtitle: 'Delta-neutral basis arbitrage & sovereign cash management. FinCEN Title 31 compliant.',
        props: { badge: 'GRADE AAA TREASURY', color: 'amber' }
      },
      {
        id: 'b2b-2',
        type: 'METRIC_KPI',
        title: 'Capital Reserves & Run-Rate',
        props: {
          metrics: [
            { label: 'Liquid Cash Buffer', value: '$2,500,000.00', change: 'US Bank NA' },
            { label: 'Target Blended Yield', value: '11.00% APR', change: 'Gold & T-Bills' },
            { label: 'Institutional Venues', value: '29 Exchanges', change: 'Zero Offshore' }
          ]
        }
      },
      {
        id: 'b2b-3',
        type: 'PAYMENT_FORM',
        title: 'Institutional Capital Injection & Allocation',
        props: {
          defaultAmount: 2500000,
          rails: ['Fedwire RTGS', 'FedNow Instant', 'Circle USDC Treasury']
        }
      }
    ]
  }
];

interface JarvisAppBuilderStudioProps {
  onNotify?: (msg: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
  onDeployApp?: (appName: string, blocks: AppBlock[]) => void;
}

export const JarvisAppBuilderStudio: React.FC<JarvisAppBuilderStudioProps> = ({
  onNotify,
  onDeployApp
}) => {
  const [appName, setAppName] = useState('My Custom Outward App');
  const [blocks, setBlocks] = useState<AppBlock[]>(TEMPLATE_APPS[0].blocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(blocks[0]?.id || null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'visual' | 'code'>('visual');
  
  // Jarvis AI Prompt Assistant State
  const [jarvisPrompt, setJarvisPrompt] = useState('');
  const [isJarvisGenerating, setIsJarvisGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Selected block
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Add a new block
  const handleAddBlock = (type: BlockType) => {
    const newId = `block-${Date.now().toString(36)}`;
    let newBlock: AppBlock;

    switch (type) {
      case 'HERO_BANNER':
        newBlock = {
          id: newId,
          type,
          title: 'New Executive Portal',
          subtitle: 'Secure institutional workflow portal backed by sovereign ledger verification.',
          props: { badge: 'FINCEN VERIFIED', color: 'indigo' }
        };
        break;
      case 'METRIC_KPI':
        newBlock = {
          id: newId,
          type,
          title: 'Financial Overview',
          props: {
            metrics: [
              { label: 'Active Vault Balance', value: '$100,000.00', change: '+5.2%' },
              { label: 'Contractors Enrolled', value: '12 Active', change: '100% Vetted' }
            ]
          }
        };
        break;
      case 'ESCROW_STREAM':
        newBlock = {
          id: newId,
          type,
          title: 'Contractor Streaming Payroll',
          props: {
            contractorName: 'Dr. Michael Chang, MD',
            role: 'Attending Surgeon',
            streamBalance: 8450.00,
            ratePerHour: 185.00,
            settlementRail: 'FedNow Instant'
          }
        };
        break;
      case 'CLAIMS_PROCESSOR':
        newBlock = {
          id: newId,
          type,
          title: 'Direct Claims Adjudication',
          props: {
            pendingClaims: 24,
            avgClaimValue: '$45.00',
            autoDisburse: true
          }
        };
        break;
      case 'PAYMENT_FORM':
        newBlock = {
          id: newId,
          type,
          title: 'Instant Draw / Escrow Transfer',
          props: {
            defaultAmount: 500,
            rails: ['FedNow Instant Clearing', 'Fedwire Funds Service']
          }
        };
        break;
      default:
        newBlock = {
          id: newId,
          type: 'COMPLIANCE_BADGE',
          title: 'Federal Regulatory Attestation',
          props: {
            complianceId: 'CERT-TSL-FIN-2026',
            status: '100% US-Regulated',
            covenant: 'Anti-Trafficking Verified (FIN-2020-A008)'
          }
        };
    }

    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newId);
    if (onNotify) onNotify(`Added ${type} component to canvas`, 'INFO');
  };

  // Move block up/down
  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    setBlocks(updated);
  };

  // Delete block
  const handleDeleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  };

  // Update block prop
  const handleUpdateBlockTitle = (title: string) => {
    if (!selectedBlockId) return;
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, title } : b));
  };

  const handleUpdateBlockSubtitle = (subtitle: string) => {
    if (!selectedBlockId) return;
    setBlocks(prev => prev.map(b => b.id === selectedBlockId ? { ...b, subtitle } : b));
  };

  // Jarvis AI Natural Language Assembly
  const handleJarvisGenerate = async () => {
    if (!jarvisPrompt.trim()) return;
    setIsJarvisGenerating(true);

    try {
      // Simulate/call AI generation for customized app blocks
      const promptLower = jarvisPrompt.toLowerCase();
      let newGeneratedBlocks: AppBlock[] = [];

      if (promptLower.includes('doctor') || promptLower.includes('hospital') || promptLower.includes('medical') || promptLower.includes('clinic')) {
        newGeneratedBlocks = [
          {
            id: `ai-${Date.now()}-1`,
            type: 'HERO_BANNER',
            title: 'Sovereign Clinical Intake & Provider Escrow',
            subtitle: 'Real-time HIPAA-compliant physician credentials and automated payroll disbursements.',
            props: { badge: 'NPI VERIFIED 100%', color: 'rose' }
          },
          {
            id: `ai-${Date.now()}-2`,
            type: 'METRIC_KPI',
            title: 'Clinic Liquidity & Staffing Telemetry',
            props: {
              metrics: [
                { label: 'On-Call Providers', value: '14 Active', change: 'All Verified' },
                { label: 'Escrow Bonded', value: '$450,000.00', change: 'TSL Level 4' },
                { label: 'Avg Payout Time', value: '0.4s', change: 'FedNow Clearing' }
              ]
            }
          },
          {
            id: `ai-${Date.now()}-3`,
            type: 'ESCROW_STREAM',
            title: 'Physician On-Demand Draw Console',
            props: {
              contractorName: 'Dr. Rebecca Vance, MD',
              role: 'Emergency Medicine',
              streamBalance: 5200.00,
              ratePerHour: 220.00,
              settlementRail: 'FedNow Instant'
            }
          }
        ];
      } else {
        newGeneratedBlocks = [
          {
            id: `ai-${Date.now()}-1`,
            type: 'HERO_BANNER',
            title: 'Pinnacle Commercial Treasury & Invoicing',
            subtitle: 'Sub-second B2B settlements with automated zero-direction basis capture.',
            props: { badge: 'SEC/CFTC TITLE 31', color: 'amber' }
          },
          {
            id: `ai-${Date.now()}-2`,
            type: 'PAYMENT_FORM',
            title: 'Treasury Wire & Escrow Allocation',
            props: {
              defaultAmount: 1000000,
              rails: ['Fedwire Funds RTGS', 'FedNow Instant']
            }
          }
        ];
      }

      setBlocks(newGeneratedBlocks);
      setSelectedBlockId(newGeneratedBlocks[0].id);
      setAppName(jarvisPrompt.slice(0, 40));
      if (onNotify) onNotify(`Jarvis generated new app layout for: "${jarvisPrompt}"`, 'SUCCESS');
      setJarvisPrompt('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsJarvisGenerating(false);
    }
  };

  // Generate clean React code snippet
  const generatedCode = `// Generated by Jarvis Studio // Aegentix Sovereign OS
import React, { useState } from 'react';

export function ${appName.replace(/[^a-zA-Z0-9]/g, '')}App() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 bg-slate-950 text-white min-h-screen">
      {/* App Header */}
      <div className="border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">${appName}</h1>
        <p className="text-sm text-slate-400">Institutional Sovereign Application &middot; 100% US-Regulated Rails</p>
      </div>

      {/* Dynamic Blocks */}
${blocks.map(b => `      {/* ${b.type}: ${b.title} */}
      <section className="p-5 rounded-xl bg-slate-900 border border-slate-800">
        <h2 className="text-lg font-bold">${b.title}</h2>
        ${b.subtitle ? `<p className="text-xs text-slate-400">${b.subtitle}</p>` : ''}
      </section>`).join('\n\n')}
    </div>
  );
}`;

  return (
    <div className="space-y-5 text-slate-100">
      {/* STUDIO TOOLBAR */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white uppercase tracking-wider">Jarvis App Studio</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Visual Workflow Builder
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Visually assemble, customize, and deploy outward-facing business apps with real escrow &amp; streaming payroll bindings.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Viewport Width Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewportMode('desktop')}
              className={`p-1.5 rounded-lg transition-all ${viewportMode === 'desktop' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('tablet')}
              className={`p-1.5 rounded-lg transition-all ${viewportMode === 'tablet' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1.5 rounded-lg transition-all ${viewportMode === 'mobile' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'}`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Visual vs Code Mode */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'visual' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${viewMode === 'code' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>React Code</span>
            </button>
          </div>

          {/* Export Code Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(generatedCode);
              if (onNotify) onNotify('React component code copied to clipboard!', 'SUCCESS');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Code</span>
          </button>

          {/* Save / Deploy App */}
          <button
            onClick={() => {
              if (onDeployApp) onDeployApp(appName, blocks);
              if (onNotify) onNotify(`"${appName}" deployed to Portal Navigation!`, 'SUCCESS');
              setSavedSuccess(true);
              setTimeout(() => setSavedSuccess(false), 3000);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savedSuccess ? 'Deployed!' : 'Deploy to Live Portal'}</span>
          </button>
        </div>
      </div>

      {/* JARVIS AI NATURAL LANGUAGE CO-PILOT PROMPT BAR */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 shrink-0">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Jarvis Prompt Builder:</span>
        </div>
        <div className="flex-1 w-full flex items-center gap-2">
          <input
            type="text"
            value={jarvisPrompt}
            onChange={(e) => setJarvisPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleJarvisGenerate();
            }}
            placeholder="e.g. Build an executive emergency clinic portal with NPI credential checks and instant draw streams..."
            className="flex-1 px-3 py-1.5 bg-slate-950/90 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
          <button
            onClick={handleJarvisGenerate}
            disabled={isJarvisGenerating || !jarvisPrompt.trim()}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shrink-0 disabled:opacity-40 flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            {isJarvisGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Assembling...</span>
              </>
            ) : (
              <>
                <span>Generate</span>
                <ArrowRight className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* TEMPLATE PICKER */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-thin">
        <span className="text-slate-500 font-bold uppercase text-[10px] shrink-0">Preset Templates:</span>
        {TEMPLATE_APPS.map(tmpl => (
          <button
            key={tmpl.id}
            onClick={() => {
              setAppName(tmpl.name);
              setBlocks(tmpl.blocks);
              setSelectedBlockId(tmpl.blocks[0].id);
              if (onNotify) onNotify(`Loaded template: ${tmpl.name}`, 'INFO');
            }}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold shrink-0 transition-colors cursor-pointer"
          >
            {tmpl.name}
          </button>
        ))}
      </div>

      {/* MAIN STUDIO WORKSPACE: 3 COLUMNS (PALETTE - CANVAS - ATTRIBUTES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: COMPONENT PALETTE (3 COLS) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Component Palette</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Click any block to insert it into your active app screen.
            </p>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleAddBlock('HERO_BANNER')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🏛️</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Executive Hero Banner</div>
                    <div className="text-[10px] text-slate-500">Corporate branding &amp; trust badge</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleAddBlock('METRIC_KPI')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">📊</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Metric KPI Cards</div>
                    <div className="text-[10px] text-slate-500">Vault reserves &amp; run-rate stats</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleAddBlock('ESCROW_STREAM')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">💸</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Live Escrow Stream Payroll</div>
                    <div className="text-[10px] text-slate-500">Sub-second stream draw balance</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleAddBlock('CLAIMS_PROCESSOR')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">📑</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Hospital Claims Adjudication</div>
                    <div className="text-[10px] text-slate-500">Automatic settlement batcher</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleAddBlock('PAYMENT_FORM')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">💳</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">FedNow / Fedwire Transfer</div>
                    <div className="text-[10px] text-slate-500">Instant treasury draw inputs</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>

              <button
                onClick={() => handleAddBlock('COMPLIANCE_BADGE')}
                className="w-full p-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-left transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">🛡️</span>
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Regulatory Compliance Attestation</div>
                    <div className="text-[10px] text-slate-500">Signed covenant &amp; audit stamp</div>
                  </div>
                </div>
                <Plus className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </button>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: LIVE INTERACTIVE CANVAS (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="font-bold text-white flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-400" />
              <span>Canvas &middot; {blocks.length} Components</span>
            </span>
            <div className="flex items-center gap-2 text-slate-400">
              <span>Width: {viewportMode === 'desktop' ? '100%' : viewportMode === 'tablet' ? '768px' : '390px'}</span>
            </div>
          </div>

          {viewMode === 'visual' ? (
            <div
              className={`mx-auto transition-all duration-300 space-y-4 p-4 rounded-2xl bg-[#080B10] border border-slate-800 shadow-2xl min-h-[500px] ${
                viewportMode === 'tablet'
                  ? 'max-w-[768px]'
                  : viewportMode === 'mobile'
                  ? 'max-w-[390px]'
                  : 'w-full'
              }`}
            >
              {blocks.length === 0 ? (
                <div className="text-center py-20 text-slate-500 space-y-3">
                  <Layout className="w-10 h-10 mx-auto opacity-40" />
                  <p className="text-sm">Canvas is empty. Add a component from the left palette or use Jarvis prompt above.</p>
                </div>
              ) : (
                blocks.map((block, idx) => {
                  const isSelected = block.id === selectedBlockId;
                  return (
                    <div
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      className={`relative group rounded-xl transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-cyan-400 ring-2 ring-cyan-500/20 shadow-lg'
                          : 'border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* Component Selector Toolbar Overlay on Hover */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-slate-900/90 p-1 rounded-lg border border-slate-700">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveBlock(idx, 'up');
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveBlock(idx, 'down');
                          }}
                          disabled={idx === blocks.length - 1}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteBlock(block.id);
                          }}
                          className="p-1 rounded hover:bg-rose-500/20 text-rose-400"
                          title="Delete Component"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      {/* RENDER LIVE BLOCK CONTENT */}
                      <div className="p-4 bg-slate-900/80 rounded-xl space-y-3">
                        {/* HERO BANNER */}
                        {block.type === 'HERO_BANNER' && (
                          <div className="space-y-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                              {block.props.badge || 'SOVEREIGN SYSTEM'}
                            </span>
                            <h2 className="text-xl font-extrabold text-white">{block.title}</h2>
                            {block.subtitle && <p className="text-xs text-slate-300">{block.subtitle}</p>}
                          </div>
                        )}

                        {/* METRIC KPI */}
                        {block.type === 'METRIC_KPI' && (
                          <div className="space-y-3">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{block.title}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {(block.props.metrics || []).map((m: any, i: number) => (
                                <div key={i} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                                  <div className="text-[10px] text-slate-500 uppercase">{m.label}</div>
                                  <div className="text-base font-extrabold text-white mt-0.5">{m.value}</div>
                                  <div className="text-[10px] text-emerald-400">{m.change}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* ESCROW STREAM */}
                        {block.type === 'ESCROW_STREAM' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-sm font-bold text-white">{block.title}</h3>
                                <p className="text-xs text-slate-400">{block.props.contractorName} &middot; {block.props.role}</p>
                              </div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                {block.props.settlementRail || 'FedNow Instant'}
                              </span>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                              <div>
                                <div className="text-[10px] text-slate-400 uppercase">Streamable Balance Available</div>
                                <div className="text-xl font-extrabold text-emerald-400">
                                  ${Number(block.props.streamBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNotify) onNotify(`Instant draw executed on ${block.props.contractorName}!`, 'SUCCESS');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
                              >
                                Instant Draw
                              </button>
                            </div>
                          </div>
                        )}

                        {/* CLAIMS PROCESSOR */}
                        {block.type === 'CLAIMS_PROCESSOR' && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-bold text-white">{block.title}</h3>
                              <span className="text-xs text-slate-400">{block.props.pendingClaims} Queued Claims</span>
                            </div>
                            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                              <span className="text-xs text-slate-300">Avg Value: {block.props.avgClaimValue} / claim</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onNotify) onNotify('Adjudicated 10 hospital claims batch!', 'SUCCESS');
                                }}
                                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold"
                              >
                                Adjudicate Batch
                              </button>
                            </div>
                          </div>
                        )}

                        {/* PAYMENT FORM */}
                        {block.type === 'PAYMENT_FORM' && (
                          <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white">{block.title}</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] text-slate-400 uppercase">Amount (USD)</label>
                                <input
                                  type="text"
                                  defaultValue={`$${Number(block.props.defaultAmount || 1000).toLocaleString()}`}
                                  className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-slate-400 uppercase">Rail</label>
                                <select
                                  className="w-full mt-1 px-2 py-1.5 bg-slate-950 border border-slate-700 rounded text-xs text-white"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {(block.props.rails || ['FedNow Instant']).map((r: string) => (
                                    <option key={r} value={r}>{r}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* COMPLIANCE BADGE */}
                        {block.type === 'COMPLIANCE_BADGE' && (
                          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <div>
                                <div className="font-bold text-white">{block.title}</div>
                                <div className="text-[10px] text-slate-400">{block.props.covenant}</div>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              {block.props.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[600px]">
              <pre>{generatedCode}</pre>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: ATTRIBUTE INSPECTOR & PROPERTY EDITOR (3 COLS) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Block Inspector</span>
            </h3>

            {selectedBlock ? (
              <div className="space-y-3 font-sans">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Block Type</label>
                  <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">{selectedBlock.type}</div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase">Component Title</label>
                  <input
                    type="text"
                    value={selectedBlock.title}
                    onChange={(e) => handleUpdateBlockTitle(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {selectedBlock.subtitle !== undefined && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase">Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={selectedBlock.subtitle || ''}
                      onChange={(e) => handleUpdateBlockSubtitle(e.target.value)}
                      className="w-full mt-1 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase mb-2">Internal Attributes</div>
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                    {Object.entries(selectedBlock.props).map(([k, v]) => (
                      <div key={k} className="flex justify-between truncate">
                        <span className="text-slate-500">{k}:</span>
                        <span className="text-cyan-400 font-bold truncate ml-2">
                          {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteBlock(selectedBlock.id)}
                  className="w-full py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Component</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs">
                Select any block on the canvas to inspect and edit properties.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

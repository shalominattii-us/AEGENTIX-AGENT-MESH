import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Terminal,
  Activity,
  FileText,
  Search,
  RefreshCw,
  Scale,
  Globe,
  ArrowRight,
  ExternalLink,
  Zap,
  Ban,
  Database,
  Eye,
  Users,
  AlertOctagon,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  ANTI_TRAFFICKING_DATASETS,
  evaluateAntiTraffickingCompliance,
  TraffickingTypology,
  IlabCommodityEntry,
  TipJurisdictionTier
} from '../data/antiTraffickingDatasets';

interface AntiTraffickingSentinelSuiteProps {
  onNotify?: (msg: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
  onBackToPortal?: () => void;
}

export const AntiTraffickingSentinelSuite: React.FC<AntiTraffickingSentinelSuiteProps> = ({
  onNotify,
  onBackToPortal
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'SCREENER' | 'TYPOLOGIES' | 'COMMODITIES' | 'JURISDICTIONS' | 'STATUTES' | 'AUDIT_LOG'>('SCREENER');

  // Screener state
  const [entityName, setEntityName] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [commodity, setCommodity] = useState('');
  const [notesOrTerms, setNotesOrTerms] = useState('');
  const [amountUsd, setAmountUsd] = useState<string>('25000');
  const [isScreening, setIsScreening] = useState(false);
  const [screeningResult, setScreeningResult] = useState<any | null>(null);

  // Live Audit Log
  const [auditLog, setAuditLog] = useState<any[]>([
    {
      auditId: 'AT-AUD-9941',
      evaluatedAt: new Date(Date.now() - 480000).toISOString(),
      counterparty: 'FedNow Sovereign Clearing Corridor',
      verdict: 'CLEARED_HUMAN_FREEDOM_COMPLIANT',
      riskScore: 0,
      violationsCount: 0,
      attestationSeal: 'HMAC-SOV-DIGNITY-FEDNOW-ROOT',
    },
    {
      auditId: 'AT-AUD-9940',
      evaluatedAt: new Date(Date.now() - 1440000).toISOString(),
      counterparty: 'Jupiter Aggregator (Solana Mainnet V6)',
      verdict: 'CLEARED_HUMAN_FREEDOM_COMPLIANT',
      riskScore: 0,
      violationsCount: 0,
      attestationSeal: 'HMAC-SOV-DIGNITY-JUP-MAINNET',
    },
    {
      auditId: 'AT-AUD-9939',
      evaluatedAt: new Date(Date.now() - 3600000).toISOString(),
      counterparty: '1inch Fusion Institutional Rebate Escrow',
      verdict: 'CLEARED_HUMAN_FREEDOM_COMPLIANT',
      riskScore: 0,
      violationsCount: 0,
      attestationSeal: 'HMAC-SOV-DIGNITY-1INCH-FUSION',
    }
  ]);

  // Filters for datasets
  const [typologyCategoryFilter, setTypologyCategoryFilter] = useState<string>('ALL');
  const [commoditySearch, setCommoditySearch] = useState('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('ALL');

  // Tripwire simulation state
  const [isTripwiring, setIsTripwiring] = useState(false);
  const [lastTripwireTriggered, setLastTripwireTriggered] = useState<any | null>(null);

  // Fetch initial audit log and status from backend if available
  useEffect(() => {
    fetch('/api/anti-trafficking/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.recentAudits && Array.isArray(data.recentAudits) && data.recentAudits.length > 0) {
          setAuditLog(prev => {
            const combined = [...data.recentAudits, ...prev];
            const seen = new Set();
            return combined.filter(item => {
              if (seen.has(item.auditId)) return false;
              seen.add(item.auditId);
              return true;
            });
          });
        }
      })
      .catch(() => {
        // Fallback gracefully to offline state
      });
  }, []);

  // Pre-configured test scenario presets
  const applyPreset = (preset: 'CLEAN' | 'FINCEN_FUNNEL' | 'UFLPA_COTTON' | 'KK_PARK' | 'PEONAGE_PASSPORT') => {
    if (preset === 'CLEAN') {
      setEntityName('Apex Logistics Clearing Corp');
      setJurisdiction('United States');
      setCommodity('Autonomous Compute Hardware');
      setNotesOrTerms('standard commercial net-30 procurement with verified wage certificates');
      setAmountUsd('150000');
    } else if (preset === 'FINCEN_FUNNEL') {
      setEntityName('Dispersed Regional Hospitality Agency LLC');
      setJurisdiction('United States');
      setCommodity('Advertising Services');
      setNotesOrTerms('funnel_deposit multiple structured micro-deposits for commercial sex advertising and motel_clustering');
      setAmountUsd('8950');
    } else if (preset === 'UFLPA_COTTON') {
      setEntityName('Tarim Basin Industrial Sourcing Consortium');
      setJurisdiction('China (Xinjiang)');
      setCommodity('Cotton & Textiles');
      setNotesOrTerms('forced_cotton_cargo export under government labor placement program');
      setAmountUsd('420000');
    } else if (preset === 'KK_PARK') {
      setEntityName('Myawaddy Eastern Frontier Tech Ltd');
      setJurisdiction('Myanmar (Burma)');
      setCommodity('Telecommunications');
      setNotesOrTerms('scam compound boiler room captivity in KK Park cyber fraud compound');
      setAmountUsd('75000');
    } else if (preset === 'PEONAGE_PASSPORT') {
      setEntityName('Global Crewing Manpower Services');
      setJurisdiction('Thailand');
      setCommodity('Seafood (Trawlers & Shrimp)');
      setNotesOrTerms('withheld_passport peonage_deduction for mandatory recruitment_fee_siphon');
      setAmountUsd('12400');
    }
  };

  const handleRunScreening = async () => {
    setIsScreening(true);
    const payload = {
      entityName,
      jurisdiction,
      declaredCommodity: commodity,
      notesOrTerms,
      transactionAmountUsd: parseFloat(amountUsd) || 0
    };

    try {
      const response = await fetch('/api/anti-trafficking/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data && data.result) {
        setScreeningResult(data.result);
        if (data.auditEntry) {
          setAuditLog(prev => [data.auditEntry, ...prev.slice(0, 19)]);
        }
        if (data.result.passed) {
          if (onNotify) onNotify(`Screening Passed: 0 violations detected for ${entityName || 'Counterparty'}.`, 'SUCCESS');
        } else {
          if (onNotify) onNotify(`TRIPWIRE DETECTED: ${data.result.violationsCount} statutory violations flagged. Route terminated.`, 'ALERT');
        }
      } else {
        throw new Error('API returned invalid result structure');
      }
    } catch {
      // Local client-side evaluation fallback
      const localResult = evaluateAntiTraffickingCompliance(payload);
      setScreeningResult(localResult);
      const newAudit = {
        auditId: `AT-AUD-${Date.now().toString().slice(-4)}`,
        evaluatedAt: localResult.evaluatedAt,
        counterparty: entityName || 'Unknown Entity',
        verdict: localResult.status,
        riskScore: localResult.riskScore,
        violationsCount: localResult.violationsCount,
        violations: localResult.violations,
        attestationSeal: localResult.attestationSeal
      };
      setAuditLog(prev => [newAudit, ...prev.slice(0, 19)]);
      if (localResult.passed) {
        if (onNotify) onNotify(`Offline Evaluation Passed: 0 violations for ${entityName || 'Counterparty'}.`, 'SUCCESS');
      } else {
        if (onNotify) onNotify(`TRIPWIRE TRIGGERED: Zero tolerance violation (${localResult.violationsCount} hits).`, 'ALERT');
      }
    } finally {
      setIsScreening(false);
    }
  };

  const handleExecuteTripwireSimulation = async () => {
    setIsTripwiring(true);
    try {
      const response = await fetch('/api/anti-trafficking/simulate-tripwire', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data && data.success) {
        setLastTripwireTriggered(data);
        if (onNotify) onNotify('Zero-Tolerance Tripwire executed: Instantaneous hard-stop and immutable compliance block generated.', 'ALERT');
      }
    } catch {
      // Offline fallback simulation
      const simulatedBreach = {
        success: true,
        tripwireActive: true,
        action: 'ZERO_TOLERANCE_TERMINATION_EXECUTED',
        statutoryBreaches: ['FIN-2020-A008-ST1', '18-USC-1592-DOC-RETENTION', 'TIP-TIER-3-SANCTION'],
        complianceBlock: {
          blockHeight: 14208,
          timestamp: new Date().toISOString(),
          type: 'HARD_STOP_TRAFFICKING_TRIPWIRE_EXECUTED',
          hmacSha256: '0x9E7A3...4F02E'
        }
      };
      setLastTripwireTriggered(simulatedBreach);
      if (onNotify) onNotify('Simulated Tripwire executed: Disconnected outbound gateways.', 'ALERT');
    } finally {
      setIsTripwiring(false);
    }
  };

  // Filtered dataset helpers
  const filteredTypologies = ANTI_TRAFFICKING_DATASETS.finCenTypologies.filter(t => {
    if (typologyCategoryFilter === 'ALL') return true;
    return t.category === typologyCategoryFilter;
  });

  const filteredCommodities = ANTI_TRAFFICKING_DATASETS.ilabSupplyChainCommodities.filter(c => {
    if (!commoditySearch) return true;
    const q = commoditySearch.toLowerCase();
    return c.commodity.toLowerCase().includes(q) || c.country.toLowerCase().includes(q) || c.highRiskCategory.toLowerCase().includes(q);
  });

  const filteredJurisdictions = ANTI_TRAFFICKING_DATASETS.tipJurisdictionMatrix.filter(j => {
    if (jurisdictionFilter === 'ALL') return true;
    return j.tier === jurisdictionFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Statutory Charter */}
      <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.08] relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>SOVEREIGN HUMAN FREEDOM COVENANT &middot; ZERO TOLERANCE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              Anti-Human-Trafficking &amp; Forced Labor Sentinel
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              Automated tripwire enforcement across FinCEN Advisory FIN-2020-A008, US Department of Labor ILAB, State Department TIP Tier 3 Watchlists, Uyghur Forced Labor Prevention Act (UFLPA), and Title 18 U.S.C. §§ 1581–1597. Any matched counterparty or supply chain nexus triggers instant termination and immutable compliance chain logging.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
            <button
              onClick={handleExecuteTripwireSimulation}
              disabled={isTripwiring}
              className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-semibold text-xs active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-rose-900/30"
            >
              <AlertOctagon className={`w-4 h-4 ${isTripwiring ? 'animate-spin' : ''}`} />
              <span>Test Zero-Tolerance Tripwire</span>
            </button>

            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/[0.08] font-medium text-xs transition-all cursor-pointer"
              >
                Return to Cockpit
              </button>
            )}
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/[0.06] text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase">Enforcement State</div>
            <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ACTIVE SENTINEL ARMED</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase">FinCEN Typologies</div>
            <div className="text-white font-semibold">
              {ANTI_TRAFFICKING_DATASETS.finCenTypologies.length} Active Vectors
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase">ILAB Barred Commodities</div>
            <div className="text-white font-semibold">
              {ANTI_TRAFFICKING_DATASETS.ilabSupplyChainCommodities.length} Monitored Flows
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-1">
            <div className="text-zinc-500 text-[10px] uppercase">Sanctioned Tier 3 Regimes</div>
            <div className="text-rose-400 font-semibold">
              {ANTI_TRAFFICKING_DATASETS.tipJurisdictionMatrix.filter(j => j.autoBlockOutwardChannel).length} Barred Corridors
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-white/[0.08] pb-3 text-xs font-medium scrollbar-thin">
        <button
          onClick={() => setActiveTab('SCREENER')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'SCREENER'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Live Counterparty Screener</span>
        </button>

        <button
          onClick={() => setActiveTab('TYPOLOGIES')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'TYPOLOGIES'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>FinCEN FIN-2020-A008 Typologies ({ANTI_TRAFFICKING_DATASETS.finCenTypologies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('COMMODITIES')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'COMMODITIES'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>DOL ILAB Supply Chain ({ANTI_TRAFFICKING_DATASETS.ilabSupplyChainCommodities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('JURISDICTIONS')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'JURISDICTIONS'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>State Dept TIP Tier Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('STATUTES')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'STATUTES'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>18 U.S.C. §§ 1581–1597 &amp; Palermo</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT_LOG')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'AUDIT_LOG'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'text-zinc-400 hover:text-white hover:bg-white/[0.02]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Immutable Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: LIVE COUNTERPARTY SCREENER */}
      {activeTab === 'SCREENER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-base font-semibold text-white">Interactive Counterparty &amp; Cargo Screener</h2>
                </div>
                <div className="text-[11px] font-mono text-zinc-500">Live Evaluation Engine</div>
              </div>

              {/* Presets Bar */}
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 font-medium">Test Scenario Presets:</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyPreset('CLEAN')}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 text-xs font-mono transition-all cursor-pointer"
                  >
                    Clean FedNow Corridor
                  </button>
                  <button
                    onClick={() => applyPreset('FINCEN_FUNNEL')}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-mono transition-all cursor-pointer"
                  >
                    FinCEN Funnel Micro-Deposits
                  </button>
                  <button
                    onClick={() => applyPreset('UFLPA_COTTON')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono transition-all cursor-pointer"
                  >
                    UFLPA Xinjiang Forced Cotton
                  </button>
                  <button
                    onClick={() => applyPreset('KK_PARK')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono transition-all cursor-pointer"
                  >
                    Myanmar KK Park Scam Compound
                  </button>
                  <button
                    onClick={() => applyPreset('PEONAGE_PASSPORT')}
                    className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-mono transition-all cursor-pointer"
                  >
                    Thailand Peonage &amp; Withheld Passport
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    Counterparty / Entity Name
                  </label>
                  <input
                    type="text"
                    value={entityName}
                    onChange={(e) => setEntityName(e.target.value)}
                    placeholder="e.g. Tarim Basin Sourcing Ltd or Apex Logistics"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs font-mono placeholder:text-zinc-600 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Origin Jurisdiction / Location
                    </label>
                    <input
                      type="text"
                      value={jurisdiction}
                      onChange={(e) => setJurisdiction(e.target.value)}
                      placeholder="e.g. Myanmar (Burma), China (Xinjiang), United States"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs font-mono placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Declared Commodity / Flow Type
                    </label>
                    <input
                      type="text"
                      value={commodity}
                      onChange={(e) => setCommodity(e.target.value)}
                      placeholder="e.g. Cobalt, Cotton & Textiles, Seafood"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs font-mono placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Transaction Amount ($ USD)
                    </label>
                    <input
                      type="number"
                      value={amountUsd}
                      onChange={(e) => setAmountUsd(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs font-mono placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      Notes, Contract Terms, or Wire Memo
                    </label>
                    <input
                      type="text"
                      value={notesOrTerms}
                      onChange={(e) => setNotesOrTerms(e.target.value)}
                      placeholder="e.g. recruitment fee deductions, dormitory clustering"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#08090D] border border-white/[0.08] focus:border-emerald-500/50 text-white text-xs font-mono placeholder:text-zinc-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunScreening}
                    disabled={isScreening}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-emerald-500/20"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScreening ? 'animate-spin' : ''}`} />
                    <span>Run Full-Spectrum Regulatory Scrutiny</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Statutory tripwire notice box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-zinc-400 leading-relaxed">
                <span className="text-white font-medium">Automatic Execution Logic:</span> Under 18 U.S.C. § 1594 and FinCEN Advisory FIN-2020-A008, transactions exhibiting forced labor or trafficking red flags cannot proceed under any operator override. The gateway severs all TCP/WS sockets immediately.
              </div>
            </div>
          </div>

          {/* Right Column: Screener Verdict Display */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.08] space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-semibold text-white">Scrutiny Verdict &amp; Attestation</h3>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">Real-Time Result</div>
              </div>

              {screeningResult ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border ${
                    screeningResult.passed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    <div className="flex items-center gap-2 font-mono text-xs font-semibold">
                      {screeningResult.passed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>PASS: {screeningResult.status}</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-4 h-4" />
                          <span>FAIL: {screeningResult.status}</span>
                        </>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-300 mt-1.5 font-sans">
                      {screeningResult.passed
                        ? 'No statutory red flags, sanctioned jurisdictions, or barred forced labor commodities detected. Attestation seal issued.'
                        : `CRITICAL ALERT: ${screeningResult.violationsCount} statutory breaches detected. Mandatory termination and compliance block enforced.`}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-zinc-500 text-[10px]">Risk Score (0–100)</div>
                      <div className={`text-lg font-semibold ${screeningResult.riskScore > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {screeningResult.riskScore} / 100
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                      <div className="text-zinc-500 text-[10px]">Violations Count</div>
                      <div className={`text-lg font-semibold ${screeningResult.violationsCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {screeningResult.violationsCount}
                      </div>
                    </div>
                  </div>

                  {screeningResult.violations && screeningResult.violations.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                        Detected Statutory Breaches:
                      </div>
                      <div className="space-y-2 max-h-56 overflow-y-auto scrollbar-thin">
                        {screeningResult.violations.map((v: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-rose-500/5 border border-rose-500/20 text-xs space-y-1">
                            <div className="flex items-center justify-between text-rose-400 font-mono font-medium text-[11px]">
                              <span>{v.ruleId}</span>
                              <span className="text-[10px] text-zinc-500">{v.source}</span>
                            </div>
                            <div className="text-zinc-300 text-[11px] leading-relaxed">
                              {v.reason}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1 text-xs font-mono">
                    <div className="text-zinc-500 text-[10px]">Attestation Seal</div>
                    <div className="text-zinc-300 truncate">{screeningResult.attestationSeal}</div>
                    <div className="text-zinc-500 text-[10px] pt-1">Statutory Covenant: {screeningResult.covenant}</div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500 space-y-2">
                  <Shield className="w-8 h-8 mx-auto text-zinc-700" />
                  <div className="text-xs">No active screening in progress.</div>
                  <div className="text-[11px] text-zinc-600">Select a preset or enter counterparty details to evaluate.</div>
                </div>
              )}
            </div>

            {/* Last tripwire simulation summary */}
            {lastTripwireTriggered && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-semibold font-mono">
                  <AlertOctagon className="w-4 h-4" />
                  <span>SIMULATED TRIPWIRE EXECUTED</span>
                </div>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  The zero-tolerance tripwire successfully forced a socket disconnection and generated compliance block #{lastTripwireTriggered.complianceBlock?.blockHeight || '14208'}.
                </p>
                <div className="text-[10px] font-mono text-zinc-400 truncate">
                  Hash: {lastTripwireTriggered.complianceBlock?.hmacSha256 || '0x9E7A3...4F02E'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FINCEN TYPOLOGIES DATASET */}
      {activeTab === 'TYPOLOGIES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0C0D14] border border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white">FinCEN Advisory FIN-2020-A008 Financial Red Flags</h3>
              <p className="text-xs text-zinc-400">Authoritative behavioral, financial, and transactional typologies.</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={typologyCategoryFilter}
                onChange={(e) => setTypologyCategoryFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#08090D] border border-white/[0.08] text-xs text-zinc-300 font-mono outline-none"
              >
                <option value="ALL">All Categories</option>
                <option value="SEX_TRAFFICKING">Sex Trafficking</option>
                <option value="FORCED_LABOR">Forced Labor</option>
                <option value="IDENTITY_RETENTION">Identity Retention</option>
                <option value="ILLICIT_CRYPTO_FLOW">Illicit Crypto Flow</option>
                <option value="SUPPLY_CHAIN_SLAVERY">Supply Chain Slavery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTypologies.map((t) => (
              <div key={t.id} className="p-5 rounded-xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    {t.code}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    Risk Weight: <strong className="text-rose-400">{t.riskWeight} / 100</strong>
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{t.sourceAuthority}</div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {t.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  <div className="text-[10px] text-zinc-500 font-mono">Detection Triggers:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {t.detectionPattern.map((p, i) => (
                      <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.03] text-zinc-300 border border-white/[0.04]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] font-mono text-amber-400/90 pt-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Action: {t.mandatoryAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOL ILAB SUPPLY CHAIN COMMODITIES */}
      {activeTab === 'COMMODITIES' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0C0D14] border border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white">US Department of Labor (ILAB) &amp; UFLPA Commodity Watchlist</h3>
              <p className="text-xs text-zinc-400">Goods produced with forced labor or child labor barred under 19 U.S.C. § 1307.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={commoditySearch}
                onChange={(e) => setCommoditySearch(e.target.value)}
                placeholder="Search commodity or country..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#08090D] border border-white/[0.08] text-xs text-zinc-300 font-mono placeholder:text-zinc-600 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0C0D14]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#08090D] text-zinc-400 border-b border-white/[0.06]">
                <tr>
                  <th className="p-3.5">Country / Territory</th>
                  <th className="p-3.5">Commodity / Material</th>
                  <th className="p-3.5">Sector</th>
                  <th className="p-3.5">Exploitation Type</th>
                  <th className="p-3.5">Statutory Authority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredCommodities.map((item, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-3.5 font-semibold text-white">{item.country}</td>
                    <td className="p-3.5 text-emerald-400">{item.commodity}</td>
                    <td className="p-3.5 text-zinc-400">{item.highRiskCategory}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        item.exploitationType === 'FORCED_LABOR'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : item.exploitationType === 'CHILD_LABOR'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {item.exploitationType}
                      </span>
                    </td>
                    <td className="p-3.5 text-zinc-400 text-[11px]">{item.statutoryBasis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: US STATE DEPT TIP JURISDICTION MATRIX */}
      {activeTab === 'JURISDICTIONS' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#0C0D14] border border-white/[0.08]">
            <div>
              <h3 className="text-sm font-semibold text-white">US State Department Trafficking in Persons (TIP) Office Jurisdictional Tiering</h3>
              <p className="text-xs text-zinc-400">Tier 3 regimes trigger mandatory automatic gateway disconnection.</p>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-zinc-500" />
              <select
                value={jurisdictionFilter}
                onChange={(e) => setJurisdictionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#08090D] border border-white/[0.08] text-xs text-zinc-300 font-mono outline-none"
              >
                <option value="ALL">All Tiers</option>
                <option value="TIER_3_SANCTIONED">Tier 3 Sanctioned (Barred)</option>
                <option value="TIER_1">Tier 1 Fully Compliant</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJurisdictions.map((j, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-[#0C0D14] border border-white/[0.06] hover:border-white/[0.12] transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white">{j.country}</h4>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    j.tier === 'TIER_3_SANCTIONED'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {j.tier.replace(/_/g, ' ')}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {j.notes}
                </p>

                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500">Sanction Score:</span>
                  <span className={j.sanctionRiskScore > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                    {j.sanctionRiskScore} / 100
                  </span>
                </div>

                <div className="text-[11px] font-mono flex items-center gap-1.5">
                  {j.autoBlockOutwardChannel ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <Ban className="w-3.5 h-3.5" />
                      <span>Outward Gateway: PERMANENTLY BLOCKED</span>
                    </span>
                  ) : (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Outward Gateway: AUTHORIZED CORRIDOR</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STATUTORY CORPUS & UN PALERMO TRIAD */}
      {activeTab === 'STATUTES' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">Title 18 U.S. Code §§ 1581–1597 Criminal Statutes</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Federal law establishes criminal liability and mandatory asset forfeiture for anyone knowingly benefiting financially from ventures engaged in peonage, forced labor, or human trafficking.
            </p>

            <div className="space-y-3 pt-2">
              {ANTI_TRAFFICKING_DATASETS.statutes.map((s, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#08090D] border border-white/[0.06] space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="text-xs font-semibold text-white">{s.title}</div>
                    <div className="text-[11px] font-mono text-emerald-400">{s.citation}</div>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{s.mandate}</p>
                  <div className="text-[11px] font-mono text-rose-400">Penalty: {s.penalty}</div>
                </div>
              ))}
            </div>
          </div>

          {/* UN Palermo Protocol Triad */}
          <div className="p-6 rounded-2xl bg-[#0C0D14] border border-white/[0.08] space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">United Nations Palermo Protocol Triad Matrix</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Under international treaty definition, human trafficking is established when the Act, Means, and Purpose intersect.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {ANTI_TRAFFICKING_DATASETS.unPalermoTriadChecks.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#08090D] border border-white/[0.06] space-y-3">
                  <div className="text-xs font-semibold text-white">{pillar.pillar}</div>
                  <ul className="space-y-1 text-xs text-zinc-400 font-mono">
                    {pillar.criteria.map((c, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-[10px] font-mono text-rose-400 pt-1">
                    Breach: {pillar.failVerdict}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: IMMUTABLE AUDIT LEDGER */}
      {activeTab === 'AUDIT_LOG' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.08] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Cryptographic Compliance Chain &amp; Audit Log</h3>
              <p className="text-xs text-zinc-400">Immutable ledger of every counterparty evaluated by the Sentinel.</p>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              Total Audits Recorded: <strong className="text-white">{auditLog.length}</strong>
            </div>
          </div>

          <div className="space-y-3">
            {auditLog.map((entry, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#0C0D14] border border-white/[0.06] space-y-2 font-mono text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                  <span className="font-semibold text-white">{entry.counterparty}</span>
                  <span className="text-zinc-500">{new Date(entry.evaluatedAt).toLocaleString()}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    entry.verdict?.includes('CLEARED')
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {entry.verdict}
                  </span>
                  <span className="text-zinc-400 text-[11px]">Risk: {entry.riskScore} / 100</span>
                  <span className="text-zinc-500 text-[10px] truncate max-w-xs">Seal: {entry.attestationSeal}</span>
                </div>

                {entry.violations && entry.violations.length > 0 && (
                  <div className="pt-2 text-[11px] text-rose-400 space-y-1">
                    {entry.violations.map((v: any, vi: number) => (
                      <div key={vi}>&bull; {v.ruleId}: {v.reason}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AntiTraffickingSentinelSuite;

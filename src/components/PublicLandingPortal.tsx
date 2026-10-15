import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  HeartPulse,
  Wand2,
  Lock,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Award,
  Globe,
  Landmark,
  UserCheck,
  Zap,
  Activity,
  FileText,
  Clock,
  Briefcase
} from 'lucide-react';
import { SovereignSeal } from './SovereignSeal';

interface PublicLandingPortalProps {
  onLaunchMedicalApp: () => void;
  onLaunchPinnacleApp: () => void;
  onLaunchJarvisBuilder: () => void;
  onLaunchTradingCommand: () => void;
  onOpenLedger: () => void;
  onNotify?: (msg: string, type: 'ALERT' | 'SUCCESS' | 'INFO') => void;
}

export const PublicLandingPortal: React.FC<PublicLandingPortalProps> = ({
  onLaunchMedicalApp,
  onLaunchPinnacleApp,
  onLaunchJarvisBuilder,
  onLaunchTradingCommand,
  onOpenLedger,
  onNotify
}) => {
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [clientType, setClientType] = useState<'HEALTHCARE' | 'CORPORATE_DERIVATIVES'>('HEALTHCARE');
  const [clientOrgName, setClientOrgName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [onboardSubmitted, setOnboardSubmitted] = useState(false);

  const handleQuickOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardSubmitted(true);
    if (onNotify) {
      onNotify(`Access granted for ${clientOrgName || 'Enterprise Partner'}. Routing to live workspace...`, 'SUCCESS');
    }
    setTimeout(() => {
      setIsOnboardModalOpen(false);
      setOnboardSubmitted(false);
      if (clientType === 'HEALTHCARE') {
        onLaunchMedicalApp();
      } else {
        onLaunchPinnacleApp();
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* INSTITUTIONAL TOP BAR */}
      <div className="border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md px-6 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SovereignSeal size={36} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-tight uppercase">Aegentix Sovereign</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                  PUBLIC PORTAL
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Institutional Derivatives &middot; Sovereign Healthcare Payroll &middot; US Regulated
              </p>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs text-slate-300 font-medium">
            <button onClick={onLaunchMedicalApp} className="hover:text-cyan-300 transition-colors cursor-pointer">
              Medical Recruiter
            </button>
            <button onClick={onLaunchPinnacleApp} className="hover:text-cyan-300 transition-colors cursor-pointer">
              Pinnacle Derivatives
            </button>
            <button onClick={onLaunchJarvisBuilder} className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jarvis App Studio</span>
            </button>
            <button onClick={onLaunchTradingCommand} className="hover:text-cyan-300 transition-colors cursor-pointer">
              29 Exchanges
            </button>
            <button onClick={onOpenLedger} className="hover:text-cyan-300 transition-colors cursor-pointer">
              Sovereign Ledger
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-bold text-xs transition-all shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <span>Client Sign-In</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-16 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-slate-950/50 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-emerald-300">100% US-Regulated Federal Rails</span>
            <span className="text-slate-600">&middot;</span>
            <span className="text-slate-400 font-mono">Zero Stripe &middot; Zero Offshore Flow</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Institutional Healthcare Staffing &amp; <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              Sovereign Treasury Settlement
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            The outward-facing operational gateway for healthcare networks, medical recruiters, and enterprise treasuries.
            Real-time streaming payroll for clinical contractors, 25-industry delta-neutral structured yields, and sub-second FedNow/Fedwire settlements backed by $62.5M in Vault Escrow.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 pt-4">
            <button
              onClick={onLaunchMedicalApp}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-rose-950/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Launch Medical Recruiter Portal</span>
            </button>

            <button
              onClick={onLaunchPinnacleApp}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-950/40 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>Pinnacle Derivatives (25 Top)</span>
            </button>

            <button
              onClick={onLaunchJarvisBuilder}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Jarvis App Studio</span>
            </button>
          </div>
        </div>
      </section>

      {/* REGULATORY TRUST MATRIX BANNER */}
      <section className="border-y border-slate-800/80 bg-slate-950/70 py-6 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-400">$62.5M</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Vault Escrow Custody</div>
            <div className="text-[11px] text-slate-400">117.92% Collateral Reserve Ratio</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">FedNow &amp; Fedwire</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Direct Clearing Rails</div>
            <div className="text-[11px] text-slate-400">Sub-second atomic RTGS settlements</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-cyan-400">HIPAA &amp; NPI</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Provider Attestation</div>
            <div className="text-[11px] text-slate-400">Zero-trust cryptographic escrow</div>
          </div>
          <div className="p-3 space-y-1">
            <div className="text-xl sm:text-2xl font-black text-rose-400">100% Anti-Trafficking</div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">Ethical Charter</div>
            <div className="text-[11px] text-slate-400">FinCEN Advisory FIN-2020-A008</div>
          </div>
        </div>
      </section>

      {/* CORE PRODUCT TRIAD */}
      <section className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Designed for Client Trust, Regulatory Continuity &amp; Zero SaaS Rent
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Everything runs in-house, native, and sovereign. No monthly vendor fees, no Stripe transaction taxes, and zero reliance on closed black boxes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Medical Recruiter */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition-all flex flex-col justify-between space-y-5 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors">
                Medical Recruiter &amp; Financial Ledger
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Autonomous staffing coordination for hospital networks and travel nurse agencies. Contractor NFT contracts, live streaming payroll, and batch claims adjudication backed by FaithLines custody.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified NPI &amp; State Board Attestation</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sub-second stream draw disbursements</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cryptographic JSON audit exports</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchMedicalApp}
              className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Open Recruiter Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Pinnacle Derivatives */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-5 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                Pinnacle Derivatives LLC
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Institutional B2B treasury management across the top 25 US industries and 125 enterprise benchmarks. Delta-neutral basis arbitrage harvesting spreads with mathematical zero directional risk.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>11.0% blended structured treasury yield</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customizable runway &amp; capital inflows</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Real-time channel covenant verification</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchPinnacleApp}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Explore 25 Top Industries</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Jarvis Studio */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between space-y-5 group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Wand2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                Jarvis Visual App Studio
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visual interactive application builder. Assemble custom clinic intake workflows, B2B payment screens, and escrow terminals using natural language prompts or drag-and-drop components.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-400 font-mono pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Interactive canvas with multi-device previews</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Powered by free-tier native AI models</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>1-click deploy to active portal navigation</span>
                </li>
              </ul>
            </div>
            <button
              onClick={onLaunchJarvisBuilder}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Launch Jarvis Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* CLIENT SIGN-IN & ONBOARDING MODAL */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Client Sign-In &amp; Onboarding</h3>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuickOnboardSubmit} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase">Select Target Workspace</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setClientType('HEALTHCARE')}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      clientType === 'HEALTHCARE'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Medical Recruiter
                  </button>
                  <button
                    type="button"
                    onClick={() => setClientType('CORPORATE_DERIVATIVES')}
                    className={`p-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      clientType === 'CORPORATE_DERIVATIVES'
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Pinnacle Derivatives
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase">Enterprise / Hospital Org Name</label>
                <input
                  type="text"
                  required
                  value={clientOrgName}
                  onChange={(e) => setClientOrgName(e.target.value)}
                  placeholder="e.g. Cleveland Clinic Hospital Network"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase">Corporate Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="admin@hospital-group.org"
                  className="w-full mt-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-emerald-400">Title 31 Anti-Trafficking Scrutiny: </span>
                By entering, counterparty affirms complete adherence to FinCEN FIN-2020-A008 and Title 18 USC compliance.
              </div>

              <button
                type="submit"
                disabled={onboardSubmitted}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {onboardSubmitted ? (
                  <>
                    <Activity className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials &amp; Routing...</span>
                  </>
                ) : (
                  <span>Access Secure Portal</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950/90 py-8 px-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Aegentix Sovereign OS &middot; Pinnacle Derivatives LLC &middot; Sovereign Healthcare Network
          </div>
          <div className="flex items-center gap-4">
            <span>Delaware Reg #4819-02</span>
            <span>&middot;</span>
            <span>FedNow RTGS Enabled</span>
            <span>&middot;</span>
            <span>FinCEN MSB Title 31</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

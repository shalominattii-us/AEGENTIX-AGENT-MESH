import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  ExternalLink,
  Bot,
  ShieldCheck,
  Terminal,
  Sparkles,
  FileText,
  AlertCircle,
  RefreshCw,
  Send,
  Lock,
  Globe
} from 'lucide-react';

interface GrokAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (msg: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void;
}

export const GrokAuditModal: React.FC<GrokAuditModalProps> = ({ isOpen, onClose, onNotify }) => {
  const [activeTab, setActiveTab] = useState<'free_upload' | 'live_api' | 'web_tunnel'>('free_upload');
  const [dossierText, setDossierText] = useState<string>('');
  const [isLoadingDossier, setIsLoadingDossier] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  // Live API States
  const [xaiKey, setXaiKey] = useState<string>('');
  const [auditPrompt, setAuditPrompt] = useState<string>(
    'Perform an end-to-end institutional production audit on Aegentix Sovereign OS and Pinnacle Derivatives. Audit the escrow mechanics, FedNow/Fedwire zero-Stripe invariants, HIPAA decoupling, and quantitative delta-neutral spread modeling.'
  );
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDossier();
    }
  }, [isOpen]);

  const loadDossier = async () => {
    setIsLoadingDossier(true);
    try {
      const res = await fetch('/api/grok/dossier');
      if (res.ok) {
        const text = await res.text();
        setDossierText(text);
      } else {
        setDossierText('# Failed to load dossier from server. Run node scripts/export-grok-dossier.js');
      }
    } catch (err: any) {
      setDossierText(`# Error loading dossier: ${err.message}`);
    } finally {
      setIsLoadingDossier(false);
    }
  };

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(dossierText);
    setCopiedDossier(true);
    onNotify?.('Full Grok Production Dossier copied to clipboard!', 'SUCCESS');
    setTimeout(() => setCopiedDossier(false), 2500);
  };

  const fullPromptForGrok = `You are acting as the Lead Production Architect and Quantitative Security Auditor for Aegentix Sovereign OS and Pinnacle Derivatives LLC.

Please analyze the production dossier below and provide a rigorous institutional evaluation:
1. SECURITY & ESCROW: Audit the escrow draw mechanics, claims adjudication logic, and FedNow instant clearing flow for any race conditions, double-draw vulnerabilities, or authorization gaps.
2. REGULATORY INVARIANTS: Verify that the decoupled HIPAA structure and FinCEN Title 31 covenants are mathematically invariant and legally defensible.
3. QUANTITATIVE BASIS ARBITRAGE: Review the delta-neutral cash-and-carry spread modeling for 25 industries across 29 US federal venues.
4. ACTIONABLE ENHANCEMENTS: Provide drop-in TypeScript / React code snippets for recommended improvements.

==================== LIVE PRODUCTION DOSSIER ====================
${dossierText}
`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(fullPromptForGrok);
    setCopiedPrompt(true);
    onNotify?.('Complete Grok Audit Prompt + Dossier copied to clipboard!', 'SUCCESS');
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleRunLiveAudit = async () => {
    if (!xaiKey.trim()) {
      setAuditError('Please enter an xAI API key (from console.x.ai) to invoke Grok live, or use Method 1 for 100% free web upload.');
      return;
    }
    setIsAuditing(true);
    setAuditError(null);
    setAuditResult(null);

    try {
      const res = await fetch('/api/grok/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': xaiKey.trim(),
        },
        body: JSON.stringify({ prompt: auditPrompt }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Failed to execute Grok audit');
      }

      setAuditResult(typeof data.audit === 'string' ? data.audit : JSON.stringify(data.audit, null, 2));
      onNotify?.('Grok production audit completed successfully!', 'SUCCESS');
    } catch (err: any) {
      setAuditError(err.message);
      onNotify?.(`Grok audit failed: ${err.message}`, 'ERROR');
    } finally {
      setIsAuditing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">Grok (xAI) Production Auditor &amp; Co-Pilot</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  xAI Integration
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Give Grok full sovereign access to analyze, audit, and enhance the live codebase &amp; ledger state.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METHOD TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('free_upload')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'free_upload'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Method 1: 1-Click Upload (100% Free)</span>
          </button>

          <button
            onClick={() => setActiveTab('live_api')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'live_api'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Method 2: Live xAI API Bridge</span>
          </button>

          <button
            onClick={() => setActiveTab('web_tunnel')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'web_tunnel'
                ? 'border-amber-400 text-amber-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Method 3: Live Web Tunnel for Grok</span>
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: 100% FREE COPY / UPLOAD METHOD */}
          {activeTab === 'free_upload' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300">Zero Cost, Native Production Dossier Ready</div>
                  <div>
                    A complete, 21KB consolidated production dossier containing your live disk state (Medical Recruiter Ledger, Pinnacle Company Profile), core API routes, and FinCEN anti-trafficking invariants has been compiled.
                  </div>
                </div>
              </div>

              {/* Local File Location */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 font-mono">Dossier File on Disk: </span>
                  <code className="text-cyan-400 font-bold font-mono">C:\Aegentix\brain\grok-production-dossier.md</code>
                </div>
                <a
                  href="/api/grok/dossier"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3 h-3 text-cyan-400" />
                  <span>View Raw</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  onClick={handleCopyPrompt}
                  className="p-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
                >
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Complete Audit Prompt + Dossier</span>
                </button>

                <button
                  onClick={handleCopyDossier}
                  className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
                >
                  {copiedDossier ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>Copy Raw Dossier Only</span>
                </button>
              </div>

              {/* Step-by-Step Instructions */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">How to Give This to Grok:</h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300">
                  <li>
                    Open <a href="https://grok.com" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-bold inline-flex items-center gap-1">grok.com <ExternalLink className="w-3 h-3" /></a> or Grok on X (Twitter).
                  </li>
                  <li>
                    Click the <strong>Paperclip (Attach file)</strong> icon and upload <code className="text-amber-300">C:\Aegentix\brain\grok-production-dossier.md</code>, OR simply click the button above to copy and paste.
                  </li>
                  <li>
                    Hit send. Grok will immediately analyze all ledger math, escrow rules, and code patterns, returning specific production architecture critiques and TypeScript enhancements.
                  </li>
                </ol>
              </div>

              {/* Dossier Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Dossier Preview ({dossierText.length} bytes):</span>
                  <button
                    onClick={loadDossier}
                    className="flex items-center gap-1 hover:text-white transition-all"
                  >
                    <RefreshCw className={`w-3 h-3 ${isLoadingDossier ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                  {dossierText.slice(0, 2000)}...
                </pre>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE XAI API BRIDGE */}
          {activeTab === 'live_api' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>xAI API Key (Stored locally in memory or .env)</span>
                </div>
                <p className="text-slate-400">
                  If you have an xAI API key from <a href="https://console.x.ai" target="_blank" rel="noreferrer" className="text-cyan-400 underline font-bold">console.x.ai</a>, you can trigger Grok audits directly inside this interface without switching tabs.
                </p>
                <input
                  type="password"
                  placeholder="xai-..."
                  value={xaiKey}
                  onChange={(e) => setXaiKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 font-bold uppercase text-[10px]">Audit Instructions / Prompt</label>
                <textarea
                  rows={3}
                  value={auditPrompt}
                  onChange={(e) => setAuditPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-sans focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleRunLiveAudit}
                disabled={isAuditing}
                className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isAuditing
                    ? 'bg-amber-600/50 text-amber-200 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                }`}
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Querying Grok (xAI) Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Live Grok Audit</span>
                  </>
                )}
              </button>

              {auditError && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{auditError}</span>
                </div>
              )}

              {auditResult && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold font-mono">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      <span>Grok Audit Findings</span>
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(auditResult)}
                      className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 text-[10px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy Findings</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-slate-200 font-mono text-xs max-h-72 overflow-y-auto whitespace-pre-wrap">
                    {auditResult}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WEB TUNNEL FOR GROK LIVE WEB BROWSING */}
          {activeTab === 'web_tunnel' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 space-y-2">
                <div className="font-bold text-cyan-300 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Enable Grok's Real-Time Web Browsing</span>
                </div>
                <div>
                  Grok 2 has native web browsing. By exposing your local port 3000 via a temporary free tunnel, Grok can crawl your live API endpoints in real-time.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 font-mono">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Option A: Cloudflare Tunnel (1-Command, Free, No Account)</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 select-all">
                  npx cloudflared tunnel --url http://localhost:3000
                </div>

                <div className="text-[11px] font-bold text-slate-400 uppercase pt-2">Option B: Localtunnel (Instant Free)</div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-emerald-400 select-all">
                  npx localtunnel --port 3000
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="font-bold text-white uppercase text-[11px]">Prompt to Give Grok Once Tunneled:</h4>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-300 font-sans italic select-all">
                  "Browse to my live sovereign node at [PASTE_TUNNEL_URL]/api/grok/dossier and [PASTE_TUNNEL_URL]/api/pinnacle/overview. Analyze the live escrow and delta-neutral trading contracts and provide a security review."
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local Production Node: Port 3000 &amp; 5173</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

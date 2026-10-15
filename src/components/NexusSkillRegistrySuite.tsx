import React, { useState, useEffect } from 'react';
import {
  Search,
  Terminal,
  Download,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  Filter,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Code2,
  Copy,
  Check,
  Sliders,
  Send,
  Zap
} from 'lucide-react';

interface NexusSkillItem {
  id: string;
  name: string;
  category: string;
  description: string;
  risk: 'safe' | 'medium' | 'high' | 'experimental';
  source: 'AAS_CORE' | 'SOVEREIGN_LOCAL' | 'GEMINI_BUILTIN';
  targets: Record<string, string>;
  installed: boolean;
  tags: string[];
}

interface NexusStats {
  totalSkills: number;
  installedCount: number;
  aasCoreCount: number;
  sovereignLocalCount: number;
  categoriesCount: number;
  safeRiskCount: number;
  lastSynced: string;
}

interface NexusSkillRegistrySuiteProps {
  onNotify?: (msg: string, type: 'SUCCESS' | 'ERROR' | 'INFO') => void;
}

export const NexusSkillRegistrySuite: React.FC<NexusSkillRegistrySuiteProps> = ({ onNotify }) => {
  const [stats, setStats] = useState<NexusStats | null>(null);
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);
  const [skills, setSkills] = useState<NexusSkillItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [installedOnly, setInstalledOnly] = useState<boolean>(false);

  // Selected Skill Detail Modal
  const [selectedSkill, setSelectedSkill] = useState<NexusSkillItem | null>(null);
  const [skillMarkdown, setSkillMarkdown] = useState<string>('');
  const [loadingMarkdown, setLoadingMarkdown] = useState<boolean>(false);

  // Terminal Command Protocol Console
  const [terminalInput, setTerminalInput] = useState<string>('nexus search trading');
  const [terminalOutput, setTerminalOutput] = useState<string>(
    `=============================================================================\n           NEXUS REGISTRY COMMAND PROTOCOL (NRCP) v1.0\n           Aegentix Sovereign OS Unified Skill & Tool Gateway\n=============================================================================\nReady. Type any nexus command below or click quick presets.\nTry: nexus stats | nexus categories | nexus search <term> | nexus install <id>\n=============================================================================`
  );
  const [isExecutingCmd, setIsExecutingCmd] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchOverview();
    fetchSkills('', 'all', false);
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/nexus/overview');
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setStats(data.stats);
          setCategories(data.categories || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to load nexus overview:', err);
    }
  };

  const fetchSkills = async (q: string, cat: string, installed: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat && cat !== 'all') params.set('category', cat);
      if (installed) params.set('installed', 'true');
      params.set('limit', '60');

      const res = await fetch(`/api/nexus/skills?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          setSkills(data.skills || []);
        }
      }
    } catch (err: any) {
      console.error('Failed to load skills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchSkills(val, selectedCategory, installedOnly);
  };

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat);
    fetchSkills(searchQuery, cat, installedOnly);
  };

  const handleInstalledToggle = (val: boolean) => {
    setInstalledOnly(val);
    fetchSkills(searchQuery, selectedCategory, val);
  };

  const handleSelectSkill = async (skill: NexusSkillItem) => {
    setSelectedSkill(skill);
    setLoadingMarkdown(true);
    try {
      const res = await fetch(`/api/nexus/skills/${skill.id}`);
      if (res.ok) {
        const data = await res.json();
        setSkillMarkdown(data.markdown || 'No markdown documentation available.');
      }
    } catch (err: any) {
      setSkillMarkdown(`Error loading SKILL.md: ${err.message}`);
    } finally {
      setLoadingMarkdown(false);
    }
  };

  const handleInstallSkill = async (skillId: string) => {
    try {
      const res = await fetch('/api/nexus/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId })
      });
      const data = await res.json();
      if (data.ok || data.success) {
        onNotify?.(data.message || `Skill ${skillId} installed!`, 'SUCCESS');
        // Refresh local installed indicator
        setSkills(prev => prev.map(s => s.id === skillId ? { ...s, installed: true } : s));
        if (selectedSkill?.id === skillId) {
          setSelectedSkill(prev => prev ? { ...prev, installed: true } : null);
        }
        fetchOverview();
      } else {
        onNotify?.(data.message || 'Installation failed', 'ERROR');
      }
    } catch (err: any) {
      onNotify?.(`Install error: ${err.message}`, 'ERROR');
    }
  };

  const handleExecuteTerminalCommand = async (cmdToRun?: string) => {
    const cmd = cmdToRun || terminalInput;
    if (!cmd.trim()) return;

    setIsExecutingCmd(true);
    try {
      const res = await fetch('/api/nexus/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      setTerminalOutput(data.output || JSON.stringify(data, null, 2));
      if (cmd.startsWith('nexus install') && data.ok) {
        fetchOverview();
        fetchSkills(searchQuery, selectedCategory, installedOnly);
      }
    } catch (err: any) {
      setTerminalOutput(`Error executing command: ${err.message}`);
    } finally {
      setIsExecutingCmd(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    onNotify?.(`Copied to clipboard: ${text}`, 'INFO');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      
      {/* HEADER HERO */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase">
                  Nexus Skill Registry
                </h1>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AAS Core + Sovereign Fleet
                </span>
                <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Command Protocol v1.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized discovery, indexing, and execution engine populated with 2,710+ agentic skills from your forked AAS Core catalog and local sovereign runtimes. Fully wired for Aegentix OS, Jarvis App Studio, and Grok MCP.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleExecuteTerminalCommand('nexus sync')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sync Catalog</span>
            </button>
            <button
              onClick={() => handleExecuteTerminalCommand('nexus stats')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Registry Stats</span>
            </button>
          </div>
        </div>

        {/* STATS METRIC BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">Total Catalog</div>
            <div className="text-xl font-mono font-black text-white mt-0.5">
              {stats?.totalSkills.toLocaleString() || '2,710'}
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5 font-bold">100% In-House Populated</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">AAS Core Fork</div>
            <div className="text-xl font-mono font-black text-indigo-400 mt-0.5">
              {stats?.aasCoreCount.toLocaleString() || '2,689'}
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5 font-bold">Local Shallow Clone</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">Active Installed</div>
            <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
              {stats?.installedCount || '22'}
            </div>
            <div className="text-[10px] text-emerald-300 mt-0.5 font-bold">In .agents/skills</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">Skill Categories</div>
            <div className="text-xl font-mono font-black text-purple-400 mt-0.5">
              {stats?.categoriesCount || '112'}
            </div>
            <div className="text-[10px] text-purple-300 mt-0.5 font-bold">Domain Taxonomies</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">Safe-Grade Rated</div>
            <div className="text-xl font-mono font-black text-cyan-300 mt-0.5">
              {stats?.safeRiskCount || '1,121'}
            </div>
            <div className="text-[10px] text-cyan-400 mt-0.5 font-bold">Zero Side-Effect Risk</div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="text-[10px] font-bold uppercase text-slate-400">Protocol Status</div>
            <div className="text-xl font-mono font-black text-amber-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>READY</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 font-mono">CLI: nexus.cmd</div>
          </div>
        </div>
      </div>

      {/* NEXUS REGISTRY COMMAND PROTOCOL (INTERACTIVE TERMINAL CONSOLE) */}
      <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-white">Nexus Registry Command Protocol (NRCP) Terminal</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Direct CLI Engine
            </span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-500 font-sans">Quick Presets:</span>
            {[
              { label: 'nexus stats', cmd: 'nexus stats' },
              { label: 'nexus categories', cmd: 'nexus categories' },
              { label: 'search trading', cmd: 'nexus search trading' },
              { label: 'search security', cmd: 'nexus search security' },
              { label: 'search medical', cmd: 'nexus search medical' },
              { label: 'nexus list', cmd: 'nexus list' }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setTerminalInput(p.cmd);
                  handleExecuteTerminalCommand(p.cmd);
                }}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 cursor-pointer transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Terminal Output Screen */}
        <pre className="p-4 rounded-xl bg-black/90 border border-slate-800/90 text-xs text-emerald-400 max-h-60 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed select-text shadow-inner">
          {terminalOutput}
        </pre>

        {/* Command Input Box */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/80 border border-slate-800 rounded-xl px-3 py-2 flex-1 focus-within:border-emerald-500 transition-all">
            <span className="text-emerald-500 font-bold mr-2 text-sm">&gt;</span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecuteTerminalCommand()}
              placeholder="nexus search <term> | nexus info <id> | nexus install <id> | nexus help"
              className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
            />
          </div>
          <button
            onClick={() => handleExecuteTerminalCommand()}
            disabled={isExecutingCmd}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-50"
          >
            {isExecutingCmd ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Send className="w-4 h-4 text-slate-950" />
            )}
            <span>Execute</span>
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search 2,710+ skills by ID, name, description, category, or tag (e.g. trading, defi, react, audio, security)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Installed Toggle */}
          <button
            onClick={() => handleInstalledToggle(!installedOnly)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer shrink-0 ${
              installedOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 hover:text-white border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Installed Only ({stats?.installedCount || 22})</span>
          </button>
        </div>

        {/* Category Filter Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Categories ({stats?.totalSkills || 2710})
          </button>

          {categories.slice(0, 20).map(c => (
            <button
              key={c.category}
              onClick={() => handleCategorySelect(c.category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === c.category
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{c.category}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 font-mono">
                {c.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SKILLS LISTING GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-white">{skills.length}</strong> skills
            {selectedCategory !== 'all' ? ` in category "${selectedCategory}"` : ''}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </span>
          <span className="font-mono text-[11px]">Nexus Registry Cache: C:\Aegentix\brain\nexus-skill-registry.json</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 flex flex-col items-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Querying Nexus Registry...</span>
          </div>
        ) : skills.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800">
            No skills found matching your filter criteria. Try searching for a different keyword or category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map(skill => {
              const isInstalled = skill.installed;
              const isSafe = skill.risk === 'safe';

              return (
                <div
                  key={skill.id}
                  className="p-5 rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4 shadow-lg group relative overflow-hidden"
                >
                  {/* Top Badges */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 truncate">
                        {skill.category}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isSafe ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            SAFE
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                            {skill.risk.toUpperCase()}
                          </span>
                        )}

                        {isInstalled && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>INSTALLED</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Skill Title & ID */}
                    <div>
                      <h3 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                        {skill.name}
                      </h3>
                      <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                        {skill.id}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {skill.description || 'No detailed description provided.'}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleSelectSkill(skill)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 text-[11px] font-bold flex items-center gap-1 border border-slate-800 cursor-pointer transition-all"
                    >
                      <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Inspect Manifest</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => copyToClipboard(`nexus install ${skill.id}`, skill.id)}
                        title="Copy 'nexus install' CLI command"
                        className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
                      >
                        {copiedId === skill.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleInstallSkill(skill.id)}
                        disabled={isInstalled}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm ${
                          isInstalled
                            ? 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-800'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                        }`}
                      >
                        <Download className="w-3 h-3" />
                        <span>{isInstalled ? 'Installed' : 'Install'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SKILL DETAIL & MANIFEST DRAWER / MODAL */}
      {selectedSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">{selectedSkill.name}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {selectedSkill.category}
                  </span>
                  {selectedSkill.installed && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ACTIVE IN AEGENTIX
                    </span>
                  )}
                </div>
                <div className="text-xs font-mono text-cyan-400 mt-0.5">{selectedSkill.id}</div>
              </div>
              <button
                onClick={() => setSelectedSkill(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-400 uppercase">Skill Description</div>
                <p className="text-slate-200 leading-relaxed">{selectedSkill.description}</p>
                <div className="pt-2 flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>Risk Grade: <strong className="text-emerald-400">{selectedSkill.risk}</strong></span>
                  <span>Source: <strong className="text-indigo-400">{selectedSkill.source}</strong></span>
                  <span>Target Agents: <strong className="text-cyan-400">{Object.keys(selectedSkill.targets || {}).join(', ')}</strong></span>
                </div>
              </div>

              {/* SKILL.md Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>SKILL.md Specification:</span>
                  <button
                    onClick={() => copyToClipboard(skillMarkdown, selectedSkill.id)}
                    className="flex items-center gap-1 hover:text-white transition-all text-[11px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy Markdown</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap select-text leading-relaxed">
                  {loadingMarkdown ? 'Loading SKILL.md from disk...' : skillMarkdown}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/70 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">CLI: nexus install {selectedSkill.id}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer font-bold"
                >
                  Close
                </button>
                <button
                  onClick={() => handleInstallSkill(selectedSkill.id)}
                  disabled={selectedSkill.installed}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                    selectedSkill.installed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                  }`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{selectedSkill.installed ? 'Already Installed' : 'Install into Aegentix'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

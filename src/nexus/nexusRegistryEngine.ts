import fs from 'fs';
import path from 'path';

export interface NexusSkill {
  id: string;
  name: string;
  category: string;
  description: string;
  path: string;
  risk: 'safe' | 'medium' | 'high' | 'experimental';
  source: 'AAS_CORE' | 'SOVEREIGN_LOCAL' | 'GEMINI_BUILTIN';
  targets: Record<string, string>;
  installed: boolean;
  tags: string[];
  dateAdded?: string;
}

export interface NexusRegistryStats {
  totalSkills: number;
  installedCount: number;
  aasCoreCount: number;
  sovereignLocalCount: number;
  categoriesCount: number;
  safeRiskCount: number;
  lastSynced: string;
}

export class NexusRegistryEngine {
  private skills: Map<string, NexusSkill> = new Map();
  private initialized: boolean = false;

  private aasRepoPath: string = 'C:/Users/eagle/antigravity/agentic-awesome-skills';
  private localSkillsPath: string = path.resolve(process.cwd(), '.agents/skills');
  private brainRegistryFile: string = 'C:/Aegentix/brain/nexus-skill-registry.json';

  constructor() {
    this.init();
  }

  public init() {
    try {
      this.skills.clear();

      // 1. Ingest from agentic-awesome-skills catalog if available
      const aasIndexPath = path.join(this.aasRepoPath, 'skills_index.json');
      if (fs.existsSync(aasIndexPath)) {
        try {
          const rawAas = JSON.parse(fs.readFileSync(aasIndexPath, 'utf8'));
          const items = Array.isArray(rawAas) ? rawAas : Object.values(rawAas);

          for (const item of items as any[]) {
            if (!item || !item.id) continue;
            const skill: NexusSkill = {
              id: item.id,
              name: item.name || item.id,
              category: (item.category || 'general').toLowerCase(),
              description: item.description || '',
              path: path.join(this.aasRepoPath, item.path || `skills/${item.id}`),
              risk: (item.risk || 'safe').toLowerCase(),
              source: 'AAS_CORE',
              targets: item.plugin?.targets || { aegentix: 'supported', claude: 'supported' },
              installed: false,
              tags: [item.category || 'general', item.source || 'community'].filter(Boolean),
              dateAdded: item.date_added
            };
            this.skills.set(skill.id, skill);
          }
        } catch (e: any) {
          console.warn('[NexusRegistry] Error parsing skills_index.json:', e.message);
        }
      }

      // 2. Ingest local sovereign skills from .agents/skills
      if (fs.existsSync(this.localSkillsPath)) {
        try {
          const localEntries = fs.readdirSync(this.localSkillsPath, { withFileTypes: true });
          for (const entry of localEntries) {
            if (entry.isDirectory()) {
              const skillId = entry.name;
              const skillDir = path.join(this.localSkillsPath, skillId);
              const skillMdPath = path.join(skillDir, 'SKILL.md');
              let description = 'Sovereign local Aegentix skill';
              let category = 'sovereign-core';

              if (fs.existsSync(skillMdPath)) {
                const mdContent = fs.readFileSync(skillMdPath, 'utf8');
                const descMatch = mdContent.match(/description:\s*([^\r\n]+)/i);
                if (descMatch && descMatch[1]) {
                  description = descMatch[1].trim();
                }
              }

              const existing = this.skills.get(skillId);
              if (existing) {
                existing.installed = true;
                existing.source = 'SOVEREIGN_LOCAL';
              } else {
                this.skills.set(skillId, {
                  id: skillId,
                  name: skillId,
                  category,
                  description,
                  path: skillDir,
                  risk: 'safe',
                  source: 'SOVEREIGN_LOCAL',
                  targets: { aegentix: 'native', grok: 'supported' },
                  installed: true,
                  tags: ['sovereign', 'in-house', 'local']
                });
              }
            }
          }
        } catch (e: any) {
          console.warn('[NexusRegistry] Error loading local skills:', e.message);
        }
      }

      // Check installed state for all
      for (const [id, skill] of this.skills.entries()) {
        const localCheck = path.join(this.localSkillsPath, id);
        if (fs.existsSync(localCheck)) {
          skill.installed = true;
        }
      }

      // Persist compiled registry to brain
      this.persist();
      this.initialized = true;
      console.log(`[NexusRegistry] Loaded ${this.skills.size} total agent skills into Nexus Registry.`);
    } catch (err: any) {
      console.error('[NexusRegistry] Failed to initialize registry:', err.message);
    }
  }

  private persist() {
    try {
      const brainDir = path.dirname(this.brainRegistryFile);
      if (!fs.existsSync(brainDir)) fs.mkdirSync(brainDir, { recursive: true });

      const payload = {
        metadata: this.getStats(),
        skills: Array.from(this.skills.values())
      };
      fs.writeFileSync(this.brainRegistryFile, JSON.stringify(payload, null, 2), 'utf8');
    } catch (e: any) {
      console.warn('[NexusRegistry] Could not write registry cache:', e.message);
    }
  }

  public getStats(): NexusRegistryStats {
    let installed = 0;
    let aas = 0;
    let local = 0;
    let safe = 0;
    const categories = new Set<string>();

    for (const skill of this.skills.values()) {
      if (skill.installed) installed++;
      if (skill.source === 'AAS_CORE') aas++;
      if (skill.source === 'SOVEREIGN_LOCAL') local++;
      if (skill.risk === 'safe') safe++;
      if (skill.category) categories.add(skill.category);
    }

    return {
      totalSkills: this.skills.size,
      installedCount: installed,
      aasCoreCount: aas,
      sovereignLocalCount: local,
      categoriesCount: categories.size,
      safeRiskCount: safe,
      lastSynced: new Date().toISOString()
    };
  }

  public getCategories(): { category: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const skill of this.skills.values()) {
      const cat = skill.category || 'other';
      counts.set(cat, (counts.get(cat) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }

  public search(query: string, options?: { category?: string; target?: string; installedOnly?: boolean; limit?: number }): NexusSkill[] {
    const q = (query || '').toLowerCase().trim();
    const limit = options?.limit || 50;
    const results: NexusSkill[] = [];

    for (const skill of this.skills.values()) {
      if (options?.category && options.category !== 'all' && skill.category !== options.category) {
        continue;
      }
      if (options?.installedOnly && !skill.installed) {
        continue;
      }
      if (options?.target && !skill.targets[options.target]) {
        continue;
      }

      if (!q) {
        results.push(skill);
      } else {
        const idMatch = skill.id.toLowerCase().includes(q);
        const nameMatch = skill.name.toLowerCase().includes(q);
        const descMatch = skill.description.toLowerCase().includes(q);
        const catMatch = skill.category.toLowerCase().includes(q);
        const tagMatch = skill.tags.some(t => t.toLowerCase().includes(q));

        if (idMatch || nameMatch || descMatch || catMatch || tagMatch) {
          results.push(skill);
        }
      }

      if (results.length >= limit) break;
    }

    return results;
  }

  public getSkill(id: string): NexusSkill | null {
    return this.skills.get(id) || null;
  }

  public getSkillMarkdown(id: string): string {
    const skill = this.skills.get(id);
    if (!skill) return `# Skill Not Found: ${id}`;

    // Try target path
    const candidates = [
      path.join(skill.path, 'SKILL.md'),
      path.join(this.localSkillsPath, id, 'SKILL.md'),
      path.join(this.aasRepoPath, 'skills', id, 'SKILL.md'),
      path.join(this.aasRepoPath, skill.path, 'SKILL.md')
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        return fs.readFileSync(c, 'utf8');
      }
    }

    return `# ${skill.name}\n\n**Category**: ${skill.category}\n**Risk**: ${skill.risk}\n\n${skill.description}\n\n*[No SKILL.md found at ${skill.path}]*`;
  }

  public installSkill(id: string): { success: boolean; message: string; targetPath?: string } {
    const skill = this.skills.get(id);
    if (!skill) {
      return { success: false, message: `Skill ${id} not found in Nexus Registry.` };
    }

    const targetDir = path.join(this.localSkillsPath, id);
    if (fs.existsSync(targetDir)) {
      skill.installed = true;
      return { success: true, message: `Skill ${id} is already installed in Aegentix.`, targetPath: targetDir };
    }

    try {
      if (!fs.existsSync(this.localSkillsPath)) {
        fs.mkdirSync(this.localSkillsPath, { recursive: true });
      }

      // Find source folder
      let sourceDir = skill.path;
      if (!fs.existsSync(sourceDir)) {
        sourceDir = path.join(this.aasRepoPath, 'skills', id);
      }

      if (fs.existsSync(sourceDir)) {
        fs.cpSync(sourceDir, targetDir, { recursive: true });
      } else {
        // Fallback: create synthetic skill directory with SKILL.md
        fs.mkdirSync(targetDir, { recursive: true });
        const stubMd = `---
name: ${skill.name}
description: ${skill.description}
category: ${skill.category}
risk: ${skill.risk}
---

# ${skill.name}

${skill.description}

## Protocol Instructions
This skill was activated via Nexus Registry Command Protocol into Aegentix Sovereign OS.
`;
        fs.writeFileSync(path.join(targetDir, 'SKILL.md'), stubMd, 'utf8');
      }

      skill.installed = true;
      this.persist();
      return {
        success: true,
        message: `Successfully installed skill [${id}] into Aegentix Sovereign OS (.agents/skills/${id}).`,
        targetPath: targetDir
      };
    } catch (err: any) {
      return { success: false, message: `Failed to install skill ${id}: ${err.message}` };
    }
  }

  // -------------------------------------------------------------
  // NEXUS REGISTRY COMMAND PROTOCOL (CLI ENGINE)
  // -------------------------------------------------------------
  public executeCommand(commandStr: string): { ok: boolean; command: string; output: string; data?: any } {
    const trimmed = (commandStr || '').trim();
    if (!trimmed) {
      return { ok: false, command: '', output: 'Nexus command empty. Try: nexus help' };
    }

    // Strip leading "nexus " if provided
    const cleanCmd = trimmed.replace(/^nexus\s+/i, '');
    const parts = cleanCmd.split(/\s+/);
    const action = (parts[0] || '').toLowerCase();
    const arg1 = parts[1];
    const restArgs = parts.slice(2).join(' ');

    switch (action) {
      case 'help': {
        const helpText = `=============================================================================
           NEXUS REGISTRY COMMAND PROTOCOL (NRCP) v1.0
           Aegentix Sovereign OS Unified Skill & Tool Gateway
=============================================================================
Commands:
  nexus search <term>          - Search 2,700+ skills by keyword, category, or tag
  nexus list [category]        - List skills (optionally filter by category)
  nexus info <skill-id>        - Inspect manifest, risk grade, and SKILL.md
  nexus install <skill-id>     - Bind & install skill into Aegentix runtime (.agents/skills)
  nexus categories             - Show all skill categories with count breakdown
  nexus stats                  - Display complete registry metrics
  nexus sync                   - Re-index local skills & forked AAS Core catalog
  nexus help                   - Show this protocol reference guide
=============================================================================`;
        return { ok: true, command: trimmed, output: helpText };
      }

      case 'stats': {
        const stats = this.getStats();
        const text = `=============================================================================
                     NEXUS REGISTRY GLOBAL METRICS
=============================================================================
  Total Skills in Catalog : ${stats.totalSkills}
  AAS Core Forked Skills  : ${stats.aasCoreCount}
  Sovereign Local Skills  : ${stats.sovereignLocalCount}
  Active Installed Skills : ${stats.installedCount}
  Unique Categories       : ${stats.categoriesCount}
  Safe-Grade Verified     : ${stats.safeRiskCount}
  Last Registry Sync      : ${stats.lastSynced}
=============================================================================`;
        return { ok: true, command: trimmed, output: text, data: stats };
      }

      case 'categories': {
        const cats = this.getCategories();
        let text = `=============================================================================\n`;
        text += `                    NEXUS REGISTRY CATEGORIES (${cats.length})\n`;
        text += `=============================================================================\n`;
        cats.slice(0, 30).forEach((c, idx) => {
          text += `  [${String(idx + 1).padStart(2, '0')}] ${c.category.padEnd(28)} : ${c.count} skills\n`;
        });
        if (cats.length > 30) {
          text += `  ... and ${cats.length - 30} more categories.\n`;
        }
        return { ok: true, command: trimmed, output: text, data: cats };
      }

      case 'search': {
        if (!arg1) {
          return { ok: false, command: trimmed, output: 'Usage: nexus search <term> (e.g. nexus search trading)' };
        }
        const queryTerm = parts.slice(1).join(' ');
        const results = this.search(queryTerm, { limit: 15 });
        if (results.length === 0) {
          return { ok: true, command: trimmed, output: `No skills found matching "${queryTerm}".` };
        }

        let text = `=============================================================================\n`;
        text += `       NEXUS SEARCH RESULTS FOR "${queryTerm}" (Showing ${results.length})\n`;
        text += `=============================================================================\n`;
        results.forEach((s, idx) => {
          const status = s.installed ? '[INSTALLED]' : '[AVAILABLE]';
          text += `${idx + 1}. ${s.id.padEnd(32)} ${status.padEnd(12)} (${s.category})\n`;
          text += `   ${s.description.slice(0, 85)}${s.description.length > 85 ? '...' : ''}\n\n`;
        });
        text += `To install: nexus install <skill-id>\nTo view info: nexus info <skill-id>`;
        return { ok: true, command: trimmed, output: text, data: results };
      }

      case 'list': {
        const catFilter = arg1 || 'all';
        const results = this.search('', { category: catFilter, limit: 20 });
        let text = `=============================================================================\n`;
        text += `       NEXUS SKILL CATALOG [Category: ${catFilter.toUpperCase()}] (Top ${results.length})\n`;
        text += `=============================================================================\n`;
        results.forEach((s, idx) => {
          const status = s.installed ? '✓' : ' ';
          text += `[${status}] ${s.id.padEnd(30)} | ${s.category.padEnd(16)} | ${s.risk}\n`;
        });
        return { ok: true, command: trimmed, output: text, data: results };
      }

      case 'info': {
        if (!arg1) {
          return { ok: false, command: trimmed, output: 'Usage: nexus info <skill-id>' };
        }
        const skill = this.getSkill(arg1);
        if (!skill) {
          return { ok: false, command: trimmed, output: `Skill "${arg1}" not found in Nexus Registry.` };
        }
        const mdPreview = this.getSkillMarkdown(arg1);
        const text = `=============================================================================
SKILL ID     : ${skill.id}
NAME         : ${skill.name}
CATEGORY     : ${skill.category}
RISK GRADE   : ${skill.risk}
SOURCE       : ${skill.source}
INSTALLED    : ${skill.installed ? 'YES (.agents/skills)' : 'NO (Available in catalog)'}
PATH         : ${skill.path}
TARGETS      : ${Object.keys(skill.targets).join(', ')}
=============================================================================
SKILL MANIFEST / SPEC:
${mdPreview.slice(0, 1500)}${mdPreview.length > 1500 ? '\n... [truncated]' : ''}
`;
        return { ok: true, command: trimmed, output: text, data: { skill, md: mdPreview } };
      }

      case 'install': {
        if (!arg1) {
          return { ok: false, command: trimmed, output: 'Usage: nexus install <skill-id>' };
        }
        const res = this.installSkill(arg1);
        return {
          ok: res.success,
          command: trimmed,
          output: res.message,
          data: res
        };
      }

      case 'sync': {
        this.init();
        const stats = this.getStats();
        return {
          ok: true,
          command: trimmed,
          output: `Nexus Registry synchronized successfully! Total skills indexed: ${stats.totalSkills} (${stats.categoriesCount} categories).`,
          data: stats
        };
      }

      default:
        return {
          ok: false,
          command: trimmed,
          output: `Unknown nexus command: "${action}". Type "nexus help" for reference.`
        };
    }
  }
}

// Global Singleton Instance
export const nexusRegistry = new NexusRegistryEngine();

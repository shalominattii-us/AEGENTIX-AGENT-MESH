import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AAS_DIR = path.resolve('C:/Users/eagle/antigravity/agentic-awesome-skills/skills');
const LOCAL_SKILLS_DIR = path.resolve(__dirname, '../.agents/skills');
const REGISTRY_CACHE_PATH = 'C:/Aegentix/brain/nexus-skill-registry.json';

const ELITE_SKILL_IDS = [
  // Autonomous Agents & Orchestration
  'agent-orchestrator',
  'agent-creator',
  'agent-evaluation',
  'agent-memory-systems',
  'agent-tool-builder',
  'ai-agents-architect',
  'autonomous-agents',
  'agent-self-scheduling',
  'agent-squad',
  'agent-observability',
  'agent-harness-fault-injection',
  'prompt-engineering',

  // Trading, Markets & Quant
  'quant-analyst',
  'traderspy-trading-signals',
  'traderspy-market-screener',
  'traderspy-smart-money',
  'traderspy-technical-analysis',
  'traderspy-position-check',
  'longbridge-market-data',
  'longbridge-quant',
  'trading-ledger',
  'axonx',
  'emblemai-crypto-wallet',
  'crypto-bd-agent',

  // Security, Auditing & Anti-Slop
  'anti-slop-design',
  'ai-agent-security',
  'ai-security-hardening',
  'api-security-best-practices',
  'api-security-testing',
  'audit-agent-run-evidence',
  'penetration-testing',
  'vulnerability-scanner',

  // DevOps, Infrastructure & Cloud
  'docker-compose',
  'docker-expert',
  'cloud-devops',
  'devops-pipeline-builder',
  'kubernetes-architect',
  'aws-serverless',
  'azure-functions',
  'bullmq-specialist',
  'vllm-server',
  'local-llm-expert',
  'performance-optimization',

  // System Automation & Web Ops
  'browser-automation',
  'workflow-automation',
  'activecampaign-automation',
  'billing-automation',
  'api-contract-testing',
  'api-design-principles'
];

async function run() {
  console.log('=============================================================================');
  console.log('         AEGENTIX SOVEREIGN OS - ELITE SKILL COATING ENGINE');
  console.log('=============================================================================');

  if (!fs.existsSync(LOCAL_SKILLS_DIR)) {
    fs.mkdirSync(LOCAL_SKILLS_DIR, { recursive: true });
  }

  let newlyInstalled = 0;
  let alreadyInstalled = 0;
  let missingInSource = 0;

  for (const id of ELITE_SKILL_IDS) {
    const targetDir = path.join(LOCAL_SKILLS_DIR, id);
    if (fs.existsSync(targetDir)) {
      alreadyInstalled++;
      console.log(`[ALREADY ACTIVE]  ${id}`);
      continue;
    }

    const sourceDir = path.join(AAS_DIR, id);
    if (fs.existsSync(sourceDir)) {
      try {
        fs.cpSync(sourceDir, targetDir, { recursive: true });
        newlyInstalled++;
        console.log(`[INSTALLED]       ${id} -> .agents/skills/${id}`);
      } catch (err) {
        console.error(`[ERROR]           Failed to copy ${id}:`, err.message);
      }
    } else {
      missingInSource++;
      console.log(`[SOURCE MISSING]  ${id}`);
    }
  }

  // Update registry cache if present
  if (fs.existsSync(REGISTRY_CACHE_PATH)) {
    try {
      const cacheData = JSON.parse(fs.readFileSync(REGISTRY_CACHE_PATH, 'utf8'));
      const installedFolders = new Set(fs.readdirSync(LOCAL_SKILLS_DIR));

      if (cacheData.skills) {
        for (const skill of cacheData.skills) {
          if (installedFolders.has(skill.id)) {
            skill.installed = true;
          }
        }
      }
      if (cacheData.stats) {
        cacheData.stats.installedCount = installedFolders.size;
        cacheData.stats.lastSynced = new Date().toISOString();
      }
      fs.writeFileSync(REGISTRY_CACHE_PATH, JSON.stringify(cacheData, null, 2), 'utf8');
      console.log(`[CACHE UPDATED]   ${REGISTRY_CACHE_PATH} synced with ${installedFolders.size} active skills.`);
    } catch (e) {
      console.warn('[CACHE WARN] Could not update cache file:', e.message);
    }
  }

  const totalInstalled = fs.readdirSync(LOCAL_SKILLS_DIR).length;
  console.log('=============================================================================');
  console.log(`Newly Coated: ${newlyInstalled} | Already Active: ${alreadyInstalled} | Total Active Skills: ${totalInstalled}`);
  console.log('=============================================================================');
}

run().catch(console.error);

/**
 * Aegentix Unified Memory Vault
 * 
 * Implements durable, inspectable context storage compatible with ECC Memory Vault (ecc.memory.v1)
 * and Aegentix Sovereign OS runtime specifications.
 * Persists to C:\Aegentix\brain\memory-vault.json and desktop/memory-vault.json.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class UnifiedMemoryVault {
  constructor(options = {}) {
    this.primaryPath = options.primaryPath || "C:/Aegentix/brain/memory-vault.json";
    this.fallbackPath = options.fallbackPath || path.join(__dirname, "memory-vault.json");
    this.vault = {
      version: "ecc.memory.v1",
      system: "AEGENTIX SOVEREIGN OS",
      lastUpdated: new Date().toISOString(),
      memories: [],
      decrees: [],
      transmittances: []
    };
    this.load();
  }

  load() {
    for (const p of [this.primaryPath, this.fallbackPath]) {
      if (fs.existsSync(p)) {
        try {
          const raw = fs.readFileSync(p, "utf-8");
          const data = JSON.parse(raw);
          if (data && Array.isArray(data.memories)) {
            this.vault = data;
            return;
          }
        } catch (err) {
          console.warn(`[MEMORY_VAULT] Warning: Failed to read from ${p}:`, err.message);
        }
      }
    }
    this.save();
  }

  save() {
    this.vault.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(this.vault, null, 2);

    for (const target of [this.primaryPath, this.fallbackPath]) {
      try {
        const dir = path.dirname(target);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(target, serialized, "utf-8");
      } catch (err) {
        // Primary path may fail if permissions or drives differ; fallback remains durable
      }
    }
  }

  saveMemory({ title, kind = "context", source = "reasoning-engine", target = "all", tags = [], content = "", data = null }) {
    const memoryId = "mem-" + crypto.randomBytes(6).toString("hex");
    const record = {
      id: memoryId,
      timestamp: new Date().toISOString(),
      title,
      kind,
      sourceHarness: source,
      targetHarness: target,
      tags: Array.isArray(tags) ? tags : [tags],
      content: String(content).trim(),
      data,
      status: "active"
    };

    this.vault.memories.unshift(record);
    // Keep bounded history
    if (this.vault.memories.length > 500) {
      this.vault.memories = this.vault.memories.slice(0, 500);
    }
    this.save();
    return record;
  }

  searchMemories(query, opts = {}) {
    const q = (query || "").toLowerCase();
    const limit = opts.limit || 10;
    const kind = opts.kind;

    return this.vault.memories
      .filter(m => {
        if (m.status !== "active") return false;
        if (kind && m.kind !== kind) return false;
        if (!q) return true;
        const matchesContent = m.content.toLowerCase().includes(q);
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesTag = m.tags.some(t => t.toLowerCase().includes(q));
        return matchesContent || matchesTitle || matchesTag;
      })
      .slice(0, limit);
  }

  recordDecree(decree) {
    const record = {
      id: decree.decreeId || "DEC-" + Date.now(),
      timestamp: new Date().toISOString(),
      type: "MINT_DECREE",
      token: decree.token || "TOK-TSL-ESC-EOC",
      amount: decree.amount,
      backingRatio: decree.backingRatio || "105%",
      escrowReserve: decree.escrowReserve,
      dagProof: decree.dagProof,
      signature: decree.signature,
      councilAttestations: decree.councilAttestations || []
    };

    if (!Array.isArray(this.vault.decrees)) {
      this.vault.decrees = [];
    }
    this.vault.decrees.unshift(record);
    this.saveMemory({
      title: `Decree Issued: ${record.id}`,
      kind: "decree",
      source: "sovereign-engine",
      tags: ["decree", "stablecoin", "tsl-esc-eoc", "escrow"],
      content: `Mint decree executed for ${record.amount} ${record.token} backed by ${record.escrowReserve} in Vault of Trust. Backing ratio: ${record.backingRatio}.`,
      data: record
    });
    this.save();
    return record;
  }

  recordTransmittance(transmittance) {
    const record = {
      id: transmittance.txId || "DAG-TX-" + Date.now(),
      timestamp: new Date().toISOString(),
      epoch: transmittance.epochHeight,
      stateChannel: transmittance.stateChannel,
      proofHash: transmittance.proofHash,
      latencyMs: transmittance.latencyMs || 38
    };

    if (!Array.isArray(this.vault.transmittances)) {
      this.vault.transmittances = [];
    }
    this.vault.transmittances.unshift(record);
    this.saveMemory({
      title: `DAG Transmittance Anchored: ${record.id}`,
      kind: "transmittance",
      source: "dag-network",
      tags: ["dag", "transmittance", "hypergraph", "consensus"],
      content: `Anchor verified at epoch #${record.epoch} across state channel ${record.stateChannel} with ${record.latencyMs}ms latency.`,
      data: record
    });
    this.save();
    return record;
  }

  getSummary() {
    return {
      version: this.vault.version,
      lastUpdated: this.vault.lastUpdated,
      totalMemories: this.vault.memories.length,
      totalDecrees: (this.vault.decrees || []).length,
      totalTransmittances: (this.vault.transmittances || []).length,
      recentMemories: this.vault.memories.slice(0, 5)
    };
  }
}

const memoryVaultInstance = new UnifiedMemoryVault();

module.exports = { UnifiedMemoryVault, memoryVaultInstance };

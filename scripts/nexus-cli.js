#!/usr/bin/env node
/**
 * NEXUS REGISTRY COMMAND PROTOCOL (NRCP) CLI
 * Usage: node scripts/nexus-cli.js search <query>
 *        node scripts/nexus-cli.js list [category]
 *        node scripts/nexus-cli.js info <skillId>
 *        node scripts/nexus-cli.js install <skillId>
 *        node scripts/nexus-cli.js categories
 *        node scripts/nexus-cli.js stats
 */

import { nexusRegistry } from '../src/nexus/nexusRegistryEngine.ts';

const args = process.argv.slice(2);
const commandStr = args.length > 0 ? args.join(' ') : 'help';

const result = nexusRegistry.executeCommand(commandStr);
console.log(result.output);
if (!result.ok) {
  process.exit(1);
}

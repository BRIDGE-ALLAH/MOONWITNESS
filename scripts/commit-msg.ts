#!/usr/bin/env bun
/**
 * SOVEREIGN COMMIT-MSG GUARD (Conventional Commits Enforcer)
 * Allowed prefixes: feat, fix, chore, docs, style, refactor, perf, test, build, ci, revert
 */

import { readFileSync } from "node:fs";

const msgFile = process.argv[2];
if (!msgFile) process.exit(0);

const msg = readFileSync(msgFile, "utf8").trim();
if (msg.startsWith("Merge ") || msg.startsWith("Revert ")) process.exit(0);

const pattern = /^(feat|fix|chore|docs|style|refactor|perf|test|build|ci|revert)(\([a-z0-9_-]+\))?!?: .+/i;

if (!pattern.test(msg)) {
  console.error("❌ INVALID COMMIT MESSAGE FORMAT.");
  console.error("  Expected Conventional Commit: <type>(<scope>): <subject>");
  console.error("  Example: feat(rid): add skang audio synthesizer");
  console.error(`  Received: "${msg}"`);
  process.exit(1);
}

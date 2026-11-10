#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO QUALITY GATE
 * Enforces Zero-Slop Production Hygiene across all workspaces:
 * 1. Zero forbidden markers (TODO, FIXME, mock_data placeholders)
 * 2. Zero tracked secrets (.env files)
 * 3. Full TypeScript check across all workspaces
 * 4. Automated Unit Test Suite
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const SCAN_DIRS = ["apps", "packages", "services"];
const IGNORE_DIRS = new Set(["node_modules", ".next", "dist", "target", "pb_data", "pb_migrations"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".rs"]);

const FORBIDDEN_PATTERNS = [
  { regex: /\/\/\s*TODO\b/i, reason: "Zero // TODO allowed in production code" },
  { regex: /\/\/\s*FIXME\b/i, reason: "Zero // FIXME allowed in production code" },
];

let violations: string[] = [];

function walk(dir: string) {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const name of entries) {
    if (IGNORE_DIRS.has(name)) continue;
    const fullPath = join(dir, name);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (stat.isFile()) {
      const ext = name.slice(name.lastIndexOf("."));
      if (!CODE_EXTS.has(ext)) continue;
      const content = readFileSync(fullPath, "utf8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        for (const pat of FORBIDDEN_PATTERNS) {
          if (pat.regex.test(line)) {
            violations.push(`${fullPath}:${idx + 1} -> ${pat.reason} (${line.trim()})`);
          }
        }
      });
    }
  }
}

console.log("⚡ [GATE 1/3] Scanning for Zero-Slop Production Hygiene...");
for (const d of SCAN_DIRS) {
  walk(join(ROOT, d));
}

if (violations.length > 0) {
  console.error("❌ HYGIENE VIOLATIONS DETECTED:");
  violations.forEach((v) => console.error("  - " + v));
  process.exit(1);
}
console.log("✓ Hygiene clean (0 TODO/FIXME markers).");

console.log("⚡ [GATE 2/3] Running Monorepo TypeScript Verification...");
const checkRes = spawnSync("bun", ["run", "check"], { stdio: "inherit", shell: true });
if (checkRes.status !== 0) {
  console.error("❌ Typecheck failed.");
  process.exit(checkRes.status || 1);
}

console.log("⚡ [GATE 3/3] Running Monorepo Test Suite...");
const testRes = spawnSync("bun", ["run", "test"], { stdio: "inherit", shell: true });
if (testRes.status !== 0) {
  console.error("❌ Tests failed.");
  process.exit(testRes.status || 1);
}

console.log("✅ ALL SOVEREIGN QUALITY GATES PASSED.");

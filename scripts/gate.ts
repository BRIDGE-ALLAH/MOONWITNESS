#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO QUALITY GATE
 * Enforces Zero-Slop Production Hygiene across all workspaces:
 * 1. Zero forbidden markers (TODO, FIXME)
 * 2. Full TypeScript check across all workspaces
 * 3. TypeScript unit test suites
 * 4. Zero tracked secrets (.env files)
 * 5. Rust fmt + clippy (-D warnings) + tests for legend and radius
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

const violations: string[] = [];

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
      const lines = readFileSync(fullPath, "utf8").split("\n");
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

function run(label: string, command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`❌ ${label} failed.`);
    process.exit(result.status || 1);
  }
}

console.log("⚡ [GATE 1/5] Scanning for Zero-Slop Production Hygiene...");
for (const d of SCAN_DIRS) walk(join(ROOT, d));
if (violations.length > 0) {
  console.error("❌ HYGIENE VIOLATIONS DETECTED:");
  violations.forEach((v) => console.error("  - " + v));
  process.exit(1);
}
console.log("✓ Hygiene clean (0 TODO/FIXME markers).");

console.log("⚡ [GATE 2/5] Running Monorepo TypeScript Verification...");
run("Typecheck", "bun", ["run", "check"]);

console.log("⚡ [GATE 3/5] Running TypeScript Test Suites...");
run("Tests", "bun", ["run", "test"]);

console.log("⚡ [GATE 4/5] Verifying no secrets are tracked...");
const tracked = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.split("\n");
const leakedEnv = tracked.filter((path) => /(^|\/)\.env(\.[^/]*)?$/.test(path) && !path.endsWith(".env.example"));
if (leakedEnv.length > 0) {
  console.error("❌ Tracked secret files: " + leakedEnv.join(", "));
  process.exit(1);
}
console.log("✓ No tracked .env files.");

console.log("⚡ [GATE 5/5] Running Rust lint + tests (legend, radius)...");
if (spawnSync("cargo", ["--version"], { stdio: "ignore", shell: true }).status !== 0) {
  console.error("❌ cargo not found; Rust gate cannot be skipped.");
  process.exit(1);
}
run("Rust lint", "bun", ["run", "lint:rust"]);
run("Rust tests", "bun", ["run", "test:rust"]);

console.log("✅ ALL SOVEREIGN QUALITY GATES PASSED.");

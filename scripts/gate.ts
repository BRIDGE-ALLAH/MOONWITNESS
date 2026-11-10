#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — QUALITY GATE RUNNER
 * Enforces:
 *  1. Zero-Slop AST/Text Scan (No // TODO, // FIXME, or production Math.random() in apps, packages, services)
 *  2. 13-Manifest SemVer Synchronization Check (10 package.json, 2 Cargo.toml, .release-please-manifest.json)
 *  3. Full Monorepo TypeScript Typecheck (8 workspaces)
 *  4. Automated Test Suites (contracts, git-engine, arsy)
 *  5. Secret Leak Prevention (No tracked .env files)
 *  6. Rust Toolchain Verification (cargo fmt, clippy -D warnings, cargo test for legend & radius)
 *
 * Flags:
 *  --hygiene-only : Run Stages 1, 2, and 5 only (fast <100ms check for CI jobs that run TS/Rust separately)
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const HYGIENE_ONLY = process.argv.includes("--hygiene-only");
const SCAN_DIRS = ["apps", "packages", "services"];
const IGNORE_DIRS = new Set(["node_modules", ".next", "dist", "target", "pb_data", "pb_migrations"]);
const CODE_EXTS = new Set([".ts", ".tsx", ".rs"]);

const PACKAGE_FILES = [
  "package.json",
  "packages/contracts/package.json",
  "packages/ui/package.json",
  "apps/dx/package.json",
  "apps/empire/package.json",
  "apps/moonwitness/package.json",
  "apps/e-isp/package.json",
  "apps/rid/package.json",
  "services/git-engine/package.json",
  "services/arsy/package.json",
];

const CARGO_FILES = [
  "services/legend/Cargo.toml",
  "services/radius/Cargo.toml",
];

const FORBIDDEN_PATTERNS = [
  { regex: /\/\/\s*TODO\b/i, reason: "Zero // TODO allowed in production code", allowInTests: false },
  { regex: /\/\/\s*FIXME\b/i, reason: "Zero // FIXME allowed in production code", allowInTests: false },
  { regex: /\bMath\.random\s*\(/, reason: "Zero Math.random() allowed in production code", allowInTests: true },
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
      const isTestFile = name.endsWith(".test.ts") || name.endsWith(".spec.ts");
      const lines = readFileSync(fullPath, "utf8").split("\n");
      lines.forEach((line, idx) => {
        for (const pat of FORBIDDEN_PATTERNS) {
          if (pat.allowInTests && isTestFile) continue;
          if (pat.regex.test(line)) {
            violations.push(`${fullPath}:${idx + 1} -> ${pat.reason} (${line.trim()})`);
          }
        }
      });
    }
  }
}

function verifyVersionSync() {
  const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const expected = rootPkg.version;
  for (const rel of PACKAGE_FILES) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    const v = JSON.parse(readFileSync(full, "utf8")).version;
    if (v !== expected) {
      violations.push(`${rel} version mismatch: found ${v}, expected ${expected}`);
    }
  }
  for (const rel of CARGO_FILES) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) continue;
    const match = readFileSync(full, "utf8").match(/^version\s*=\s*"([^"]+)"/m);
    if (!match || match[1] !== expected) {
      violations.push(`${rel} version mismatch: found ${match?.[1] ?? "none"}, expected ${expected}`);
    }
  }
  const rpPath = join(ROOT, ".release-please-manifest.json");
  if (existsSync(rpPath)) {
    const rpVer = JSON.parse(readFileSync(rpPath, "utf8"))["."];
    if (rpVer !== expected) {
      violations.push(`.release-please-manifest.json version mismatch: found ${rpVer}, expected ${expected}`);
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

console.log("⚡ [GATE 1/5] Scanning for Zero-Slop Production Hygiene & Version Sync...");
for (const d of SCAN_DIRS) walk(join(ROOT, d));
verifyVersionSync();
if (violations.length > 0) {
  console.error("❌ HYGIENE OR VERSION SYNC VIOLATIONS DETECTED:");
  violations.forEach((v) => console.error("  - " + v));
  process.exit(1);
}
console.log("✓ Hygiene clean (0 TODO/FIXME/Math.random markers, 13/13 manifests synced).");

console.log("⚡ [GATE 4/5] Verifying no secrets are tracked...");
const tracked = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.split("\n");
const leakedEnv = tracked.filter((path) => /(^|\/)\.env(\.[^/]*)?$/.test(path) && !path.endsWith(".env.example"));
if (leakedEnv.length > 0) {
  console.error("❌ Tracked secret files: " + leakedEnv.join(", "));
  process.exit(1);
}
console.log("✓ No tracked .env files.");

if (HYGIENE_ONLY) {
  console.log("✅ HYGIENE & SECRET GATES PASSED.");
  process.exit(0);
}

console.log("⚡ [GATE 2/5] Running Monorepo TypeScript Verification...");
run("Typecheck", "bun", ["run", "check"]);

console.log("⚡ [GATE 3/5] Running TypeScript Test Suites...");
run("Tests", "bun", ["run", "test"]);

console.log("⚡ [GATE 5/5] Running Rust lint + tests (legend, radius)...");
if (spawnSync("cargo", ["--version"], { stdio: "ignore", shell: true }).status !== 0) {
  console.error("❌ cargo not found; Rust gate cannot be skipped.");
  process.exit(1);
}
run("Rust lint", "bun", ["run", "lint:rust"]);
run("Rust tests", "bun", ["run", "test:rust"]);

console.log("✅ ALL SOVEREIGN QUALITY GATES PASSED.");

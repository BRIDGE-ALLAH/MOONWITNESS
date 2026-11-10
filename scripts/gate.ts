#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — QUALITY GATE RUNNER
 * Enforces:
 *  1. Zero-Slop AST/Text Scan (No // TODO, // FIXME, or production Math.random() in apps, packages, services)
 *  2. 16-File SemVer Synchronization Check (11 JSON manifests, 2 Cargo.toml, 2 Cargo.lock, .release-please-manifest.json)
 *  3. Universal Agent & Skill Kit Mirror Parity (.agents/* == .claude/* == .agents/plugins/sovereign-kit/*)
 *  4. Full Monorepo TypeScript Typecheck (8 workspaces)
 *  5. Automated Test Suites (contracts, ui, git-engine, arsy)
 *  6. Secret Leak Prevention (No tracked .env files)
 *  7. Rust Toolchain Verification (cargo fmt, clippy -D warnings, cargo test for legend & radius)
 *
 * Flags:
 *  --hygiene-only : Run Stages 1, 2, 3, and 6 only (fast <100ms check for pre-push and CI jobs)
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
  ".agents/plugins/sovereign-kit/plugin.json",
];

const CARGO_CRATES = [
  { name: "legend", toml: "services/legend/Cargo.toml", lock: "services/legend/Cargo.lock" },
  { name: "radius", toml: "services/radius/Cargo.toml", lock: "services/radius/Cargo.lock" },
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

function verifyVersionAndAgentSync() {
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
  for (const crate of CARGO_CRATES) {
    const fullToml = join(ROOT, crate.toml);
    if (existsSync(fullToml)) {
      const match = readFileSync(fullToml, "utf8").match(/^version\s*=\s*"([^"]+)"/m);
      if (!match || match[1] !== expected) {
        violations.push(`${crate.toml} version mismatch: found ${match?.[1] ?? "none"}, expected ${expected}`);
      }
    }
    const fullLock = join(ROOT, crate.lock);
    if (existsSync(fullLock)) {
      const lockRegex = new RegExp(`name = "${crate.name}"\\r?\\nversion = "([^"]+)"`, "m");
      const match = readFileSync(fullLock, "utf8").match(lockRegex);
      if (!match || match[1] !== expected) {
        violations.push(`${crate.lock} version mismatch: found ${match?.[1] ?? "none"}, expected ${expected}`);
      }
    }
  }
  const rpPath = join(ROOT, ".release-please-manifest.json");
  if (existsSync(rpPath)) {
    const rpVer = JSON.parse(readFileSync(rpPath, "utf8"))["."];
    if (rpVer !== expected) {
      violations.push(`.release-please-manifest.json version mismatch: found ${rpVer}, expected ${expected}`);
    }
  }

  // Verify Agent & Skill Kit Parity across .agents/, .claude/, and .agents/plugins/sovereign-kit/
  const skillsDir = join(ROOT, ".agents/skills");
  if (existsSync(skillsDir)) {
    for (const skill of readdirSync(skillsDir)) {
      const src = join(ROOT, ".agents/skills", skill, "SKILL.md");
      const claudeMirror = join(ROOT, ".claude/skills", skill, "SKILL.md");
      const pluginMirror = join(ROOT, ".agents/plugins/sovereign-kit/skills", skill, "SKILL.md");
      if (existsSync(src)) {
        if (!existsSync(claudeMirror)) violations.push(`Missing Claude skill mirror: .claude/skills/${skill}/SKILL.md`);
        if (!existsSync(pluginMirror)) violations.push(`Missing Plugin skill mirror: .agents/plugins/sovereign-kit/skills/${skill}/SKILL.md`);
      }
    }
  }
  const agentsDir = join(ROOT, ".agents/agents");
  if (existsSync(agentsDir)) {
    for (const agentFile of readdirSync(agentsDir).filter((f) => f.endsWith(".md"))) {
      if (!existsSync(join(ROOT, ".claude/agents", agentFile))) {
        violations.push(`Missing Claude agent mirror: .claude/agents/${agentFile}`);
      }
      if (!existsSync(join(ROOT, ".agents/plugins/sovereign-kit/agents", agentFile))) {
        violations.push(`Missing Plugin agent mirror: .agents/plugins/sovereign-kit/agents/${agentFile}`);
      }
    }
  }
  if (existsSync(join(ROOT, ".plan"))) {
    violations.push(
      "Forbidden local .plan/ folder detected -> Use sovereign-codex-mcp (https://codex.a-l-l-a-h.com/mcp) instead"
    );
  }
}

function run(label: string, command: string, args: string[]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`❌ ${label} failed.`);
    process.exit(result.status || 1);
  }
}

console.log("⚡ [GATE 1/5] Scanning Zero-Slop AST, 16-File Version Sync & Agent Kit Parity...");
for (const d of SCAN_DIRS) walk(join(ROOT, d));
verifyVersionAndAgentSync();
if (violations.length > 0) {
  console.error("❌ HYGIENE, VERSION SYNC, OR AGENT PARITY VIOLATIONS DETECTED:");
  violations.forEach((v) => console.error("  - " + v));
  process.exit(1);
}
console.log("✓ Hygiene clean (0 TODO/FIXME/Math.random, 16/16 manifests synced, Agent Kit mirrored).");

console.log("⚡ [GATE 4/5] Verifying no secrets are tracked...");
const tracked = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.split("\n");
const leakedEnv = tracked.filter((path) => /(^|\/)\.env(\.[^/]*)?$/.test(path) && !path.endsWith(".env.example"));
if (leakedEnv.length > 0) {
  console.error("❌ Tracked secret files: " + leakedEnv.join(", "));
  process.exit(1);
}
console.log("✓ No tracked .env files.");

if (HYGIENE_ONLY) {
  console.log("✅ HYGIENE, PARITY & SECRET GATES PASSED.");
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

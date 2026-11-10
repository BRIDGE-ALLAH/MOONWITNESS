#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — AUTONOMOUS BUG DETECTOR & SELF-HEALING ENGINE (AUTOFIX)
 * Automatically detects and repairs:
 *  1. SemVer version drift across 10 package.json, 2 Cargo.toml, 2 Cargo.lock, and .release-please-manifest.json
 *  2. Git hooks registration (core.hooksPath = .githooks) and LF line-ending normalization on shell/hook scripts
 *  3. Missing local .env bootstrap (copies .env.example -> .env) and untracks any accidentally staged .env secrets
 *  4. Rust formatting drift (cargo fmt on services/legend and services/radius)
 *  5. Optional deep Rust clippy auto-repair (--deep)
 */

import { existsSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const DEEP = process.argv.includes("--deep");

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

const CARGO_CRATES = [
  { name: "legend", toml: "services/legend/Cargo.toml", lock: "services/legend/Cargo.lock" },
  { name: "radius", toml: "services/radius/Cargo.toml", lock: "services/radius/Cargo.lock" },
];

let fixesApplied = 0;

console.log("🔧 [AUTOFIX 1/5] Checking & Healing 15-File Manifest Version Sync...");
const rootPkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
const targetVersion: string = rootPkg.version;

for (const rel of PACKAGE_FILES) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) continue;
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  if (pkg.version !== targetVersion) {
    pkg.version = targetVersion;
    writeFileSync(full, JSON.stringify(pkg, null, 2) + "\n", "utf8");
    console.log(`  ✓ Healed version drift in ${rel} -> ${targetVersion}`);
    fixesApplied++;
  }
}

for (const crate of CARGO_CRATES) {
  const fullToml = join(ROOT, crate.toml);
  if (existsSync(fullToml)) {
    const content = readFileSync(fullToml, "utf8");
    const updated = content.replace(/^version\s*=\s*"[^"]+"/m, `version = "${targetVersion}"`);
    if (updated !== content) {
      writeFileSync(fullToml, updated, "utf8");
      console.log(`  ✓ Healed version drift in ${crate.toml} -> ${targetVersion}`);
      fixesApplied++;
    }
  }
  const fullLock = join(ROOT, crate.lock);
  if (existsSync(fullLock)) {
    const lock = readFileSync(fullLock, "utf8");
    const lockRegex = new RegExp(`(name = "${crate.name}"\\r?\\nversion = ")[^"]+(")`, "m");
    const updatedLock = lock.replace(lockRegex, `$1${targetVersion}$2`);
    if (updatedLock !== lock) {
      writeFileSync(fullLock, updatedLock, "utf8");
      console.log(`  ✓ Healed version drift in ${crate.lock} -> ${targetVersion}`);
      fixesApplied++;
    }
  }
}

const rpPath = join(ROOT, ".release-please-manifest.json");
if (existsSync(rpPath)) {
  const rp = JSON.parse(readFileSync(rpPath, "utf8"));
  if (rp["."] !== targetVersion) {
    writeFileSync(rpPath, JSON.stringify({ ".": targetVersion }, null, 2) + "\n", "utf8");
    console.log(`  ✓ Healed .release-please-manifest.json -> ${targetVersion}`);
    fixesApplied++;
  }
}

console.log("🔧 [AUTOFIX 2/5] Checking Git Hooks & Unix Script Line Endings (LF)...");
const hookConfig = spawnSync("git", ["config", "--get", "core.hooksPath"], { encoding: "utf8" }).stdout.trim();
if (hookConfig !== ".githooks") {
  spawnSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
  console.log("  ✓ Configured git core.hooksPath -> .githooks");
  fixesApplied++;
}

const lfTargets = [
  ...readdirSync(join(ROOT, ".githooks")).map((f) => join(ROOT, ".githooks", f)),
  ...readdirSync(join(ROOT, "scripts"))
    .filter((f) => f.endsWith(".sh"))
    .map((f) => join(ROOT, "scripts", f)),
];

for (const file of lfTargets) {
  if (!existsSync(file)) continue;
  const raw = readFileSync(file, "utf8");
  if (raw.includes("\r\n")) {
    writeFileSync(file, raw.replace(/\r\n/g, "\n"), "utf8");
    console.log(`  ✓ Normalized CRLF -> LF in ${file.replace(ROOT + "\\", "").replace(ROOT + "/", "")}`);
    fixesApplied++;
  }
}

console.log("🔧 [AUTOFIX 3/5] Checking Environment Bootstrap & Secret Index Hygiene...");
const envPath = join(ROOT, ".env");
const envExamplePath = join(ROOT, ".env.example");
if (!existsSync(envPath) && existsSync(envExamplePath)) {
  copyFileSync(envExamplePath, envPath);
  console.log("  ✓ Bootstrapped missing .env from .env.example");
  fixesApplied++;
}

const tracked = spawnSync("git", ["ls-files"], { encoding: "utf8" }).stdout.split("\n");
const leakedEnv = tracked.filter((p) => /(^|\/)\.env(\.[^/]*)?$/.test(p.trim()) && !p.trim().endsWith(".env.example"));
for (const leaked of leakedEnv) {
  spawnSync("git", ["rm", "--cached", leaked.trim()], { stdio: "inherit" });
  console.log(`  ✓ Untracked leaked secret file from git index: ${leaked.trim()}`);
  fixesApplied++;
}

console.log("🔧 [AUTOFIX 4/5] Running Rust Code Formatter (legend & radius)...");
for (const crate of CARGO_CRATES) {
  spawnSync("cargo", ["fmt", "--manifest-path", crate.toml], { stdio: "inherit", shell: true });
  if (DEEP) {
    spawnSync(
      "cargo",
      ["clippy", "--manifest-path", crate.toml, "--fix", "--allow-dirty", "--allow-staged", "--all-targets"],
      { stdio: "inherit", shell: true }
    );
  }
}

console.log(`✅ AUTOFIX COMPLETE (${fixesApplied} automatic repair(s) applied).`);


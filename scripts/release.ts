#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — AUTONOMOUS RELEASE & VERSION BUMP ENGINE
 * Synchronizes versions across all 10 package.json files, 2 Rust Cargo.toml crates,
 * 2 Rust Cargo.lock files, .release-please-manifest.json, and CHANGELOG.md.
 *
 * Usage:
 *   bun scripts/release.ts [auto|patch|minor|major|<explicit_semver>] [--tag] [--push]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const ROOT = process.cwd();
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

function getLastGitTag(): string | null {
  try {
    const tag = execSync("git describe --tags --abbrev=0", { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return tag || null;
  } catch {
    return null;
  }
}

function getCommitsSinceTag(lastTag: string | null): string[] {
  try {
    const range = lastTag ? `${lastTag}..HEAD` : "-n 15";
    const out = execSync(`git log ${range} --pretty=format:"%s (%h)"`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return out ? out.split("\n").map((s) => s.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function detectAutoBumpMode(commits: string[]): "major" | "minor" | "patch" {
  for (const line of commits) {
    if (/BREAKING CHANGE|^[a-z]+(\([^)]+\))?!:/i.test(line)) return "major";
  }
  for (const line of commits) {
    if (/^feat(\([^)]+\))?:/i.test(line)) return "minor";
  }
  return "patch";
}

function bumpSemver(current: string, mode: string): string {
  if (/^\d+\.\d+\.\d+$/.test(mode)) return mode;
  const parts = current.split(".").map((n) => parseInt(n, 10) || 0);
  const [maj = 0, min = 1, pat = 0] = parts;
  if (mode === "major") return `${maj + 1}.0.0`;
  if (mode === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

const args = process.argv.slice(2);
const requestedMode = args.find((a) => !a.startsWith("--")) || "patch";
const shouldTag = args.includes("--tag");
const shouldPush = args.includes("--push");

const lastTag = getLastGitTag();
const commitsSinceTag = getCommitsSinceTag(lastTag);

if (requestedMode === "auto" && lastTag && commitsSinceTag.length === 0) {
  console.log(`✓ No new commits since ${lastTag}. Skipping auto-release.`);
  process.exit(0);
}

const resolvedMode = requestedMode === "auto" ? detectAutoBumpMode(commitsSinceTag) : requestedMode;

const rootPkgPath = join(ROOT, "package.json");
const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
const oldVersion = rootPkg.version || "0.1.0";
const nextVersion = bumpSemver(oldVersion, resolvedMode);

console.log(`⚡ Bumping Sovereign Monorepo (${resolvedMode}): v${oldVersion} -> v${nextVersion}`);

for (const relPath of PACKAGE_FILES) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) continue;
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  pkg.version = nextVersion;
  writeFileSync(full, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log(`  ✓ Updated ${relPath} (${nextVersion})`);
}

for (const crate of CARGO_CRATES) {
  const fullToml = join(ROOT, crate.toml);
  if (existsSync(fullToml)) {
    const toml = readFileSync(fullToml, "utf8");
    const updated = toml.replace(/^version\s*=\s*"[^"]+"/m, `version = "${nextVersion}"`);
    writeFileSync(fullToml, updated, "utf8");
    console.log(`  ✓ Updated ${crate.toml} (${nextVersion})`);
  }
  const fullLock = join(ROOT, crate.lock);
  if (existsSync(fullLock)) {
    const lock = readFileSync(fullLock, "utf8");
    const lockRegex = new RegExp(`(name = "${crate.name}"\\r?\\nversion = ")[^"]+(")`, "m");
    const updatedLock = lock.replace(lockRegex, `$1${nextVersion}$2`);
    writeFileSync(fullLock, updatedLock, "utf8");
    console.log(`  ✓ Updated ${crate.lock} (${nextVersion})`);
  }
}

const manifestPath = join(ROOT, ".release-please-manifest.json");
writeFileSync(manifestPath, JSON.stringify({ ".": nextVersion }, null, 2) + "\n", "utf8");
console.log(`  ✓ Updated .release-please-manifest.json (${nextVersion})`);

const changelogPath = join(ROOT, "CHANGELOG.md");
const bulletCommits =
  commitsSinceTag.length > 0
    ? commitsSinceTag.map((c) => `- ${c}`).join("\n")
    : `- Maintenance release v${nextVersion}`;

const dateStr = new Date().toISOString().slice(0, 10);
const entry = `## [v${nextVersion}] - ${dateStr}\n\n${bulletCommits}\n\n`;
const existingChangelog = existsSync(changelogPath)
  ? readFileSync(changelogPath, "utf8")
  : "# CHANGELOG — SOVEREIGN ECOSYSTEM\n\n";
const updatedChangelog = existingChangelog.replace(
  "# CHANGELOG — SOVEREIGN ECOSYSTEM\n\n",
  `# CHANGELOG — SOVEREIGN ECOSYSTEM\n\n${entry}`
);
writeFileSync(
  changelogPath,
  updatedChangelog.startsWith("# CHANGELOG")
    ? updatedChangelog
    : `# CHANGELOG — SOVEREIGN ECOSYSTEM\n\n${entry}${existingChangelog}`,
  "utf8"
);
console.log(`  ✓ Updated CHANGELOG.md`);

if (shouldTag) {
  try {
    const trackedFiles = [
      ...PACKAGE_FILES.filter((p) => existsSync(join(ROOT, p))),
      ...CARGO_CRATES.flatMap((c) => [c.toml, c.lock]).filter((p) => existsSync(join(ROOT, p))),
      ".release-please-manifest.json",
      "CHANGELOG.md",
    ];
    execSync(`git add ${trackedFiles.join(" ")}`, { stdio: "inherit" });
    execSync(`git commit -m "chore(release): v${nextVersion}"`, { stdio: "inherit" });
    execSync(`git tag -a v${nextVersion} -m "Release v${nextVersion}"`, { stdio: "inherit" });
    console.log(`✅ Created commit and git tag v${nextVersion}`);
    if (shouldPush) {
      execSync("git push origin HEAD --tags", { stdio: "inherit" });
      console.log(`✅ Pushed commit and tag v${nextVersion} to origin`);
    }
  } catch (e) {
    console.error("⚠️ Could not auto-commit/tag:", (e as Error).message);
    process.exit(1);
  }
}

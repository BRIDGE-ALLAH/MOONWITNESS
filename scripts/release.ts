#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO RELEASE & VERSION BUMP AUTOMATION
 * Synchronizes versions across all package.json, Rust Cargo.toml crates,
 * .release-please-manifest.json, and CHANGELOG.md.
 * Usage:
 *   bun scripts/release.ts [patch|minor|major|<explicit_semver>] [--tag]
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

const CARGO_FILES = [
  "services/legend/Cargo.toml",
  "services/radius/Cargo.toml",
];

function bumpSemver(current: string, mode: string): string {
  if (/^\d+\.\d+\.\d+$/.test(mode)) return mode;
  const parts = current.split(".").map((n) => parseInt(n, 10) || 0);
  const [maj = 0, min = 1, pat = 0] = parts;
  if (mode === "major") return `${maj + 1}.0.0`;
  if (mode === "minor") return `${maj}.${min + 1}.0`;
  return `${maj}.${min}.${pat + 1}`;
}

const args = process.argv.slice(2);
const bumpMode = args.find((a) => !a.startsWith("--")) || "patch";
const shouldTag = args.includes("--tag");

const rootPkgPath = join(ROOT, "package.json");
const rootPkg = JSON.parse(readFileSync(rootPkgPath, "utf8"));
const oldVersion = rootPkg.version || "0.1.0";
const nextVersion = bumpSemver(oldVersion, bumpMode);

console.log(`⚡ Bumping Sovereign Monorepo: v${oldVersion} -> v${nextVersion}`);

for (const relPath of PACKAGE_FILES) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) continue;
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  pkg.version = nextVersion;
  writeFileSync(full, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log(`  ✓ Updated ${relPath} (${nextVersion})`);
}

for (const cargoPath of CARGO_FILES) {
  const full = join(ROOT, cargoPath);
  if (!existsSync(full)) continue;
  const toml = readFileSync(full, "utf8");
  const updated = toml.replace(/^version\s*=\s*"[^"]+"/m, `version = "${nextVersion}"`);
  writeFileSync(full, updated, "utf8");
  console.log(`  ✓ Updated ${cargoPath} (${nextVersion})`);
}

const manifestPath = join(ROOT, ".release-please-manifest.json");
writeFileSync(manifestPath, JSON.stringify({ ".": nextVersion }, null, 2) + "\n", "utf8");
console.log(`  ✓ Updated .release-please-manifest.json (${nextVersion})`);

const changelogPath = join(ROOT, "CHANGELOG.md");
let recentCommits = "";
try {
  recentCommits = execSync('git log -n 15 --pretty=format:"- %s (%h)"', { encoding: "utf8" }).trim();
} catch {
  recentCommits = "- Initial release snapshot";
}

const dateStr = new Date().toISOString().slice(0, 10);
const entry = `## [v${nextVersion}] - ${dateStr}\n\n${recentCommits}\n\n`;
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
      ...CARGO_FILES.filter((p) => existsSync(join(ROOT, p))),
      ".release-please-manifest.json",
      "CHANGELOG.md",
    ];
    execSync(`git add ${trackedFiles.join(" ")}`, { stdio: "inherit" });
    execSync(`git commit -m "chore(release): v${nextVersion}"`, { stdio: "inherit" });
    execSync(`git tag -a v${nextVersion} -m "Release v${nextVersion}"`, { stdio: "inherit" });
    console.log(`✅ Created commit and git tag v${nextVersion}`);
  } catch (e) {
    console.error("⚠️ Could not auto-commit/tag:", (e as Error).message);
  }
}

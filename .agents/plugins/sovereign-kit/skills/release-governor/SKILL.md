---
name: release-governor
description: >-
  Execute SemVer version bumps, changelog updates, git tagging, CycloneDX SBOM,
  and SLSA container release workflows across all 10 JS/TS packages and 2 Rust
  crates. Use when preparing or publishing a release.
---

# Sovereign Release Governor

## 1. Pre-Release Checklist
1. Working tree must be clean (`git status --short`).
2. Full 5-stage gate must pass (`bun run gate`).
3. All 9 live nodes should respond (`bun run doctor`).

## 2. Synchronized Version Bump
Run `bun scripts/release.ts [patch|minor|major|<semver>] --tag` to atomically update:
- Root `package.json` + 9 workspace `package.json` manifests
- `services/legend/Cargo.toml` & `services/radius/Cargo.toml`
- `.release-please-manifest.json`
- `CHANGELOG.md`
- Annotated git tag `vX.Y.Z`

## 3. CI/CD & Supply Chain Verification
Pushing `master` and tags (`git push origin master --follow-tags`) triggers:
- `.github/workflows/ci.yml`: TS check/test/build, Rust fmt/clippy/test matrix, Gitleaks secret scan, Docker Compose validation.
- `.github/workflows/security.yml`: CodeQL SAST + RustSec `cargo audit`.
- `.github/workflows/release.yml`: Release Please PRs on branch push; Gate + CycloneDX SBOM + SLSA provenance + GHCR multi-service container push (`legend`, `arsy`, `radius`, `pocketbase`) on `v*.*.*` tags.

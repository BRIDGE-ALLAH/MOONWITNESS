---
name: autopilot-loop
description: Execute closed-loop autonomous bug autofix, full-stack feature/auth radar, E2E live mesh smoke verification, and auto-SemVer release across the Sovereign Monorepo. Use when auditing, self-healing, or shipping autonomous releases.
---

# AUTOPILOT LOOP — CLOSED-LOOP ENTERPRISE AUTOMATION

## 1. CLOSED-LOOP EXECUTION PHASES
Execute the full pipeline via `bun run autopilot` or run individual phases:

1. **Phase 1 — Self-Healing & Bug Autofix (`bun run autofix`)**:
   - Synchronizes SemVer across all 10 `package.json`, 2 `Cargo.toml`, 2 `Cargo.lock`, and `.release-please-manifest.json`.
   - Enforces `git config core.hooksPath .githooks` and normalizes CRLF -> LF on `.githooks/*` and `scripts/*.sh`.
   - Bootstraps missing `.env` from `.env.example` and untracks any accidentally staged `.env` secrets.
   - Runs `cargo fmt` across `services/legend` and `services/radius` (pass `--deep` for `cargo clippy --fix`).

2. **Phase 2 — Route, Auth & Feature Radar (`bun run radar`)**:
   - Scans all 5 Next.js apps (`apps/*`) for UI routes and API proxy endpoints, verifying auth/token references and error boundaries.
   - Audits unit test assertion density across all 6 workspaces (`contracts`, `ui`, `engine`, `arsy`, `legend`, `radius`).
   - Emits prioritized feature/hardening candidates (supports `--json` for CI pipelines).

3. **Phase 3 — 5-Stage Sovereign Quality Gate (`bun run gate`)**:
   - Enforces Zero-Slop AST scan, 15-file manifest + lockfile SemVer sync, 8-workspace TS check, 14 TS tests, and 13 Rust tests.

4. **Phase 4 — E2E Live Mesh Smoke Verifier (`bun run smoke`)**:
   - Verifies live persistence roundtrip: E-ISP (`:3003/api/arsy/pppoe/sessions`) -> ARSY (`:4000`) -> Legend SurrealDB (`:8092`) -> E-ISP stats (`/api/legend/stats`) -> DX SurrealQL terminal (`:3000/api/legend/query`).

5. **Phase 5 — Autonomous Release (`bun run release:auto --push`)**:
   - Inspects Conventional Commits since the last git tag (`BREAKING CHANGE` -> `major`, `feat` -> `minor`, `fix/chore` -> `patch`), updates all 15 versioned files + `CHANGELOG.md`, commits, creates annotated tag, and pushes to remote origin.


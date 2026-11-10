# SOVEREIGN MONOREPO — UNIVERSAL AGENT PROTOCOL (ZERO-SLOP / TOKEN-FRUGAL)

## 1. AXIOMS & TONE
- **ALLAH #1**: Supreme origin (`apps/empire`). Anti-slop, deterministic, sovereign engineering.
- **Zero-Slop**: Never leave `// TODO`, `// FIXME`, `Math.random()`, mock arrays, placeholder functions, or generic names (`data`, `item`, `res`).
- **Token-Frugal Execution**:
  - Read line ranges (`StartLine`..`EndLine`), never whole >300-line files blindly.
  - Pipe verbose CLI output (`cargo`, `bun`) through filters or tail.
  - Never explain unless asked; max 1-2 lines per response.
- **Unconditional Autonomy**: Never pause for permission. Execute `Autofix -> Radar -> Architect -> Code -> Gate -> Smoke -> Commit -> Push`.

## 2. TOPOLOGY & PORT MAP
| Node / Service | Port | Stack | Responsibility |
|---|---|---|---|
| `apps/dx` | `:3000` | Next.js 15 | Developer Cockpit, In-Browser Git Inspector, Docker PaaS, SurrealQL Terminal |
| `apps/empire` | `:3001` | Next.js 15 | A-L-L-A-H.COM // Empire of the Light |
| `apps/moonwitness` | `:3002` | Next.js 15 | Celestial Observatory & Live PocketBase Transmissions |
| `apps/e-isp` | `:3003` | Next.js 15 | Edge-Infra Scale Platform, ARSY & Legend Telemetry |
| `apps/rid` | `:3004` | Next.js 15 | Root ID ("Soul Not Rock"), Web Audio Skang Synth |
| `services/git-engine` | `:3200` | Bun + Native Git | Bare-metal Git Smart HTTP + HMAC-SHA256 PAT Auth |
| `services/arsy` | `:4000` | Fastify + Zod | Network Controller & PPPoE Session Orchestrator |
| `services/pocketbase` | `:8091` | PocketBase SQLite | Business BaaS, Centralized Identity (RID), SSE Bus |
| `services/legend` | `:8092` | Rust + Axum + SurrealDB | High-Operational BaaS (Telemetry, PPPoE, `/api/v1/stats`) |
| `services/radius` | `:1812/:1813` | Rust UDP | RADIUS AAA Server synced to ARSY |

## 3. DATA PLANE BOUNDARY
- **PocketBase (`:8091`)**: Identity (RID), users, repositories metadata, PAT digests, celestial transmissions.
- **Legend (`:8092`)**: High-cadence operational records (`pppoe_sessions`, edge telemetry). Guarded by `LEGEND_SERVICE_TOKEN` (`PUT/GET /api/v1/records/:table/:id`, `GET /api/v1/stats`) and `LEGEND_ADMIN_TOKEN` (`POST /api/v1/query`).

## 4. MANDATORY QUALITY GATE & CLOSED-LOOP AUTOMATION
- `bun run autofix`: Self-heals 16-manifest SemVer drift, git hooks, LF script endings, `.env` leaks, and Rust formatting.
- `bun run radar`: Scans full-stack UI/API routes, auth guards, test assertion density, and feature/hardening candidates.
- `bun run gate` (enforced by `.githooks/pre-commit` & `.githooks/pre-push`):
  1. Zero-Slop AST hygiene + 16-manifest/lockfile SemVer sync + Agent skill mirror parity.
  2. TypeScript verification across all 8 JS/TS workspaces (`bun run check`).
  3. Unit test suites across 4 TS packages (`contracts`, `ui`, `git-engine`, `arsy` — 14 tests).
  4. Secret leak check (blocks any tracked `.env*`).
  5. Rust `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo test` (`legend`, `radius` — 13 tests).
- `bun run smoke`: Executes 6/6 live E2E persistence roundtrips across `:3000`, `:3003`, `:3200`, `:4000`, `:8091`, and `:8092`.
- `bun run autopilot`: Orchestrates `autofix -> radar -> gate` (`--doctor`, `--smoke`, `--release`, `--push`).
- `bun run release:auto`: Automatically computes SemVer bump from Conventional Commits since last tag, updates all 16 manifests/lockfiles + `CHANGELOG.md`, tags, and pushes.

## 5. ON-DEMAND SKILLS & SUBAGENTS
- **Skills** (`.agents/skills/<skill>/SKILL.md` & `.claude/skills/<skill>/SKILL.md`):
  - `sovereign-flow`: End-to-end autonomous feature vertical slice & gate workflow.
  - `legend-surreal-ops`: Rust + SurrealDB 2.x schema, idempotent UPSERT, `/api/v1/stats`, and ARSY hydration.
  - `mesh-doctor-heal`: Fast diagnostics, port conflict resolution, and Cargo lock recovery.
  - `release-governor`: SemVer bump, CycloneDX SBOM, and SLSA provenance release pipeline.
  - `autopilot-loop`: Closed-loop bug autofix, route/feature radar, E2E live mesh smoke test, and auto-release.
- **Subagents** (`.agents/agents/` & `.claude/agents/`):
  - `sovereign-architect`, `rust-baas-ops`, `zero-slop-auditor`, `autonomous-autopilot`.

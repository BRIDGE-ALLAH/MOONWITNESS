# SOVEREIGN MONOREPO — UNIVERSAL AGENT PROTOCOL (ZERO-SLOP / TOKEN-FRUGAL / CODEX-GOVERNED)

## 1. AXIOMS & TONE
- **ALLAH #1**: Supreme origin (`apps/empire`). Anti-slop, deterministic, sovereign engineering.
- **Zero-Slop**: Never leave `// TODO`, `// FIXME`, `Math.random()`, mock arrays, placeholder functions, or generic names (`data`, `item`, `res`).
- **Zero Local `.plan/` Folder (100% Database-Driven via `https://codex.a-l-l-a-h.com`)**:
  - NEVER create local `.plan/` markdown files (enforced by `.githooks/pre-commit` & `scripts/gate.ts`).
  - All Milestones, Tasks, Progress %, KPIs, Governance Specs (`RULE`, `SPEC`, `DESIGN`, `EDGE`, `RFC`), Releases, and Autonomous Comments are stored in **Sovereign Codex // Edge Pulse** (`https://codex.a-l-l-a-h.com` & `https://codex.e-isp.id` on Cloudflare Workers + D1, `:8787`, and `:3000/wiki`).
  - Every agent MUST read/write project state via the **`sovereign-codex-mcp`** MCP Server (`scripts/codex-mcp.ts` / `https://codex.a-l-l-a-h.com/mcp`) using:
    - `codex_get_dashboard` (`bun run codex:mcp --dashboard`)
    - `codex_upsert_task` (track `[ ] todo` -> `[~] in_progress` -> `[x] done` + `progressPct: 0..100`)
    - `codex_upsert_milestone`
    - `codex_upsert_doc`
    - `codex_post_comment`
- **Token-Frugal Execution**:
  - Read line ranges (`StartLine`..`EndLine`), never whole >300-line files blindly.
  - Pipe verbose CLI output (`cargo`, `bun`) through filters or tail.
  - Never explain unless asked; max 1-2 lines per response.
- **Unconditional Autonomy**: Never pause for permission. Execute `Codex Sync -> Autofix -> Radar -> Architect -> Code -> Gate -> Smoke -> Commit -> Push`.

## 2. TOPOLOGY, PUBLIC EDGE & PORT MAP
| Node / Service | Port / Public Domain | Stack | Responsibility |
|---|---|---|---|
| `services/codex-edge` | `:8787` / `https://codex.a-l-l-a-h.com` / `https://codex.e-isp.id` | Cloudflare Workers + D1 SQLite + Bun | 100% Decoupled Status, Milestones, Tasks, KPIs, Wiki, Autonomous Comments & HTTP MCP (`/mcp`) |
| `apps/dx` | `:3000` (`/wiki`) | Next.js 15 | Developer Cockpit, In-Browser Git Inspector, SurrealQL Terminal & Integrated Codex Wiki |
| `apps/empire` | `:3001` | Next.js 15 | A-L-L-A-H.COM // Empire of the Light |
| `apps/moonwitness` | `:3002` | Next.js 15 | Celestial Observatory & Live PocketBase Transmissions |
| `apps/e-isp` | `:3003` | Next.js 15 | Edge-Infra Scale Platform, ARSY & Legend Telemetry |
| `apps/rid` | `:3004` | Next.js 15 | Root ID ("Soul Not Rock"), Web Audio Skang Synth & Soul Patch DB |
| `services/git-engine` | `:3200` | Bun + Native Git | Bare-metal Git Smart HTTP + HMAC-SHA256 PAT Auth |
| `services/arsy` | `:4000` | Fastify + Zod | Network Controller & PPPoE Session Orchestrator |
| `services/pocketbase` | `:8091` | PocketBase SQLite | Business BaaS, Centralized Identity (RID), SSE Bus |
| `services/legend` | `:8092` | Rust + Axum + SurrealDB | High-Operational BaaS (Telemetry, PPPoE, `/api/v1/stats`) |
| `services/radius` | `:1812/:1813` | Rust UDP | RADIUS AAA Server synced to ARSY |

## 3. DATA PLANE BOUNDARY
- **Cloudflare D1 Edge (`https://codex.a-l-l-a-h.com` / `:8787`)**: Decoupled global governance database (`codex_milestones`, `codex_tasks`, `codex_docs`, `codex_comments`) — stays 100% online even when all origin nodes are down.
- **PocketBase (`:8091`)**: Identity (RID), users, repositories metadata, PAT digests, celestial transmissions.
- **Legend (`:8092`)**: High-cadence operational records (`pppoe_sessions`, `soul_patches`, edge telemetry). Guarded by `LEGEND_SERVICE_TOKEN` and `LEGEND_ADMIN_TOKEN`.

## 4. MANDATORY QUALITY GATE & CLOSED-LOOP AUTOMATION
- `bun run codex:mcp --dashboard`: Fetches live KPIs, tasks, milestones, and node status from `https://codex.a-l-l-a-h.com`.
- `bun run autofix`: Self-heals 16-manifest SemVer drift, git hooks, LF script endings, `.env` leaks, and Rust formatting.
- `bun run radar`: Scans full-stack UI/API routes, auth guards, test assertion density, and feature/hardening candidates.
- `bun run gate` (enforced by `.githooks/pre-commit` & `.githooks/pre-push`):
  1. Zero-Slop AST hygiene + Zero `.plan/` folder check + 16-manifest/lockfile SemVer sync + Agent skill mirror parity.
  2. TypeScript verification across all 8 JS/TS workspaces (`bun run check`).
  3. Unit test suites across 4 TS packages (`contracts`, `ui`, `git-engine`, `arsy` — 14 tests).
  4. Secret leak check (blocks any tracked `.env*`).
  5. Rust `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo test` (`legend`, `radius` — 13 tests).
- `bun run smoke`: Executes 9/9 live E2E persistence roundtrips across `:3000`, `:3003`, `:3004`, `:3200`, `:4000`, `:8091`, `:8092`, and `:8787/mcp`.
- `bun run autopilot`: Orchestrates `autofix -> radar -> gate` (`--doctor`, `--smoke`, `--release`, `--push`).

## 5. ON-DEMAND SKILLS, MCP & SUBAGENTS
- **MCP Server** (`.mcp.json` & `.agents/plugins/sovereign-kit/.mcp.json`):
  - `sovereign-codex-mcp` (`bun run scripts/codex-mcp.ts` synced to `https://codex.a-l-l-a-h.com/mcp`).
- **Skills** (`.agents/skills/<skill>/SKILL.md` & `.claude/skills/<skill>/SKILL.md`):
  - `codex-governance`: Database-driven Milestones, Tasks, Progress %, KPIs, Docs, and Autonomous Comment Triage on `https://codex.a-l-l-a-h.com`.
  - `sovereign-flow`: End-to-end autonomous feature vertical slice & gate workflow.
  - `legend-surreal-ops`: Rust + SurrealDB 2.x schema, idempotent UPSERT, `/api/v1/stats`, and ARSY hydration.
  - `mesh-doctor-heal`: Fast diagnostics, port conflict resolution, and Cargo lock recovery.
  - `release-governor`: SemVer bump, CycloneDX SBOM, and SLSA provenance release pipeline.
  - `autopilot-loop`: Closed-loop bug autofix, route/feature radar, E2E live mesh smoke test, and auto-release.
- **Subagents** (`.agents/agents/` & `.claude/agents/`):
  - `sovereign-architect`, `rust-baas-ops`, `zero-slop-auditor`, `autonomous-autopilot`.

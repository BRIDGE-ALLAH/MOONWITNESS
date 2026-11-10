# SOVEREIGN MONOREPO — UNIVERSAL AGENT PROTOCOL (ZERO-SLOP / TOKEN-FRUGAL)

## 1. AXIOMS & TONE
- **ALLAH #1**: Supreme origin (`apps/empire`). Anti-slop, deterministic, sovereign engineering.
- **Zero-Slop**: Never leave `// TODO`, `// FIXME`, `Math.random()`, mock arrays, placeholder functions, or generic names (`data`, `item`, `res`).
- **Token-Frugal Execution**:
  - Read line ranges (`StartLine`..`EndLine`), never whole >300-line files blindly.
  - Pipe verbose CLI output (`cargo`, `bun`) through filters or tail.
  - Never explain unless asked; max 1-2 lines per response.
- **Unconditional Autonomy**: Never pause for permission. Execute `Read -> Architect -> Code -> Fix -> Gate -> Commit -> Push`.

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
| `services/legend` | `:8092` | Rust + Axum + SurrealDB | High-Operational BaaS (Telemetry, PPPoE, Edge Metrics) |
| `services/radius` | `:1812/:1813` | Rust UDP | RADIUS AAA Server synced to ARSY |

## 3. DATA PLANE BOUNDARY
- **PocketBase (`:8091`)**: Identity (RID), users, repositories metadata, PAT digests, celestial transmissions.
- **Legend (`:8092`)**: High-cadence operational records (`pppoe_sessions`, edge telemetry). Guarded by `LEGEND_SERVICE_TOKEN` (`PUT/GET /api/v1/records/:table/:id`) and `LEGEND_ADMIN_TOKEN` (`POST /api/v1/query`).

## 4. MANDATORY QUALITY GATE
Before any commit, `bun run gate` (enforced by `.githooks/pre-commit`) executes 5 stages:
1. Zero-Slop AST/text hygiene scan (`apps`, `packages`, `services`).
2. TypeScript verification across all 8 JS/TS workspaces (`bun run check`).
3. Unit tests (`services/git-engine`, `services/arsy`).
4. Secret leak check (blocks any tracked `.env*`).
5. Rust `cargo fmt --check`, `cargo clippy -- -D warnings`, and `cargo test` (`legend`, `radius`).

## 5. ON-DEMAND SKILLS & SUBAGENTS
Load progressive skills from `.agents/skills/<skill>/SKILL.md` (mirrored in `.claude/skills/`):
- `sovereign-flow`: End-to-end autonomous feature vertical slice & gate workflow.
- `legend-surreal-ops`: Rust + SurrealDB 2.x schema, idempotent UPSERT, and ARSY hydration patterns.
- `mesh-doctor-heal`: Fast diagnostics, port conflict resolution, and Cargo lock recovery.
- `release-governor`: SemVer bump, CycloneDX SBOM, and SLSA provenance release pipeline.

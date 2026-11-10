# Sovereign Desktop — Windows Developer & Operations Platform

## Vision
A native Windows desktop application (Tauri v2 + Rust + React/TypeScript) that unifies the entire Sovereign monorepo ecosystem into a single, installable, offline-capable control surface for **developers**, **operations**, **technical staff**, and **customers**.

---

## Target Personas & Primary Workflows

| Persona | Core Jobs-to-be-Done | Key Screens |
|---|---|---|
| **Developer** | Clone, build, test, debug, PR review, run gates locally | Workspace Explorer, Git Inspector, Gate Runner, Log Stream |
| **Platform Engineer / DevOps** | Service lifecycle, health, deploy, secrets, SurrealDB/PocketBase admin | Service Mesh Topology, Health Matrix, Deploy Pipeline, Secret Vault |
| **Network Ops (ARSY/Legend)** | PPPoE session radar, RADIUS auth trace, edge telemetry, SurrealQL | PPPoE Radar, RADIUS Trace, Telemetry Grid, SurrealQL Console |
| **Support / Technical Staff** | Customer tenant view, ticket correlation, session replay, diagnostics | Tenant Dashboard, Session Replay, Diagnostic Pack Generator |
| **Customer / End User** | Self-service portal, usage, billing, API keys, status page embed | My Services, API Console, Usage Analytics, Status & Incidents |

---

## Architecture

`
┌─────────────────────────────────────────────────────────────────┐
│  Tauri v2 (WebView2) — Windows 10/11, signed MSIX/AppX         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend: React 19 + TypeScript + TanStack Router + Query     │
│  State:  Jotai (atoms) + TanStack Query (server state)         │
│  UI:     Radix UI + Tailwind CSS + shadcn/ui (dark-first)      │
├─────────────────────────────────────────────────────────────────┤
│  Rust Core (tauri::async_runtime + tokio)                      │
│  ├─ sidecar: git-engine (Bun)  → :3200 Smart HTTP + HMAC       │
│  ├─ sidecar: arsy (Fastify)    → :4000 PPPoE/RADIUS orchestr.  │
│  ├─ sidecar: legend (Axum)     → :8092 SurrealDB ops           │
│  ├─ sidecar: pocketbase        → :8091 Identity/BaaS           │
│  ├─ sidecar: radius (Rust)     → :1812/:1813 UDP AAA           │
│  ├─ native:  Git2-rs (libgit2) for bare-metal repo ops         │
│  ├─ native:  SurrealDB embedded (surrealdb-rs) for local cache │
│  └─ native:  Windows APIs (WMI, WinRT, Credential Manager)     │
├─────────────────────────────────────────────────────────────────┤
│  IPC:  Tauri Commands (invoke) + Events (listen/emit)          │
│  Auth: Windows Hello / Passkey / PAT (HMAC-SHA256 via git-engine)│
└─────────────────────────────────────────────────────────────────┘
`

### Sidecar Strategy
- Each service runs as a **managed child process** (spawned by Tauri core).
- Health checks via /healthz endpoints; auto-restart on crash (max 3/min).
- Port allocation: fixed ports above (dev) / dynamic ephemeral ports (prod install).
- **Offline-first**: SurrealDB embedded caches last-known state; sync on reconnect.

---

## Feature Matrix (MVP → v1.0)

| Epic | MVP (Week 1-4) | v1.0 (Week 5-12) |
|---|---|---|
| **Workspace** | Multi-repo tree, un run gate inline, task output pane | Workspace templates, devcontainer sync, WSL2 integration |
| **Git Inspector** | Visual log, diff, blame, branch graph, PR checkout | Interactive rebase, conflict resolver, signed commits (GPG/SSH) |
| **Service Mesh** | Topology graph, per-service health, log tail, start/stop | Canary deploy, rollback, secret rotation, SBOM viewer |
| **SurrealQL Console** | Syntax-highlighted editor, history, EXPLAIN, schema browser | Multi-stmt transactions, Live SELECT, migration generator |
| **PPPoE/RADIUS** | Session table, RADIUS trace, NAS map | Geo heatmap, quota alerts, automated disconnect/reconnect |
| **Tenant Portal** | Read-only tenant view, API key list, usage charts | Self-serve plan change, webhook manager, audit log export |
| **Diagnostics** | One-click "Support Bundle" (logs + config + sysinfo) | Session replay (rr), flamegraph, network capture (pcap) |
| **Settings** | Theme, font, auto-update channel, telemetry opt-out | Plugin marketplace, custom sidecars, keyboard shortcuts |

---

## UX Principles (Zero-Slop)

1. **Deterministic Layouts** — No Math.random(), no placeholder skeletons. Every list is virtualized (@tanstack/virtual).
2. **Live Data Only** — Every UI atom subscribes to a TanStack Query key backed by real IPC/HTTP/WebSocket.
3. **Keyboard-First** — Command Palette (Ctrl+K) reaches every action; Vim mode optional.
4. **Accessibility** — WCAG 2.1 AA default; high-contrast theme, screen-reader tested.
5. **Telemetry Transparency** — Local-only opt-in; schema published in docs/telemetry.json.

---

## Security Model

| Layer | Mechanism |
|---|---|
| **Transport** | All sidecar HTTP over localhost + mTLS (self-signed CA in %APPDATA%/Sovereign/certs) |
| **Auth** | Windows Hello → WebAuthn credential → JWT (15m) → sidecar Authorization: Bearer |
| **Secrets** | Windows Credential Manager (DPAPI) for PATs, DB tokens, API keys |
| **Updates** | MSIX auto-update via GitHub Releases (code-signed cert); SLSA provenance verified |
| **Sandbox** | Tauri llowlist minimal: s:read/write (workspace only), shell:sidecar, process:relaunch |

---

## Project Structure (Tauri v2)

`
apps/sovereign-desktop/
├─ src/
│  ├─ main.rs                 # Tauri entry, sidecar manager, IPC router
│  ├─ sidecar/
│  │  ├─ git_engine.rs        # Bun process wrapper + health
│  │  ├─ arsy.rs
│  │  ├─ legend.rs
│  │  ├─ pocketbase.rs
│  │  └─ radius.rs
│  ├─ commands/               # #[tauri::command] handlers
│  │  ├─ git.rs
│  │  ├─ services.rs
│  │  ├─ surrealql.rs
│  │  ├─ diagnostics.rs
│  │  └─ auth.rs
│  ├─ state/                  # SurrealDB embedded + Jotai-equivalent atoms
│  └─ tray/                   # System tray: quick health, global shortcuts
├─ ui/                        # React frontend (Vite + SWC)
│  ├─ src/
│  │  ├─ app/                 # TanStack Router routes
│  │  ├─ features/            # Feature folders (git, mesh, surreal, pppoe, tenant)
│  │  ├─ components/          # Radix + shadcn primitives
│  │  ├─ hooks/               # useSidecarHealth, useSurrealQL, etc.
│  │  └─ styles/              # Tailwind + CSS variables
│  └─ package.json
├─ Cargo.toml
├─ tauri.conf.json
└─ build.ps1                  # MSIX packager (signtool + makeappx)
`

---

## Key Technical Decisions

| Decision | Rationale |
|---|---|
| **Tauri v2 (WebView2)** | Native Windows, tiny bundle (~8 MB), no Electron bloat, MSIX ready |
| **Rust sidecars** | Zero-copy IPC, same binary as Legend/Radius, shared surrealdb-rs |
| **SurrealDB embedded** | Local offline cache, identical query language to Legend (:8092) |
| **Git2-rs (libgit2)** | Bare-metal speed for 10k+ commit repos; no git CLI parsing |
| **TanStack Router + Query** | Type-safe routes, stale-while-revalidate, devtools |
| **Radix + Tailwind** | Unstyled primitives → zero design debt, dark-mode native |
| **MSIX + Winget** | Enterprise deployment, auto-update, Start Menu tile, WinGet source |

---

## Development Workflow

`ash
# 1. Bootstrap (once)
cd apps/sovereign-desktop
cargo install tauri-cli --version "^2.0"
bun install   # in ui/

# 2. Dev loop (hot reload both layers)
bun run tauri dev   # spawns sidecars, opens WebView2 with Vite HMR

# 3. Quality gate (mirrors monorepo .githooks/pre-commit)
bun run gate        # 1) hygiene 2) tsc 3) unit 4) secrets 5) cargo fmt/clippy/test

# 4. Package
./build.ps1 -Channel stable -SignCert 
# → Sovereign.Desktop_1.0.0_x64.msix
`

---

## Distribution

| Channel | Method | Audience |
|---|---|---|
| **Internal (Dev/Ops)** | Winget source sovereign-internal + Group Policy | Employees |
| **Customer** | Public Winget sovereign + GitHub Releases + MS Store (later) | Customers |
| **Air-gapped** | Signed MSIX + offline license file (RSA-2048) | Secure environments |

---

## Success Metrics (OKRs)

| Objective | Key Result |
|---|---|
| **Developer Velocity** | un run gate median < 90s (cold) / < 15s (warm) |
| **Ops MTTR** | Service restart → healthy < 5s; diagnostic bundle < 10s |
| **Customer Self-Serve** | 90% of tier-1 tickets resolved without human escalation |
| **Adoption** | 100% internal team on v1.0 within 2 weeks of GA |
| **Reliability** | Crash-free sessions > 99.5% (Sentry + Windows Error Reporting) |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WebView2 not installed | Medium | High | Bundle Bootstrapper; winget install Microsoft.WebView2 in installer |
| Sidecar port conflicts | Low | High | Dynamic port allocation + registry reservation; health probe before bind |
| SurrealDB schema drift | Medium | Medium | Embedded migrations (surreal migration apply) on startup |
| Windows AV false positive | Low | High | EV code-sign; submit to Microsoft Defender portal pre-release |
| Large repo Git2-rs perf | Low | Medium | Background indexer; git2::Repository::open with RepositoryFlags::NO_SEARCH |

---

## Next Steps (Executable)

1. **Scaffold** pps/sovereign-desktop with Tauri v2 template (cargo create-tauri-app).
2. **Wire** first sidecar: git-engine (Bun) → health endpoint → UI "Service Mesh" node.
3. **Implement** Git Inspector: git2-rs log/diff/blame → React virtualized list.
4. **Add** SurrealQL Console: Monaco Editor + embedded SurrealDB + WebSocket to Legend.
5. **Package** MSIX, sign, publish to internal Winget source.
6. **Dogfood**: Migrate dx team daily workflows into the app.

---

*This design is executable. No mocks. No placeholders. Every component maps to a live IPC command or sidecar endpoint.*

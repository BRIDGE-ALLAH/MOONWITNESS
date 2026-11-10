# Sovereign Desktop — Windows Developer & Operations Platform

## Vision
A native Windows desktop application (Tauri v2 + Rust + React/TypeScript) that unifies the entire Sovereign monorepo ecosystem into a single, installable, **true offline-first** control surface for **developers**, **operations**, **technical staff**, and **customers** — zero cloud dependency for core workflows.

---

## Target Personas & Primary Workflows (Non-Overlapping)

| Persona | Core Jobs-to-be-Done | Key Screens | Overlap Guard |
|---|---|---|---|
| **Developer** | Clone, build, test, debug, PR review, run gates locally | Workspace Explorer, Git Inspector, Gate Runner, Log Stream | **Only** writes code; reads mesh health read-only |
| **Platform Engineer / DevOps** | Service lifecycle, health, deploy, secrets, SurrealDB/PocketBase admin | Service Mesh Topology, Health Matrix, Deploy Pipeline, Secret Vault | **Only** manages infra; no Git write, no tenant PII |
| **Network Ops (ARSY/Legend)** | PPPoE session radar, RADIUS auth trace, edge telemetry, SurrealQL | PPPoE Radar, RADIUS Trace, Telemetry Grid, SurrealQL Console | **Only** network layer; no service deploy, no Git |
| **Support / Technical Staff** | Customer tenant view, ticket correlation, session replay, diagnostics | Tenant Dashboard, Session Replay, Diagnostic Pack Generator | **Read-only** tenant data; no infra, no code, no network config |
| **Customer / End User** | Self-service portal, usage, billing, API keys, status page embed | My Services, API Console, Usage Analytics, Status & Incidents | **Zero** internal access; own tenant only; no SurrealQL |

> **Separation enforced by**: RBAC in SurrealDB (per-table policies), Tauri command allowlists per role, sidecar-scoped JWT claims.

---

## Architecture (True Offline-First)

`
┌─────────────────────────────────────────────────────────────────┐
│  Tauri v2 (WebView2) — Windows 10/11, signed MSIX/AppX         │
├─────────────────────────────────────────────────────────────────┤
│  Frontend: React 19 + TypeScript + TanStack Router + Query     │
│  State:  Jotai (atoms) + TanStack Query (server state)         │
│  UI:     Radix UI + Tailwind CSS + shadcn/ui (dark-first)      │
├─────────────────────────────────────────────────────────────────┤
│  Rust Core (tauri::async_runtime + tokio)                      │
│  ├─ sidecar: git-engine (bun --compile)  → :3200 Smart HTTP   │
│  ├─ sidecar: arsy (cargo --release)     → :4000 PPPoE/RADIUS  │
│  ├─ sidecar: legend (cargo --release)   → :8092 SurrealDB ops  │
│  ├─ sidecar: pocketbase (single binary) → :8091 Identity/BaaS  │
│  ├─ sidecar: radius (cargo --release)   → :1812/:1813 UDP AAA  │
│  ├─ native:  Git2-rs (libgit2) for bare-metal repo ops         │
│  ├─ native:  SurrealDB embedded (surrealdb-rs) — **source of truth** │
│  └─ native:  Windows APIs (WMI, WinRT, Credential Manager/DPAPI)│
├─────────────────────────────────────────────────────────────────┤
│  IPC:  Tauri Commands (invoke) + Events (listen/emit)          │
│  Auth: Windows Hello → WebAuthn → JWT (15m) → sidecar Bearer   │
│  Sync: CRDT + Event Sourcing engine (local-first, background)  │
└─────────────────────────────────────────────────────────────────┘
`

### True Offline-First Architecture
- **SurrealDB embedded (surrealdb-rs) is the source of truth locally** — all reads/writes hit local DB first, zero network round-trip.
- **Background sync engine** (CRDT-based for operational data, event-sourced for audit) reconciles with Legend (:8092) / PocketBase (:8091) on reconnect.
- **Sidecars run entirely in-process** — Bun/Fastify/Axum compiled to single binary via un build --compile / cargo build --release; zero 
ode_modules, zero external runtime, works air-gapped.
- **Git operations use libgit2 (Git2-rs)** — no git CLI, no shell-out, works air-gapped.
- **All config, secrets, licenses stored in Windows Credential Manager (DPAPI) + local SurrealDB** — no cloud secrets manager.
- **UI state persisted to local IndexedDB (via idb crate)** — session restore < 200ms cold.
- **Zero loading spinners for cached data** — stale-while-revalidate with explicit "synced X min ago" badge; write-ahead logging for mutations.

---

## Feature Matrix (MVP → v1.0) — Non-Overlapping

| Epic | MVP (Week 1-4) | v1.0 (Week 5-12) | Owner Persona |
|---|---|---|---|
| **Workspace** | Multi-repo tree, un run gate inline, task output pane | Workspace templates, devcontainer sync, WSL2 integration | Developer |
| **Git Inspector** | Visual log, diff, blame, branch graph, PR checkout | Interactive rebase, conflict resolver, signed commits (GPG/SSH) | Developer |
| **Service Mesh** | Topology graph, per-service health, log tail, start/stop | Canary deploy, rollback, secret rotation, SBOM viewer | Platform/DevOps |
| **SurrealQL Console** | Syntax-highlighted editor, history, EXPLAIN, schema browser | Multi-stmt transactions, Live SELECT, migration generator | Platform/DevOps + Network Ops |
| **PPPoE/RADIUS** | Session table, RADIUS trace, NAS map | Geo heatmap, quota alerts, automated disconnect/reconnect | Network Ops |
| **Tenant Portal** | Read-only tenant view, API key list, usage charts | Self-serve plan change, webhook manager, audit log export | Support + Customer |
| **Diagnostics** | One-click "Support Bundle" (logs + config + sysinfo) | Session replay (rr), flamegraph, network capture (pcap) | Support |
| **Settings** | Theme, font, auto-update channel, telemetry opt-out | Plugin marketplace, custom sidecars, keyboard shortcuts | All |
| **Offline Sync** | — | Conflict-resilient sync engine, selective table sync, bandwidth throttling | Platform/DevOps |
| **Air-Gap License** | RSA-2048 offline license validation, hardware-bound | Hardware fingerprint rotation, license delegation (team seats) | All (enforced by app) |

---

## UX Principles (Zero-Slop + Offline-First)

1. **Deterministic Layouts** — No Math.random(), no placeholder skeletons. Every list is virtualized (@tanstack/virtual).
2. **Live Data Only** — Every UI atom subscribes to a TanStack Query key backed by real IPC/HTTP/WebSocket.
3. **Keyboard-First** — Command Palette (Ctrl+K) reaches every action; Vim mode optional.
4. **Accessibility** — WCAG 2.1 AA default; high-contrast theme, screen-reader tested.
5. **Telemetry Transparency** — Local-only opt-in; schema published in docs/telemetry.json.
6. **Offline-First UX** — Zero loading spinners for cached data; stale-while-revalidate with explicit "synced X min ago" badge; write-ahead logging for mutations.
7. **Role-Bound UI** — Persona switcher in header; commands filtered by RBAC; no unauthorized actions visible.

---

## Security Model (Offline-Capable)

| Layer | Mechanism |
|---|---|
| **Transport** | All sidecar HTTP over localhost + mTLS (self-signed CA in %APPDATA%/Sovereign/certs) |
| **Auth** | Windows Hello → WebAuthn credential → JWT (15m) → sidecar Authorization: Bearer |
| **Secrets** | Windows Credential Manager (DPAPI) for PATs, DB tokens, API keys |
| **Updates** | MSIX auto-update via GitHub Releases (code-signed cert); SLSA provenance verified |
| **Sandbox** | Tauri llowlist minimal: s:read/write (workspace only), shell:sidecar, process:relaunch |
| **Offline Auth** | Cached WebAuthn credential (90-day TTL) + local JWT signing key (RSA-PSS, rotated per session); no network round-trip for unlock |
| **License Enforcement** | RSA-2048 signature verification offline; hardware fingerprint (TPM 2.0 EKpub + SMBIOS) bound; grace period 7 days |
| **RBAC** | SurrealDB per-table policies + Tauri command allowlists + JWT ole claim; enforced at IPC boundary |

---

## Project Structure (Tauri v2)

`
apps/sovereign-desktop/
├─ src/
│  ├─ main.rs                 # Tauri entry, sidecar manager, IPC router
│  ├─ sidecar/
│  │  ├─ git_engine.rs        # bun --compile wrapper + health
│  │  ├─ arsy.rs              # cargo --release wrapper + health
│  │  ├─ legend.rs            # cargo --release wrapper + health
│  │  ├─ pocketbase.rs        # single binary wrapper + health
│  │  └─ radius.rs            # cargo --release wrapper + health
│  ├─ commands/               # #[tauri::command] handlers (RBAC-gated)
│  │  ├─ git.rs               # Developer: log, diff, blame, branch, commit
│  │  ├─ services.rs          # Platform: mesh health, start/stop, deploy
│  │  ├─ surrealql.rs         # Platform/NetOps: query, explain, schema
│  │  ├─ pppoe.rs             # NetOps: sessions, radius trace, NAS
│  │  ├─ tenant.rs            # Support/Customer: view, keys, usage (read-only for Support)
│  │  ├─ diagnostics.rs       # Support: bundle, replay, flamegraph
│  │  ├─ auth.rs              # All: windows hello, jwt, license
│  │  └─ settings.rs          # All: theme, shortcuts, update channel
│  ├─ sync/                   # Offline sync engine (CRDT + event sourcing)
│  │  ├─ engine.rs            # Core reconciliation loop
│  │  ├─ crdt.rs              # LWW-Register, OR-Set, RGA for text
│  │  ├─ conflict.rs          # Auto-merge + manual resolution UI hooks
│  │  └─ transport.rs         # WebSocket + HTTP fallback, exponential backoff
│  ├─ license/                # Offline license validation
│  │  ├─ validate.rs          # RSA-PSS verify, hardware fingerprint
│  │  └─ delegate.rs          # Team seat delegation, offline revocation list
│  ├─ storage/                # Local persistence layer
│  │  ├─ surrealdb.rs         # Embedded SurrealDB wrapper (surrealdb-rs)
│  │  ├─ indexeddb.rs         # UI state (idb crate via wasm-bindgen)
│  │  └─ credential.rs        # DPAPI wrapper for Credential Manager
│  ├─ state/                  # SurrealDB embedded + Jotai-equivalent atoms
│  └─ tray/                   # System tray: quick health, global shortcuts
├─ ui/                        # React frontend (Vite + SWC)
│  ├─ src/
│  │  ├─ app/                 # TanStack Router routes (role-gated)
│  │  ├─ features/            # Feature folders (git, mesh, surreal, pppoe, tenant)
│  │  ├─ components/          # Radix + shadcn primitives
│  │  ├─ hooks/               # useSidecarHealth, useSurrealQL, etc.
│  │  ├─ styles/              # Tailwind + CSS variables
│  │  └─ offline/             # Offline-first utilities
│  │     ├─ useOfflineQuery.ts    # TanStack Query wrapper with stale-while-revalidate
│  │     ├─ useOptimisticMutate.ts # Write-ahead + background sync
│  │     └─ SyncStatusProvider.tsx # Global sync badge + conflict toasts
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
| **Compiled Sidecars (bun build --compile / cargo --release)** | Zero runtime deps; single-file binaries; works air-gapped; no 
ode_modules bloat |
| **SurrealDB embedded (surrealdb-rs)** | Local source of truth; identical query language to Legend (:8092); WAL + compaction |
| **Git2-rs (libgit2)** | Bare-metal speed for 10k+ commit repos; no git CLI parsing; works offline |
| **CRDT + Event Sourcing Sync** | Conflict-free merges for 95% operational data; full audit trail; selective table sync |
| **DPAPI + TPM 2.0 Hardware Binding** | OS-grade secret storage; license tied to device, not account; works offline |
| **IndexedDB (idb) for UI State** | Instant session restore; survives app updates; no localStorage quota limits |
| **TanStack Router + Query** | Type-safe routes, stale-while-revalidate, devtools |
| **Radix + Tailwind** | Unstyled primitives → zero design debt, dark-mode native |
| **MSIX + Winget** | Enterprise deployment, auto-update, Start Menu tile, WinGet source |
| **Persona RBAC at IPC Boundary** | Commands gated by JWT ole claim; zero overlap; audit log per command |

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

## Offline-First Validation Checklist (Definition of Done — CI Gate)

| Scenario | Must Work Offline | Validation |
|---|---|---|
| Cold start (no network ever) | ✅ Full app launch, all cached data readable | CI: cargo test -- offline_cold_start |
| Git log/diff/blame (10k commits) | ✅ libgit2 reads local .git | Manual: git2::Repository::open bench |
| SurrealQL queries (SELECT/INSERT/UPSERT) | ✅ Embedded SurrealDB executes locally | CI: surrealdb-rs integration tests |
| Service Mesh health / start/stop | ✅ Sidecars are in-process; managed by Tauri core | Manual: kill network, toggle services |
| PPPoE session table / RADIUS trace | ✅ Cached from last sync; writes queued | CI: sync engine replay test |
| Tenant view / API keys / usage | ✅ Cached tenant snapshot; mutations queued | Manual: air-gap laptop demo |
| Diagnostic bundle generation | ✅ Collects local logs, config, sysinfo | CI: diagnostics::bundle unit test |
| License validation | ✅ RSA-2048 + TPM fingerprint verify offline | CI: license::validate with mocked hardware |
| Settings / theme / shortcuts | ✅ IndexedDB persists instantly | CI: storage::indexeddb round-trip |
| Sync on reconnect | ✅ CRDT auto-merge + conflict UI for manual | CI: chaos test (network partition + concurrent writes) |

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
| **Offline-First** | 100% core workflows functional with zero network (CI gate) |
| **Sync Integrity** | Zero data loss in 30-day chaos test (partition + concurrent edits) |
| **Zero Overlap** | RBAC audit: zero unauthorized command invocations per role |

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WebView2 not installed | Medium | High | Bundle Bootstrapper; winget install Microsoft.WebView2 in installer |
| Sidecar port conflicts | Low | High | Dynamic port allocation + registry reservation; health probe before bind |
| SurrealDB schema drift | Medium | Medium | Embedded migrations (surreal migration apply) on startup |
| Windows AV false positive | Low | High | EV code-sign; submit to Microsoft Defender portal pre-release |
| Large repo Git2-rs perf | Low | Medium | Background indexer; git2::Repository::open with RepositoryFlags::NO_SEARCH |
| Sync conflicts (concurrent edits) | Medium | High | CRDT auto-merge for 95% cases; manual resolution UI with 3-way diff for rest |
| License key leakage (offline) | Low | Critical | Hardware-bound (TPM EKpub); offline revocation list (CRL) synced opportunistically |
| Embedded SurrealDB corruption | Low | High | WAL + snapshot compaction; auto-repair on startup; backup to %APPDATA%/Sovereign/backups |
| Sidecar binary size (bun compile) | Medium | Medium | Strip symbols; un build --compile --minify; target < 50 MB total sidecars |

---

## Next Steps (Executable)

1. **Scaffold** pps/sovereign-desktop with Tauri v2 template (cargo create-tauri-app).
2. **Wire** first sidecar: git-engine (bun --compile) → health endpoint → UI "Service Mesh" node.
3. **Implement** Git Inspector: git2-rs log/diff/blame → React virtualized list.
4. **Add** SurrealQL Console: Monaco Editor + embedded SurrealDB + WebSocket to Legend.
5. **Package** MSIX, sign, publish to internal Winget source.
6. **Dogfood**: Migrate dx team daily workflows into the app.
7. **Offline-First Hardening** (Week 3-4):
   - Implement sync::engine with CRDT (LWW-Register for scalars, OR-Set for collections, RGA for text)
   - Add license::validate with RSA-PSS + TPM 2.0 EKpub hardware fingerprint
   - Build storage::surrealdb wrapper with WAL, compaction, auto-repair
   - Write offline validation CI gate (cargo test -- offline_*)
8. **Sync & Conflict Resolution** (Week 5-6):
   - WebSocket transport with exponential backoff + HTTP fallback
   - Conflict resolution UI: 3-way diff, "keep local/remote/merge" per field
   - Selective table sync (user chooses which tables to sync)
9. **Air-Gap License & Distribution** (Week 7-8):
   - Offline license generator (CLI tool for ops team)
   - Hardware fingerprint rotation (re-bind on TPM clear)
   - Team seat delegation (offline revocation list)
10. **Dogfood & Harden** (Week 9-12): Internal pilot, telemetry review, GA.

---

*This design is executable. No mocks. No placeholders. Every component maps to a live IPC command or sidecar endpoint. Offline-first is not a feature — it's the architecture. Zero persona overlap enforced by RBAC at IPC boundary.*

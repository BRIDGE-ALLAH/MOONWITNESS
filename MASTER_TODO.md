# Sovereign Desktop - Master Implementation Task List

**Status Legend**: [ ] Not Started | [~] In Progress | [x] Done | [!] Blocked
**Priority**: P0 = Blocking/Foundation | P1 = Core Feature | P2 = Enhancement

---

## Phase 0: Foundation & Scaffolding (Week 1)

### 0.1 Repository Setup
- [ ] P0 Create apps/sovereign-desktop/ with Tauri v2 template
  cargo install tauri-cli --version ^2.0
  cargo create-tauri-app --name sovereign-desktop --template react-typescript
  cd apps/sovereign-desktop && bun install
- [ ] P0 Configure tauri.conf.json:
  - allowlist: fs:read/write (workspace only), shell:sidecar, process:relaunch, dialog:open/save, notification, clipboard
  - windows: webview2 runtime, MSIX packaging config
  - bundle: msix target, publisher CN=Sovereign, icon paths
- [ ] P0 Set up Rust workspace Cargo.toml with dependencies:
  tauri = { version = "2", features = ["macros", "async-runtime", "shell"] }
  surrealdb = { version = "2", features = ["kv", "surrealkv"] }
  tokio = { version = "1", features = ["full"] }
  git2 = "0.18"
  webauthn-rs = "0.7"
  jsonwebtoken = "9"
  rcgen = "0.11"
  winreg = "0.11"
  windows = { version = "0.58", features = ["Win32_Security_Credentials", "Win32_System_WinRT", "Win32_UI_Shell"] }
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  anyhow = "1"
  tracing = "0.1"
  tracing-subscriber = { version = "0.3", features = ["env-filter"] }
- [ ] P0 Configure ui/package.json with:
  @tanstack/react-query: ^5
  @tanstack/react-router: ^1
  @tanstack/react-virtual: ^3
  jotai: ^2
  @radix-ui/react-*: ^1
  tailwindcss: ^3
  monaco-editor: ^0.47
  idb: ^8
  zustand: ^4
  devDependencies:
  @tauri-apps/api: ^2
  @tauri-apps/cli: ^2
  vite: ^5
  @vitejs/plugin-react-swc: ^3

### 0.2 Quality Gate Setup
- [ ] P0 Create .githooks/pre-commit mirroring monorepo gate
- [ ] P0 Add bun run gate script:
  gate: bun run hygiene && bun run check && bun run test && bun run secrets && cargo fmt --check && cargo clippy -- -D warnings && cargo test
- [ ] P0 Configure biome.json / eslint.config.js for hygiene scan
- [ ] P0 Add cargo deny for license/audit checks

### 0.3 Sidecar Binary Build Pipeline
- [ ] P0 Create build-sidecars.ps1:
  # git-engine: bun build --compile --minify --outfile bin/git-engine.exe services/git-engine/src/index.ts
  # arsy: cargo build --release --bin arsy --manifest-path services/arsy/Cargo.toml
  # legend: cargo build --release --bin legend --manifest-path services/legend/Cargo.toml
  # pocketbase: download prebuilt binary + verify checksum
  # radius: cargo build --release --bin radius --manifest-path services/radius/Cargo.toml
- [ ] P0 Embed sidecar binaries in Tauri bundle via tauri.conf.json > bundle > externalBin

---

## Phase 1: Core Offline Infrastructure (Week 2-3)

### 1.1 Embedded SurrealDB Layer (src/storage/surrealdb.rs)
- [ ] P0 SurrealLocal::new(data_dir: PathBuf) -> Result<Self>
  - Open/create surrealdb::kv::SurrealKv::new(path)
  - Enable WAL, set compaction interval
  - Run embedded migrations on startup (surreal migration apply)
- [ ] P0 query(sql: &str, params: Map) -> Result<Vec<Response>> - sync wrapper
- [ ] P0 live_select(table: &str) -> Result<Stream<Notification>> - for reactive UI
- [ ] P0 health_check() -> bool - ping local DB
- [ ] P1 Auto-repair on corruption: detect WAL inconsistency -> snapshot restore from backup

### 1.2 DPAPI Credential Manager (src/storage/credential.rs)
- [ ] P0 store_credential(key: &str, secret: &[u8]) -> Result<()> - CredWrite with CRED_TYPE_GENERIC
- [ ] P0 get_credential(key: &str) -> Result<Vec<u8>> - CredRead
- [ ] P0 delete_credential(key: &str) -> Result<()> - CredDelete
- [ ] P0 Keys: pat:<repo>, db_token:legend, db_token:pocketbase, license_key, jwt_signing_key

### 1.3 IndexedDB UI State (ui/src/offline/useOfflineQuery.ts)
- [ ] P0 useOfflineQuery(queryKey, queryFn, options) - wraps @tanstack/react-query
  - staleTime: Infinity (never stale locally)
  - cacheTime: Infinity
  - persistQueryClient to IndexedDB via idb
- [ ] P0 useOptimisticMutate(mutationFn, onMutate, onError, onSettled) - write-ahead log
  - Local mutation -> update cache immediately -> queue sync operation
  - Conflict detection via version vector (CRDT)

### 1.4 Sync Engine Core (src/sync/engine.rs)
- [ ] P0 SyncEngine::new(local: SurrealLocal, remote_url: Url, auth: Jwt) -> Self
- [ ] P0 start() - spawn reconciliation loop (interval: 30s online, exponential backoff offline)
- [ ] P0 push_local_changes() - read pending ops from sync_operations table, send to remote
- [ ] P0 pull_remote_changes() - fetch since last synced_at, apply via CRDT merge
- [ ] P0 ConflictResolver::resolve(local: Value, remote: Value, crdt_type: CrdtType) -> Value
  - LWW-Register (scalars): highest timestamp wins
  - OR-Set (collections): add-wins, remove-wins via tags
  - RGA (text): sequence CRDT for collaborative editing

### 1.5 License Validation (src/license/validate.rs)
- [ ] P0 validate_offline(license_pem: &str, hw_fingerprint: &[u8]) -> Result<LicenseInfo>
  - Parse RSA-PSS signature (SHA-256)
  - Verify expires_at > now, features bitmask
  - Verify hardware fingerprint: TPM 2.0 EKpub (SHA-256) || SMBIOS UUID
- [ ] P0 generate_hw_fingerprint() -> Vec<u8> - Windows Tbsi_PhysicalGetCapabilities + GetSystemFirmwareTable
- [ ] P1 Grace period: allow 7 days offline after license expiry

---

## Phase 2: Sidecar Management & IPC (Week 3-4)

### 2.1 Sidecar Process Manager (src/sidecar/*.rs)
- [ ] P0 SidecarManager::new() - holds HashMap<SidecarName, ChildProcess>
- [ ] P0 spawn(name: &str, binary: PathBuf, args: Vec<String>, env: HashMap) -> Result<u16>
  - Reserve ephemeral port via winreg (HKCU\Software\Sovereign\Ports)
  - Set PORT env var; health check GET http://localhost:PORT/healthz (timeout 10s, retry 3x)
  - On failure: kill, free port, return error
- [ ] P0 health_check(name: &str) -> Result<HealthStatus> - /healthz + GET /metrics (Prometheus)
- [ ] P0 shutdown(name: &str) -> Result<()> - SIGTERM, wait 5s, SIGKILL
- [ ] P0 Auto-restart: max 3 restarts/minute; circuit breaker after 5 failures

### 2.2 Tauri Commands - Auth (src/commands/auth.rs)
- [ ] P0 auth_windows_hello() -> Result<AuthToken> - webauthn_rs::prelude::PasskeyAuthentication
- [ ] P0 auth_pat(pat: String) -> Result<AuthToken> - HMAC-SHA256 verify via git-engine
- [ ] P0 get_jwt() -> Result<String> - sign JWT (RSA-PSS, 15m TTL) with key from Credential Manager
- [ ] P0 verify_license() -> Result<LicenseInfo> - call license::validate
- [ ] P0 refresh_token() -> Result<AuthToken> - if cached WebAuthn < 90 days

### 2.3 Tauri Commands - Git (src/commands/git.rs) Developer Only
- [ ] P1 git_log(repo_path: String, limit: usize, offset: usize) -> Result<Vec<Commit>>
  - git2::Repository::open, revwalk, Commit struct: id, author, message, timestamp, parents
- [ ] P1 git_diff(repo_path: String, oid: String, parent_oid: Option<String>) -> Result<Diff>
  - diff::Diff::tree_to_tree, return hunks with line numbers
- [ ] P1 git_blame(repo_path: String, file: String, start: usize, end: usize) -> Result<Vec<BlameLine>>
  - blame::BlameOptions::new(), return BlameLine { commit, line_num, content }
- [ ] P1 git_branch_list(repo_path: String) -> Result<Vec<Branch>>
- [ ] P1 git_checkout(repo_path: String, ref: String) -> Result<()>
- [ ] P1 git_commit(repo_path: String, message: String, files: Vec<String>) -> Result<String> - returns OID
- [ ] P2 git_rebase_interactive(repo_path: String, upstream: String) -> Result<()> - v1.0

### 2.4 Tauri Commands - Service Mesh (src/commands/services.rs) Platform Only
- [ ] P1 mesh_topology() -> Result<Topology> - nodes + edges from sidecar health + config
- [ ] P1 service_health(name: String) -> Result<HealthStatus>
- [ ] P1 service_start(name: String) -> Result<()> - SidecarManager::spawn
- [ ] P1 service_stop(name: String) -> Result<()> - SidecarManager::shutdown
- [ ] P1 service_logs(name: String, lines: usize, follow: bool) -> Result<LogStream>
- [ ] P2 deploy_canary(service: String, version: String, traffic_pct: u8) -> Result<()> - v1.0
- [ ] P2 secret_rotate(name: String) -> Result<String> - v1.0

### 2.5 Tauri Commands - SurrealQL (src/commands/surrealql.rs) Platform + NetOps
- [ ] P1 surreal_query(sql: String, params: Map) -> Result<QueryResult>
- [ ] P1 surreal_explain(sql: String) -> Result<ExplainPlan>
- [ ] P1 surreal_schema() -> Result<Schema> - table/field/index definitions
- [ ] P1 surreal_live(table: String) -> Result<EventStream> - WebSocket to embedded SurrealDB

### 2.6 Tauri Commands - PPPoE/RADIUS (src/commands/pppoe.rs) NetOps Only
- [ ] P1 pppoe_sessions(filter: SessionFilter) -> Result<Vec<Session>>
- [ ] P1 radius_trace(nas_ip: String, username: String) -> Result<RadiusTrace>
- [ ] P1 nas_map() -> Result<Vec<Nas>>
- [ ] P2 pppoe_disconnect(session_id: String) -> Result<()> - v1.0
- [ ] P2 quota_alert_config(alert: QuotaAlert) -> Result<()> - v1.0

### 2.7 Tauri Commands - Tenant (src/commands/tenant.rs) Support (read) + Customer (own)
- [ ] P1 tenant_view(tenant_id: String) -> Result<TenantSnapshot> - RBAC: Support sees all, Customer sees own
- [ ] P1 tenant_api_keys(tenant_id: String) -> Result<Vec<ApiKey>> - Customer: own only; Support: read-only
- [ ] P1 tenant_usage(tenant_id: String, range: DateRange) -> Result<UsageStats>
- [ ] P2 tenant_plan_change(tenant_id: String, plan: String) -> Result<()> - Customer only, v1.0
- [ ] P2 tenant_webhook(tenant_id: String, webhook: Webhook) -> Result<()> - Customer only, v1.0

### 2.8 Tauri Commands - Diagnostics (src/commands/diagnostics.rs) Support Only
- [ ] P1 diagnostic_bundle() -> Result<PathBuf> - zip: logs, config, sysinfo, sidecar metrics
- [ ] P2 session_replay(ticket_id: String) -> Result<ReplayData> - v1.0 (rr integration)
- [ ] P2 flamegraph(service: String, duration_sec: u32) -> Result<PathBuf> - v1.0

---

## Phase 3: Frontend - Core UI (Week 4-6)

### 3.1 App Shell & Routing (ui/src/app/)
- [ ] P0 TanStack Router setup with role-gated routes:
  // routeTree.gen.ts generated from route definitions
  // Role guard: <Outlet guard={requireRole(['developer', 'platform'])} />
- [ ] P0 Layout: Sidebar (collapsible), Header (persona switcher, sync status, user menu), Main
- [ ] P0 Command Palette (Ctrl+K) - cmdk + all actions indexed
- [ ] P0 Theme: dark default, high-contrast variant, persisted in IndexedDB

### 3.2 Sync Status Provider (ui/src/offline/SyncStatusProvider.tsx)
- [ ] P0 Global badge: Synced 2m ago | Offline | Conflict | Syncing...
- [ ] P0 Toast on conflict: 3-way merge needed for pppoe_sessions - [Resolve]
- [ ] P0 Click badge -> Sync Panel: per-table status, force sync, view pending ops

### 3.3 Workspace Explorer (ui/src/features/workspace/)
- [ ] P1 Repo tree: VirtualizedTree (@tanstack/virtual) with lazy load
- [ ] P1 Repo actions: clone (git-engine), open, build (bun run gate), test
- [ ] P1 Task output pane: streaming logs from bun run gate via Tauri event

### 3.4 Git Inspector (ui/src/features/git/)
- [ ] P1 Commit log: virtualized list, search/filter, graph view (mermaid/visx)
- [ ] P1 Diff viewer: Monaco diff editor, side-by-side, inline toggle
- [ ] P1 Blame view: line-by-line with commit tooltip, heatmap
- [ ] P1 Branch graph: interactive, drag-drop rebase (v1.0)
- [ ] P1 PR checkout: fetch ref, create local branch, switch

### 3.5 Service Mesh (ui/src/features/mesh/)
- [ ] P1 Topology graph: Cytoscape.js / React Flow, real-time health colors
- [ ] P1 Node detail panel: logs, metrics (CPU/mem/net), start/stop/restart
- [ ] P1 Deploy pipeline view: stages, approvals, rollback button
- [ ] P2 SBOM viewer: CycloneDX, vulnerability badges (v1.0)

### 3.6 SurrealQL Console (ui/src/features/surreal/)
- [ ] P1 Monaco editor with SurrealQL language support (custom tokenizer)
- [ ] P1 History panel: persisted to IndexedDB, searchable
- [ ] P1 Schema browser: tree view, field types, indexes, foreign keys
- [ ] P1 EXPLAIN visualizer: query plan tree with costs
- [ ] P2 Live SELECT: reactive table with WebSocket updates (v1.0)

### 3.7 PPPoE/RADIUS (ui/src/features/pppoe/)
- [ ] P1 Session table: virtualized, filterable (NAS, username, state, duration)
- [ ] P1 RADIUS trace: sequence diagram (Access-Request -> Challenge -> Accept/Reject)
- [ ] P1 NAS map: Leaflet/MapLibre with markers, health status
- [ ] P2 Geo heatmap: session density, quota utilization (v1.0)

### 3.8 Tenant Portal (ui/src/features/tenant/)
- [ ] P1 Tenant list (Support) / single view (Customer): virtualized table
- [ ] P1 API keys: create/revoke/rotate (Customer), view only (Support)
- [ ] P1 Usage charts: Recharts, time-series (bandwidth, sessions, API calls)
- [ ] P2 Plan change wizard, webhook manager (v1.0)

### 3.9 Diagnostics (ui/src/features/diagnostics/)
- [ ] P1 One-click bundle: progress modal, save dialog, auto-open folder
- [ ] P2 Session replay viewer: rr trace + timeline (v1.0)
- [ ] P2 Flamegraph: speedscope integration (v1.0)

---

## Phase 4: Offline Sync & Conflict Resolution (Week 6-8)

### 4.1 CRDT Implementation (src/sync/crdt.rs)
- [ ] P0 LwwRegister<T> - value: T, timestamp: u64, actor: ActorId
- [ ] P0 OrSet<T> - adds: Map<T, Set<Tag>>, removes: Set<Tag>
- [ ] P0 Rga - sequence CRDT for text (integrate automerge or custom)
- [ ] P0 Serde serialization for all CRDT types -> store in sync_operations table

### 4.2 Conflict Resolution UI (ui/src/offline/ConflictResolver.tsx)
- [ ] P1 3-way diff view: Base | Local | Remote
- [ ] P1 Per-field actions: Keep Local | Keep Remote | Merge (manual edit)
- [ ] P1 Batch resolve: Accept All Local / Accept All Remote
- [ ] P1 Conflict history: audit log of resolutions

### 4.3 Selective Table Sync
- [ ] P1 Settings -> Sync: checkbox per table (pppoe_sessions, radius_logs, tenants, api_keys, git_repos, service_config)
- [ ] P1 Bandwidth throttling: max_kbps setting, pause/resume
- [ ] P1 Sync direction: push_only | pull_only | bidirectional

### 4.4 Chaos Testing (CI)
- [ ] P1 cargo test -- offline_chaos - network partition + concurrent writes
- [ ] P1 Verify: zero data loss, all conflicts resolvable, eventual consistency

---

## Phase 5: Air-Gap License & Distribution (Week 8-10)

### 5.1 License Generator CLI (tools/license-gen/)
- [ ] P0 cargo build --release --bin license-gen
- [ ] P0 license-gen issue --features=all --seats=10 --expires=2027-12-31 --output=license.pem
- [ ] P0 license-gen delegate --parent=license.pem --seats=3 --output=seat.pem
- [ ] P0 license-gen revoke --seat=seat.pem --output=crl.pem

### 5.2 Offline License Enforcement
- [ ] P0 App startup: validate license before UI mount; show license entry screen if invalid
- [ ] P0 Hardware fingerprint rotation: detect TPM clear -> prompt re-license
- [ ] P0 Offline CRL: check local revoked_seats.bin on startup; sync opportunistically

### 5.3 MSIX Packaging (build.ps1)
- [ ] P0 makeappx pack /d pkg /p Sovereign.Desktop_1.0.0_x64.msix
- [ ] P0 signtool sign /fd SHA256 /a /tr http://timestamp.digicert.com /td SHA256 Sovereign.Desktop_1.0.0_x64.msix
- [ ] P0 Winget manifest (Sovereign.Desktop.yaml) with InstallerType: msix
- [ ] P0 Internal Winget source: Azure Artifacts / GitHub Packages
- [ ] P1 Auto-update: tauri-plugin-updater with GitHub Releases endpoint

---

## Phase 6: Dogfood & Harden (Week 10-12)

### 6.1 Internal Pilot
- [ ] P0 Deploy to dx team via Group Policy
- [ ] P0 Collect telemetry (opt-in): startup time, sync latency, crash reports
- [ ] P0 Weekly feedback sessions; iterate on UX pain points

### 6.2 Performance Benchmarks
- [ ] P1 Cold start < 3s (target: 2s)
- [ ] P1 Git log (10k commits) < 500ms
- [ ] P1 SurrealQL query (10k rows) < 200ms
- [ ] P1 Sync engine memory < 100MB steady state

### 6.3 Security Hardening
- [ ] P1 Penetration test: IPC command fuzzing, sidecar escape, license bypass
- [ ] P1 Dependency audit: cargo audit, bun audit
- [ ] P1 SBOM generation: cargo cyclonedx, bun pm sbom

### 6.4 GA Checklist
- [ ] P0 All offline validation checklist scenarios pass in CI
- [ ] P0 Zero P0/P1 bugs open
- [ ] P0 Documentation: user guide, admin guide, API reference
- [ ] P0 Signed MSIX published to internal Winget
- [ ] P0 License generator CLI distributed to ops team

---

## Dependency Graph (Critical Path)

Phase 0 (Scaffold)
    |
    +-> 1.1 SurrealDB Local -> 1.2 DPAPI -> 1.3 IndexedDB -> 1.4 Sync Engine -> 1.5 License
    |           |                                      |
    |           +-------------------> 2.x Tauri Commands <-+
    |                                      |
    |                                      +----> 3.x Frontend Features
    |
    +-> 2.1 Sidecar Manager <--------------> 4.x Sync/Conflict
                                              |
                                              +----> 5.x License/Distribution
                                                              |
                                                              +----> 6.x Dogfood/GA

---

## Task Assignment Suggestion

| Area | Owner | Tasks |
|---|---|---|
| Rust Core | Backend Lead | 0.1, 0.2, 1.1-1.5, 2.1-2.8, 4.1, 5.1-5.2 |
| Frontend | Frontend Lead | 0.1 (ui), 3.1-3.9, 4.2-4.3 |
| Sync Engine | Distributed Systems | 1.4, 4.1-4.4 |
| DevOps/Release | Platform Eng | 0.3, 5.3, 6.3-6.4 |
| QA/Offline Validation | QA Lead | 1.5 (test), 4.4, 6.1-6.2 |

---

## Tracking

- File: MASTER_TODO.md (this file) - update status emojis as work progresses
- Daily: Update [~]/[x] at EOD
- Weekly: Review with team, reprioritize [!] blocked items
- Gate: No commit to main without bun run gate passing

---

*Generated from DESKTOP_APP_DESIGN.md - executable, zero-slop, offline-first.*

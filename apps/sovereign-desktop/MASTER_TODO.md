# Sovereign Desktop - Master TODO

**Status**: Active Development
**Target**: Production-ready offline-first Windows desktop app
**Quality Gate**: \un run gate\ must pass (zero-slop, types, tests, secrets, rust)

---

## Phase 0: Foundation & Configuration (Mostly Done)

- [x] Tauri v2 config with MSIX bundle, sidecars, CSP, allowlist
- [x] Cargo.toml with all deps (tauri, surrealdb, git2, webauthn, windows, crypto)
- [x] Embedded SurrealDB with migrations (9 tables, CRDT sync_operations)
- [x] SidecarManager with port registry, health checks, circuit breaker
- [x] SyncEngine with CRDT (LWW, OR-Set, RGA) + reconciliation loop
- [x] LicenseManager with RSA-PSS, hw fingerprint (TPM/SMBIOS/MachineGuid)
- [x] Windows Credential Manager wrapper (PAT, JWT keys, WebAuthn)
- [x] Auth commands: Windows Hello, PAT, JWT refresh, license verify, init_app
- [x] React + TanStack Router + role-based routes
- [x] Layout with collapsible sidebar, sync badge, theme toggle
- [x] LoginPage with Windows Hello + PAT

---

## Phase 1: Core Backend Commands (In Progress)

### 1.1 Git Commands (src/commands/git.rs)
- [x] git_list_repos() - List registered repos from SurrealDB
- [x] git_register_repo(path, name, remote_url?) - Add repo to registry
- [x] git_open_repo(path) - Validate repo, return status (branch, ahead/behind, dirty)
- [x] git_log(repo_path, limit?, offset?) - Paginated commit history via git-engine
- [x] git_diff(repo_path, commit_sha?) - Diff vs HEAD or between commits
- [x] git_branch_list(repo_path) - Local + remote branches
- [x] git_branch_create(repo_path, name, start_point?) - Create branch
- [x] git_branch_delete(repo_path, name, force?) - Delete branch
- [x] git_checkout(repo_path, target) - Switch branch/commit
- [x] git_status(repo_path) - Working tree status (staged/unstaged/untracked)
- [x] git_add(repo_path, paths[]) - Stage files
- [x] git_commit(repo_path, message, sign?) - Create commit
- [x] git_push(repo_path, remote?, branch?, force?) - Push via git-engine
- [x] git_pull(repo_path, remote?, branch?) - Pull via git-engine
- [x] git_fetch(repo_path, remote?) - Fetch remotes
- [x] git_remote_list(repo_path) - List remotes with URLs
- [x] git_remote_add(repo_path, name, url) - Add remote
- [x] git_stash_list(repo_path) - List stashes
- [x] git_stash_push/pop/drop(repo_path, message?) - Stash operations
- [x] git_blame(repo_path, file, start_line, end_line) - Line annotations
- [x] git_show(repo_path, commit_sha) - Commit details + diff

### 1.2 Service/Mesh Commands (src/commands/mesh.rs)
- [x] mesh_get_all_health() - HealthStatus[] for all 5 sidecars
- [x] mesh_start_service(name) - Spawn sidecar with config
- [x] mesh_stop_service(name) - Graceful shutdown
- [x] mesh_restart_service(name) - Restart with circuit breaker
- [x] mesh_get_logs(name, lines?, follow?) - Tail stdout/stderr
- [x] mesh_get_config(name) - Current runtime config from service_config table
- [x] mesh_update_config(name, config_obj) - Update + restart sidecar
- [x] mesh_get_port_map() - All reserved ports + actual bindings
- [x] mesh_export_diagnostics() - ZIP bundle: logs, config, health, system info
- [x] mesh_status() - HealthStatus[] for all sidecars
- [x] mesh_start(name) - Spawn sidecar with config
- [x] mesh_stop(name) - Graceful shutdown
- [x] mesh_restart(name) - Restart with circuit breaker
- [x] mesh_logs(name, lines?, follow?) - Tail stdout/stderr
- [x] mesh_health(name) - Single service health check
- [x] mesh_get_config(name) - Current runtime config from service_config table
- [x] mesh_update_config(name, config_obj) - Update + restart sidecar
- [x] mesh_get_port_map() - All reserved ports + actual bindings
- [x] mesh_export_diagnostics() - ZIP bundle: logs, config, health, system info

### 1.3 SurrealQL Commands (src/commands/surreal.rs)
- [ ] surreal_query(sql, params?) - Execute query against embedded DB
- [ ] surreal_explain(sql) - Query plan
- [ ] surreal_schema(table?) - Table definitions, indexes, fields
- [ ] surreal_live_query(sql) - Subscribe to live results (WebSocket)
- [ ] surreal_export_table(table, format?) - JSON/CSV export
- [ ] surreal_import_table(table, data, format?) - Import with conflict resolution
- [x] surreal_query(sql, params?) - Execute query
- [x] surreal_create(table, data) - Create record
- [x] surreal_read(table, id) - Read record
- [x] surreal_update(table, id, data) - Update record
- [x] surreal_delete(table, id) - Delete record
- [x] surreal_health() - Health check
- [ ] surreal_explain(sql) - Query plan
- [ ] surreal_schema(table?) - Table definitions, indexes, fields
- [ ] surreal_live_query(sql) - Subscribe to live results (WebSocket)
- [ ] surreal_export_table(table, format?) - JSON/CSV export
- [ ] surreal_import_table(table, data, format?) - Import with conflict resolution

### 1.4 PPPoE/RADIUS Commands (src/commands/pppoe.rs)
- [ ] pppoe_list_sessions(filter?) - Active sessions from legend/pocketbase
- [ ] pppoe_get_session(session_id) - Session details + traffic counters
- [ ] pppoe_disconnect_session(session_id) - Terminate via arsy
- [ ] pppoe_radius_logs(filter?) - Paginated RADIUS packet log
- [ ] pppoe_nas_list() - NAS devices from arsy
- [ ] pppoe_nas_config(nas_id) - NAS config (IP, secret, ports)
- [ ] pppoe_nas_update(nas_id, config) - Update NAS config
- [x] pppoe_list(filter?) - List PPPoE sessions (placeholder)
- [x] pppoe_create(data) - Create session (placeholder)
- [x] pppoe_delete(id) - Delete session (placeholder)
- [x] pppoe_stats() - Stats (placeholder)
- [ ] pppoe_list_sessions(filter?) - Active sessions from legend/pocketbase
- [ ] pppoe_get_session(session_id) - Session details + traffic counters
- [ ] pppoe_disconnect_session(session_id) - Terminate via arsy
- [ ] pppoe_radius_logs(filter?) - Paginated RADIUS packet log
- [ ] pppoe_nas_list() - NAS devices from arsy
- [ ] pppoe_nas_config(nas_id) - NAS config (IP, secret, ports)
- [ ] pppoe_nas_update(nas_id, config) - Update NAS config

### 1.5 Tenant Commands (src/commands/tenant.rs)
- [ ] tenant_list(filter?) - Paginated tenant list
- [ ] tenant_get(id) - Tenant details + usage + API keys
- [ ] tenant_create(name, slug, plan) - Create tenant
- [ ] tenant_update(id, patch) - Update tenant (plan, limits)
- [ ] tenant_delete(id) - Soft delete (mark inactive)
- [ ] tenant_api_keys(id) - List API keys for tenant
- [ ] tenant_api_key_create(id, name, permissions, expires_at?) - Generate key
- [ ] tenant_api_key_revoke(id, key_id) - Revoke key
- [ ] tenant_usage(id, period?) - Usage metrics (API calls, bandwidth, sessions)
- [ ] tenant_billing_sync(id) - Trigger billing sync to remote
- [x] tenant_list() - List tenants (placeholder)
- [x] tenant_create(data) - Create tenant (placeholder)
- [x] tenant_update(id, data) - Update tenant (placeholder)
- [x] tenant_delete(id) - Delete tenant (placeholder)
- [x] tenant_usage(id) - Usage metrics (placeholder)
- [x] api_key_create(tenant_id, data) - Create API key (placeholder)
- [x] api_key_list(tenant_id) - List API keys (placeholder)
- [x] api_key_revoke(tenant_id, key_id) - Revoke key (placeholder)
- [ ] tenant_list(filter?) - Paginated tenant list
- [ ] tenant_get(id) - Tenant details + usage + API keys
- [ ] tenant_create(name, slug, plan) - Create tenant with SurrealDB
- [ ] tenant_update(id, patch) - Update tenant (plan, limits)
- [ ] tenant_delete(id) - Soft delete (mark inactive)
- [ ] tenant_api_keys(id) - List API keys for tenant
- [ ] tenant_api_key_create(id, name, permissions, expires_at?) - Generate key
- [ ] tenant_api_key_revoke(id, key_id) - Revoke key
- [ ] tenant_usage(id, period?) - Usage metrics (API calls, bandwidth, sessions)
- [ ] tenant_billing_sync(id) - Trigger billing sync to remote

### 1.6 Diagnostics Commands (src/commands/diagnostics.rs)
- [ ] diag_system_info() - OS, CPU, RAM, disk, network interfaces
- [ ] diag_network_trace(target, type?) - Ping, traceroute, DNS, TCP connect
- [ ] diag_sidecar_logs(name, since?) - Structured logs from sidecar
- [ ] diag_db_stats() - SurrealDB size, table counts, index stats
- [ ] diag_sync_status() - Pending ops, last sync, conflicts, queue depth
- [ ] diag_export_bundle() - Comprehensive diagnostic ZIP
- [x] diagnostics_run() - Run diagnostics (placeholder)
- [x] diagnostics_history() - History (placeholder)
- [ ] diag_system_info() - OS, CPU, RAM, disk, network interfaces
- [ ] diag_network_trace(target, type?) - Ping, traceroute, DNS, TCP connect
- [ ] diag_sidecar_logs(name, since?) - Structured logs from sidecar
- [ ] diag_db_stats() - SurrealDB size, table counts, index stats
- [ ] diag_sync_status() - Pending ops, last sync, conflicts, queue depth
- [ ] diag_export_bundle() - Comprehensive diagnostic ZIP

### 1.7 Settings Commands (src/commands/settings.rs)
- [ ] settings_get_all() - All key-value settings
- [ ] settings_get(key) - Single setting
- [ ] settings_set(key, value) - Update setting (triggers sidecar restart if needed)
- [ ] settings_license_enter(pem) - Validate + store license
- [ ] settings_license_current() - Current license info
- [ ] settings_sync_configure(config) - SyncEngine config (remote_url, token, tables, direction)
- [ ] settings_sync_status() - SyncEngine status + last sync times
- [ ] settings_sync_trigger() - Manual reconciliation
- [ ] settings_sidecar_paths() - Custom binary paths (override bundled)
- [x] settings_get(key) - Get single setting
- [x] settings_set(key, value) - Set single setting
- [x] settings_list() - List all settings
- [ ] settings_get_all() - All key-value settings
- [ ] settings_license_enter(pem) - Validate + store license
- [ ] settings_license_current() - Current license info
- [ ] settings_sync_configure(config) - SyncEngine config (remote_url, token, tables, direction)
- [ ] settings_sync_status() - SyncEngine status + last sync times
- [ ] settings_sync_trigger() - Manual reconciliation
- [ ] settings_sidecar_paths() - Custom binary paths (override bundled)

---

## Phase 2: Frontend Feature Pages

### 2.1 Workspace (ui/src/features/workspace/)
- [ ] WorkspacePage.tsx - Dashboard with quick stats, recent repos, service health
- [ ] RepoCard.tsx - Repo summary with status, branch, sync state
- [ ] QuickActions.tsx - New repo, clone, open folder, sync all
- [x] WorkspacePage.tsx - Dashboard with repo cards, quick actions
- [ ] RepoCard.tsx - Repo summary with status, branch, sync state
- [ ] QuickActions.tsx - New repo, clone, open folder, sync all

### 2.2 Git Inspector (ui/src/features/git/)
- [ ] GitInspectorPage.tsx - Main layout: repo selector + tabbed views
- [ ] RepoSelector.tsx - Dropdown with search, register new repo modal
- [ ] CommitLog.tsx - Virtualized list (TanStack Virtual), infinite scroll
- [ ] CommitDetail.tsx - Monaco diff view, file tree, commit metadata
- [ ] BranchManager.tsx - Visual branch graph, create/delete/checkout
- [ ] WorkingTree.tsx - Staged/unstaged files, diff, stage/unstage/discard
- [ ] RemotePanel.tsx - Remotes, fetch/push/pull, PR integration (future)
- [ ] StashPanel.tsx - Stash list, apply/drop, preview
- [ ] BlameView.tsx - Line-by-line blame with commit navigation
- [x] GitInspectorPage.tsx - Main layout with commit log, branches, diff viewer
- [ ] RepoSelector.tsx - Dropdown with search, register new repo modal
- [ ] CommitLog.tsx - Virtualized list (TanStack Virtual), infinite scroll
- [ ] CommitDetail.tsx - Monaco diff view, file tree, commit metadata
- [ ] BranchManager.tsx - Visual branch graph, create/delete/checkout
- [ ] WorkingTree.tsx - Staged/unstaged files, diff, stage/unstage/discard
- [ ] RemotePanel.tsx - Remotes, fetch/push/pull, PR integration (future)
- [ ] StashPanel.tsx - Stash list, apply/drop, preview
- [ ] BlameView.tsx - Line-by-line blame with commit navigation

### 2.3 Service Mesh (ui/src/features/mesh/)
- [ ] MeshPage.tsx - Grid of 5 service cards with health, port, uptime
- [ ] ServiceCard.tsx - Health badge, start/stop/restart, config button
- [ ] ServiceConfigModal.tsx - JSON editor for service_config, validate + apply
- [ ] LogViewer.tsx - Real-time tail with search, filter, pause, download
- [ ] PortMap.tsx - Visual port allocation, conflicts, reserved ranges
- [ ] DiagnosticsExport.tsx - One-click diagnostic bundle generation
- [x] MeshPage.tsx - Topology graph, service details, deploy pipeline
- [ ] ServiceCard.tsx - Health badge, start/stop/restart, config button
- [ ] ServiceConfigModal.tsx - JSON editor for service_config, validate + apply
- [ ] LogViewer.tsx - Real-time tail with search, filter, pause, download
- [ ] PortMap.tsx - Visual port allocation, conflicts, reserved ranges
- [ ] DiagnosticsExport.tsx - One-click diagnostic bundle generation

### 2.4 SurrealQL (ui/src/features/surreal/)
- [ ] SurrealQLPage.tsx - Split pane: editor + results
- [ ] QueryEditor.tsx - Monaco with SurrealQL syntax highlighting, autocomplete
- [ ] QueryHistory.tsx - Persisted history (IndexedDB), rerun, favorite
- [ ] ResultsTable.tsx - Sortable, filterable, paginated, export CSV/JSON
- [ ] SchemaExplorer.tsx - Tree view of tables, fields, indexes, sample data
- [ ] LiveQueryPanel.tsx - WebSocket subscription UI, real-time updates
- [x] SurrealQLPage.tsx - Editor + results + history + schema browser
- [ ] QueryEditor.tsx - Monaco with SurrealQL syntax highlighting, autocomplete
- [ ] QueryHistory.tsx - Persisted history (IndexedDB), rerun, favorite
- [ ] ResultsTable.tsx - Sortable, filterable, paginated, export CSV/JSON
- [ ] SchemaExplorer.tsx - Tree view of tables, fields, indexes, sample data
- [ ] LiveQueryPanel.tsx - WebSocket subscription UI, real-time updates

### 2.5 PPPoE/RADIUS (ui/src/features/pppoe/)
- [ ] PPPoEPage.tsx - Tabbed: Sessions | RADIUS Logs | NAS Devices
- [ ] SessionTable.tsx - Virtualized, filterable (user, NAS, status, IP)
- [ ] SessionDetail.tsx - Traffic charts (Recharts), timeline, disconnect action
- [ ] RadiusLogStream.tsx - Real-time log tail, packet decode, filter
- [ ] NASManager.tsx - CRUD NAS configs, test connectivity
- [x] PPPoEPage.tsx - Session table, RADIUS trace, NAS map
- [ ] SessionTable.tsx - Virtualized, filterable (user, NAS, status, IP)
- [ ] SessionDetail.tsx - Traffic charts (Recharts), timeline, disconnect action
- [ ] RadiusLogStream.tsx - Real-time log tail, packet decode, filter
- [ ] NASManager.tsx - CRUD NAS configs, test connectivity

### 2.6 Tenants (ui/src/features/tenant/)
- [ ] TenantPage.tsx - Table with search, filter (plan, status), pagination
- [ ] TenantDetail.tsx - Tabs: Overview | API Keys | Usage | Billing
- [ ] TenantForm.tsx - Create/edit modal with validation
- [ ] APIKeyManager.tsx - List, create (with permissions picker), revoke
- [ ] UsageCharts.tsx - Recharts: API calls, bandwidth, sessions over time
- [ ] BillingSync.tsx - Manual sync button, last sync status, webhook config
- [x] TenantPage.tsx - List + detail view with tabs
- [ ] TenantDetail.tsx - Tabs: Overview | API Keys | Usage | Billing
- [ ] TenantForm.tsx - Create/edit modal with validation
- [ ] APIKeyManager.tsx - List, create (with permissions picker), revoke
- [ ] UsageCharts.tsx - Recharts: API calls, bandwidth, sessions over time
- [ ] BillingSync.tsx - Manual sync button, last sync status, webhook config

### 2.7 Diagnostics (ui/src/features/diagnostics/)
- [ ] DiagnosticsPage.tsx - Sections: System | Network | Database | Sync | Export
- [ ] SystemInfoPanel.tsx - Hardware, OS, runtime versions
- [ ] NetworkTools.tsx - Ping, traceroute, DNS, port check with results
- [ ] DatabaseStats.tsx - DB size, table rows, index usage, vacuum status
- [ ] SyncDashboard.tsx - Pending queue, conflicts, last sync, throughput
- [ ] ExportBundle.tsx - One-click ZIP download with all diagnostics
- [x] DiagnosticsPage.tsx - Support bundle generation, flamegraph, session replay
- [ ] SystemInfoPanel.tsx - Hardware, OS, runtime versions
- [ ] NetworkTools.tsx - Ping, traceroute, DNS, port check with results
- [ ] DatabaseStats.tsx - DB size, table rows, index usage, vacuum status
- [ ] SyncDashboard.tsx - Pending queue, conflicts, last sync, throughput
- [ ] ExportBundle.tsx - One-click ZIP download with all diagnostics

### 2.8 Settings (ui/src/features/settings/)
- [ ] SettingsPage.tsx - Tabs: General | License | Sync | Sidecars | Advanced
- [ ] LicensePanel.tsx - Paste PEM, validate, show features/expiry, hw fingerprint
- [ ] SyncConfigPanel.tsx - Remote URL, token, tables, direction, bandwidth limit
- [ ] SidecarConfigPanel.tsx - Custom binary paths, auto-start, log level
- [ ] ThemeSettings.tsx - Light/dark/system, accent color
- [ ] AboutPanel.tsx - Version, build info, license, third-party notices
- [x] SettingsPage.tsx - Tabs: Appearance, Sync, Updates, License, Account, Danger Zone
- [ ] LicensePanel.tsx - Paste PEM, validate, show features/expiry, hw fingerprint
- [ ] SyncConfigPanel.tsx - Remote URL, token, tables, direction, bandwidth limit
- [ ] SidecarConfigPanel.tsx - Custom binary paths, auto-start, log level
- [ ] ThemeSettings.tsx - Light/dark/system, accent color
- [ ] AboutPanel.tsx - Version, build info, license, third-party notices

---

## Phase 3: Offline-First Polish

### 3.1 Sync Status & Conflict UI
- [ ] SyncStatusProvider.tsx - Global context: state, pending count, last sync
- [ ] SyncStatusBadge.tsx - Top-bar indicator (synced/pending/conflict/offline)
- [ ] ConflictResolverUI.tsx - Modal for manual conflict resolution (per table)
- [ ] OfflineBanner.tsx - Persistent notice when offline, queues mutations

### 3.2 IndexedDB Cache Layer
- [ ] queryCache.ts - TanStack Query persister to IndexedDB (idb)
- [ ] repoMetadataCache.ts - Repo list, branch names, remote URLs
- [ ] schemaCache.ts - SurrealDB schema introspection
- [ ] offlineMutationQueue.ts - Queue mutations when offline, replay on reconnect

### 3.3 Service Worker (PWA)
- [ ] vite.config.ts - Add Vite PWA plugin
- [ ] manifest.webmanifest - App metadata, icons, shortcuts
- [ ] sw.ts - Cache static assets, API GET requests (stale-while-revalidate)

---

## Phase 4: System Tray & Background

### 4.1 System Tray (src/tray/mod.rs)
- [ ] TrayManager - Create tray icon with menu
- [ ] Menu items: Show/Hide, Service status, Quick actions, Quit
- [ ] show_window() / hide_window() - Toggle main window
- [ ] start_all_services() / stop_all_services() - Bulk control
- [ ] Notifications: Sync complete, service down, license expiry

### 4.2 Background Services
- [ ] Auto-start sidecars on login (Windows Task Scheduler / Run key)
- [ ] Background sync engine (runs when window hidden)
- [ ] License expiry warning (30/7/1 day notifications)
- [ ] Auto-update check (daily, silent)

---

## Phase 5: Testing & Quality

### 5.1 Unit Tests (Rust)
- [ ] sidecar::tests - Spawn, health, restart, port collision
- [ ] storage::surrealdb::tests - Migrations, CRUD, live queries
- [ ] sync::crdt::tests - LWW, OR-Set, RGA merge properties
- [ ] sync::engine::tests - Reconciliation, conflict resolution
- [ ] license::validate::tests - Valid/expired/revoked/hw-mismatch
- [ ] storage::credential::tests - Write/read/delete/enumerate

### 5.2 Integration Tests (Tauri)
- [ ] auth_flow_test - Windows Hello + PAT + JWT refresh
- [ ] git_workflow_test - Register, log, diff, commit, push
- [ ] mesh_lifecycle_test - Start/stop/restart all services
- [ ] sync_offline_test - Write offline, reconnect, reconcile

### 5.3 Frontend Tests
- [ ] App.test.tsx - Router, role guards, auth redirect
- [ ] Layout.test.tsx - Sidebar collapse, navigation, theme
- [ ] LoginPage.test.tsx - Windows Hello, PAT, error states
- [ ] Component tests for each feature page (React Testing Library)

### 5.4 E2E Tests (Playwright)
- [ ] auth.spec.ts - Login flows, session persistence
- [ ] git.spec.ts - Full git workflow in inspector
- [ ] mesh.spec.ts - Service control, health monitoring
- [ ] offline.spec.ts - Write offline, sync on reconnect

---

## Phase 6: Build, Sign & Release

### 6.1 Build Scripts
- [ ] build.ps1 - Full build: frontend + backend + MSIX bundle
- [ ] sign.ps1 - Code signing (EV cert), timestamp, verify
- [ ] package.ps1 - Create MSIX, generate latest.json for updater

### 6.2 CI/CD (GitHub Actions)
- [ ] .github/workflows/ci.yml - Lint, typecheck, test on PR
- [ ] .github/workflows/release.yml - Tag trigger: build, sign, upload release
- [ ] .github/workflows/nightly.yml - Nightly build to artifacts

### 6.3 Auto-Updater
- [ ] latest.json schema + generation
- [ ] Ed25519 keypair generation + pubkey embed
- [ ] Staged rollout (canary % -> 100%)

---

## Phase 7: Documentation & Polish

### 7.1 User Documentation
- [ ] README.md - Install, quick start, architecture overview
- [ ] USER_GUIDE.md - Feature walkthroughs with screenshots
- [ ] LICENSE_GUIDE.md - License types, hardware binding, renewal
- [ ] SYNC_GUIDE.md - Offline-first, conflict resolution, config

### 7.2 Developer Documentation
- [ ] CONTRIBUTING.md - Dev setup, workflow, quality gates
- [ ] ARCHITECTURE.md - Deep dive (this DESIGN.md)
- [ ] PLUGIN_API.md - Future plugin system spec

### 7.3 Polish
- [ ] Splash screen + loading state
- [ ] Keyboard shortcuts (Cmd/Ctrl+K command palette)
- [ ] Accessibility audit (ARIA, focus management, contrast)
- [ ] Performance profiling (startup time, memory, bundle size)
- [ ] Telemetry opt-in (anonymous usage stats to Legend)

---

## Blockers / Dependencies

| Task | Blocker | Resolution |
|------|---------|------------|
| Git commands | git-engine sidecar binary | Build services/git-engine first |
| Mesh commands | arsy/legend/pocketbase/radius binaries | Build each service |
| PPPoE commands | arsy + legend APIs | Define API contracts |
| Tenant commands | PocketBase schema | Align with services/pocketbase |
| License validation | assets/public_key.pem | Generate keypair, embed pubkey |
| Auto-updater | GitHub repo + releases | Create sovereign/sovereign-desktop repo |
| Code signing | EV certificate | Procure or use test cert for dev |

---

## Definition of Done (Per Task)

- [ ] Code compiles: cargo check + bun run check
- [ ] Zero-slop: No TODO, FIXME, mock, Math.random, generic names
- [ ] Tests pass: cargo test + bun run test
- [ ] Gate passes: bun run gate (all 5 stages)
- [ ] Documentation updated (if user-facing)
- [ ] Committed with conventional commit message

---

## Commit & Push Protocol

**Every completed task:**
1. Stage changes: git add -A
2. Commit: git commit -m "feat(scope): description" (conventional)
3. Push: git push origin HEAD
4. Verify CI passes (watch GitHub Actions)
5. Update this TODO: mark [x] with commit SHA

**Branch Strategy:**
- main - Protected, CI required, release tags only
- Feature branches: feat/<scope>-<description>
- Hotfix: fix/<scope>-<description>

---

## Monitoring CI Fixes

When CI fails:
1. Read failure logs (GitHub Actions)
2. Reproduce locally: bun run gate
3. Fix root cause (not workaround)
4. Re-run gate until green
5. Push fix, verify CI passes

**Common Failure Patterns:**
- Zero-slop: Remove TODO, replace mock, rename generic vars
- Types: Add explicit types, fix inference, update @types
- Tests: Fix flaky async, mock properly, update snapshots
- Secrets: Remove .env from tracked files, use .env.example
- Rust: cargo fmt, fix clippy warnings, add missing tests

---

*Last Updated: 2026-11-10*
*Next Review: After Phase 1 completion*
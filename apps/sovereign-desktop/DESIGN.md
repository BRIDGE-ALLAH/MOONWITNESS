# Sovereign Desktop - Architecture & Design Specification

## Executive Summary

**Sovereign Desktop** is an offline-first Windows desktop application that serves as a unified control surface for:
- **Developers**: Git operations, in-browser code inspection, Docker PaaS
- **Platform Engineers**: Service mesh management (ARSY, Legend, PocketBase, Git Engine, RADIUS)
- **Network Engineers**: PPPoE session orchestration, RADIUS AAA, edge telemetry
- **Support Teams**: Tenant management, diagnostics, customer-facing tooling
- **Customers**: Self-service portal, usage analytics, billing

Built on **Tauri v2 (Rust + React)** with **embedded SurrealDB** for local-first persistence and **CRDT-based sync** for eventual consistency with remote Sovereign cloud.

---

## 1. Architecture Overview

### 1.1 System Topology

```
+-----------------------------------------------------------------+
|                    Sovereign Desktop (Tauri v2)                 |
|  +------------------+  +--------------------------------------+  |
|  |  Frontend (React |  |  Backend (Rust)                      |  |
|  |  + TanStack      |  |  +--------------------------------+  |  |
|  |  Router/Query)   |  |  |  Sidecar Manager               |  |  |
|  |                  |  |  |  - git-engine :3200            |  |  |
|  |  Features:       |  |  |  - arsy :4000                  |  |  |
|  |  - Workspace     |  |  |  - legend :8092                |  |  |
|  |  - Git Inspector |  |  |  - pocketbase :8091            |  |  |
|  |  - Service Mesh  |  |  |  - radius :1812/1813           |  |  |
|  |  - SurrealQL     |  |  +--------------------------------+  |  |
|  |  - PPPoE/RADIUS  |  |  +--------------------------------+  |  |
|  |  - Tenants       |  |  |  Embedded SurrealDB (KV)       |  |  |
|  |  - Diagnostics   |  |  |  - sync_operations (CRDT)      |  |  |
|  |  - Settings      |  |  |  - git_repositories            |  |  |
|  +------------------+  |  |  - service_config              |  |  |
|                        |  |  - tenants, api_keys           |  |  |
|         IPC (Tauri)    |  |  - pppoe_sessions              |  |  |
|                        |  |  - radius_logs                 |  |  |
|                        |  |  - license, settings           |  |  |
|                        |  +--------------------------------+  |  |
|                        |  +--------------------------------+  |  |
|                        |  |  Sync Engine (CRDT)            |  |  |
|                        |  |  - LWW Register                |  |  |
|                        |  |  - OR-Set                      |  |  |
|                        |  |  - RGA (text)                  |  |  |
|                        |  +--------------------------------+  |  |
|                        |  +--------------------------------+  |  |
|                        |  |  License Manager               |  |  |
|                        |  |  - RSA-PSS verification        |  |  |
|                        |  |  - TPM/SMBIOS hw fingerprint   |  |  |
|                        |  |  - Offline validation          |  |  |
|                        |  +--------------------------------+  |  |
|                        |  +--------------------------------+  |  |
|                        |  |  Credential Store (WinCred)    |  |  |
|                        |  |  - PAT, JWT signing keys       |  |  |
|                        |  |  - WebAuthn credentials        |  |  |
|                        |  +--------------------------------+  |  |
+-----------------------------------------------------------------+
                              |
                    +---------+---------+
                    |  Sync (Optional)  |
                    |  Sovereign Cloud  |
                    |  (Legend :8092,   |
                    |   PocketBase :8091)|
                    +-------------------+
```

### 1.2 Port Allocation (Local Sidecars)

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| git-engine | 3200 | HTTP | Bare-metal Git Smart HTTP + PAT auth |
| arsy | 4000 | HTTP | Network controller, PPPoE orchestration |
| legend | 8092 | HTTP | Operational BaaS (SurrealDB), telemetry |
| pocketbase | 8091 | HTTP | Identity BaaS (RID), SSE bus |
| radius | 1812/1813 | UDP | RADIUS AAA (auth/acct) |

---

## 2. Core Subsystems

### 2.1 Sidecar Manager (`src/sidecar/mod.rs`)

**Responsibilities:**
- Process lifecycle management (spawn, health-check, restart, shutdown)
- Port reservation with collision detection (default + 0-1000 range)
- Circuit breaker: max 3 restarts/minute per service
- Structured health status reporting to frontend

**Key Types:**
```rust
enum SidecarName { GitEngine, Arsy, Legend, PocketBase, Radius }
struct HealthStatus { name, healthy, port, pid, uptime_seconds, last_check, error }
struct SidecarProcess { child, port, start_time, restart_count, last_restart }
```

**Health Check Contract:**
Each sidecar MUST expose `GET /healthz` returning `200 OK` with JSON:
```json
{ "status": "healthy", "version": "x.y.z", "uptime_seconds": 123 }
```

### 2.2 Embedded SurrealDB (`src/storage/surrealdb.rs`)

**Schema (SCHEMAFULL tables):**

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `sync_operations` | CRDT event log for sync | `(table_name, record_id)`, `(synced)` |
| `git_repositories` | Local repo registry | `(path)` UNIQUE |
| `service_config` | Sidecar runtime config | `(name)` UNIQUE |
| `tenants` | Tenant registry | `(slug)` UNIQUE |
| `api_keys` | PAT/API keys per tenant | `(tenant_id)` |
| `pppoe_sessions` | Active PPPoE sessions | `(session_id)` UNIQUE, `(nas_ip)`, `(username)` |
| `radius_logs` | RADIUS packet audit log | `(nas_ip)`, `(username)`, `(timestamp)` |
| `settings` | Key-value app settings | `(key)` UNIQUE |
| `license` | Hardware-bound license | single row |

**CRDT Sync Operations Table:**
```surql
DEFINE TABLE sync_operations SCHEMAFULL;
DEFINE FIELD crdt_type TYPE string;  -- "lww", "orset", "rga"
DEFINE FIELD operation TYPE string;  -- "insert", "update", "delete"
DEFINE FIELD data TYPE object;       -- CRDT-serialized payload
DEFINE FIELD actor_id TYPE string;   -- UUID of originating node
DEFINE FIELD version TYPE int DEFAULT 0;  -- vector clock component
```

### 2.3 Sync Engine (`src/sync/engine.rs` + `crdt.rs`)

**CRDT Types Supported:**

| Type | Use Case | Merge Strategy |
|------|----------|----------------|
| **LWW Register** | Single-value config, settings, license | Max timestamp, tie-break by actor_id |
| **OR-Set** | Collections: tags, labels, tenant members | Union of adds \ union of removes |
| **RGA** | Ordered sequences: code, logs, chat | Causal ordering by timestamp + origin |

**Sync Directions:**
- `PushOnly`: Local to Remote (air-gapped export)
- `PullOnly`: Remote to Local (disaster recovery)
- `Bidirectional`: Normal operation

**Reconciliation Loop:** Every 30s (configurable)
1. Query unsynced local operations (LIMIT 100)
2. Push to remote `/api/v1/sync/{table}/{id}` with CRDT payload
3. Pull remote changes since last sync timestamp per table
4. Resolve conflicts via `ConflictResolver::resolve()`
5. Apply merged CRDT to local tables
6. Update `last_sync_{table}` in settings

### 2.4 License Manager (`src/license/validate.rs`)

**License Format (PEM):**
```
<base64(json_claims)>.<base64(rsa_pss_signature)>
```

**Claims:**
```json
{
  "features": ["git", "mesh", "pppoe", "surreal", "tenants"],
  "seats": 5,
  "expires_at": 1767225600,
  "hw_fingerprint": "sha256(tpm_ekpub|smbios_uuid|machine_guid)",
  "issued_at": 1735689600
}
```

**Hardware Fingerprint (Priority Order):**
1. TPM 2.0 Endorsement Key (EKpub) - `get_tpm_ekpub()`
2. SMBIOS UUID (Type 1 structure) - `GetSystemFirmwareTable('RSMB')`
3. MachineGuid from `HKLM\SOFTWARE\Microsoft\Cryptography`

**Validation Flow:**
1. Parse PEM to claims + signature
2. Compute current hw_fingerprint
3. Verify fingerprint matches license
4. Verify RSA-PSS-SHA256 signature against embedded public key
5. Check expiration (7-day grace period)
6. Check feature flags non-empty

**Revocation:** Optional CRL file loaded at startup (one fingerprint per line)

### 2.5 Credential Store (`src/storage/credential.rs`)

**Backend:** Windows Credential Manager (`CredWriteW`/`CredReadW`/`CredDeleteW`/`CredEnumerateW`)
- Type: `CRED_TYPE_GENERIC`
- Persistence: `CRED_PERSIST_LOCAL_MACHINE`
- Prefix: `SovereignDesktop_`

**Stored Credentials:**
| Key | Content |
|-----|---------|
| `pat:default` | Git PAT (encrypted at rest by Windows DPAPI) |
| `jwt_signing_key` | 32-byte RSA private key (PKCS#8) |
| `webauthn:default` | WebAuthn credential ID + public key |
| `license:revocation` | CRL content (optional) |

### 2.6 Authentication (`src/commands/auth.rs`)

**Methods:**
1. **Windows Hello (WebAuthn/ Passkey)** - Primary for developers
   - `auth_windows_hello()` -> challenge
   - `auth_windows_hello_verify(credential, challenge)` -> JWT
2. **Personal Access Token** - For CI/CD, automation
   - `auth_pat(pat)` -> validates via git-engine, stores in WinCred, returns JWT
3. **JWT Refresh** - Silent re-auth if WebAuthn credential < 90 days old
   - `refresh_token()` -> new 15-min JWT

**JWT Claims:**
```json
{
  "sub": "user-id",
  "name": "Display Name",
  "role": "developer|platform|network|support|customer",
  "tenant_id": "optional",
  "exp": unix_timestamp,
  "iat": unix_timestamp
}
```
Signed with RSA-PSS-SHA256 (key from WinCred)

**Role-Based Access (Frontend Routes):**
| Route | Allowed Roles |
|-------|---------------|
| `/app/workspace` | developer, platform |
| `/app/git` | developer |
| `/app/mesh` | platform |
| `/app/surreal` | platform, network |
| `/app/pppoe` | network |
| `/app/tenant` | support, customer |
| `/app/diagnostics` | support |
| `/app/settings` | all |

---

## 3. Frontend Architecture (`ui/src/`)

### 3.1 Tech Stack
- **React 18** + **TypeScript** + **Vite**
- **TanStack Router** (type-safe routing) + **TanStack Query** (server state)
- **Jotai** (atomic client state) + **Zustand** (auth store)
- **Radix UI** + **Tailwind CSS** (design system)
- **Monaco Editor** (Git diff, SurrealQL, code views)
- **Recharts** (telemetry dashboards)
- **idb** (IndexedDB for offline UI cache)

### 3.2 Route Structure (`App.tsx`)
```
/login                    -> LoginPage (public)
/app/                     -> Layout + Outlet (protected)
  /workspace              -> WorkspacePage (dev, platform)
  /git                    -> GitInspectorPage (dev)
  /mesh                   -> MeshPage (platform)
  /surreal                -> SurrealQLPage (platform, network)
  /pppoe                  -> PPPoEPage (network)
  /tenant                 -> TenantPage (support, customer)
  /diagnostics            -> DiagnosticsPage (support)
  /settings               -> SettingsPage (all)
```

### 3.3 Offline-First Patterns (`ui/src/offline/`)
- **SyncStatusProvider** - Global sync state (pending, synced, conflict, offline)
- **Optimistic Updates** - TanStack Query mutations with rollback
- **IndexedDB Cache** - Recent queries, repo metadata, schema introspection
- **Service Worker** - Static asset caching (Vite PWA plugin)

### 3.4 Key Components
| Component | Purpose |
|-----------|---------|
| `Layout` | Collapsible sidebar, top bar, sync badge, theme toggle |
| `SyncStatusBadge` | Real-time sync state (spinner, check, warning, offline) |
| `LoginPage` | Windows Hello + PAT authentication |
| `GitInspectorPage` | Bare-metal git log/diff/branch via git-engine HTTP |
| `MeshPage` | Sidecar health grid, port map, log tail, restart controls |
| `SurrealQLPage` | Monaco editor + live query results against embedded SurrealDB |
| `PPPoEPage` | Session table, RADIUS log stream, NAS map |
| `TenantPage` | CRUD tenants, API keys, usage quotas, billing sync |
| `DiagnosticsPage` | System info, network trace, sidecar logs, export bundle |
| `SettingsPage` | License entry, sync config, theme, sidecar paths |

---

## 4. Data Flow & Offline Guarantees

### 4.1 Write Path (Local-First)
```
User Action -> Optimistic UI Update -> Local SurrealDB Write
                                    |
                         Append to sync_operations (CRDT)
                                    |
                         Background Sync Engine -> Remote
```

### 4.2 Read Path
```
UI Query -> TanStack Query
  |- Cache hit (IndexedDB) -> Instant
  |- Local SurrealDB -> <10ms
  |- Remote (if online & stale) -> Background refresh
```

### 4.3 Conflict Resolution
- **LWW**: Last-writer-wins by timestamp (server-authoritative for license, config)
- **OR-Set**: Add-wins for collections (tags, members)
- **RGA**: Causal ordering for sequences (code, logs)

### 4.4 Offline Guarantees
| Guarantee | Mechanism |
|-----------|-----------|
| **Write availability** | All writes go to local SurrealDB first |
| **Read availability** | Full local dataset queryable |
| **No data loss** | CRDT event log persisted to disk |
| **Eventual consistency** | Background sync with conflict resolution |
| **Graceful degradation** | UI shows sync status, queues mutations |

---

## 5. Security Model

### 5.1 Threat Model
| Asset | Threat | Mitigation |
|-------|--------|------------|
| License key | Extraction, reuse | Hardware-bound (TPM/SMBIOS), RSA-PSS |
| PAT/Git credentials | Theft | Windows Credential Manager (DPAPI) |
| JWT signing key | Compromise | Generated per-install, stored in WinCred |
| Local DB | Tampering | Signed license validates DB integrity |
| Sidecar binaries | Replacement | MSIX signature verification, hash pinning |
| Sync traffic | MITM | mTLS (future), bearer token over HTTPS |

### 5.2 Capabilities (Tauri Allowlist)
- **FS**: Scoped to `$APPDATA/Sovereign/**` + `$HOME/**`
- **Shell**: Sidecar binaries only (explicit allowlist)
- **Process**: Relaunch, exit
- **Dialog**: Open, save, message, ask
- **Notification**: Show
- **Clipboard**: Read/write text
- **Updater**: GitHub releases (passive MSIX install)

---

## 6. Build & Distribution

### 6.1 Build Pipeline
```bash
# Frontend
cd ui && bun run build    # -> ui/dist

# Backend
cargo build --release     # -> target/release/sovereign-desktop.exe

# Bundle (MSIX)
cargo tauri build         # Uses tauri.conf.json bundle config
```

### 6.2 MSIX Bundle Contents
```
Sovereign.Desktop.msix
+-- sovereign-desktop.exe          # Tauri app
+-- bin/
|   +-- git-engine.exe             # Sidecar (Bun + native git)
|   +-- arsy.exe                   # Sidecar (Fastify + Zod)
|   +-- legend.exe                 # Sidecar (Rust + Axum + SurrealDB)
|   +-- pocketbase.exe             # Sidecar (PocketBase SQLite)
|   +-- radius.exe                 # Sidecar (Rust UDP)
+-- assets/
|   +-- public_key.pem             # License verification key
+-- icons/                         # 32, 128, 256px
```

### 6.3 Auto-Updater
- **Endpoint**: `https://github.com/sovereign/sovereign-desktop/releases/latest/download/latest.json`
- **Pubkey**: Ed25519 (configured at build)
- **Install Mode**: Passive (background, no UAC prompt for MSIX)

---

## 7. Development Workflow

### 7.1 Prerequisites
- Rust 1.78+ (MSVC toolchain)
- Bun 1.1+
- Windows 10 1809+ / Windows 11
- Visual Studio Build Tools (for MSIX)

### 7.2 Local Development
```bash
# Terminal 1: Frontend dev server
cd apps/sovereign-desktop/ui && bun run dev  # :5173

# Terminal 2: Tauri dev (hot reload)
cd apps/sovereign-desktop && cargo tauri dev
```

### 7.3 Quality Gates (Pre-commit)
Run `bun run gate` from repo root (enforced by `.githooks/pre-commit`):
1. Zero-slop AST scan (no TODO, mock, Math.random, generic names)
2. TypeScript check across all workspaces
3. Unit tests (git-engine, arsy)
4. Secret leak check
5. Rust: `cargo fmt --check`, `cargo clippy -D warnings`, `cargo test`

---

## 8. Future Extensibility

### 8.1 Plugin Architecture (Planned)
- WASM-based plugins loaded from `%APPDATA%/Sovereign/plugins/`
- Capability-based permissions (fs, net, sidecar, db)
- Manifest: `plugin.toml` with name, version, permissions, entry

### 8.2 Remote Management (Planned)
- MDM-style device enrollment via PocketBase
- Remote wipe (license revocation + local data purge)
- Fleet telemetry (opt-in) to Legend

### 8.3 Cross-Platform (Future)
- macOS: Keychain instead of WinCred, launchd for sidecars
- Linux: libsecret, systemd user services
- Shared Rust core, platform-specific shims

---

## 9. Appendix: File Map

```
apps/sovereign-desktop/
+-- Cargo.toml                    # Rust workspace manifest
+-- tauri.conf.json               # Tauri v2 config (MSIX, sidecars, CSP)
+-- build.ps1                     # Build script (MSIX signing)
+-- .gitignore
+-- src/
|   +-- main.rs                   # App entry, state, Tauri setup
|   +-- commands/
|   |   +-- auth.rs               # Tauri commands: auth, license, init
|   +-- sidecar/
|   |   +-- mod.rs                # SidecarManager, health, port registry
|   +-- storage/
|   |   +-- surrealdb.rs          # Embedded SurrealDB + migrations
|   |   +-- credential.rs         # Windows Credential Manager wrapper
|   +-- sync/
|   |   +-- engine.rs             # SyncEngine, CRDT reconciliation
|   |   +-- crdt.rs               # LWW, OR-Set, RGA implementations
|   +-- license/
|   |   +-- validate.rs           # License parsing, hw fingerprint, RSA-PSS
|   +-- state/                    # (empty - for future global state)
|   +-- tray/                     # (empty - for system tray)
+-- ui/
|   +-- package.json              # React + Vite + Tauri deps
|   +-- vite.config.ts            # Vite + Tauri plugin
|   +-- tailwind.config.js        # Tailwind + Radix theme
|   +-- tsconfig.json             # TypeScript strict mode
|   +-- index.html
|   +-- src/
|       +-- App.tsx               # Router + role-based routes
|       +-- main.tsx              # React entry
|       +-- components/
|       |   +-- Layout/Layout.tsx # Sidebar, top bar, navigation
|       |   +-- ui/               # Radix-based design system
|       +-- features/
|       |   +-- auth/LoginPage.tsx
|       |   +-- workspace/
|       |   +-- git/
|       |   +-- mesh/
|       |   +-- surreal/
|       |   +-- pppoe/
|       |   +-- tenant/
|       |   +-- diagnostics/
|       |   +-- settings/
|       +-- hooks/
|       |   +-- useAuthStore.ts   # Zustand auth state
|       |   +-- useTheme.ts       # Jotai theme atom
|       +-- lib/utils.ts          # cn(), helpers
|       +-- offline/
|           +-- SyncStatusProvider.tsx  # Global sync state
+-- bin/                          # Sidecar binaries (gitignored)
    +-- git-engine.exe
    +-- arsy.exe
    +-- legend.exe
    +-- pocketbase.exe
    +-- radius.exe
```

---

*End of Design Specification*
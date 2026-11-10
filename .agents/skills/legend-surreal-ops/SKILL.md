---
name: legend-surreal-ops
description: >-
  Operate, extend, and query Legend BaaS (Rust + Axum + SurrealDB on :8092) and
  its synchronization with ARSY (:4000) and E-ISP/DX frontends. Use when adding
  operational tables, SurrealQL queries, or Rust endpoints.
---

# Legend BaaS & SurrealDB Operations

Legend (`services/legend/src/main.rs`) is the high-operational Rust BaaS backed by SurrealDB (`namespace: sovereign`, `database: operational`).

## 1. Security & Token Tiers
- **Public**: `GET /health`, `GET /api/v1/meta`.
- **Service Tier** (`LEGEND_SERVICE_TOKEN` or `LEGEND_ADMIN_TOKEN`):
  - `PUT /api/v1/records/:table/:id` — Idempotent `UPSERT type::thing($tb, $id) CONTENT $doc RETURN AFTER`.
  - `POST /api/v1/records/:table` — UUID v4 creation.
  - `GET /api/v1/records/:table?limit=N` — Ordered by `updated_at DESC` (max 1000).
  - `GET /api/v1/records/:table/:id` & `DELETE /api/v1/records/:table/:id`.
- **Admin Tier** (`LEGEND_ADMIN_TOKEN` only):
  - `POST /api/v1/query` — Raw SurrealQL execution (`{ "query": "SELECT * FROM ..." }`).

## 2. SurrealDB 2.x Crate Rules
- Pin `surrealdb = { version = "2.1", features = ["kv-mem", "kv-surrealkv"] }` in `services/legend/Cargo.toml`.
- Convert `surrealdb::Value` to `serde_json::Value` via `value.into_inner().into_json()`.
- Always validate table and record IDs with `is_valid_identifier` (`[a-zA-Z0-9_-]{1,64}`) and bind parameters (`.bind(("tb", table))`) to prevent SurrealQL injection.

## 3. ARSY Read-Through & Hydration
- `services/arsy/src/legend.ts` hydrates `pppoe_sessions` from Legend on boot (`hydrateSessions`) and persists every session create/accounting/terminate via `PUT /api/v1/records/pppoe_sessions/:id`.
- When adding a new operational entity in ARSY, reuse `persistRecord(table, id, payload)` from `services/arsy/src/legend.ts`.


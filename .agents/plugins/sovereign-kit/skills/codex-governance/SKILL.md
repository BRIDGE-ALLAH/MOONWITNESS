---
name: codex-governance
description: Operate the 100% independent database-driven Sovereign Codex // Edge Pulse (Cloudflare Workers + D1 :8787, DX Wiki :3000/wiki, and MCP Server scripts/codex-mcp.ts) for Milestones, Tasks, Progress %, KPIs, Releases, Governance Docs, and Autonomous Comment Triage without any local .plan folder.
---

# Sovereign Codex // Edge Pulse — Database-Driven Governance & MCP Skill

## 1. Purpose & Decoupled Architecture
- **Zero Local `.plan/` Folder**: Never create local `.plan/` markdown files. All milestones, tasks, progress percentages, KPIs, governance specs (`RULE`, `SPEC`, `DESIGN`, `EDGE`, `RFC`), and public/autonomous comments live in the independent Codex database.
- **100% Decoupled Uptime**:
  - **Standalone Edge Portal (`services/codex-edge/src/worker.ts`)**: Runs on `:8787` (`bun run codex:edge`) or Cloudflare Workers + Cloudflare D1 (`wrangler deploy` via `wrangler.toml` + `services/codex-edge/schema.sql`). Stays **100% ONLINE** even when all 9 origin monorepo nodes (`:3000`–`:8092`) are shut down.
  - **Integrated Cockpit View (`apps/dx/src/app/wiki/page.tsx`)**: Accessible at `http://127.0.0.1:3000/wiki` via the global `★ WIKI & PM` pill in `EcosystemTopBar`.
  - **MCP Server (`scripts/codex-mcp.ts` & `POST :8787/mcp`)**: Exposes JSON-RPC 2.0 MCP tools over `stdio` and HTTP.

## 2. Available MCP & CLI Tools
- `codex_get_dashboard`:
  ```bash
  bun run scripts/codex-mcp.ts --dashboard
  ```
- `codex_upsert_milestone`:
  ```bash
  bun run scripts/codex-mcp.ts --tool codex_upsert_milestone --args '{"version":"v0.5.0","title":"Cloudflare Edge Federation","status":"ACTIVE","progressPct":90}'
  ```
- `codex_upsert_task`:
  ```bash
  bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"task-edge-02","title":"Decouple Cloudflare D1 Edge Service","domain":"EDGE_MCP","priority":"CRITICAL","status":"done","progressPct":100}'
  ```
- `codex_upsert_doc`:
  ```bash
  bun run scripts/codex-mcp.ts --tool codex_upsert_doc --args '{"id":"doc-edge-01","category":"EDGE","title":"Cloudflare D1 Edge Protocol","content":"Independent edge state."}'
  ```
- `codex_post_comment`:
  ```bash
  bun run scripts/codex-mcp.ts --tool codex_post_comment --args '{"targetType":"milestone","targetId":"m5-v050","author":"agent@allah.com","sentiment":"IDEA","body":"Add multi-region D1 read replicas"}'
  ```


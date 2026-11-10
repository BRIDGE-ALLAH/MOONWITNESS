---
name: codex-governance
description: Operate the 100% independent database-driven Sovereign Codex // Edge Pulse (https://codex.a-l-l-a-h.com, https://codex.e-isp.id, :8787, :3000/wiki, and MCP Server scripts/codex-mcp.ts) for Milestones, Tasks, Progress %, KPIs, Releases, Governance Docs, and Autonomous Comment Triage without any local .plan folder.
---

# Sovereign Codex // Edge Pulse — Database-Driven Governance & MCP Skill

## 1. Live Public Endpoints & Decoupled Architecture
- **Primary Global Domain**: `https://codex.a-l-l-a-h.com` (MCP: `https://codex.a-l-l-a-h.com/mcp`)
- **Edge Infra Domain**: `https://codex.e-isp.id` (MCP: `https://codex.e-isp.id/mcp`)
- **Local Standalone Edge Daemon**: `http://127.0.0.1:8787` (`bun run codex:edge`)
- **Integrated Cockpit View**: `http://127.0.0.1:3000/wiki`
- **Zero Local `.plan/` Folder**: Never create `.plan/` markdown files (`scripts/gate.ts` blocks `.plan/`). All milestones, tasks, progress percentages, KPIs, specs (`RULE`, `SPEC`, `DESIGN`, `EDGE`, `RFC`), and autonomous comments are persisted in Cloudflare D1 (`sovereign-codex-db`) and mirrored locally.

## 2. Mandatory Agentic Workflow (Before & After Every Task)
1. **Read Live State**:
   ```bash
   bun run codex:mcp --dashboard
   ```
2. **Register / Update Task Progress (`[ ] todo` -> `[~] in_progress` -> `[x] done`)**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"task-slice-01","title":"Implement vertical slice","domain":"BACKEND","priority":"HIGH","status":"in_progress","progressPct":50}'
   ```
3. **Update Milestone or Spec Doc (`RULE` / `SPEC` / `DESIGN` / `EDGE` / `RFC`)**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_upsert_milestone --args '{"id":"m5-v050","version":"v0.5.0","title":"Decoupled Cloudflare Serverless Edge Status & Multi-Region D1","status":"COMPLETED","progressPct":100}'
   ```
4. **Post Autonomous Verification Comment**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_post_comment --args '{"targetType":"milestone","targetId":"m5-v050","author":"autonomous-autopilot","sentiment":"APPROVE","body":"All 5 quality gates and 9/9 E2E smoke tests verified."}'
   ```

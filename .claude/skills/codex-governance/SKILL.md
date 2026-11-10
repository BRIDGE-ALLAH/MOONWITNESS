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
1. **Read Live State & Intelligence**:
   ```bash
   bun run codex:mcp --dashboard
   ```
2. **Register Task as In-Progress Before Writing Code**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"task-slice-01","title":"Implement vertical slice","domain":"BACKEND","priority":"HIGH","status":"in_progress","progressPct":30}'
   ```
3. **Execute Task with Radical Anti-Slop & Out-of-the-Box Innovation**:
   - Synthesize research from papers, GitHub Trending, Trendshift & Reddit (`r/rust`, `r/systemdesign`).
   - Absolute anti-slop: zero TODO, zero mock data, zero placeholder functions.
4. **Update Milestone / Release / Spec Doc**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_upsert_release --args '{"tagName":"v0.4.2","title":"Release Title","channel":"stable","changelogMd":"- Highlights"}'
   ```
5. **Mark Task Completed (`status: done`, `progressPct: 100`)**:
   ```bash
   bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"task-slice-01","status":"done","progressPct":100}'
   ```
6. **Trigger Daily Standup & Telegram Dispatch**:
   ```bash
   bun run codex:daily
   ```

---
name: sovereign-flow
description: >-
  Token-frugal, zero-slop vertical-slice development workflow for the Sovereign
  Monorepo. Use whenever implementing features, fixing bugs, or wiring frontend
  nodes (:3000-:3004) to backend planes (:3200, :4000, :8091, :8092).
---

# Sovereign Vertical-Slice Flow

Execute every task as a complete vertical slice with minimum token burn, radical out-of-the-box thinking, and zero-slop execution.

## 1. Recon, Deep Learning & World Pulse Sourcing
1. Mandatory state check: `bun run codex:mcp --dashboard`.
2. Register task as `in_progress`: `bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"<id>","status":"in_progress","progressPct":25}'`.
3. Out-of-the-box research, Riot Cognition & Planetary Pulse:
   - Synthesize state-of-the-art patterns from online research papers (ArXiv, ACM, IEEE), GitHub Trending, Trendshift, Hacker News, and Reddit (`r/rust`, `r/systemdesign`).
   - Infuse Riot, Brutal, Grunge & Gen-Z creative audacity: reject sterile corporate defaults in UI and architecture; implement aggressive, raw, high-velocity, sovereign engineering.
   - Full-spectrum planetary monitoring: evaluate macroeconomics, currency/energy shifts, geopolitical data sovereignty, subsea cable integrity, cultural velocity, and extreme planetary resilience.
   - Reject vanilla boilerplate in favor of bold, resilient, out-of-the-box sovereign architectures.
4. Token-frugal inspection: Locate symbols with targeted search (`Select-String` / `grep`), read only 40-80 lines around targets.

## 2. Architecture & Data Routing
Route every state mutation to its authoritative plane:
- **Identity / Business / Git Metadata** -> PocketBase (`:8091`) via `pb` client or `services/git-engine` (`:3200`).
- **High-Frequency Telemetry / PPPoE / Controllers** -> Legend BaaS (`:8092`) via server-side Route Handlers using `LEGEND_SERVICE_TOKEN` or `ARSY_SERVICE_TOKEN`.
- **Global Governance, KPIs, Releases & Comments** -> Sovereign Codex Edge (`https://codex.a-l-l-a-h.com`) via `sovereign-codex-mcp`.
- **Never expose service or admin tokens to browser bundles (`NEXT_PUBLIC_*`).** Always proxy mutations through Next.js App Router API routes (`src/app/api/.../route.ts`).

## 3. Zero-Slop & Anti-Synthetic Craftsmanship Contract
- Strictly forbidden in code: `// TODO`, `// FIXME`, `Math.random()`, hardcoded mock arrays, fake success responses, dead buttons, or generic identifiers (`data`, `item`, `res`).
- Eradicate synthetic AI markers: no sterile SaaS boilerplate, no redundant explanatory comments, no superficial try/catch wrappers that mask roots.
- Write decisive, battle-tested code with idiomatic precision and raw human intentionality.
- Every UI control must trigger a real backend/state action or be removed.

## 4. Verification & Ship Loop
1. Run targeted check first: `bun --filter <pkg> check` or `cargo check --manifest-path services/<crate>/Cargo.toml`.
2. Run full 5-stage gate: `bun run gate`.
3. Mark task completed on Codex: `bun run scripts/codex-mcp.ts --tool codex_upsert_task --args '{"id":"<id>","status":"done","progressPct":100}'`.
4. Trigger daily pulse standup: `bun run codex:daily`.
5. Commit with Conventional Commits (`feat(scope): ...`, `fix(scope): ...`) and push to `origin/master`.


---
name: sovereign-flow
description: >-
  Token-frugal, zero-slop vertical-slice development workflow for the Sovereign
  Monorepo. Use whenever implementing features, fixing bugs, or wiring frontend
  nodes (:3000-:3004) to backend planes (:3200, :4000, :8091, :8092).
---

# Sovereign Vertical-Slice Flow

Execute every task as a complete vertical slice with minimum token burn.

## 1. Recon (Token-Frugal)
1. Locate symbols with targeted search (`Select-String` / `grep`) instead of reading full files.
2. Read only the relevant 40-80 lines around the target edit.
3. Verify live node status with `bun run doctor` only when touching network/runtime paths.

## 2. Architecture & Data Routing
Route every state mutation to its authoritative plane:
- **Identity / Business / Git Metadata** -> PocketBase (`:8091`) via `pb` client or `services/git-engine` (`:3200`).
- **High-Frequency Telemetry / PPPoE / Controllers** -> Legend BaaS (`:8092`) via server-side Route Handlers using `LEGEND_SERVICE_TOKEN` or `ARSY_SERVICE_TOKEN`.
- **Never expose service or admin tokens to browser bundles (`NEXT_PUBLIC_*`).** Always proxy mutations through Next.js App Router API routes (`src/app/api/.../route.ts`).

## 3. Zero-Slop Coding Contract
- Forbidden in production code: `// TODO`, `// FIXME`, `Math.random()`, hardcoded mock arrays, silent fake success responses, or generic identifiers (`data`, `item`, `res`).
- Every UI control must trigger a real backend/state action or be removed.

## 4. Verification & Ship Loop
1. Run targeted check first: `bun --filter <pkg> check` or `cargo check --manifest-path services/<crate>/Cargo.toml`.
2. Run full 5-stage gate: `bun run gate`.
3. Commit with Conventional Commits (`feat(scope): ...`, `fix(scope): ...`) and push to `origin/master`.

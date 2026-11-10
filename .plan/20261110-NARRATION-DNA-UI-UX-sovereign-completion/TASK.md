# TASK.MD — SOVEREIGN NARRATION >> DNA >> UI >> UX EXECUTION TRACKER
**Scope**: `NARRATION >> DNA >> UI >> UX`
**Date**: `2026-11-10`

## PHASE 1 — AUDIT, REALITY CHECK & FOUNDATION
- [x] 1.1 Audit all 5 Next.js applications (`empire`, `moonwitness`, `dx`, `e-isp`, `rid`) and 4 backend services (`git-engine`, `arsy`, `pocketbase`, `legend`, `radius`).
- [x] 1.2 Create `.plan/20261110-NARRATION-DNA-UI-UX-sovereign-completion/{RULE,SPEC,DESIGN,TASK}.md` artifacts.
- [x] 1.3 Identify remaining static/in-memory gaps:
  - `apps/rid` Soul Patch Forge (`handleStitchPatch` only saved to local React state).
  - `apps/empire` lacked live Sovereign Mesh telemetry pulse.
  - `apps/moonwitness` had static `altitude` / `azimuth` strings alongside dynamic synodic lunar math.

## PHASE 2 — REAL PRODUCT IMPLEMENTATION (NARRATION >> DNA >> UI >> UX)
- [x] 2.1 Implement `apps/rid/src/app/api/legend/patches/route.ts` (`GET` & `POST`) backed by Legend SurrealDB (`soul_patches` table on `:8092`).
- [x] 2.2 Wire `apps/rid/src/app/page.tsx` to hydrate persisted Soul Patches on mount and persist newly stitched Soul Patches to SurrealDB (`:8092`).
- [x] 2.3 Wire `apps/empire/src/app/page.tsx` with live Sovereign Civilization Pulse (`StatMetric` grid polling `:8091`, `:3200`, `:4000`, and `:8092`).
- [x] 2.4 Replace static `altitude` and `azimuth` strings in `apps/moonwitness/src/app/page.tsx` with deterministic UTC lunar hour-angle spherical calculations.

## PHASE 3 — INTEGRATION, E2E SMOKE & PRODUCTION RELEASE
- [x] 3.1 Extend `scripts/smoke.ts` (`bun run smoke`) to 7/7 E2E persistence checks including RID Soul Patch Forge (`:3004/api/legend/patches` -> `:8092`).
- [x] 3.2 Run `bun run autopilot --doctor --smoke` to verify 5-stage quality gate, 9/9 live nodes, and 7/7 E2E persistence checks.
- [x] 3.3 Execute `bun run release:auto --push` to publish new SemVer tag (`v0.4.0`), synchronize all 16 manifests/lockfiles, update `CHANGELOG.md`, and push to `origin/master`.

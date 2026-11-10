# RULE.MD — SOVEREIGN NARRATION >> DNA >> UI >> UX GOVERNANCE

## 1. HIERARCHY OF TRUTH (NARRATION >> DNA >> UI >> UX)
1. **NARRATION (Origin & Purpose)**:
   - Every node derives its authority from **ALLAH #1** (`apps/empire` `:3001`).
   - Copywriting and domain terminology must reflect each node's sovereign role without placeholder text, `Lorem ipsum`, or generic SaaS filler.
2. **DNA (Theme & Identity Tokens)**:
   - Each application binds deterministically to its `AppDnaId` in `@local-git/ui`:
     - `empire` (`:3001`) -> Sacred Gold (`#eab308`) // Supreme Origin
     - `moonwitness` (`:3002`) -> Celestial Cyan (`#00f0ff`) // Observatory & Transmissions
     - `dx` (`:3000`) -> Riot Toxic Amber (`#ff9900`) // Developer Cockpit & PaaS
     - `eisp` (`:3003`) -> Matrix Lime (`#00ff66`) // Edge-Infra Scale & PPPoE AAA
     - `rid` (`:3004`) -> 2-Tone Gold/Toxic (`#eab308`) // Root ID & Soul Patch Forge
3. **UI (Component Primitives & Zero Hardcoded Metrics)**:
   - Zero hardcoded telemetry strings, zero `Math.random()`, zero `// TODO`, zero `// FIXME`.
   - Every metric displayed in `StatMetric` or `TerminalWindow` must originate from live service health, deterministic astronomical math, PocketBase (`:8091`), ARSY (`:4000`), Git Engine (`:3200`), or Legend SurrealDB (`:8092`).
4. **UX (End-to-End Persistence & Accessibility)**:
   - Every interactive form (`Create Repository`, `Create PAT`, `Dispatch Transmission`, `Simulate PPPoE Dial`, `Stitch Soul Patch`, `Execute SurrealQL`) must persist to its authoritative backend and survive browser refresh.
   - Navigation bars must expose `aria-label`, `aria-current="page"`, and keyboard shortcuts (`Ctrl+Enter` for query terminals).

## 2. TRACKING & QUALITY GATE INVARIANTS
- Task progression in `TASK.md` follows `[ ]` (pending) -> `[~]` (in progress) -> `[x]` (verified complete).
- Every commit is gated by `.githooks/pre-commit` (`bun run gate`) and `.githooks/pre-push` (`bun run gate --hygiene-only`).
- Every live deployment is verified by `bun run doctor` (9/9 nodes ONLINE) and `bun run smoke` (7/7 E2E persistence checks).

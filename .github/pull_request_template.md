## ⚡ Sovereign Monorepo — Change Verification & Quality Gate

### 1. Type of Change
- [ ] `feat`: New feature or vertical slice
- [ ] `fix`: Bug fix
- [ ] `perf`: Performance improvement
- [ ] `refactor`: Structural improvement without behavior change
- [ ] `security`: Vulnerability remediation or token guard hardening
- [ ] `chore`: Tooling, dependencies, or governance

### 2. Monorepo Quality Gate Self-Check
- [ ] Zero-Slop Hygiene: Strictly zero `// TODO`, `// FIXME`, `Math.random()`, or mock arrays in production code.
- [ ] TypeScript Check: `bun run check` passes across all 8 workspaces.
- [ ] Tests: `bun run test` (contracts, engine, arsy) & `bun run test:rust` (legend, radius) pass.
- [ ] No Secrets: Zero `.env*` files committed or tracked.
- [ ] Rust Hygiene: `cargo fmt --check` and `cargo clippy -- -D warnings` pass cleanly.

### 3. Affected Boundaries
- [ ] Frontend apps (`apps/dx`, `apps/empire`, `apps/moonwitness`, `apps/e-isp`, `apps/rid`)
- [ ] Engine / Controller (`services/git-engine`, `services/arsy`)
- [ ] High-cadence BaaS & AAA (`services/legend`, `services/radius`)
- [ ] Shared Packages (`packages/contracts`, `packages/ui`)

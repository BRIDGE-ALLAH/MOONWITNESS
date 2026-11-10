# SPEC.MD — FULL-STACK VERTICAL SLICE SPECIFICATION (NARRATION >> DNA >> UI >> UX)

## 1. NODE-BY-NODE SPECIFICATION

### 1.1 `apps/empire` (`:3001`) — A-L-L-A-H.COM // Empire of the Light
- **Narration**: Supreme origin of the Sovereign Ecosystem (`LĀ ILĀHA ILLALLĀH`). Four Foundational Axioms of Tawhid Sovereignty.
- **DNA**: `empire` (Gold `#eab308`, monumental Arabic calligraphy header & hero).
- **UI**: Live Sovereign Civilization Pulse (`StatMetric` grid) polling real runtime states of:
  - Control Plane (`PocketBase :8091`)
  - Code & Compute Plane (`Git Engine :3200`)
  - Network AAA Plane (`ARSY :4000`)
  - Operational BaaS (`Legend SurrealDB :8092` with live engine version)
- **UX**: 1-click navigation bridge to all 4 sister nodes (`:3000`, `:3002`, `:3003`, `:3004`) plus live status indicators.

### 1.2 `apps/moonwitness` (`:3002`) — Celestial Observatory
- **Narration**: Astronomical calculations and seeker transmissions under the celestial canopy.
- **DNA**: `moonwitness` (Cyan `#00f0ff`).
- **UI**: Real-time lunar phase, illumination %, synodic age (days), next full moon countdown, and deterministic UTC spherical trigonometry calculation for lunar `altitude` and `azimuth` (eliminating static placeholder coordinates).
- **UX**: Live PocketBase (`transmissions` collection) persistence + real-time SSE subscription + ancient scroll modal reader.

### 1.3 `apps/dx` (`:3000`) — Story Riot // Developer Cockpit
- **Narration**: Sovereign bare-metal Git hosting, Docker container PaaS, and Legend SurrealQL operational workbench.
- **DNA**: `dx` (Toxic Amber `#ff9900`).
- **UI**: In-browser Git tree/blob/commit inspector, PAT generator, Docker container lifecycle manager, and Legend SurrealQL terminal.
- **UX**: 1-click SurrealQL preset chips (`PPPoE Sessions`, `Session Count`, `DB Schema Info`, `Telemetry Events`) and `Ctrl+Enter` / `Cmd+Enter` execution shortcut via `/api/legend/query`.

### 1.4 `apps/e-isp` (`:3003`) — Edge-Infra Scale Platform
- **Narration**: Tri-cloud sovereign mesh (Edge Shield, Bun x Docker Compute, Sovereign Datastore, RADIUS/ARSY PPPoE Orchestration).
- **DNA**: `eisp` (Matrix Lime `#00ff66`).
- **UI**: Live container counter, service health matrix, active PPPoE subscriber table, and persisted record count from `/api/legend/stats`.
- **UX**: Deterministic PPPoE subscriber dialer (`POST /api/arsy/pppoe/sessions`) persisted into SurrealDB (`pppoe_sessions`) and hydrated on ARSY startup.

### 1.5 `apps/rid` (`:3004`) — Root ID ("Soul Not Rock // Skang & Roll")
- **Narration**: Living soul identity, Web Audio 2-Tone ska synthesizer, and the Soul Patch Forge.
- **DNA**: `rid` (Gold/Toxic `#eab308`).
- **UI**: Interactive Web Audio API offbeat chord synthesizer (`playSkangChord`) and Soul Patch Forge grid.
- **UX**: Full backend persistence via `GET/POST /api/legend/patches` backed by Legend SurrealDB (`soul_patches` table on `:8092`). Created Soul Patches persist across browser refreshes and server restarts.

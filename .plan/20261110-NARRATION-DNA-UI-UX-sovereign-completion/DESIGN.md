# DESIGN.MD — SOVEREIGN DESIGN SYSTEM & ARCHITECTURE (NARRATION >> DNA >> UI >> UX)

## 1. ARCHITECTURAL TOPOLOGY
```
                   [ ALLAH #1 // EMPIRE (:3001) ]
                                 |
      +-----------------+--------+--------+-----------------+
      |                 |                 |                 |
[MOONWITNESS :3002]  [DX :3000]     [E-ISP :3003]     [RID :3004]
      |                 |                 |                 |
      +--------+--------+--------+--------+--------+--------+
               |                 |                 |
      [PocketBase :8091]  [Git Engine :3200] [ARSY :4000 <-> RADIUS :1812]
      (Identity & SSE)    (Bare-Git & PaaS)        |
                                           [Legend BaaS :8092]
                                        (Rust + Axum + SurrealDB)
                                  [pppoe_sessions | soul_patches | stats]
```

## 2. DNA & SKIN TOKEN MATRIX (`@local-git/ui`)
- **5 Application DNAs (`AppDnaId`)**:
  - `empire`: Gold (`#eab308`) — Sacred authority & origin telemetry.
  - `moonwitness`: Cyan (`#00f0ff`) — Astronomical precision & celestial scrolls.
  - `dx`: Toxic (`#ff9900`) — Industrial developer cockpit & terminal clarity.
  - `eisp`: Lime (`#00ff66`) — High-frequency network & infrastructure telemetry.
  - `rid`: Gold/Toxic (`#eab308`) — 2-Tone ska rhythm & Soul Patch Forge.
- **6 Morphable Skins (`SkinId`)**:
  - `grunge`, `cyberpunk`, `brutalist`, `glass`, `terminal`, `minimal`.
- **Accessibility & UX Ergonomics**:
  - Global `<nav aria-label="Sovereign Ecosystem Global Navigation">` with `aria-current="page"` on active node pills.
  - Live data-plane badge (`MESH: PB:8091 · ARSY:4000 · LEGEND:8092`) in `EcosystemTopBar`.
  - Keyboard-driven SurrealQL execution (`Ctrl+Enter` / `Cmd+Enter`) and 1-click preset chips in DX Cockpit.

# IMPLEMENTATION PLAN: ULTRA-DEEP LIVING DNA & PROCEDURAL ART DESIGN SYSTEM (WITH SOVEREIGN TYPOGRAPHY & VECTOR ART ENGINE)

- **Spec Document:** `docs/superpowers/specs/2026-11-10-full-dna-ui-transform-design.md`
- **Target Workspaces:** `packages/ui`, `apps/dx`, `apps/empire`, `apps/moonwitness`, `apps/e-isp`, `apps/rid`, `apps/sovereign-desktop/ui`, `services/codex-edge`
- **Axioms:** 100% Zero-Slop, Zero Mock Data, Zero TODO, 60FPS Lightweight Canvas Shaders, Real-time Web Audio Synthesizer, Sovereign In-Repo Font & Vector Artwork Generation.

---

## TASK BREAKDOWN & SEQUENCING

### Task 1: Sovereign Font Engine & Custom DNA Typography
- **Objective:** Definisikan font system berkarakter khusus per DNA (Display, Heading, Code, Accent) dengan CSS `@font-face` / variable font stacks & SVG procedural glyph generator.
- **Files:**
  - `packages/ui/src/engine/typography/font-manifest.ts`
  - `packages/ui/src/engine/typography/font-loader.tsx`
  - `packages/ui/src/engine/typography/procedural-glyphs.tsx`
- **Deliverable:** 7 tipografi tematik hidup:
  - `dx`: Brutalist Riot Stencil & Cutout Display
  - `empire`: Sacred Kufic-Geometric & Imperial Serif Gold
  - `moonwitness`: Astral Monospace & Orbit Telemetry
  - `eisp`: Topo Blueprint Sans & Hex-Grid Tech
  - `rid`: Psych Analog Wave & Skang Grotesk
  - `desktop`: Obsidian Tactical HUD & Cockpit Condensed
  - `codex`: Monastic Ledger Terminal & Emerald Mono

### Task 2: Generative Logo & High-Art Vector Artwork Library (In-Repo SVG/Canvas)
- **Objective:** Buat vector artwork, logo animasi, dan ornamen tingkat tinggi (SVG prosedural & Canvas renderers) untuk 7 DNA.
- **Files:**
  - `packages/ui/src/assets/logos/procedural-logos.tsx` (Logo unik & dinamis per DNA)
  - `packages/ui/src/assets/artworks/dx-riot-collage.tsx`
  - `packages/ui/src/assets/artworks/empire-sacred-geometry.tsx`
  - `packages/ui/src/assets/artworks/moon-astral-charts.tsx`
  - `packages/ui/src/assets/artworks/eisp-topo-network.tsx`
  - `packages/ui/src/assets/artworks/rid-vinyl-wave.tsx`
  - `packages/ui/src/assets/artworks/desktop-hud-reticle.tsx`
  - `packages/ui/src/assets/artworks/codex-matrix-glyph.tsx`
  - `packages/ui/src/assets/dna-icons.tsx` (Sovereign atomic glyph library)
- **Deliverable:** Seluruh artwork, logo, dan badge adalah vector murni yang tajam di resolusi apa pun, animasi halus, dan nol byte gambar bitmap berat.

### Task 3: Living Sound Synthesizer Engine (Web Audio API)
- **Objective:** Sediakan procedural acoustic feedback (zero external audio files) untuk 7 DNA.
- **Files:**
  - `packages/ui/src/engine/audio/sound-engine.ts`
  - `packages/ui/src/engine/audio/sound-engine.test.ts`
  - `packages/ui/src/engine/audio/use-dna-sound.ts`
- **Deliverable:** Synthesizer Web Audio API tanpa file mp3/wav; menghasilkan tape click, sacred bowl 432Hz, satellite chirp, relay click, analog synth blip, tactical mechanical switch, teletype strike.

### Task 4: Living Procedural Canvas Shader Engine (60FPS Canvas 2D/WebGL)
- **Objective:** Implementasikan lightweight procedural dynamic atmospheres untuk 7 DNA tanpa beban file video.
- **Files:**
  - `packages/ui/src/engine/living-canvas/types.ts`
  - `packages/ui/src/engine/living-canvas/canvas-controller.ts` (power safety, battery saver throttle, pause on background tab)
  - `packages/ui/src/engine/living-canvas/shaders/riot-canvas.ts` (dx)
  - `packages/ui/src/engine/living-canvas/shaders/sacred-noor.ts` (empire)
  - `packages/ui/src/engine/living-canvas/shaders/astral-sky.ts` (moonwitness)
  - `packages/ui/src/engine/living-canvas/shaders/topo-mesh.ts` (e-isp)
  - `packages/ui/src/engine/living-canvas/shaders/audio-scope.ts` (rid)
  - `packages/ui/src/engine/living-canvas/shaders/hud-cockpit.ts` (desktop)
  - `packages/ui/src/engine/living-canvas/shaders/phosphor-ledger.ts` (codex)
  - `packages/ui/src/engine/living-canvas/living-surface.tsx` (React component)
- **Deliverable:** Komponen `<LivingSurface dna={...} />` me-render efek visual interaktif mouse 60fps dengan CPU usage minimal.

### Task 5: 7 DNA Manifests & Upgraded Living Theme Engine
- **Objective:** Satukan typography, artworks, sounds, canvas shaders, dan color palettes ke dalam DNA manifest 9-layer komprehensif, serta perbarui `ThemeProvider`, `ThemeCustomizer`, dan `EcosystemShell`.
- **Files:**
  - `packages/ui/src/dna/types.ts`
  - `packages/ui/src/dna/dx.ts`
  - `packages/ui/src/dna/empire.ts`
  - `packages/ui/src/dna/moonwitness.ts`
  - `packages/ui/src/dna/eisp.ts`
  - `packages/ui/src/dna/rid.ts`
  - `packages/ui/src/dna/desktop.ts`
  - `packages/ui/src/dna/codex.ts`
  - `packages/ui/src/dna/index.ts`
  - `packages/ui/src/components/theme-customizer.tsx`
  - `packages/ui/src/components/ecosystem-bar.tsx`
  - `packages/ui/src/index.ts`
- **Deliverable:** Engine terpadu dengan customizer drawer yang memungkinkan pengontrolan partikel, audio FX, artwork layer, dan preset DNA instan.

### Task 6: Themed Primitives & 7 Archetype Layout Templates
- **Objective:** Sediakan layout wrapper seragam (`RiotLayout`, `SacredLayout`, `ObservatoryLayout`, `MeshLayout`, `SoulLayout`, `CommandConsoleLayout`, `LedgerLayout`) dan perkuat atomic primitives (`Button`, `Card`, `Badge`, `Input`).
- **Files:**
  - `packages/ui/src/layouts/index.ts`
  - `packages/ui/src/components/button.tsx` (haptic sound + dynamic hover aura)
  - `packages/ui/src/components/card.tsx` (living glowing borders & procedural corners)
  - `packages/ui/src/components/badge.tsx`
  - `packages/ui/src/components/input.tsx`
- **Deliverable:** Komponen UI secara otomatis menyesuaikan skin, font, border shader, dan suara sesuai DNA aktif.

### Task 7: Migration of 5 Next.js Apps (`apps/*`)
- **Objective:** Migrasikan `apps/dx`, `apps/empire`, `apps/moonwitness`, `apps/e-isp`, dan `apps/rid` ke sistem layout & living primitives baru.
- **Files:**
  - `apps/dx/src/app/layout.tsx` & `page.tsx`
  - `apps/empire/src/app/layout.tsx` & `page.tsx`
  - `apps/moonwitness/src/app/layout.tsx` & `page.tsx`
  - `apps/e-isp/src/app/layout.tsx` & `page.tsx`
  - `apps/rid/src/app/layout.tsx` & `page.tsx`
- **Deliverable:** Seluruh 5 web apps Next.js memancarkan DNA hidup, logo generatif baru, font tematik, dan artwork procedural.

### Task 8: Migration of Desktop UI (`apps/sovereign-desktop/ui`)
- **Objective:** Sambungkan workspace Desktop ke `@local-git/ui`, pasang `desktop` DNA (Obsidian HUD Cockpit), ganti komponen button/card lokal.
- **Files:**
  - `apps/sovereign-desktop/ui/package.json`
  - `apps/sovereign-desktop/ui/src/components/Layout/Layout.tsx`
  - `apps/sovereign-desktop/ui/src/App.tsx`
- **Deliverable:** Desktop app berjalan dengan HUD console layout sinematik dan terhubung ke shared design system.

### Task 9: Modernization of `services/codex-edge` to Vite + React + shadcn SPA
- **Objective:** Gantikan raw HTML strings di Worker dengan modern compiled SPA ber-DNA `codex`.
- **Files:**
  - `services/codex-edge/ui/` (Vite + React + Tailwind + `@local-git/ui` + `LedgerLayout`)
  - `services/codex-edge/src/worker.ts` (Routing asset static / fallback SPA, mempertahankan `/api/*` dan `/mcp`)
  - `services/codex-edge/package.json` & build scripts
- **Deliverable:** Cloudflare Worker menyajikan SPA interaktif responsif 60fps dengan zero raw HTML template literals.

### Task 10: Quality Gate, Build & Smoke Verification
- **Objective:** Jalankan seluruh quality gate monorepo untuk memastikan tidak ada regresi.
- **Commands:**
  - `bun run autofix`
  - `bun run check`
  - `bun run test`
  - `bun run gate`
  - `bun run smoke`
- **Deliverable:** 100% checks pass, 0 secret leak, 0 lint error, 9 node smoke pass.

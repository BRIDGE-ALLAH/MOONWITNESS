# Project: Sovereign UI Evolution & Block-Level Design System

## Architecture
Modular, zero-dependency, pure procedural vector and canvas block design system extending `@local-git/ui`, with interaction primitives and deep visual blocks integrated across all 7 frontend surfaces in the Sovereign Monorepo.

### Package & Module Boundaries
1. `@local-git/ui` (`packages/ui`):
   - `src/blocks/`: Visual component blocks (Tactical HUD, Sacred Geometric Cards, Isometric Network Graph, Audio Visualizer, Cosmic Archives).
   - `src/vectors/`: Pure procedural SVG/Canvas vector asset libraries (marks, badges, ornaments, dividers, data indicators).
   - `src/engine/interactions/`: Gesture controls, keyboard micro-shortcuts, tactile drag/drop, sound-reactive canvas triggers.
   - `src/engine/audio/`: Enhanced procedural Web Audio synthesizer with event bus and frequency analysis.
   - `src/index.ts`: Unified barrel exports.
2. Web Frontends:
   - `apps/dx` (:3000): Developer Cockpit & Lab (Next.js 16).
   - `apps/empire` (:3001): A-L-L-A-H.COM Sovereign Light (Next.js 16).
   - `apps/moonwitness` (:3002): Celestial Observatory (Next.js 16).
   - `apps/e-isp` (:3003): Edge-Infra Scale Platform (Next.js 16).
   - `apps/rid` (:3004): Root ID & Web Audio Soul Patch Forge (Next.js 15.1).
3. Desktop & Edge Surfaces:
   - `apps/sovereign-desktop/ui`: Tauri Desktop application (Vite 5 + React).
   - `services/codex-edge` (:8787): Sovereign Codex Edge Pulse (Cloudflare Workers / Bun).
4. Testing & Verification Plane:
   - `tests/e2e-ui/`: Requirement-driven opaque-box E2E test suite.
   - `scripts/gate.ts`: Monorepo AST hygiene, 16-manifest sync, TypeScript, unit tests, secret scan.
   - `scripts/smoke.ts`: Live 9-node runtime mesh smoke verification.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Tactical HUD Blocks | Reusable HUD blocks with corner L-brackets, status telemetry, scanline toggle, and reticle | M1 | Survey 1 |
| 2 | Sacred Geometric Cards | Golden-ratio Islamic geometric cards with octagrams/flower of life and golden radial aura | M1 | Survey 1 |
| 3 | Isometric Network Graphs | 2.5D isometric mesh graph with dynamic node pulses and telemetry | M1 | Survey 1 |
| 4 | Audio Visualizer Canvas Blocks | Real-time oscilloscope waveform, FFT bars, and circular radar canvas blocks | M1 | Survey 1 |
| 5 | Cosmic Archives | Celestial archives with procedural starfield canvas, RA/Dec coordinates, and expandable items | M1 | Survey 1 |
| 6 | Animated Marks | Procedural animated SVG glyphs (SovereignSeal, RadarSweep, GlitchGlyph, CelestialOrbit, TawhidRay, SineWaveform) | M1 | Survey 1 |
| 7 | Procedural Badges | Chamfered, shield crest, lozenge, hazard, and LED status badges | M1 | Survey 1 |
| 8 | Procedural Ornaments | Tactical brackets, rosettes, PCB traces, and OrnamentFrame wrapper | M1 | Survey 1 |
| 9 | Procedural Dividers | Tactical, hazard, sacred, pulse, matrix, and celestial vector dividers | M1 | Survey 1 |
| 10 | Data Indicators | Gauges, segmented resource bars, sparkline graphs, and radial progress rings | M1 | Survey 1 |
| 11 | Gesture Controls | Zero-dependency Pointer Event gesture system (swipe, pan, long press, pinch, double tap) | M2 | Survey 2 |
| 12 | Keyboard Micro-Shortcuts | Shortcut registry, useKeyboardMicroShortcuts hook, ShortcutBadge, ShortcutOverlayModal | M2 | Survey 2 |
| 13 | Tactile Drag & Drop Blocks | Pointer-driven tactile drag/drop blocks, drop zones, context provider, and physics feedback | M2 | Survey 2 |
| 14 | Sound-Reactive Canvas & Audio | Event bus, AnalyserNode, chord/drone synthesis routines, and shockwave canvas triggers | M2 | Survey 2 |
| 15 | Surface Integration: `apps/dx` | Mount Tactical HUD, Isometric Network Graph, Dividers, and Keyboard Shortcuts in DX Cockpit | M3 | Survey 3 |
| 16 | Surface Integration: `apps/empire` | Mount Sacred Geometric Cards, Tactical HUD, Tawhid Ray, and Ornaments in Sanctum | M3 | Survey 3 |
| 17 | Surface Integration: `apps/moonwitness` | Mount Cosmic Archives, Astral Tactical HUD, Celestial Orbit, and Gestures in Observatory | M3 | Survey 3 |
| 18 | Surface Integration: `apps/e-isp` | Mount Isometric Network Graph, Tactical HUD, Data Indicators, and Drag/Drop in E-ISP | M3 | Survey 3 |
| 19 | Surface Integration: `apps/rid` | Mount Audio Visualizer Canvas, Sound Triggers, Drag/Drop Soul Patches in RID Forge | M3 | Survey 3 |
| 20 | Surface Integration: Desktop | Mount Isometric Network Graph in MeshPage, Tactical HUD in Diagnostics, Cosmic Archives in Releases | M4 | Survey 3 |
| 21 | Surface Integration: Edge | Mount procedural SVG marks, dividers, badges, and data indicators in Edge Pulse HTML stream | M4 | Survey 3 |
| 22 | Final E2E Test & Gate Pass | 100% E2E test suite pass, `bun run check`, `bun run gate`, `bun run smoke` | M5 | Survey 1-3 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | UI Blocks & Procedural Vectors | Implement R1 blocks and R2 vector assets in `packages/ui` | none | IN_PROGRESS |
| M2 | Interaction Primitives & Audio Engine | Implement R3 gestures, shortcuts, drag/drop, sound-reactive canvas triggers & audio enhancements in `packages/ui` | M1 | PLANNED |
| M3 | Web Frontends Integration | Integrate new components across `apps/dx`, `apps/empire`, `apps/moonwitness`, `apps/e-isp`, `apps/rid` | M1, M2 | PLANNED |
| M4 | Desktop & Edge Integration | Integrate new components across `apps/sovereign-desktop/ui` and `services/codex-edge` | M1, M2 | PLANNED |
| M5 | Final E2E Verification & Gates | 100% E2E tests pass, full monorepo quality gate (`check`, `gate`, `smoke`) | M3, M4 | PLANNED |

---

## Interface Contracts

### `@local-git/ui/blocks`
```typescript
export interface TacticalHudBlockProps {
  dna?: DnaSoundProfile;
  title: string;
  callsign?: string;
  coordinates?: string;
  status?: string;
  scanlines?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface SacredGeometricCardProps {
  dna?: DnaSoundProfile;
  title: string;
  subtitle?: string;
  pattern?: "octagram" | "flower-of-life" | "arabesque";
  auraColor?: string;
  children?: React.ReactNode;
  className?: string;
}

export interface IsometricNetworkGraphProps {
  nodes?: Array<{ id: string; label: string; x: number; y: number; z?: number; status: "online" | "syncing" | "offline" }>;
  edges?: Array<{ from: string; to: string; active?: boolean }>;
  width?: number;
  height?: number;
  className?: string;
}

export interface AudioVisualizerBlockProps {
  dna?: DnaSoundProfile;
  mode?: "oscilloscope" | "fft-bars" | "circular-radar";
  analyser?: AnalyserNode;
  height?: number;
  className?: string;
}

export interface CosmicArchivesProps {
  title?: string;
  items: Array<{ id: string; title: string; timestamp: string; coordinates?: string; tag?: string; content?: React.ReactNode }>;
  className?: string;
}
```

### `@local-git/ui/vectors`
```typescript
export interface AnimatedMarkProps {
  mark: "sovereign-seal" | "radar-sweep" | "glitch-glyph" | "celestial-orbit" | "tawhid-ray" | "sine-wave";
  size?: number;
  color?: string;
  className?: string;
}

export interface ProceduralBadgeProps {
  variant?: "chamfer" | "shield" | "lozenge" | "hazard" | "led";
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}

export interface ProceduralOrnamentProps {
  ornament: "corner-brackets" | "rosette" | "pcb-trace" | "crosshair";
  size?: number;
  className?: string;
}

export interface ProceduralDividerProps {
  variant?: "tactical" | "hazard" | "sacred" | "pulse" | "matrix" | "celestial";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export interface DataIndicatorProps {
  type: "arc-dial" | "segmented-bar" | "radial-ring";
  value: number; // 0..100
  label?: string;
  className?: string;
}

export interface SparklineGraphProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}
```

### `@local-git/ui/interactions` & Audio
```typescript
export interface GestureHandlers {
  onSwipe?: (direction: "left" | "right" | "up" | "down", velocity: number) => void;
  onPan?: (offset: { x: number; y: number }, velocity: { x: number; y: number }) => void;
  onLongPress?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
}

export interface ShortcutItem {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  alt?: boolean;
  shift?: boolean;
  description: string;
  action: () => void;
}

export interface SoundTriggerEvent {
  type: "click" | "hover" | "chord" | "drone" | "snap" | "glitch";
  dna: DnaSoundProfile;
  frequency?: number;
  intensity?: number;
  timestamp: number;
}
```

---

## Code Layout
- `packages/ui/src/blocks/`: Owned by M1 Worker.
- `packages/ui/src/vectors/`: Owned by M1 Worker.
- `packages/ui/src/engine/interactions/`: Owned by M2 Worker.
- `packages/ui/src/engine/audio/`: Owned by M2 Worker.
- `packages/ui/src/index.ts`: Owned by M2 Worker (exports both M1 and M2 modules).
- `apps/dx/src/`: Owned by M3 Worker.
- `apps/empire/src/`: Owned by M3 Worker.
- `apps/moonwitness/src/`: Owned by M3 Worker.
- `apps/e-isp/src/`: Owned by M3 Worker.
- `apps/rid/src/`: Owned by M3 Worker.
- `apps/sovereign-desktop/ui/src/`: Owned by M4 Worker.
- `services/codex-edge/src/`: Owned by M4 Worker.
- `tests/e2e-ui/`: Owned by E2E Testing Track Orchestrator / Test Writer.

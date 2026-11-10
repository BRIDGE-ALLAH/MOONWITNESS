# TEST_INFRA.md — Sovereign UI Evolution & Block-Level Design System E2E Testing Infrastructure

## 1. Test Philosophy & Design Principles

### 1.1 Opaque-Box, Requirement-Driven Verification
The Sovereign UI E2E test suite adheres strictly to **opaque-box (black-box) testing principles**:
- **Source of Truth**: All test scenarios, expected behaviors, inputs, and assertion criteria are derived strictly from functional requirements in `ORIGINAL_REQUEST.md` and public interface contracts in `PROJECT.md`.
- **Integrity Rule**: No existing test files (`*.test.ts`, `*.spec.ts`) are inspected to infer behavior. The test suite operates independently as an uncompromised verification harness.
- **Zero Internal Coupling**: Tests interact solely with public component exports (`@local-git/ui`), standard DOM/Pointer/Keyboard events, public props, and the public Web Audio event bus (`sovereignSound`). Internal component state, unexported helpers, and private variables are never accessed.

### 1.2 Formal Test Design Methodologies
The test suite applies four formal engineering methodologies to ensure exhaustive coverage:
1. **Category-Partitioning**:
   - Deconstructs input parameters (props, themes, variants, orientations) into discrete equivalence partitions.
   - For every component, valid nominal partitions, boundary partitions, and error/fallback partitions are systematically exercised.
2. **Boundary Value Analysis (BVA)**:
   - Probes numerical, string, and collection limits: values at min, min-1, max, max+1, empty collections `[]`, zero dimensions `0x0`, extreme coordinates, and missing optional props.
   - Verifies graceful fallback and clamping without uncaught exceptions or rendering freezes.
3. **Pairwise (Combinatorial) Interaction Testing**:
   - Evaluates multi-dimensional feature interactions (DNA Theme $\times$ Block Variant $\times$ Gesture State $\times$ Audio Trigger) using orthogonal 2-way combinations to uncover emergent defects without combinatorial explosion.
4. **Workload & Stress Modeling**:
   - Validates stability under burst input sequences: rapid pointer gesture streams, high-cadence audio trigger storms (100+ events/sec), large topology graphs (50+ nodes and edges), and high-frequency data streams.

---

## 2. Feature Inventory & Tier Coverage Matrix

Every feature is tracked across Tier 1 (Baseline), Tier 2 (Boundary), and Tier 3 (Pairwise Interactions):

| # | Feature | Subsystem / Contract | Tier 1 (Baseline) | Tier 2 (Boundary) | Tier 3 (Pairwise) | Description |
|---|---|---|:---:|:---:|:---:|---|
| **F1** | Tactical HUD Blocks | `@local-git/ui/blocks` (`TacticalHudBlock`) | [x] | [x] | [x] | Cyber-tactical HUD blocks with L-brackets, status telemetry, scanlines, and reticle |
| **F2** | Sacred Geometric Cards | `@local-git/ui/blocks` (`SacredGeometricCard`) | [x] | [x] | [x] | Islamic geometric cards with golden-ratio octagrams/flower of life and golden radial aura |
| **F3** | Isometric Network Graphs | `@local-git/ui/blocks` (`IsometricNetworkGraph`) | [x] | [x] | [x] | 2.5D isometric mesh graph with dynamic node pulses and telemetry readouts |
| **F4** | Audio Visualizer Canvas Blocks | `@local-git/ui/blocks` (`AudioVisualizerBlock`) | [x] | [x] | [x] | Real-time oscilloscope waveform, FFT bars, and circular radar canvas blocks |
| **F5** | Cosmic Archives | `@local-git/ui/blocks` (`CosmicArchives`) | [x] | [x] | [x] | Celestial archives with procedural starfield canvas, RA/Dec coordinates, and expandable items |
| **F6** | Animated Marks | `@local-git/ui/vectors` (`AnimatedMark`) | [x] | [x] | [x] | Procedural animated SVG glyphs (SovereignSeal, RadarSweep, GlitchGlyph, CelestialOrbit, TawhidRay, SineWaveform) |
| **F7** | Procedural Badges | `@local-git/ui/vectors` (`ProceduralBadge`) | [x] | [x] | [x] | Chamfered, shield crest, lozenge, hazard, and LED status badges |
| **F8** | Procedural Ornaments | `@local-git/ui/vectors` (`ProceduralOrnament`) | [x] | [x] | [x] | Tactical corner brackets, rosettes, PCB traces, and OrnamentFrame wrapper |
| **F9** | Procedural Dividers | `@local-git/ui/vectors` (`ProceduralDivider`) | [x] | [x] | [x] | Tactical, hazard, sacred, pulse, matrix, and celestial vector dividers |
| **F10** | Data Indicators | `@local-git/ui/vectors` (`DataIndicator`, `SparklineGraph`) | [x] | [x] | [x] | Arc gauges, segmented resource bars, sparkline graphs, and radial progress rings |
| **F11** | Gesture Controls | `@local-git/ui/interactions` (`useGesture`, `GestureZone`) | [x] | [x] | [x] | Zero-dependency Pointer Event gesture system (swipe, pan, long press, pinch, double tap) |
| **F12** | Keyboard Micro-Shortcuts | `@local-git/ui/interactions` (`useKeyboardMicroShortcuts`, `ShortcutBadge`, `ShortcutOverlayModal`) | [x] | [x] | [x] | Shortcut registry, key binding normalization, keycap badges, and command overlay HUD |
| **F13** | Tactile Drag & Drop Blocks | `@local-git/ui/interactions` (`TactileDragProvider`, `TactileDraggableBlock`, `TactileDropZone`) | [x] | [x] | [x] | Pointer-driven drag blocks, drop zones, context provider, and physics feedback |
| **F14** | Sound-Reactive Canvas & Audio | `@local-git/ui/engine` (`DnaSoundSynthesizer`, `sovereignSound`, `useDnaSound`, `SoundReactiveCanvasBlock`) | [x] | [x] | [x] | Event bus, AnalyserNode, chord/drone synthesis routines, and shockwave canvas triggers |
| **F15** | Surface Integration: `apps/dx` | `apps/dx` (:3000) | [x] | [x] | [x] | Mount Tactical HUD, Isometric Network Graph, Dividers, and Keyboard Shortcuts in DX Cockpit & Wiki |
| **F16** | Surface Integration: `apps/empire` | `apps/empire` (:3001) | [x] | [x] | [x] | Mount Sacred Geometric Cards, Tactical HUD, Tawhid Ray, and Ornaments in Sanctum |
| **F17** | Surface Integration: `apps/moonwitness` | `apps/moonwitness` (:3002) | [x] | [x] | [x] | Mount Cosmic Archives, Astral Tactical HUD, Celestial Orbit, and Gestures in Observatory |
| **F18** | Surface Integration: `apps/e-isp` | `apps/e-isp` (:3003) | [x] | [x] | [x] | Mount Isometric Network Graph, Tactical HUD, Data Indicators, and Drag/Drop in E-ISP |
| **F19** | Surface Integration: `apps/rid` | `apps/rid` (:3004) | [x] | [x] | [x] | Mount Audio Visualizer Canvas, Sound Triggers, Drag/Drop Soul Patches in RID Forge |
| **F20** | Surface Integration: Desktop | `apps/sovereign-desktop/ui` | [x] | [x] | [x] | Mount Isometric Graph in MeshPage, Tactical HUD in Diagnostics, Archives in Releases, Layout Shortcuts |
| **F21** | Surface Integration: Edge | `services/codex-edge` (:8787) | [x] | [x] | [x] | Mount procedural SVG marks, dividers, badges, and data indicators in Edge Pulse HTML stream |

---

## 3. Test Architecture & Runner Specification

### 3.1 Test Runner Location & Invocation
- **Test Runner**: Native Bun Test (`bun test`) executing in the workspace root `z:\repo\dx`.
- **Command Script**: Added to root `package.json`:
  ```bash
  bun run test:e2e-ui
  # maps directly to:
  bun test tests/e2e-ui
  ```
- **Monorepo Quality Gate Integration**:
  - Wired into `scripts/gate.ts` as an automated verification stage alongside type checks and unit test suites.
  - Executable in CI/CD and pre-push hooks without external browser binaries (headless DOM execution).

### 3.2 Pass / Fail Semantics
- **Exit Code 0**: Exactly 100% of tests pass with 0 assertion failures, 0 unhandled promise rejections, and 0 uncaught exceptions.
- **Exit Code 1**: Any test failure, assertion mismatch, or unhandled runtime exception terminates execution and returns non-zero.
- **Test Timeouts**: Default 5000ms per test case; 15000ms for continuous animation loops and Canvas stress tests.
- **Deterministic Assertion Standards**: Zero arbitrary `setTimeout(..., 500)` sleeps. Tests utilize deterministic event dispatching, DOM mutation observers, or microtask flushing.

### 3.3 Directory Layout
```
tests/e2e-ui/
├── harness/
│   ├── dom-environment.ts          # Window, document, navigator, PointerEvent, ResizeObserver polyfills
│   ├── canvas-mock.ts              # Headless CanvasRenderingContext2D call recorder & state tracker
│   ├── audio-mock.ts               # AudioContext, AnalyserNode, OscillatorNode mock stubs
│   ├── svg-queries.ts              # DOM query helpers for SVG elements, attributes, viewBox, paths
│   └── test-harness.ts             # Unified render, unmount, dispatchPointer, dispatchKey helpers
├── tier1-features/
│   ├── test-f01-tactical-hud.test.tsx
│   ├── test-f02-sacred-card.test.tsx
│   ├── test-f03-isometric-graph.test.tsx
│   ├── test-f04-audio-visualizer.test.tsx
│   ├── test-f05-cosmic-archives.test.tsx
│   ├── test-f06-animated-marks.test.tsx
│   ├── test-f07-procedural-badges.test.tsx
│   ├── test-f08-procedural-ornaments.test.tsx
│   ├── test-f09-procedural-dividers.test.tsx
│   ├── test-f10-data-indicators.test.tsx
│   ├── test-f11-gesture-controls.test.tsx
│   ├── test-f12-keyboard-shortcuts.test.tsx
│   ├── test-f13-tactile-dnd.test.tsx
│   ├── test-f14-sound-reactive-audio.test.tsx
│   ├── test-f15-surface-dx.test.tsx
│   ├── test-f16-surface-empire.test.tsx
│   ├── test-f17-surface-moonwitness.test.tsx
│   ├── test-f18-surface-eisp.test.tsx
│   ├── test-f19-surface-rid.test.tsx
│   ├── test-f20-surface-desktop.test.tsx
│   └── test-f21-surface-edge.test.tsx
├── tier2-boundary/
│   ├── test-boundary-f01-f05-blocks.test.tsx
│   ├── test-boundary-f06-f10-vectors.test.tsx
│   ├── test-boundary-f11-f14-interactions.test.tsx
│   └── test-boundary-f15-f21-surfaces.test.tsx
├── tier3-pairwise/
│   └── test-pairwise-interactions.test.tsx
└── tier4-scenarios/
    ├── test-scenario-dx-cockpit.test.tsx
    ├── test-scenario-empire-sanctum.test.tsx
    ├── test-scenario-moonwitness-observatory.test.tsx
    ├── test-scenario-eisp-telemetry.test.tsx
    ├── test-scenario-rid-patch-forge.test.tsx
    └── test-scenario-desktop-edge-governance.test.tsx
```

---

## 4. Detailed Test Case Distribution Specification

### 4.1 Tier 1: Functional Baseline Coverage ($\ge 5$ tests per feature, 105+ tests total)

| Feature | Test Case IDs | Test Names & Nominal Verification Scope |
|---|---|---|
| **F1: Tactical HUD Blocks** | `T1-F01-01` to `T1-F01-05` | 1. Renders container with corner L-bracket SVG elements.<br>2. Renders title, callsign, and coordinates text correctly.<br>3. Renders scanline overlay when `scanlines={true}`.<br>4. Omits scanline overlay when `scanlines={false}`.<br>5. Propagates `className` and renders nested `children` content. |
| **F2: Sacred Geometric Cards** | `T1-F02-01` to `T1-F02-05` | 1. Renders card with default `octagram` Islamic geometric SVG.<br>2. Renders `flower-of-life` pattern when pattern prop is specified.<br>3. Renders `arabesque` pattern when pattern prop is specified.<br>4. Renders golden radial aura gradient style when `auraColor` is provided.<br>5. Displays title, subtitle, and card body children. |
| **F3: Isometric Network Graphs** | `T1-F03-01` to `T1-F03-05` | 1. Renders canvas/SVG container with specified `width` and `height`.<br>2. Projects 3D node coordinates `(x, y, z)` into 2.5D isometric viewport plane.<br>3. Renders active network edges connecting source and target nodes.<br>4. Displays status colors corresponding to "online", "syncing", and "offline".<br>5. Emits node click/hover telemetry event when node element is selected. |
| **F4: Audio Visualizer Canvas Blocks** | `T1-F04-01` to `T1-F04-05` | 1. Mounts canvas and initializes 2D rendering context.<br>2. Executes oscilloscope waveform rendering loop using time-domain data.<br>3. Renders FFT frequency bar graph when `mode="fft-bars"`.<br>4. Renders circular radar scan line when `mode="circular-radar"`.<br>5. Respects specified `height` prop and dynamic resize events. |
| **F5: Cosmic Archives** | `T1-F05-01` to `T1-F05-05` | 1. Renders procedural starfield canvas background.<br>2. Renders list of archive items with title, timestamp, and coordinates.<br>3. Toggles item drawer expansion on click to reveal item content.<br>4. Renders celestial tags and callout badges per item.<br>5. Applies custom `className` and DNA theme accents. |
| **F6: Animated Marks** | `T1-F06-01` to `T1-F06-06` | 1. Renders `sovereign-seal` with concentric hexagram vector paths.<br>2. Renders `radar-sweep` with sweeping beam polygon.<br>3. Renders `glitch-glyph` with chromatic displacement layers.<br>4. Renders `celestial-orbit` with orbital ellipse and satellite mark.<br>5. Renders `tawhid-ray` with radiant linear pulses.<br>6. Renders `sine-wave` with smooth mathematical bezier curve path. |
| **F7: Procedural Badges** | `T1-F07-01` to `T1-F07-05` | 1. Renders `chamfer` badge with 45° corner polygon clips.<br>2. Renders `shield` crest vector badge.<br>3. Renders `lozenge` pill badge with rounded pill geometry.<br>4. Renders `hazard` badge with diagonal caution stripes.<br>5. Renders `led` badge with active pulsing indicator for each status ("active", "warning", "danger", "neutral"). |
| **F8: Procedural Ornaments** | `T1-F08-01` to `T1-F08-05` | 1. Renders `corner-brackets` tactical L-shapes at container corners.<br>2. Renders `rosette` sacred geometric vector medallion.<br>3. Renders `pcb-trace` circuit board bus-lines.<br>4. Renders `crosshair` tactical reticle alignment marks.<br>5. `OrnamentFrame` correctly wraps child content with ornamental borders. |
| **F9: Procedural Dividers** | `T1-F09-01` to `T1-F09-05` | 1. Renders horizontal and vertical `tactical` divider with millimeter ticks.<br>2. Renders `hazard` divider with diagonal chevron path.<br>3. Renders `sacred` divider with interlaced star center glyph.<br>4. Renders `pulse` divider with ECG heartbeat vector spikes.<br>5. Renders `matrix` and `celestial` dividers with byte/node patterns. |
| **F10: Data Indicators** | `T1-F10-01` to `T1-F10-05` | 1. Renders `arc-dial` gauge with SVG stroke-dasharray corresponding to value.<br>2. Renders `segmented-bar` with active filled segments matching value 0..100.<br>3. Renders `radial-ring` circular progress SVG.<br>4. `SparklineGraph` generates smooth polyline path from number array.<br>5. Displays numerical value and optional label text. |
| **F11: Gesture Controls** | `T1-F11-01` to `T1-F11-05` | 1. Fires `onSwipe` with correct direction ("left", "right", "up", "down") and velocity.<br>2. Fires continuous `onPan` with cumulative offset and delta coordinates.<br>3. Triggers `onLongPress` after pointer hold exceeding 500ms threshold.<br>4. Fires `onDoubleTap` when two pointerdown events occur within 300ms.<br>5. Fires `onPinch` with scale factor on multi-pointer distance delta. |
| **F12: Keyboard Micro-Shortcuts** | `T1-F12-01` to `T1-F12-05` | 1. Registers shortcuts and invokes callback when matching key combo is pressed.<br>2. Recognizes modifier combinations (`Ctrl+K`, `Cmd+K`, `Alt+1`, `Shift+?`).<br>3. Ignores shortcut trigger when active element is an `<input>` or `<textarea>`.<br>4. `<ShortcutBadge>` renders styled keycap tags for keyboard combinations.<br>5. `<ShortcutOverlayModal>` opens on trigger and displays list of registered shortcuts. |
| **F13: Tactile Drag & Drop Blocks** | `T1-F13-01` to `T1-F13-05` | 1. `<TactileDraggableBlock>` initiates drag state on pointerdown and movement.<br>2. Updates drag preview position during pointermove.<br>3. `<TactileDropZone>` detects pointer entry and applies hover highlight styling.<br>4. Emits `onDrop` event with dropped block payload on pointerup inside drop zone.<br>5. Cancels drag state and resets block position on pointercancel or drop outside zone. |
| **F14: Sound-Reactive Canvas & Audio** | `T1-F14-01` to `T1-F14-05` | 1. `sovereignSound.subscribe` registers listener and receives `SoundTriggerEvent`.<br>2. `playClick` and `playHover` publish sound events with DNA profile.<br>3. `playSkangChord` executes staccato 3-oscillator chord synthesis.<br>4. `playBootDrone` synthesizes PSX-inspired sub-bass drone and chimes.<br>5. `<SoundReactiveCanvasBlock>` renders ripple/shockwave animation upon audio event. |
| **F15: Surface: `apps/dx`** | `T1-F15-01` to `T1-F15-05` | 1. Verifies `TacticalHudBlock` is mounted in DX Cockpit.<br>2. Verifies `IsometricNetworkGraph` renders the 9 monorepo nodes in DX Lab.<br>3. Verifies `ProceduralDivider` renders between DX Cockpit sections.<br>4. Verifies global keyboard shortcuts are active in DX layout.<br>5. Verifies DX DNA theme tokens (`dna="dx"`) apply to HUD and components. |
| **F16: Surface: `apps/empire`** | `T1-F16-01` to `T1-F16-05` | 1. Verifies Triad Axiom Sanctum Cards render using `SacredGeometricCard`.<br>2. Verifies `TawhidRay` animated mark renders in Sanctum header.<br>3. Verifies `TacticalHudBlock` mounts on Core Plane Harmony Monitor.<br>4. Verifies sacred procedural dividers separate sanctum sections.<br>5. Verifies gold aesthetic tokens and aura styles render cleanly. |
| **F17: Surface: `apps/moonwitness`** | `T1-F17-01` to `T1-F17-05` | 1. Verifies Astral Telemetry bar renders using `TacticalHudBlock`.<br>2. Verifies `CosmicArchives` mounts in Celestial Transmission Feed.<br>3. Verifies `CelestialOrbit` animated mark indicates orbital transit.<br>4. Verifies `RadialRing` progress indicator renders lunar phase percentage.<br>5. Verifies gesture controls respond to swipe on observatory canvas. |
| **F18: Surface: `apps/e-isp`** | `T1-F18-01` to `T1-F18-05` | 1. Verifies `IsometricNetworkGraph` renders live ISP nodes and sessions.<br>2. Verifies `TacticalHudBlock` wraps Subscriber Dialing Engine.<br>3. Verifies `DataIndicator` segmented bars render CPU/RAM/Bandwidth telemetry.<br>4. Verifies `SparklineGraph` renders latency/throughput trends.<br>5. Verifies `TactileDraggableBlock` enables drag/drop session subscriber reassignment. |
| **F19: Surface: `apps/rid`** | `T1-F19-01` to `T1-F19-05` | 1. Verifies `AudioVisualizerBlock` mounts in Root ID Soul Patch Forge.<br>2. Verifies sound trigger connects `playSkangChord()` to visualizer canvas.<br>3. Verifies `TactileDraggableBlock` and `TactileDropZone` reorder soul patches.<br>4. Verifies acid/toxic `ProceduralBadge` indicates active patch bank.<br>5. Verifies living surface renders sound-reactive phosphor ripples on chord stabs. |
| **F20: Surface: Desktop** | `T1-F20-01` to `T1-F20-05` | 1. Verifies `IsometricNetworkGraph` renders in Desktop `MeshPage`.<br>2. Verifies `TacticalHudBlock` renders in Desktop `DiagnosticsPage`.<br>3. Verifies `CosmicArchives` renders in Desktop `ReleasesPage`.<br>4. Verifies keyboard shortcut registry handles desktop navigation.<br>5. Verifies desktop dark theme styling and zero hydration errors. |
| **F21: Surface: Edge** | `T1-F21-01` to `T1-F21-05` | 1. Verifies `renderStandaloneEdgeHtml()` outputs valid procedural SVG mark tags.<br>2. Verifies procedural dividers render in Edge Pulse HTML stream.<br>3. Verifies procedural status badges render for edge node health.<br>4. Verifies data indicator gauges render in edge KPI bar.<br>5. Verifies standalone HTML renders with 0 React runtime dependencies on Bun. |

---

### 4.2 Tier 2: Boundary, Limit, Corner & Robustness Cases ($\ge 5$ tests per feature, 105+ tests total)

| Feature | Test Case IDs | Boundary & Extreme Condition Verification Scope |
|---|---|---|
| **F1: Tactical HUD** | `T2-F01-01` to `T2-F01-05` | 1. Missing optional props (empty title, no callsign, no coordinates) renders without error.<br>2. Extremely long string inputs (500+ chars in title/callsign) truncate or wrap without layout overflow.<br>3. Empty children `children={null}` or `children={undefined}` renders clean shell.<br>4. Rapid toggle of `scanlines` boolean 100 times in succession maintains DOM stability.<br>5. Zero-width / zero-height container flexbox constraints do not crash component. |
| **F2: Sacred Card** | `T2-F02-01` to `T2-F02-05` | 1. Unknown or malformed `pattern` string falls back gracefully to default `octagram`.<br>2. Invalid hex or malformed `auraColor` (e.g. `""`, `"rgba(invalid)"`) uses default fallback glow.<br>3. Zero-size container dimensions clamp SVG viewBox cleanly.<br>4. Rapid hover/unhover oscillation does not leave orphaned CSS animation classes.<br>5. Nested deep React elements inside children render without style bleeding. |
| **F3: Isometric Graph** | `T2-F03-01` to `T2-F03-05` | 1. Empty `nodes=[]` and `edges=[]` renders empty isometric grid without errors.<br>2. Dangling edge references (`from` or `to` node IDs not present in nodes array) are filtered safely.<br>3. Extreme 3D coordinates (negative numbers, $x > 10000$, $z < -5000$) clamp within visible bounding box.<br>4. Scale stress test: 100 nodes and 200 edges render within 50ms without frame stutter.<br>5. Zero or negative `width` / `height` props fall back to container default dimensions. |
| **F4: Audio Visualizer** | `T2-F04-01` to `T2-F04-05` | 1. Uninitialized or disconnected `analyser` prop renders idle flatline gracefully.<br>2. Rapid switching between visualizer modes (`oscilloscope` -> `fft-bars` -> `circular-radar`) does not leak animation frames.<br>3. Extreme amplitude audio data (all 0s or all 255s) clamps cleanly to canvas limits.<br>4. Canvas resize to 0px height/width pauses render loop cleanly.<br>5. Component unmount during active render loop cancels `requestAnimationFrame` immediately. |
| **F5: Cosmic Archives** | `T2-F05-01` to `T2-F05-05` | 1. Empty `items=[]` renders empty state message with procedural starfield intact.<br>2. Archive item with missing coordinates or tags displays fallback placeholder.<br>3. Opening and closing all items simultaneously maintains accordion state integrity.<br>4. List with 1000 archive items renders virtualized or paginated without thread locking.<br>5. Special characters and unicode entities in archive titles render securely without XSS. |
| **F6: Animated Marks** | `T2-F06-01` to `T2-F06-05` | 1. Unknown `mark` prop string defaults safely to `sovereign-seal`.<br>2. Extreme `size={0}` or `size={10000}` renders valid non-negative SVG viewBox.<br>3. Rapid prop mutations (mark type changes every 16ms) render cleanly without SVG DOM thrashing.<br>4. Transparent or `color="transparent"` prop renders visible path geometry with zero opacity.<br>5. Rendering multiple identical marks in the same DOM tree does not generate duplicate SVG gradient IDs. |
| **F7: Badges** | `T2-F07-01` to `T2-F07-05` | 1. Empty label string `label=""` renders compact pill/badge without layout collapse.<br>2. Out-of-bounds `status` string defaults cleanly to `neutral`.<br>3. Ultra-long label (200+ characters) truncates with ellipsis.<br>4. Chamfer badge in high-DPI scaling context preserves crisp 45° corner geometry.<br>5. Rapid status changes (`active` -> `danger` -> `warning`) transition CSS classes smoothly. |
| **F8: Ornaments** | `T2-F08-01` to `T2-F08-05` | 1. Unknown `ornament` string falls back cleanly to `corner-brackets`.<br>2. `OrnamentFrame` with `size=0` clamps to minimum 1px ornamental margin.<br>3. Nested `OrnamentFrame` components render without recursive style inheritance errors.<br>4. Crosshair ornament in non-square aspect ratio container maintains 1:1 reticle ratio.<br>5. Rosette geometry math avoids NaN/Infinity during zero-radius edge cases. |
| **F9: Dividers** | `T2-F09-01` to `T2-F09-05` | 1. Vertical orientation inside 0px height parent container falls back to minimum visible stroke.<br>2. Unknown `variant` defaults safely to `tactical`.<br>3. Container width smaller than center ornamental icon (width < 32px) scales center mark gracefully.<br>4. Rapid orientation toggle (`horizontal` <-> `vertical`) recomputes SVG viewBox dimensions.<br>5. High-contrast theme mode dynamically updates divider stroke colors. |
| **F10: Data Indicators** | `T2-F10-01` to `T2-F10-05` | 1. Negative `value = -50` clamps to 0% fill cleanly.<br>2. Overflow `value = 250` clamps to 100% fill cleanly.<br>3. Non-numeric or NaN values (`value = NaN`) fallback to 0 with warning.<br>4. `SparklineGraph` with empty array `data=[]` renders flatline at base baseline.<br>5. `SparklineGraph` with single data point `data=[42]` renders centered point or horizontal line. |
| **F11: Gestures** | `T2-F11-01` to `T2-F11-05` | 1. Micro-drifts (< 5px total movement) do not trigger swipe or pan handlers.<br>2. Pointer cancel event (`pointercancel`) aborts active swipe/longpress without firing callbacks.<br>3. Multi-touch with 3+ fingers does not cause Euclidean distance NaN in pinch handler.<br>4. Long press release at 499ms does NOT fire `onLongPress` (strict 500ms threshold).<br>5. Double tap second touch at 301ms does NOT fire `onDoubleTap` (strict 300ms window). |
| **F12: Shortcuts** | `T2-F12-01` to `T2-F12-05` | 1. Unregistered key presses pass through untouched without intercepting normal typing.<br>2. Modifier key combinations (`Ctrl`, `Meta`, `Alt`, `Shift`) must match exact configuration.<br>3. Rapid keystroke bursts (20 keydown events in 100ms) invoke handler deterministically without queuing lag.<br>4. Modals and inputs with `data-allow-shortcuts="true"` allow explicit override.<br>5. Keyboard shortcut unmount unregisters global event listener, preventing memory leaks. |
| **F13: Drag & Drop** | `T2-F13-01` to `T2-F13-05` | 1. Drag started and dropped at same coordinate resets without triggering state mutations.<br>2. Multiple draggable blocks dragged simultaneously (multi-touch) are handled or clamped to single active drag.<br>3. Dragging outside browser viewport boundary and releasing resets draggable block smoothly.<br>4. Drop target nested inside another drop target dispatches drop event only to the topmost target.<br>5. Dragging disabled block (`disabled={true}`) blocks pointer capture and drag initiation. |
| **F14: Sound & Audio** | `T2-F14-01` to `T2-F14-05` | 1. Calling audio synthesis methods before user interaction gesture does not throw unhandled AudioContext errors.<br>2. Rapid burst of 100 audio triggers in 50ms does not exhaust audio oscillators or drop UI frames.<br>3. Calling `setMuted(true)` immediately silences output and stops active oscillators.<br>4. Calling `subscribe` returns an unsubscribe function that cleanly detaches listener.<br>5. Sound reactive canvas trigger receives valid default intensity when event payload omits intensity. |
| **F15: Surface DX** | `T2-F15-01` to `T2-F15-05` | 1. DX Cockpit mounts correctly when offline from network services (graceful fallback state).<br>2. Isometric Network Graph in DX handles 0 online nodes by displaying all nodes in offline red styling.<br>3. Resizing DX browser viewport from 4K to mobile 320px adapts HUD blocks without text collision.<br>4. Switching DX Wiki tabs rapidly does not cause multiple duplicate shortcut registries.<br>5. DX Cockpit terminal window handles 10,000 log lines with procedural dividers intact. |
| **F16: Surface Empire** | `T2-F16-01` to `T2-F16-05` | 1. Sanctum renders cleanly on screens with high contrast or forced dark mode.<br>2. Rapidly toggling between Triad Axiom cards preserves individual card state.<br>3. TawhidRay animation remains smooth without dropping below 50fps during background tasks.<br>4. Harmony index calculation handles NaN/null inputs by displaying "CALIBRATING...".<br>5. Sacred card pattern with zero dimensions renders fallback golden border. |
| **F17: Surface Moonwitness** | `T2-F17-01` to `T2-F17-05` | 1. Astral telemetry bar displays fallback dashes when coordinate GPS/azimuth is unavailable.<br>2. Cosmic Archives handles empty transmission stream without crashing starfield canvas.<br>3. Starfield canvas adapts to device pixel ratios (1x, 2x, 3x Retina) with crisp stars.<br>4. Celestial orbit animated mark handles extreme inclination angles without clipping.<br>5. Rapid swipe gesture storm on observatory surface does not cause memory accumulation. |
| **F18: Surface E-ISP** | `T2-F18-01` to `T2-F18-05` | 1. Subscriber Dialing Engine handles 0 active sessions by showing standby tactical HUD status.<br>2. Data indicator sparklines handle constant zero throughput without divide-by-zero math errors.<br>3. Dragging subscriber profile to invalid non-drop area snaps back without session loss.<br>4. Dialing burst of 50 subscribers updates segmented resource bars monotonically.<br>5. Legend BaaS disconnect shows warning badge and maintains UI operability. |
| **F19: Surface RID** | `T2-F19-01` to `T2-F19-05` | 1. Triggering `playSkangChord` with frequency = 0 or negative frequency clamps to 20Hz minimum audible note.<br>2. Audio visualizer handles silent input without freezing render loop (renders baseline zero line).<br>3. Dragging soul patch beyond drop zone bank boundaries returns patch to original position.<br>4. Rapid sequential clicks on soul patches trigger audio staccato stabs without clipping.<br>5. Phosphor trail fade in living surface handles tab backgrounding without runaway delta timing. |
| **F20: Surface Desktop** | `T2-F20-01` to `T2-F20-05` | 1. Desktop route transitions (`/app/mesh` -> `/app/diagnostics`) cleanly unmount canvas blocks.<br>2. Window minimize/restore events recalculate isometric network graph dimensions without distortion.<br>3. Keyboard navigation operates without mouse/pointer availability.<br>4. High system load does not cause audio click latency spikes in desktop buttons.<br>5. Offline status displays local cached state in Cosmic Archives without blocking UI. |
| **F21: Surface Edge** | `T2-F21-01` to `T2-F21-05` | 1. Edge Pulse HTML stream handles missing query params (`GET /`) with full default HUD render.<br>2. Corrupted D1 database state renders clean edge error badge without raw stack trace leak.<br>3. Heavy traffic burst to edge endpoint streams valid SVG markup without buffering timeouts.<br>4. Edge HTML stream contains zero client-side React script dependencies.<br>5. SVG output validates against W3C SVG 1.1 specification standards. |

---

### 4.3 Tier 3: Combinatorial & Cross-Feature Pairwise Interactions (10 Interaction Suites)

| Suite | Feature Pair | Interaction Description & Verification Criteria |
|---|---|---|
| **P1** | F01 (Tactical HUD) $\times$ F10 (Data Indicators) | Embedding arc dials and segmented resource bars inside a Tactical HUD block: verifies telemetry updates dynamically propagate through HUD layout without clipping. |
| **P2** | F02 (Sacred Card) $\times$ F06 (Animated Marks) | Embedding `TawhidRay` and `SovereignSeal` inside a Sacred Geometric Card: verifies CSS keyframe animations and SVG rotational transforms synchronize smoothly with golden aura glow. |
| **P3** | F03 (Isometric Graph) $\times$ F01 (Tactical HUD) | Selecting a node in the Isometric Network Graph populates its real-time telemetry readouts inside an adjacent Tactical HUD block: verifies node selection event wiring and coordinate projection. |
| **P4** | F04 (Audio Visualizer) $\times$ F14 (Sound Engine) | Triggering `playSkangChord` and `playBootDrone` synthesizers broadcasts `SoundTriggerEvent` which drives real-time waveform oscillations on `AudioVisualizerBlock`: verifies end-to-end audio-to-visual pipeline. |
| **P5** | F05 (Cosmic Archives) $\times$ F11 (Gesture Controls) | Attaching touch/pointer gestures (swipe and pinch-to-zoom) to the Cosmic Archives starfield viewport: verifies celestial item navigation and zoom scaling through pointer gestures. |
| **P6** | F11 (Gesture Controls) $\times$ F14 (Sound Engine) | Executing swipe and long-press gestures dispatches micro-haptic sound feedback clicks through `sovereignSound`: verifies pointer event coordinates trigger audio feedback. |
| **P7** | F12 (Keyboard Shortcuts) $\times$ F01 (Tactical HUD) | Pressing keyboard micro-shortcut (`Alt+S`) toggles the scanline raster effect on Tactical HUD blocks: verifies global keyboard listener updates block state. |
| **P8** | F13 (Tactile Drag & Drop) $\times$ F14 (Sound Engine) | Initiating drag triggers audio lift snap; hovering over drop zone triggers harmonic hum; releasing into drop zone triggers latch punch sound: verifies tactile physics-to-audio feedback. |
| **P9** | F13 (Tactile Drag & Drop) $\times$ F07 (Procedural Badges) | Dragging and dropping status badges into different priority buckets updates badge variant from `neutral` to `active` with pulsing LED: verifies state-driven badge morphing. |
| **P10** | F09 (Procedural Dividers) $\times$ F08 (Procedural Ornaments) | Interlacing procedural vector dividers with corner bracket ornaments in composite layout frames: verifies geometric alignment, stroke thickness consistency, and responsive scaling. |

---

## 5. Real-World Application Scenarios (Tier 4) Table & Workflow Specifications

Tier 4 exercises complete, multi-surface user workflows across all 7 frontend surfaces:

| Scenario ID | Primary Surface | Scenario Title | User Role | Workflows & Components Exercised |
|---|---|---|---|---|
| **S1** | `apps/dx` (:3000) | Developer Cockpit Mesh Telemetry & Lab Diagnostics | Core Systems Engineer | Keyboard shortcuts (`Alt+1`) -> 9-Node Isometric Graph -> Node Selection -> Tactical HUD Telemetry -> Scanline Toggle -> Tactical Divider -> Audio Click SFX |
| **S2** | `apps/empire` (:3001) | Sovereign Sanctum Axiom Meditation & Harmony Audit | Sovereign Architect | Sacred Geometric Cards (Triad Axioms) -> Hover Radial Aura -> TawhidRay Pulse -> Harmony Monitor HUD -> Sacred Dividers -> Zero-Jitter Status |
| **S3** | `apps/moonwitness` (:3002) | Celestial Observatory Astrometric Tracking & Archive Retrieval | Chief Astronomer | Pointer Swipe Gesture -> Elevation Tracking -> Astral Tactical HUD -> Cosmic Archives Starfield Canvas -> CelestialOrbit Mark -> Radial Progress Ring |
| **S4** | `apps/e-isp` (:3003) | Edge Network Operations Center Subscriber Dialing & Bandwidth Balancing | ISP Network Operator | 2.5D Isometric Topology -> Subscriber Dialing HUD -> Pointer Drag & Drop Session Reassignment -> Segmented Resource Bars -> Sparkline Throughput Graphs |
| **S5** | `apps/rid` (:3004) | Root ID Ska Sound Patch Forge & Real-Time Synthesis | Sovereign Musician / Patch Engineer | Soul Patch Selection -> `playSkangChord()` 3-Note Staccato Stab -> Audio Visualizer Oscilloscope Waveform -> Drag/Drop Patch Bank -> Toxic Badge LED -> Phosphor Shockwave |
| **S6** | `apps/sovereign-desktop/ui` & `services/codex-edge` (:8787) | Cross-Platform Release Governance & Edge Pulse Stream | Release Governor / Auditor | Desktop Route Navigation -> MeshPage Graph -> Diagnostics HUD -> Releases Cosmic Archives -> Cloudflare Worker HTML Stream -> Standalone Procedural SVG Marks |

### Detailed Workflow Specifications

#### Scenario S1: Developer Cockpit Mesh Telemetry & Lab Diagnostics (`apps/dx`)
1. **Entry**: Engineer launches DX Cockpit (`apps/dx` on `:3000`).
2. **Keyboard Navigation**: Pressing `Alt+1` or `Ctrl+K` invokes `useKeyboardMicroShortcuts`, opening the shortcut overlay and switching the active workbench tab.
3. **Topology Inspection**: The `IsometricNetworkGraph` renders the 9 Sovereign Monorepo nodes with active pulse rings.
4. **Interactive Selection**: Engineer clicks the `LEGEND (:8092)` node. The graph projects coordinates and selects the node.
5. **HUD Telemetry Readout**: Adjacent `TacticalHudBlock` updates its callsign to `"LGD-8092"`, displays coordinates `"32.89 N / 13.04 E"`, and renders active scanlines.
6. **Divider & Sound**: Tactical vector divider separates query metrics from terminal output; each button click triggers `sovereignSound.playClick('dx')`.

#### Scenario S2: Sovereign Sanctum Axiom Meditation & Harmony Audit (`apps/empire`)
1. **Entry**: Architect accesses Sanctum (`apps/empire` on `:3001`).
2. **Sanctum Rendering**: Three `SacredGeometricCard` components display the Triad Axioms: `TAWHID`, `DETERMINISTIC PURITY`, and `ETERNAL PULSE`.
3. **Procedural Geometry**: Golden-ratio octagram and flower of life SVG paths render with golden radial gradients.
4. **Interactive Hover**: Hovering over the `TAWHID` card expands its golden radial aura and triggers `sovereignSound.playHover('empire')`.
5. **Harmonic Pulse**: Header mounts `AnimatedMark` with `mark="tawhid-ray"`, pulsating outward into procedural sacred vector dividers.
6. **Plane Harmony**: Core Plane Harmony Monitor wraps its health status inside `TacticalHudBlock` with zero layout jitter.

#### Scenario S3: Celestial Observatory Astrometric Tracking & Archive Retrieval (`apps/moonwitness`)
1. **Entry**: Astronomer navigates to Moonwitness Observatory (`apps/moonwitness` on `:3002`).
2. **Touch / Pointer Navigation**: Astronomer executes an upward swipe (`onSwipe("up")`, velocity > 0.5) using `useGesture` over the celestial starfield.
3. **HUD Coordinate Tracking**: Astral `TacticalHudBlock` updates right ascension and declination readouts to match the new viewport position.
4. **Archive Discovery**: Astronomer clicks on a chronicle in `CosmicArchives`. The item drawer expands smoothly, displaying stellar observation notes.
5. **Orbit Visualization**: An `AnimatedMark` (`celestial-orbit`) indicates satellite orbital transit across the moon.
6. **Lunar Telemetry**: Data indicator radial ring displays current lunar cycle illumination percentage (e.g. 78%).

#### Scenario S4: Edge Network Operations Center Subscriber Dialing (`apps/e-isp`)
1. **Entry**: Network operator opens E-ISP Console (`apps/e-isp` on `:3003`).
2. **Mesh Topology**: 2.5D `IsometricNetworkGraph` renders active PPPoE subscriber nodes connected to ARSY and Legend edges.
3. **Subscriber Management**: Operator uses `TactileDraggableBlock` to pick up a high-bandwidth subscriber session card.
4. **Drop Zone Latch**: Operator hovers over the "High-Priority QoS" `TactileDropZone`. The zone illuminates with neon green dashed borders; releasing triggers the drop latch event and audio punch haptic.
5. **Resource Telemetry**: `DataIndicator` segmented bars reflect updated CPU core load and subscriber session saturation.
6. **Throughput Trends**: `SparklineGraph` plots real-time megabit transfer rates with smoothed SVG polyline paths.

#### Scenario S5: Root ID Ska Sound Patch Forge & Real-Time Synthesis (`apps/rid`)
1. **Entry**: Patch engineer opens Root ID Forge (`apps/rid` on `:3004`).
2. **Audio Patch Trigger**: Engineer clicks "sp-01 Ska Skank" button.
3. **Procedural Web Audio**: Synthesizer fires `playSkangChord(440)`—a 3-oscillator staccato organ/guitar stab with zero external audio assets.
4. **Event Bus Propagation**: Event bus transmits `SoundTriggerEvent` (`type: "chord"`, `dna: "rid"`, `intensity: 0.85`).
5. **Real-Time Oscilloscope**: `AudioVisualizerBlock` receives audio stream and renders the high-frequency waveform on Canvas 2D with green phosphor decay.
6. **Patch Bank Reordering**: Engineer drags patch blocks into the active patch rack via `TactileDraggableBlock`, updating toxic LED status badges.

#### Scenario S6: Cross-Platform Release Governance & Edge Pulse Stream (Desktop & Edge)
1. **Entry (Desktop)**: Release governor opens Tauri Desktop (`apps/sovereign-desktop/ui`).
2. **Mesh Routing**: Governor navigates to `/app/mesh`; `IsometricNetworkGraph` renders the local monorepo topology inside `MeshPage`.
3. **Diagnostics & Releases**: Navigates to `/app/diagnostics` (monitored via `TacticalHudBlock`) and `/app/releases` (listing SemVer releases via `CosmicArchives`).
4. **Edge Pulse Streaming**: Release governor requests Edge Pulse (`services/codex-edge` on `:8787`).
5. **Zero-React HTML Stream**: Cloudflare Worker responds with `renderStandaloneEdgeHtml()` containing pure procedural SVG marks (`SovereignSeal`, `RadarSweep`), procedural matrix dividers, and LED health badges.
6. **Cross-Platform Verification**: Confirms complete visual and design system parity across native desktop window and edge HTTP stream.

---

## 6. Coverage Thresholds & Quality Acceptance Criteria

### 6.1 Quantitative Test Thresholds
- **Tier 1 (Functional Baseline)**: $\ge 5$ test cases per feature $\times$ 21 features = **$\ge 105$ tests**.
- **Tier 2 (Boundary & Corner Cases)**: $\ge 5$ test cases per feature $\times$ 21 features = **$\ge 105$ tests**.
- **Tier 3 (Pairwise Interactions)**: **$\ge 10$ combinatorial test suites**.
- **Tier 4 (Real-World Scenarios)**: **$\ge 5$ multi-surface scenarios** (6 comprehensive scenarios specified).
- **Total Suite Size**: **$\ge 226$ automated tests**.

### 6.2 Quality & Operational Gates
1. **Zero Flakiness**: All test assertions execute synchronously or await deterministic microtask promises. Zero arbitrary timer sleeps.
2. **Execution Speed**: The entire 226+ test suite executes in $< 15$ seconds under native Bun test runner.
3. **Zero Test Code Reading**: Test specifications are 100% synthesized from requirements and contracts, adhering to monorepo integrity directives.
4. **Gate Compliance**:
   - `bun run check`: Exits with code 0 across all 8 monorepo workspaces.
   - `bun run gate`: Exits with code 0 (hygiene, SemVer sync, agent parity, secret scan).
   - `bun run smoke`: Exits with code 0 across all 9 live mesh nodes.

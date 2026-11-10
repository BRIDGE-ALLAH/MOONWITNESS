# DESIGN SPEC: ULTRA-DEEP LIVING DNA & PROCEDURAL ART DESIGN SYSTEM (UNIVERSAL CONVERGENCE)

- **Date:** 2026-11-10
- **Status:** APPROVED BY USER (LIVING ART ENGINE ADDENDUM)
- **Target Workspaces:**
  - `packages/ui` (`@local-git/ui` / `@sovereign/ui`)
  - `apps/dx` (Next.js 15, `:3000`)
  - `apps/empire` (Next.js 15, `:3001`)
  - `apps/moonwitness` (Next.js 15, `:3002`)
  - `apps/e-isp` (Next.js 15, `:3003`)
  - `apps/rid` (Next.js 15, `:3004`)
  - `apps/sovereign-desktop/ui` (Tauri + Vite + React)
  - `services/codex-edge` (Migrasi dari raw HTML string -> Vite + React + shadcn + `@local-git/ui`)

---

## 1. VISION: THE LIVING ART SURFACE (ZERO-VIDEO / ZERO-LAG / PURE HIGH-FPS COMPUTATION)
Transformasi total UI menjadi entitas hidup yang bernafas layaknya sinematik animasi/video, namun **100% ringan, aman, dan tanpa aset video berat**:
- **Lightweight Hardware-Accelerated Shaders (Canvas 2D / WebGL 60FPS)**: Menggunakan procedural math (simplex noise, trig orbits, ray lattices, raymarch geometry) dengan footprint CPU < 1-2%.
- **Zero Heavy Assets**: Tanpa file `.mp4`, `.webm`, atau ribuan file PNG besar. Seluruh animasi dirender secara prosedural langsung di browser/desktop client.
- **Micro-Haptic Procedural Soundscapes (Web Audio API Synthesizer)**: Nol file MP3/WAV. Suara mikro-taktil (tape click, sacred resonant chime, satellite telemetry chirp, tactile relay) disintesis secara real-time via oscillator Web Audio bawaan browser.
- **Adaptive Frame Throttling & Power-Safety**: Otomatis berhenti/pause saat tab di background atau perangkat dalam mode battery saver (0% resource leak).

---

## 2. 7 LIVING DNA ARTIFACTS & EXPERIENCES

Setiap DNA memiliki 5 lapisan hidup (Living Layers):
1. **Atmosphere Mesh**: Background canvas hidup 60fps dengan motion halus interaktif mouse.
2. **Material Shader**: Border, kartu, dan tombol yang memancarkan cahaya (bloom, prismatic refraction, golden rim).
3. **Reactive Topology**: Elemen UI merespons ritme (audio untuk RID, network latency untuk E-ISP, astronomi untuk Moonwitness).
4. **Procedural Vector Motifs**: Logo dan ornamen SVG hidup yang bertransformasi dan berotasi fraktal.
5. **Acoustic Signature**: Identitas suara prosedural saat interaksi.

### The 7 Living Flavors:
1. **`dx` (Story Riot // Cyberpunk Kinetic Collage)**
   - *Atmosphere:* Dynamic xerox halftone grain + kinetic typography drifts + CRT scanline warp saat scroll.
   - *Interactive:* Klik memicu partikel ink-splatter neon sekejap.
   - *Soundscape:* Cassette click, analog fuzz, vinyl pop halus.
2. **`empire` (Sacred Noor // Divine Golden Ray - A-L-L-A-H.COM)**
   - *Atmosphere:* Ray of light (Nur) prosedural yang bergerak perlahan dari pusat, fraktal arabesque geometris berputar tenang secara sakral.
   - *Interactive:* Hover pada kartu mengalirkan garis emas berkilau (gold liquid rim).
   - *Soundscape:* 432Hz harmonic singing bowl chime, ambient cathedral resonance.
3. **`moonwitness` (Celestial Observatory // Astral Chronometer)**
   - *Atmosphere:* Starfield astronomis hidup, konstelasi garis orbit yang melengkung mengikuti mouse, fase bulan real-time.
   - *Interactive:* Partikel bintang bereaksi terhadap gaya gravitasi kursor.
   - *Soundscape:* Satellite pulse beacon, solar wind hum.
4. **`eisp` (Sovereign Mesh // Living Isometric Topo)**
   - *Atmosphere:* Gelombang wireframe 3D topo yang berdenyut sesuai status latency monorepo / backend ping.
   - *Interactive:* Paket data visual berjalan melintasi garis border saat transaksi API terjadi.
   - *Soundscape:* Relay click presisi, high-tech data chirp.
5. **`rid` (Root ID // Organic Audio Waveform)**
   - *Atmosphere:* Gelombang osiloskop neon acid yang hidup dan bereaksi terhadap frekuensi audio browser.
   - *Interactive:* Tombol memantul (analog spring bounce) dengan tactile squish feedback.
   - *Soundscape:* Analog synthesizer blip, modular tape snap.
6. **`desktop` (Sovereign Desktop // Obsidian HUD Cockpit)**
   - *Atmosphere:* Multi-layer parallax cockpit glass dengan depth effect saat mouse bergeser, radar reticle di latar belakang.
   - *Interactive:* Glass refraction highlights dan tactile HUD locked rings.
   - *Soundscape:* Tactical mechanical switch click, sub-bass lock hum.
7. **`codex` (Codex Edge // Phosphor Matrix Ledger)**
   - *Atmosphere:* Retro-future phosphor glow grid, subtle emerald/amber data stream matrix di sisi wiki.
   - *Interactive:* Text reveal scanning effect saat berganti halaman.
   - *Soundscape:* Vintage mechanical teletype strike halus.

---

## 3. ENGINE ARCHITECTURE IN `@local-git/ui`

```
packages/ui/
├── src/
│   ├── engine/
│   │   ├── living-canvas/         # High-FPS ultra-light Canvas/Shader engines
│   │   │   ├── riot-canvas.tsx
│   │   │   ├── sacred-noor.tsx
│   │   │   ├── astral-sky.tsx
│   │   │   ├── topo-mesh.tsx
│   │   │   ├── audio-scope.tsx
│   │   │   ├── hud-cockpit.tsx
│   │   │   └── phosphor-ledger.tsx
│   │   ├── audio/                 # Web Audio procedural sound synthesizer
│   │   │   ├── sound-engine.ts    # Oscillator / biquad filter nodes (zero external files)
│   │   │   └── use-dna-sound.ts   # React hook for hover/click/action triggers
│   │   ├── provider.tsx           # Living ThemeProvider + DOM Injector + Sound Controller
│   │   ├── customizer.tsx         # Floating drawer with living controls (sound toggle, particle density)
│   │   └── shell.tsx              # Universal EcosystemShell wrapping living layers
│   ├── layouts/                   # Full-bleed living layouts per DNA
│   ├── primitives/                # Radix/shadcn atomic components with living material borders
│   ├── assets/                    # Procedural SVG generator & vector logos
│   └── index.ts
```

---

## 4. APPS CONVERGENCE & MIGRATION ROADMAP

1. **`packages/ui` Core Engine**:
   - Implementasikan Living Canvas shaders (dx, empire, moonwitness, eisp, rid, desktop, codex).
   - Implementasikan Web Audio procedural synthesizer (`sound-engine.ts`).
   - Sediakan toggle performa otomatis (High / Battery Saver / Reduced Motion / Mute).
   - Bangun Atomic Primitives (`Button`, `Card`, `Badge`, `Input`, `Dialog`, dll.) dengan reactive living borders.
2. **5 Next.js Web Apps Migration**:
   - Pasang `EcosystemShell` ber-living canvas di `dx`, `empire`, `moonwitness`, `eisp`, dan `rid`.
   - Bersihkan custom CSS statis dan ganti dengan layout template hidup.
3. **`apps/sovereign-desktop/ui` Migration**:
   - Hubungkan ke `@local-git/ui`, konsumsi `desktop` (Obsidian HUD Cockpit) living layout.
   - Ganti komponen lokal duplikat dengan unified atomic primitives.
4. **`services/codex-edge` Modernization**:
   - Migrasikan seluruh string HTML statis menjadi Vite + React + shadcn SPA dengan `codex` (Phosphor Ledger) living skin.
   - Pertahankan seluruh API endpoint `/api/*` dan `/mcp`.
5. **Autonomous Gate & Verification**:
   - `bun run gate` (Lint, TS check 8 workspaces, 14 TS tests, Rust fmt & tests).
   - `bun run smoke` (Pastikan seluruh 9 node dan SPA hidup berjalan mulus tanpa lag).

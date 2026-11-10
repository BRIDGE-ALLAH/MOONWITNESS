# ROCKSOUL — VISUAL & EXPERIENCE DIRECTION

## 01. Design thesis

**Riot on the surface. Precision underneath.**

Rocksoul should feel like a creative studio that collided with a basement gig venue, a manga ink lab, a hardware workshop, and a research cockpit. The surface is loud, tactile, asymmetric, and full of motion. The information architecture beneath it is calm, legible, predictable, and safe.

Do not make every screen noisy. Use the grunge as a signature, not as a layer of visual interference over every control.

## 02. Visual DNA

- Punk flyer collage: torn paper edges, xerox grain, rough cutouts, tape marks, hand-inked symbols.
- Manga acceleration: speed lines, screentone halftones, impact frames, sharp silhouettes.
- Garage hardware: meters, switches, stamped labels, knobs, patch cables, small status LEDs.
- Funky digital culture: elastic timing, surprising color pairings, playful microcopy, rhythmic layouts.
- Research discipline: source rails, evidence labels, version history, confidence and uncertainty made visible.

### Mood words
Gritty. Electric. Funky. Handmade. Defiant. Curious. Fast. Warm-blooded. Precise.

## 03. Color system

Use a small set of named design tokens. Keep backgrounds mostly dark and typography high-contrast; reserve the brightest colors for action, focus, and state.

| Token | Hex | Role |
|---|---|---|
| Asphalt | #09090B | Main canvas |
| Ink | #151519 | Panels and deep surfaces |
| Paper | #F1EBDD | Primary light text / paper surface |
| Dust | #A7A29A | Secondary text |
| Riot Pink | #FF315C | Primary action / expressive highlight |
| Acid Lime | #D8FF35 | Creative signal / success accent |
| Electric Cyan | #38DDF2 | Links / active intelligence trace |
| Amp Amber | #FFB547 | Caution / pending / attention |
| Signal Red | #FF444F | Errors / destructive state only |

Color is never the only status indicator. Pair it with text, icons, and accessible contrast. Validate every foreground/background pair before shipping.

## 04. Typography

- **Display:** condensed, poster-like type for short titles and impact statements (e.g. Anton or a comparable licensed/system-safe face).
- **Interface:** a highly legible geometric sans (e.g. Space Grotesk or Plus Jakarta Sans).
- **Code/data:** JetBrains Mono or another readable monospace.
- **Editorial:** use a warm serif sparingly for long-form research and narrative moments.

Never use distressed display type for body text, dense data, or critical actions. Check font licensing and provide reliable fallbacks; do not bundle fonts without appropriate rights.

## 05. Logo and graphic language

### Wordmark
ROCKSOUL in uppercase, compact, heavy, slightly irregular letterforms. It should remain readable at app-icon and title-bar sizes.

### Mark concept
A single diagonal strike crossing a circular groove: part vinyl groove, part guitar pick, part signal pulse. The negative space can hint at an R without drawing a literal brain, robot head, or glowing eye.

### Graphic motifs
- Torn-edge horizontal dividers.
- Halftone fields at low opacity, never behind small body text.
- Repeating waveform / pick-strike icon.
- Stamped mission IDs and revision marks.
- Hand-drawn arrows used to show flow and provenance.
- Manga speedlines used on transitions and empty-state moments, not continuous animation.

Avoid borrowing recognizable band marks, record labels, manga characters, or third-party brand assets.

## 06. App shell

### Primary desktop frame
- **Left rail — THE WALL:** projects, recent missions, saved artifacts, and quick capture.
- **Center — THE FLOOR:** active project canvas; tabs for brief, sources, plan, artifacts, and review.
- **Right rail — THE CREW:** agent roles, tool permissions, run state, and approvals.
- **Bottom strip — AMP METER:** local/online status, active run, task queue, and resource signals.

A panel may collapse when focus is needed. Preserve keyboard navigation and a stable layout; never rely on drag gestures alone.

### Operator hierarchy
1. What am I working on?
2. What is the system doing right now?
3. What evidence and artifacts have been produced?
4. What requires my approval?
5. What is the next safe action?

## 07. Signature interactions

- **SPARK capture:** one persistent capture command, keyboard shortcut, and drag/drop target for text, files, links, and images.
- **Mission strip:** show the current objective and a readable plan before execution.
- **Agent pit:** each agent has a named role, scope, allowed tools, current task, and output. No anonymous swarm.
- **Action checkpoint:** preview the exact tool, target, data, and consequence before permission is granted.
- **Sound check:** present test results, source coverage, open questions, and failed checks side-by-side.
- **Artifact shelf:** versioned outputs with diff, export, provenance, and owner.
- **Local-first state:** explicit labels for Saved locally, Sync queued, Synced, Conflict, and Sync failed.

## 08. Motion and sound

### Motion
- Fast, sharp transitions for navigation; slower, deliberate transitions for destructive confirmations.
- Small elastic responses for creative actions.
- Glitch or scanline effects only as brief punctuation.
- Reduced-motion mode must remove parallax, flashing, and non-essential animation.
- Do not animate the entire dashboard continuously; protect focus and battery.

### Sonic identity
An optional original two-second startup sting: a dry pick scrape, a low analog pulse, and a bright harmonic tail. All sounds are off by default or user-configurable. Never use an existing song, sample, or recognizable melody without rights.

## 09. Microcopy examples

| Moment | Copy |
|---|---|
| Empty project | “No noise yet. Drop a spark.” |
| New mission | “What are we making real?” |
| Plan ready | “The crew has a route. Check the moves.” |
| Permission gate | “This tool wants access to these files. Let it in?” |
| Run complete | “Built. Now give it a sound check.” |
| Evidence missing | “Good rhythm. Missing receipts.” |
| Offline | “Offline. Your local work is still here.” |
| Sync conflict | “Two versions. Pick what survives.” |
| Failure | “That take broke. Nothing shipped.” |

Microcopy must remain respectful and precise, especially around errors, privacy, billing, identity, and destructive actions.

## 10. Accessibility and trust

- Keyboard-first navigation with visible focus, shortcuts that can be remapped, and no keyboard traps.
- Screen-reader labels for custom controls; semantic headings and landmarks.
- Contrast validation for all color tokens and states.
- Reduced motion and sound-off defaults.
- Clear confirmation and reversible options where possible.
- Never disguise a permission request as a decorative animation.
- Keep evidence, source, tool activity, and approval records accessible without relying on color or motion.

## 11. Non-goals for the visual system

- No default purple AI gradient.
- No generic SaaS tile wall as the whole product.
- No unreadable distressed fonts in data views.
- No blinking “AGI online” theatre.
- No animated confidence meter that suggests a calibrated probability when none exists.
- No fake live status, fake system telemetry, or fake completed actions.

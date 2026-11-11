# ROCKSOUL — AGILITY VISUAL & EXPERIENCE DIRECTION

## 01. Design thesis

**BRUTAL ENERGY. FUNKY STYLE. SMART AGILITY.**

Rocksoul should feel like a basement gig collided with an experimental research lab, a manga ink studio, a hardware workshop, and a late-night creative collective.

The visual layer is loud, tactile, asymmetric, rhythmic, and alive. The interaction layer is agile and expressive. The system underneath is calm, legible, testable, and safe.

**Think with chaos. Act with riot.** Let the canvas invite exploration; let the controls preserve clarity. Grunge is a signature, not visual interference. Brutality means visual confidence and craft intensity—not hostility, intimidation, or recklessness.

## 02. Visual DNA

- **Punk flyer collage:** torn paper, xerox grain, rough cutouts, tape marks, hand-inked symbols.
- **Manga acceleration:** speed lines, screentone halftones, impact frames, explosive compositions.
- **Garage hardware:** meters, toggles, stamped labels, knobs, patch cables, status LEDs.
- **Funky geometry:** off-grid shapes, unexpected pairings, elastic spacing, playful asymmetry, rhythmic repetition.
- **Brutalist structure:** oversized condensed headlines, hard edges, exposed dividers, clear hierarchy, unapologetic blocks.
- **Research discipline:** source rails, evidence tags, version history, timestamps, confidence and uncertainty made explicit.

### Mood words

Restless. Electric. Funky. Gritty. Defiant. Inventive. Adaptive. Playful. Precise. Human.

## 03. Color system

Keep backgrounds mostly dark and typography high-contrast. Use high-energy colors as signals, not as wallpaper. The palette should feel like a gig poster under electric stage lights.

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

Use color with labels, icons, and shape. Validate every foreground/background pair for accessible contrast. Do not communicate permission, risk, or completion by color alone.

## 04. Typography

- **Display:** condensed poster typography for short headlines and impact statements (e.g. Anton or a comparable licensed/system-safe face).
- **Interface:** highly legible geometric sans (e.g. Space Grotesk or Plus Jakarta Sans).
- **Code and telemetry:** JetBrains Mono or another readable monospace.
- **Editorial:** a warm serif, used sparingly for research and long-form narrative.

Use brutalist scale contrast for hierarchy, not for every label. Never use distressed display type for body text, dense data, or critical actions. Check licensing and provide reliable fallbacks.

## 05. Logo and graphic language

### Wordmark
ROCKSOUL in uppercase: compact, heavy, slightly irregular, and readable at app-icon and title-bar sizes.

### Mark concept
A diagonal strike crossing a circular groove: part vinyl groove, part guitar pick, part signal pulse. Negative space may hint at an R. No literal brain, robot head, glowing eye, or generic AI sparkle.

### Graphic motifs
- Torn-edge section dividers and tape-like labels.
- Halftone fields at low opacity, never behind dense body text.
- Repeating waveform / pick-strike symbol.
- Stamped mission IDs and revision marks.
- Hand-drawn arrows for flow and provenance.
- Manga speedlines for transitions and empty states.
- Funky sticker shapes for optional creative annotations.

Avoid recognizable band marks, record labels, manga characters, or third-party brand assets.

## 06. Experience modes

The UI should support two complementary energies:

### RIOT MODE — explore

- Open canvas and flexible spatial arrangement.
- Fast capture, remixing, branching, and comparing alternatives.
- Visible idea clusters, experimental paths, and rough artifacts.
- Playful micro-interactions and expressive color accents.
- Clear distinction between a suggestion, a draft, and an executed action.

### FOCUS MODE — deliver

- Reduced visual noise and stable layout.
- One primary mission, one visible plan, and explicit next action.
- Sources, diffs, tests, and approvals brought forward.
- Permission gates and destructive confirmations given full attention.
- No decorative motion that competes with review.

These are presentation modes, not separate security policies. Both modes retain identical permissions, auditability, and user control.

## 07. App shell

### Primary desktop frame

- **Left rail — THE WALL:** projects, recent missions, saved artifacts, and quick capture.
- **Center — THE FLOOR:** active project canvas; tabs for brief, sources, plan, experiments, artifacts, and review.
- **Right rail — THE CREW:** agent roles, model/tool assignments, scopes, run state, and approvals.
- **Bottom strip — AMP METER:** local/online state, active run, task queue, resource signals, and notifications.

A panel may collapse when focus is needed. Preserve keyboard navigation and stable anchors; never rely on drag gestures alone.

### Operator hierarchy

1. What am I trying to make or solve?
2. What is the system exploring or doing right now?
3. Which assumptions, sources, and artifacts are in play?
4. What has been tested, and what remains uncertain?
5. What requires my approval?
6. What is the next safe and useful move?

## 08. Signature interactions

- **SPARK capture:** persistent capture command, keyboard shortcut, and drag/drop for text, files, links, and images.
- **Chaos canvas:** branch ideas and approaches; keep the source and parent context of each branch.
- **Mission strip:** show objective, constraints, and proposed plan before execution.
- **Agent pit:** each agent/model has a named role, scope, allowed tools, current task, and output. No anonymous swarm.
- **Action checkpoint:** preview the exact tool, target, data, and consequence before permission is granted.
- **Sound check:** show test results, source coverage, competing interpretations, open questions, and failed checks.
- **Artifact shelf:** versioned outputs with diffs, export, provenance, and owner.
- **Local-first state:** explicit labels for Saved locally, Sync queued, Synced, Conflict, and Sync failed.

## 09. Motion and feedback

- Fast, sharp transitions for navigation; slower, deliberate transitions for destructive confirmations.
- Small elastic responses for creative actions and idea branching.
- Glitch, scanline, and impact-frame effects only as brief punctuation.
- Reduced-motion mode removes parallax, flashing, and non-essential animation.
- Avoid continuous dashboard animation; protect focus, battery, and legibility.
- Never let a sound, animation, or color pulse imply that work is complete when it is not.

## 10. Sonic identity

An optional original two-second startup sting: dry pick scrape, low analog pulse, bright harmonic tail. Sounds are off by default or user-configurable. Never use an existing song, sample, or recognizable melody without rights.

## 11. Microcopy examples

| Moment | Copy |
|---|---|
| Empty project | “No noise yet. Drop a spark.” |
| New mission | “What are we making real?” |
| Explore alternatives | “Make some noise. Find the signal.” |
| Plan ready | “The crew has a route. Check the moves.” |
| Permission gate | “This tool wants access to these files. Let it in?” |
| Run complete | “Built. Now give it a sound check.” |
| Evidence missing | “Good rhythm. Missing receipts.” |
| Offline | “Offline. Your local work is still here.” |
| Sync conflict | “Two versions. Pick what survives.” |
| Failure | “That take broke. Nothing shipped.” |

Microcopy must remain respectful and precise, especially around errors, privacy, billing, identity, and destructive actions.

## 12. Accessibility and trust

- Keyboard-first navigation with visible focus, remappable shortcuts, and no keyboard traps.
- Screen-reader labels for custom controls; semantic headings and landmarks.
- Contrast validation for every color token and state.
- Reduced-motion mode and sound-off defaults.
- Clear confirmation and reversible options where possible.
- Never disguise a permission request as a decorative animation.
- Keep evidence, sources, tool activity, and approvals accessible without relying on color or motion.
- Preserve a calm, readable FOCUS MODE for long or sensitive work.

## 13. Non-goals for the visual system

- No default purple AI gradient.
- No generic SaaS tile wall as the whole product.
- No unreadable distressed fonts in data views.
- No blinking “AGI online” or “ASI awakening” theatre.
- No animated confidence meter that implies calibrated probability without evidence.
- No fake live status, fake telemetry, fake autonomy, or fake completed actions.
- No visual chaos that hides what the system is doing or what the user is approving.

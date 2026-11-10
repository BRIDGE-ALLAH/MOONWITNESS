/**
 * Sovereign Monorepo — Dynamic Typography & Procedural Glyph Engine
 * Zero external font download stalls, resilient native variable stacks + procedural font styling.
 */

export interface DnaTypographyConfig {
  id: string;
  displayStack: string;
  headingStack: string;
  bodyStack: string;
  codeStack: string;
  letterSpacing: {
    display: string;
    heading: string;
    body: string;
    code: string;
  };
  transform: "none" | "uppercase" | "lowercase";
  accentGlyphs: string[];
}

export const DNA_TYPOGRAPHY: Record<string, DnaTypographyConfig> = {
  dx: {
    id: "dx",
    displayStack: "'Impact', 'Arial Black', -apple-system, sans-serif",
    headingStack: "'JetBrains Mono', 'Courier New', monospace",
    bodyStack: "'JetBrains Mono', 'Courier New', monospace",
    codeStack: "'JetBrains Mono', monospace",
    letterSpacing: {
      display: "-0.04em",
      heading: "-0.02em",
      body: "0.01em",
      code: "0.05em",
    },
    transform: "uppercase",
    accentGlyphs: ["✕", "⚡", "█", "░", "■", "▲"],
  },
  empire: {
    id: "empire",
    displayStack: "'Cinzel', 'Trajan Pro', 'Times New Roman', Georgia, serif",
    headingStack: "'Cinzel', 'Times New Roman', Georgia, serif",
    bodyStack: "system-ui, -apple-system, 'Segoe UI', serif",
    codeStack: "'JetBrains Mono', monospace",
    letterSpacing: {
      display: "0.22em",
      heading: "0.14em",
      body: "0.02em",
      code: "0.04em",
    },
    transform: "uppercase",
    accentGlyphs: ["۞", "✦", "✧", "⚜", "❖", "✹"],
  },
  moonwitness: {
    id: "moonwitness",
    displayStack: "'Space Mono', 'JetBrains Mono', monospace",
    headingStack: "'Space Mono', 'Courier New', monospace",
    bodyStack: "'Inter', system-ui, -apple-system, sans-serif",
    codeStack: "'Space Mono', monospace",
    letterSpacing: {
      display: "0.16em",
      heading: "0.08em",
      body: "0.01em",
      code: "0.06em",
    },
    transform: "uppercase",
    accentGlyphs: ["☽", "☾", "◯", "☄", "✦", "☿"],
  },
  eisp: {
    id: "eisp",
    displayStack: "'JetBrains Mono', 'SF Mono', monospace",
    headingStack: "'SF Pro Display', system-ui, sans-serif",
    bodyStack: "'Inter', system-ui, sans-serif",
    codeStack: "'JetBrains Mono', monospace",
    letterSpacing: {
      display: "-0.02em",
      heading: "-0.01em",
      body: "0.00em",
      code: "0.04em",
    },
    transform: "none",
    accentGlyphs: ["⬡", "⌬", "⎔", "⚡", "◈", "▣"],
  },
  rid: {
    id: "rid",
    displayStack: "'Trebuchet MS', 'Arial Black', sans-serif",
    headingStack: "'Courier New', monospace",
    bodyStack: "system-ui, -apple-system, sans-serif",
    codeStack: "'Courier New', monospace",
    letterSpacing: {
      display: "0.04em",
      heading: "0.02em",
      body: "0.01em",
      code: "0.08em",
    },
    transform: "none",
    accentGlyphs: ["♬", "♩", "〰", "◉", "⦿", "∿"],
  },
  desktop: {
    id: "desktop",
    displayStack: "'JetBrains Mono', 'Segoe UI', system-ui, sans-serif",
    headingStack: "'JetBrains Mono', monospace",
    bodyStack: "system-ui, -apple-system, sans-serif",
    codeStack: "'JetBrains Mono', monospace",
    letterSpacing: {
      display: "0.06em",
      heading: "0.04em",
      body: "0.00em",
      code: "0.05em",
    },
    transform: "uppercase",
    accentGlyphs: ["⌖", "⎈", "⌗", "⌘", "⌥", "⏻"],
  },
  codex: {
    id: "codex",
    displayStack: "'JetBrains Mono', 'Courier New', monospace",
    headingStack: "'JetBrains Mono', monospace",
    bodyStack: "'JetBrains Mono', monospace",
    codeStack: "'JetBrains Mono', monospace",
    letterSpacing: {
      display: "0.08em",
      heading: "0.05em",
      body: "0.01em",
      code: "0.04em",
    },
    transform: "none",
    accentGlyphs: ["§", "¶", "❯", "❖", "▰", "▱"],
  },
};

export function getTypographyForDna(dna: string): DnaTypographyConfig {
  return DNA_TYPOGRAPHY[dna] || DNA_TYPOGRAPHY.dx;
}

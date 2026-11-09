"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// ─── SKIN DEFINITIONS ──────────────────────────────────────────────────────────

export type SkinId = "grunge" | "phantom" | "neon" | "acid" | "void" | "steel";

export type AccentId = "toxic" | "lime" | "cyan" | "gold" | "purple" | "orange";

export type RadiusId = "none" | "sm" | "md";

export type FontId = "mono" | "sans";

export interface ThemeConfig {
  skin: SkinId;
  accent: AccentId;
  radius: RadiusId;
  font: FontId;
}

const DEFAULT_THEME: ThemeConfig = {
  skin: "grunge",
  accent: "toxic",
  radius: "none",
  font: "mono",
};

const SKINS: Record<SkinId, { label: string; vars: Record<string, string> }> = {
  grunge: {
    label: "GRUNGE",
    vars: {
      "--bg": "#000000",
      "--panel": "#070707",
      "--panel2": "#111111",
      "--line": "#2a2a2a",
      "--line2": "#444444",
      "--text": "#ffffff",
      "--muted": "#a3a3a3",
      "--skin-preview": "#ff0055",
    },
  },
  phantom: {
    label: "PHANTOM",
    vars: {
      "--bg": "#0a0a12",
      "--panel": "#0f0f1a",
      "--panel2": "#16162a",
      "--line": "#2a2a40",
      "--line2": "#3a3a55",
      "--text": "#e8e8ff",
      "--muted": "#8888aa",
      "--skin-preview": "#bf00ff",
    },
  },
  neon: {
    label: "NEON",
    vars: {
      "--bg": "#010f0f",
      "--panel": "#021818",
      "--panel2": "#032222",
      "--line": "#003333",
      "--line2": "#005555",
      "--text": "#ccffff",
      "--muted": "#66aaaa",
      "--skin-preview": "#00f0ff",
    },
  },
  acid: {
    label: "ACID",
    vars: {
      "--bg": "#080800",
      "--panel": "#111100",
      "--panel2": "#1a1900",
      "--line": "#2a2a00",
      "--line2": "#3a3a00",
      "--text": "#ffffcc",
      "--muted": "#aaaa66",
      "--skin-preview": "#f4ff00",
    },
  },
  void: {
    label: "VOID",
    vars: {
      "--bg": "#050505",
      "--panel": "#0a0a0a",
      "--panel2": "#111111",
      "--line": "#1a1a1a",
      "--line2": "#222222",
      "--text": "#cccccc",
      "--muted": "#666666",
      "--skin-preview": "#ffffff",
    },
  },
  steel: {
    label: "STEEL",
    vars: {
      "--bg": "#030308",
      "--panel": "#08080f",
      "--panel2": "#0d0d18",
      "--line": "#1a1a30",
      "--line2": "#252545",
      "--text": "#d0d0ff",
      "--muted": "#7070aa",
      "--skin-preview": "#6060ff",
    },
  },
};

const ACCENTS: Record<AccentId, { label: string; color: string; vars: Record<string, string> }> = {
  toxic: {
    label: "TOXIC",
    color: "#ff0055",
    vars: { "--accent": "#ff0055", "--accent-dim": "rgba(255,0,85,0.15)", "--accent-border": "rgba(255,0,85,0.4)" },
  },
  lime: {
    label: "LIME",
    color: "#c8ff00",
    vars: { "--accent": "#c8ff00", "--accent-dim": "rgba(200,255,0,0.15)", "--accent-border": "rgba(200,255,0,0.4)" },
  },
  cyan: {
    label: "CYAN",
    color: "#00f0ff",
    vars: { "--accent": "#00f0ff", "--accent-dim": "rgba(0,240,255,0.15)", "--accent-border": "rgba(0,240,255,0.4)" },
  },
  gold: {
    label: "GOLD",
    color: "#c9a84c",
    vars: { "--accent": "#c9a84c", "--accent-dim": "rgba(201,168,76,0.15)", "--accent-border": "rgba(201,168,76,0.4)" },
  },
  purple: {
    label: "PURPLE",
    color: "#bf00ff",
    vars: { "--accent": "#bf00ff", "--accent-dim": "rgba(191,0,255,0.15)", "--accent-border": "rgba(191,0,255,0.4)" },
  },
  orange: {
    label: "ORANGE",
    color: "#ff5500",
    vars: { "--accent": "#ff5500", "--accent-dim": "rgba(255,85,0,0.15)", "--accent-border": "rgba(255,85,0,0.4)" },
  },
};

const RADII: Record<RadiusId, { label: string; value: string }> = {
  none: { label: "SHARP", value: "0px" },
  sm: { label: "SOFT", value: "4px" },
  md: { label: "ROUND", value: "8px" },
};

const FONTS: Record<FontId, { label: string; stack: string }> = {
  mono: { label: "MONO", stack: "'JetBrains Mono', 'Courier New', monospace" },
  sans: { label: "SANS", stack: "system-ui, -apple-system, sans-serif" },
};

// ─── CONTEXT ───────────────────────────────────────────────────────────────────

interface ThemeContextValue {
  theme: ThemeConfig;
  setSkin: (s: SkinId) => void;
  setAccent: (a: AccentId) => void;
  setRadius: (r: RadiusId) => void;
  setFont: (f: FontId) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}

function useThemeSafe() {
  return useContext(ThemeContext);
}

function applyTheme(cfg: ThemeConfig) {
  const root = document.documentElement;
  const skin = SKINS[cfg.skin];
  const accent = ACCENTS[cfg.accent];
  const radius = RADII[cfg.radius];
  const font = FONTS[cfg.font];

  for (const [k, v] of Object.entries(skin.vars)) root.style.setProperty(k, v);
  for (const [k, v] of Object.entries(accent.vars)) root.style.setProperty(k, v);
  root.style.setProperty("--radius", radius.value);
  root.style.setProperty("--font-body", font.stack);

  root.setAttribute("data-skin", cfg.skin);
  root.setAttribute("data-accent", cfg.accent);
}

const STORAGE_KEY = "dx-theme-v1";

function loadStored(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THEME;
    return { ...DEFAULT_THEME, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_THEME;
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    setTheme(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);

  const update = useCallback((patch: Partial<ThemeConfig>) => {
    setTheme((prev) => {
      const next = { ...prev, ...patch };
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const setSkin = useCallback((skin: SkinId) => update({ skin }), [update]);
  const setAccent = useCallback((accent: AccentId) => update({ accent }), [update]);
  const setRadius = useCallback((radius: RadiusId) => update({ radius }), [update]);
  const setFont = useCallback((font: FontId) => update({ font }), [update]);
  const reset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTheme(DEFAULT_THEME);
    applyTheme(DEFAULT_THEME);
  }, []);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ theme, setSkin, setAccent, setRadius, setFont, reset }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── CUSTOMIZER PANEL ──────────────────────────────────────────────────────────

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const ctx = useThemeSafe();

  if (!ctx) return null;

  const { theme, setSkin, setAccent, setRadius, setFont, reset } = ctx;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.5)",
          }}
        />
      )}

      {/* Floating Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open theme customizer"
        style={{
          position: "fixed",
          bottom: "2rem",
          right: open ? "calc(320px + 1rem)" : "1.5rem",
          zIndex: 9999,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "1px solid var(--accent, #ff0055)",
          background: "var(--panel, #070707)",
          color: "var(--accent, #ff0055)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 20,
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s",
          boxShadow: `0 0 16px var(--accent-dim, rgba(255,0,85,0.2))`,
        }}
      >
        ✦
      </button>

      {/* Slide-in Panel */}
      <aside
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          zIndex: 9999,
          background: "var(--panel, #070707)",
          borderLeft: "1px solid var(--line, #2a2a2a)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--line, #2a2a2a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "var(--accent, #ff0055)", fontWeight: 700, letterSpacing: "0.15em", fontSize: 12 }}>
              THEME CUSTOMIZER
            </div>
            <div style={{ color: "var(--muted, #a3a3a3)", fontSize: 10, letterSpacing: "0.1em", marginTop: 2 }}>
              CUSTOMIZE YOUR EXPERIENCE
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: "none",
              color: "var(--muted, #a3a3a3)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              padding: 4,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>

          {/* Skin */}
          <section>
            <div style={labelStyle}>SKIN</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {(Object.entries(SKINS) as [SkinId, typeof SKINS[SkinId]][]).map(([id, s]) => (
                <button
                  key={id}
                  onClick={() => setSkin(id)}
                  style={{
                    ...skinBtnBase,
                    borderColor: theme.skin === id ? s.vars["--skin-preview"] : "var(--line, #2a2a2a)",
                    background: s.vars["--bg"],
                    color: theme.skin === id ? s.vars["--skin-preview"] : "var(--muted, #a3a3a3)",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: s.vars["--skin-preview"],
                      marginBottom: 4,
                    }}
                  />
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          {/* Accent */}
          <section>
            <div style={labelStyle}>ACCENT COLOR</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(Object.entries(ACCENTS) as [AccentId, typeof ACCENTS[AccentId]][]).map(([id, a]) => (
                <button
                  key={id}
                  onClick={() => setAccent(id)}
                  title={a.label}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    border: theme.accent === id ? `3px solid #fff` : "3px solid transparent",
                    background: a.color,
                    cursor: "pointer",
                    outline: theme.accent === id ? `2px solid ${a.color}` : "none",
                    outlineOffset: 2,
                    transition: "outline 0.15s",
                  }}
                />
              ))}
            </div>
            <div style={{ marginTop: 6, color: "var(--accent, #ff0055)", letterSpacing: "0.1em" }}>
              {ACCENTS[theme.accent].label}
            </div>
          </section>

          {/* Border Radius */}
          <section>
            <div style={labelStyle}>BORDER RADIUS</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(Object.entries(RADII) as [RadiusId, typeof RADII[RadiusId]][]).map(([id, r]) => (
                <button
                  key={id}
                  onClick={() => setRadius(id)}
                  style={{
                    ...toggleBtnBase,
                    borderColor: theme.radius === id ? "var(--accent, #ff0055)" : "var(--line, #2a2a2a)",
                    color: theme.radius === id ? "var(--accent, #ff0055)" : "var(--muted, #a3a3a3)",
                    borderRadius: r.value || "0px",
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </section>

          {/* Font */}
          <section>
            <div style={labelStyle}>FONT SYSTEM</div>
            <div style={{ display: "flex", gap: 8 }}>
              {(Object.entries(FONTS) as [FontId, typeof FONTS[FontId]][]).map(([id, f]) => (
                <button
                  key={id}
                  onClick={() => setFont(id)}
                  style={{
                    ...toggleBtnBase,
                    fontFamily: f.stack,
                    borderColor: theme.font === id ? "var(--accent, #ff0055)" : "var(--line, #2a2a2a)",
                    color: theme.font === id ? "var(--accent, #ff0055)" : "var(--muted, #a3a3a3)",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          {/* Current config readout */}
          <section>
            <div style={labelStyle}>ACTIVE CONFIG</div>
            <pre
              style={{
                background: "var(--panel2, #111)",
                border: "1px solid var(--line, #2a2a2a)",
                padding: "12px",
                fontSize: 10,
                color: "var(--muted, #a3a3a3)",
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {JSON.stringify(theme, null, 2)}
            </pre>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--line, #2a2a2a)",
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={reset}
            style={{
              ...toggleBtnBase,
              flex: 1,
              borderColor: "var(--line, #2a2a2a)",
              color: "var(--muted, #a3a3a3)",
            }}
          >
            RESET
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{
              ...toggleBtnBase,
              flex: 2,
              borderColor: "var(--accent, #ff0055)",
              color: "var(--accent, #ff0055)",
            }}
          >
            APPLY ✦
          </button>
        </div>
      </aside>
    </>
  );
}

// ─── SHARED STYLES ─────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: "var(--muted, #a3a3a3)",
  marginBottom: 10,
};

const skinBtnBase: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 2,
  padding: "10px 6px",
  border: "1px solid",
  cursor: "pointer",
  fontSize: 10,
  letterSpacing: "0.1em",
  transition: "border-color 0.15s, color 0.15s",
};

const toggleBtnBase: React.CSSProperties = {
  padding: "8px 14px",
  border: "1px solid",
  background: "transparent",
  cursor: "pointer",
  fontSize: 10,
  letterSpacing: "0.1em",
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  transition: "border-color 0.15s, color 0.15s",
};

// ─── RE-EXPORTS ────────────────────────────────────────────────────────────────

export { SKINS, ACCENTS, RADII, FONTS };


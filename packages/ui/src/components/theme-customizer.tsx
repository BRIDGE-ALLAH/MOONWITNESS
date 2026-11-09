"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

// ─── TYPES ─────────────────────────────────────────────────────────────────────

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

// ─── DATA ──────────────────────────────────────────────────────────────────────

export const SKINS: Record<
  SkinId,
  { label: string; bg: string; panel: string; vars: Record<string, string> }
> = {
  grunge: {
    label: "GRUNGE",
    bg: "#000000",
    panel: "#0d0d0d",
    vars: {
      "--bg": "#000000",
      "--panel": "#070707",
      "--panel2": "#111111",
      "--line": "#2a2a2a",
      "--line2": "#444444",
      "--text": "#ffffff",
      "--muted": "#a3a3a3",
    },
  },
  phantom: {
    label: "PHANTOM",
    bg: "#0a0a12",
    panel: "#0f0f1a",
    vars: {
      "--bg": "#0a0a12",
      "--panel": "#0f0f1a",
      "--panel2": "#16162a",
      "--line": "#2a2a40",
      "--line2": "#3a3a55",
      "--text": "#e8e8ff",
      "--muted": "#8888aa",
    },
  },
  neon: {
    label: "NEON",
    bg: "#010f0f",
    panel: "#021818",
    vars: {
      "--bg": "#010f0f",
      "--panel": "#021818",
      "--panel2": "#032222",
      "--line": "#003333",
      "--line2": "#005555",
      "--text": "#ccffff",
      "--muted": "#66aaaa",
    },
  },
  acid: {
    label: "ACID",
    bg: "#080800",
    panel: "#111100",
    vars: {
      "--bg": "#080800",
      "--panel": "#111100",
      "--panel2": "#1a1900",
      "--line": "#2a2a00",
      "--line2": "#3a3a00",
      "--text": "#ffffcc",
      "--muted": "#aaaa66",
    },
  },
  void: {
    label: "VOID",
    bg: "#050505",
    panel: "#0a0a0a",
    vars: {
      "--bg": "#050505",
      "--panel": "#0a0a0a",
      "--panel2": "#111111",
      "--line": "#1a1a1a",
      "--line2": "#222222",
      "--text": "#cccccc",
      "--muted": "#666666",
    },
  },
  steel: {
    label: "STEEL",
    bg: "#030308",
    panel: "#08080f",
    vars: {
      "--bg": "#030308",
      "--panel": "#08080f",
      "--panel2": "#0d0d18",
      "--line": "#1a1a30",
      "--line2": "#252545",
      "--text": "#d0d0ff",
      "--muted": "#7070aa",
    },
  },
};

export const ACCENTS: Record<
  AccentId,
  { label: string; color: string; vars: Record<string, string> }
> = {
  toxic: {
    label: "TOXIC",
    color: "#ff0055",
    vars: {
      "--accent": "#ff0055",
      "--accent-dim": "rgba(255,0,85,0.12)",
      "--accent-border": "rgba(255,0,85,0.35)",
    },
  },
  lime: {
    label: "LIME",
    color: "#c8ff00",
    vars: {
      "--accent": "#c8ff00",
      "--accent-dim": "rgba(200,255,0,0.12)",
      "--accent-border": "rgba(200,255,0,0.35)",
    },
  },
  cyan: {
    label: "CYAN",
    color: "#00f0ff",
    vars: {
      "--accent": "#00f0ff",
      "--accent-dim": "rgba(0,240,255,0.12)",
      "--accent-border": "rgba(0,240,255,0.35)",
    },
  },
  gold: {
    label: "GOLD",
    color: "#c9a84c",
    vars: {
      "--accent": "#c9a84c",
      "--accent-dim": "rgba(201,168,76,0.12)",
      "--accent-border": "rgba(201,168,76,0.35)",
    },
  },
  purple: {
    label: "PURPLE",
    color: "#bf00ff",
    vars: {
      "--accent": "#bf00ff",
      "--accent-dim": "rgba(191,0,255,0.12)",
      "--accent-border": "rgba(191,0,255,0.35)",
    },
  },
  orange: {
    label: "ORANGE",
    color: "#ff5500",
    vars: {
      "--accent": "#ff5500",
      "--accent-dim": "rgba(255,85,0,0.12)",
      "--accent-border": "rgba(255,85,0,0.35)",
    },
  },
};

export const RADII: Record<RadiusId, { label: string; value: string; preview: string }> = {
  none:  { label: "SHARP",  value: "0px",  preview: "□" },
  sm:    { label: "SOFT",   value: "4px",  preview: "▢" },
  md:    { label: "ROUND",  value: "8px",  preview: "◻" },
};

export const FONTS: Record<FontId, { label: string; stack: string; sample: string }> = {
  mono: { label: "MONO", stack: "'JetBrains Mono', 'Courier New', monospace", sample: "0xDX" },
  sans: { label: "SANS", stack: "system-ui, -apple-system, sans-serif", sample: "0xDX" },
};

// ─── DEFAULTS ──────────────────────────────────────────────────────────────────

const DEFAULT_THEME: ThemeConfig = { skin: "grunge", accent: "toxic", radius: "none", font: "mono" };
const STORAGE_KEY = "dx-theme-v1";

// ─── CONTEXT ───────────────────────────────────────────────────────────────────

interface ThemeCtx {
  theme: ThemeConfig;
  setSkin: (s: SkinId) => void;
  setAccent: (a: AccentId) => void;
  setRadius: (r: RadiusId) => void;
  setFont: (f: FontId) => void;
  reset: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

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
  for (const [k, v] of Object.entries(SKINS[cfg.skin].vars)) root.style.setProperty(k, v);
  for (const [k, v] of Object.entries(ACCENTS[cfg.accent].vars)) root.style.setProperty(k, v);
  root.style.setProperty("--radius", RADII[cfg.radius].value);
  root.style.setProperty("--font-body", FONTS[cfg.font].stack);
  root.dataset.skin = cfg.skin;
  root.dataset.accent = cfg.accent;
}

function loadStored(): ThemeConfig {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : DEFAULT_THEME;
  } catch { return DEFAULT_THEME; }
}

// ─── PROVIDER ──────────────────────────────────────────────────────────────────

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

  const setSkin   = useCallback((skin: SkinId)     => update({ skin }),   [update]);
  const setAccent = useCallback((accent: AccentId) => update({ accent }), [update]);
  const setRadius = useCallback((radius: RadiusId) => update({ radius }), [update]);
  const setFont   = useCallback((font: FontId)     => update({ font }),   [update]);
  const reset     = useCallback(() => {
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

// ─── CUSTOMIZER ────────────────────────────────────────────────────────────────

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const ctx = useThemeSafe();

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus trap — move focus into panel when it opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const first = panelRef.current?.querySelector<HTMLElement>("button, [tabindex]");
        first?.focus();
      });
    }
  }, [open]);

  if (!ctx) return null;
  const { theme, setSkin, setAccent, setRadius, setFont, reset } = ctx;

  const accentColor = ACCENTS[theme.accent].color;
  const skinData    = SKINS[theme.skin];

  const copyConfig = async () => {
    await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      {/* ── Global style injection for transitions ── */}
      <style>{`
        html { transition: background-color 0.25s ease, color 0.25s ease; }
        :root { transition: --accent 0s; }
      `}</style>

      {/* ── Overlay ── */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          style={{
            position: "fixed", inset: 0, zIndex: 9997,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(2px)",
            animation: "tc-fade-in 0.2s ease",
          }}
        />
      )}

      {/* ── Keyframes ── */}
      <style>{`
        @keyframes tc-fade-in  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes tc-spin     { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes tc-pulse    { 0%,100% { box-shadow: 0 0 0 0 ${accentColor}55 } 50% { box-shadow: 0 0 0 8px ${accentColor}00 } }
      `}</style>

      {/* ── Floating Trigger ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open theme customizer"
        title="Theme Customizer (Esc to close)"
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: open ? "calc(340px + 1rem)" : "1.5rem",
          zIndex: 9999,
          width: 46,
          height: 46,
          borderRadius: "50%",
          border: `2px solid ${accentColor}`,
          background: skinData.bg,
          color: accentColor,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.25s, color 0.25s, transform 0.15s",
          transform: open ? "rotate(90deg)" : "rotate(0deg)",
          animation: !open ? "tc-pulse 2.5s ease-in-out infinite" : "none",
          boxShadow: `0 0 20px ${accentColor}33`,
        }}
      >
        ✦
      </button>

      {/* ── Side Panel ── */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="Theme customizer"
        style={{
          position: "fixed",
          top: 0, right: 0, bottom: 0,
          width: 340,
          zIndex: 9998,
          background: skinData.bg,
          borderLeft: `1px solid ${accentColor}22`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          overflowY: "auto",
          overscrollBehavior: "contain",
        }}
      >
        {/* Palette Preview Strip */}
        <div style={{ display: "flex", height: 4 }}>
          {(Object.entries(ACCENTS) as [AccentId, typeof ACCENTS[AccentId]][]).map(([id, a]) => (
            <div
              key={id}
              onClick={() => setAccent(id)}
              style={{
                flex: 1,
                background: a.color,
                cursor: "pointer",
                opacity: theme.accent === id ? 1 : 0.35,
                transition: "opacity 0.2s",
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div style={{
          padding: "16px 20px 14px",
          borderBottom: `1px solid ${accentColor}22`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{
              color: accentColor,
              fontWeight: 700,
              letterSpacing: "0.18em",
              fontSize: 11,
              textTransform: "uppercase",
            }}>
              ✦ THEME CUSTOMIZER
            </div>
            <div style={{ color: "#555", fontSize: 10, letterSpacing: "0.08em", marginTop: 3 }}>
              {SKINS[theme.skin].label} · {ACCENTS[theme.accent].label} · {RADII[theme.radius].label} · {FONTS[theme.font].label}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: "none",
              border: `1px solid ${accentColor}33`,
              color: "#555",
              cursor: "pointer",
              fontSize: 12,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "color 0.1s, border-color 0.1s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accentColor; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#555"; }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── SKIN ── */}
          <section>
            <SectionLabel color={accentColor}>SKIN</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {(Object.entries(SKINS) as [SkinId, typeof SKINS[SkinId]][]).map(([id, s]) => {
                const active = theme.skin === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSkin(id)}
                    style={{
                      position: "relative",
                      padding: "10px 6px 8px",
                      background: s.bg,
                      border: `1px solid ${active ? accentColor : "#1f1f1f"}`,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      transition: "border-color 0.15s",
                      outline: "none",
                    }}
                  >
                    {/* Mini palette preview */}
                    <div style={{ display: "flex", gap: 2 }}>
                      <div style={{ width: 10, height: 10, background: s.bg, border: "1px solid #333" }} />
                      <div style={{ width: 10, height: 10, background: s.panel, border: "1px solid #333" }} />
                      <div style={{ width: 10, height: 10, background: accentColor, borderRadius: "50%" }} />
                    </div>
                    <span style={{
                      fontSize: 9,
                      letterSpacing: "0.12em",
                      color: active ? accentColor : "#555",
                      transition: "color 0.15s",
                    }}>
                      {s.label}
                    </span>
                    {active && (
                      <div style={{
                        position: "absolute",
                        top: 3, right: 3,
                        width: 6, height: 6,
                        borderRadius: "50%",
                        background: accentColor,
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── ACCENT ── */}
          <section>
            <SectionLabel color={accentColor}>ACCENT COLOR</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
              {(Object.entries(ACCENTS) as [AccentId, typeof ACCENTS[AccentId]][]).map(([id, a]) => {
                const active = theme.accent === id;
                return (
                  <button
                    key={id}
                    onClick={() => setAccent(id)}
                    title={a.label}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: a.color,
                      cursor: "pointer",
                      border: "none",
                      outline: active ? `3px solid ${a.color}` : "3px solid transparent",
                      outlineOffset: 3,
                      boxShadow: active ? `0 0 12px ${a.color}66` : "none",
                      transition: "outline 0.15s, box-shadow 0.15s, transform 0.1s",
                      transform: active ? "scale(1.15)" : "scale(1)",
                    }}
                  />
                );
              })}
            </div>
            <div style={{ marginTop: 8, fontSize: 10, letterSpacing: "0.1em", color: accentColor }}>
              {ACCENTS[theme.accent].label} · {ACCENTS[theme.accent].color}
            </div>
          </section>

          {/* ── RADIUS ── */}
          <section>
            <SectionLabel color={accentColor}>BORDER RADIUS</SectionLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {(Object.entries(RADII) as [RadiusId, typeof RADII[RadiusId]][]).map(([id, r]) => {
                const active = theme.radius === id;
                return (
                  <button
                    key={id}
                    onClick={() => setRadius(id)}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      border: `1px solid ${active ? accentColor : "#1f1f1f"}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: active ? accentColor : "#555",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      fontFamily: "inherit",
                      transition: "border-color 0.15s, color 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                      borderRadius: r.value,
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{r.preview}</span>
                    <span>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── FONT ── */}
          <section>
            <SectionLabel color={accentColor}>FONT SYSTEM</SectionLabel>
            <div style={{ display: "flex", gap: 6 }}>
              {(Object.entries(FONTS) as [FontId, typeof FONTS[FontId]][]).map(([id, f]) => {
                const active = theme.font === id;
                return (
                  <button
                    key={id}
                    onClick={() => setFont(id)}
                    style={{
                      flex: 1,
                      padding: "10px 12px",
                      border: `1px solid ${active ? accentColor : "#1f1f1f"}`,
                      background: "transparent",
                      cursor: "pointer",
                      color: active ? accentColor : "#555",
                      fontSize: 9,
                      letterSpacing: "0.1em",
                      fontFamily: f.stack,
                      transition: "border-color 0.15s, color 0.15s",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 15, fontWeight: 700 }}>{f.sample}</span>
                    <span style={{ fontFamily: "inherit", fontSize: 9 }}>{f.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── LIVE PREVIEW ── */}
          <section>
            <SectionLabel color={accentColor}>LIVE PREVIEW</SectionLabel>
            <div style={{
              background: skinData.panel,
              border: `1px solid ${accentColor}22`,
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: 8,
              borderRadius: RADII[theme.radius].value,
            }}>
              <div style={{
                fontSize: 10,
                fontWeight: 700,
                color: accentColor,
                letterSpacing: "0.15em",
                fontFamily: FONTS[theme.font].stack,
              }}>
                ✦ DX // STORY RIOT
              </div>
              <div style={{
                fontSize: 9,
                color: "#666",
                fontFamily: FONTS[theme.font].stack,
                lineHeight: 1.6,
              }}>
                Creative Chaos · Developer Business
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  border: `1px solid ${accentColor}`,
                  color: accentColor,
                  fontSize: 8,
                  letterSpacing: "0.1em",
                  borderRadius: RADII[theme.radius].value,
                  fontFamily: FONTS[theme.font].stack,
                }}>ACTIVE</span>
                <span style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  border: "1px solid #333",
                  color: "#555",
                  fontSize: 8,
                  letterSpacing: "0.1em",
                  borderRadius: RADII[theme.radius].value,
                  fontFamily: FONTS[theme.font].stack,
                }}>IDLE</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "12px 20px",
          borderTop: `1px solid ${accentColor}22`,
          display: "flex",
          gap: 6,
        }}>
          <button
            onClick={copyConfig}
            style={{
              ...footerBtn,
              borderColor: "#2a2a2a",
              color: copied ? accentColor : "#555",
              flex: 1,
            }}
          >
            {copied ? "✓ COPIED" : "COPY"}
          </button>
          <button
            onClick={reset}
            style={{ ...footerBtn, borderColor: "#2a2a2a", color: "#555", flex: 1 }}
          >
            RESET
          </button>
          <button
            onClick={() => setOpen(false)}
            style={{ ...footerBtn, borderColor: accentColor, color: accentColor, flex: 2 }}
          >
            APPLY ✦
          </button>
        </div>

        {/* Keyboard hint */}
        <div style={{
          padding: "6px 20px 10px",
          fontSize: 9,
          color: "#2a2a2a",
          letterSpacing: "0.08em",
          textAlign: "center",
        }}>
          Press ESC to close
        </div>
      </aside>
    </>
  );
}

// ─── HELPERS ───────────────────────────────────────────────────────────────────

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{
      fontSize: 9,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color,
      marginBottom: 10,
      display: "flex",
      alignItems: "center",
      gap: 6,
    }}>
      <span style={{ display: "inline-block", width: 12, height: 1, background: color, opacity: 0.5 }} />
      {children}
    </div>
  );
}

const footerBtn: React.CSSProperties = {
  padding: "9px 10px",
  border: "1px solid",
  background: "transparent",
  cursor: "pointer",
  fontSize: 9,
  letterSpacing: "0.12em",
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  transition: "border-color 0.15s, color 0.15s",
};

export { DEFAULT_THEME, STORAGE_KEY };

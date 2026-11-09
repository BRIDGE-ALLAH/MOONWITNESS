"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { EcosystemTopBar, EcosystemFooter } from "./ecosystem-bar";
import { AuthProvider } from "./auth-context";
import { EcosystemLoginModal } from "./ecosystem-login-modal";

// ─── TYPES ─────────────────────────────────────────────────────────────────────

export type AppDnaId = "dx" | "empire" | "moonwitness" | "eisp" | "rid";
export type ModeId = "dark" | "light";
export type SkinId = "grunge" | "sacred" | "celestial" | "steel" | "phantom" | "acid";
export type AccentId = "toxic" | "lime" | "cyan" | "gold" | "purple" | "orange";
export type RadiusId = "none" | "sm" | "md";
export type FontId = "mono" | "sans" | "serif";

export interface ThemeConfig {
  dna: AppDnaId;
  mode: ModeId;
  skin: SkinId;
  accent: AccentId;
  radius: RadiusId;
  font: FontId;
}

// ─── DNA PRESETS (Each ecosystem site has its own default DNA) ─────────────────

export const DNA_PRESETS: Record<
  AppDnaId,
  { label: string; subtitle: string; defaultSkin: SkinId; defaultAccent: AccentId; defaultFont: FontId }
> = {
  dx: {
    label: "DX // STORY RIOT",
    subtitle: "Creative Chaos · Developer Business",
    defaultSkin: "grunge",
    defaultAccent: "toxic",
    defaultFont: "mono",
  },
  empire: {
    label: "EMPIRE // A-L-L-A-H.COM",
    subtitle: "Supreme Origin · Tawhid · Sacred Gold",
    defaultSkin: "sacred",
    defaultAccent: "gold",
    defaultFont: "serif",
  },
  moonwitness: {
    label: "MOONWITNESS",
    subtitle: "Living Observatory · Celestial Archive",
    defaultSkin: "celestial",
    defaultAccent: "cyan",
    defaultFont: "mono",
  },
  eisp: {
    label: "E-ISP // SOVEREIGN MESH",
    subtitle: "Edge Shield · Compute · Storage Fabric",
    defaultSkin: "steel",
    defaultAccent: "cyan",
    defaultFont: "mono",
  },
  rid: {
    label: "RID // ROOT ID",
    subtitle: "Not Rock But Soul · Skang And Roll · Patch It",
    defaultSkin: "acid",
    defaultAccent: "orange",
    defaultFont: "mono",
  },
};

// ─── SKINS (Dual Palette: Dark + Light) ────────────────────────────────────────

export interface SkinPalette {
  bg: string;
  panel: string;
  panel2: string;
  line: string;
  line2: string;
  text: string;
  muted: string;
}

export const SKINS: Record<
  SkinId,
  { label: string; dark: SkinPalette; light: SkinPalette }
> = {
  grunge: {
    label: "GRUNGE",
    dark: {
      bg: "#000000",
      panel: "#070707",
      panel2: "#111111",
      line: "#2a2a2a",
      line2: "#444444",
      text: "#ffffff",
      muted: "#a3a3a3",
    },
    light: {
      bg: "#f4f3ef",
      panel: "#ffffff",
      panel2: "#eae8e1",
      line: "#111111",
      line2: "#333333",
      text: "#050505",
      muted: "#555555",
    },
  },
  sacred: {
    label: "SACRED",
    dark: {
      bg: "#030302",
      panel: "#0a0905",
      panel2: "#141109",
      line: "#2e2612",
      line2: "#4d3f1d",
      text: "#f9f6f0",
      muted: "#a89f89",
    },
    light: {
      bg: "#fcfaf5",
      panel: "#ffffff",
      panel2: "#f3efe4",
      line: "#c5a059",
      line2: "#8c6d2f",
      text: "#17140a",
      muted: "#6b5e40",
    },
  },
  celestial: {
    label: "CELESTIAL",
    dark: {
      bg: "#030712",
      panel: "#0b1329",
      panel2: "#111e3f",
      line: "#1e293b",
      line2: "#334155",
      text: "#f8fafc",
      muted: "#94a3b8",
    },
    light: {
      bg: "#f0f7ff",
      panel: "#ffffff",
      panel2: "#e0effe",
      line: "#93c5fd",
      line2: "#3b82f6",
      text: "#09152b",
      muted: "#475569",
    },
  },
  steel: {
    label: "STEEL",
    dark: {
      bg: "#030305",
      panel: "#0a0a0f",
      panel2: "#12121c",
      line: "#1f1f2e",
      line2: "#32324a",
      text: "#e2e4f0",
      muted: "#7c809b",
    },
    light: {
      bg: "#eef0f5",
      panel: "#ffffff",
      panel2: "#e1e4ed",
      line: "#9ca3b8",
      line2: "#4b5563",
      text: "#0b0d14",
      muted: "#525866",
    },
  },
  phantom: {
    label: "PHANTOM",
    dark: {
      bg: "#090612",
      panel: "#110b22",
      panel2: "#1b1136",
      line: "#2e1d59",
      line2: "#492e8c",
      text: "#f2ebff",
      muted: "#9b87c2",
    },
    light: {
      bg: "#f7f4ff",
      panel: "#ffffff",
      panel2: "#ede6ff",
      line: "#b399ff",
      line2: "#7c4dff",
      text: "#150a2b",
      muted: "#5e4b82",
    },
  },
  acid: {
    label: "ACID",
    dark: {
      bg: "#070800",
      panel: "#101200",
      panel2: "#191c00",
      line: "#2d3300",
      line2: "#485200",
      text: "#f9ffcc",
      muted: "#9da668",
    },
    light: {
      bg: "#f9fbe8",
      panel: "#ffffff",
      panel2: "#eff5c9",
      line: "#8a9900",
      line2: "#4d5700",
      text: "#121400",
      muted: "#596128",
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
      "--accent-dim": "rgba(255,0,85,0.14)",
      "--accent-border": "rgba(255,0,85,0.45)",
    },
  },
  lime: {
    label: "LIME",
    color: "#00ff66",
    vars: {
      "--accent": "#00ff66",
      "--accent-dim": "rgba(0,255,102,0.14)",
      "--accent-border": "rgba(0,255,102,0.45)",
    },
  },
  cyan: {
    label: "CYAN",
    color: "#00f0ff",
    vars: {
      "--accent": "#00f0ff",
      "--accent-dim": "rgba(0,240,255,0.14)",
      "--accent-border": "rgba(0,240,255,0.45)",
    },
  },
  gold: {
    label: "GOLD",
    color: "#d4af37",
    vars: {
      "--accent": "#d4af37",
      "--accent-dim": "rgba(212,175,55,0.14)",
      "--accent-border": "rgba(212,175,55,0.45)",
    },
  },
  purple: {
    label: "PURPLE",
    color: "#bf00ff",
    vars: {
      "--accent": "#bf00ff",
      "--accent-dim": "rgba(191,0,255,0.14)",
      "--accent-border": "rgba(191,0,255,0.45)",
    },
  },
  orange: {
    label: "ORANGE",
    color: "#ff5500",
    vars: {
      "--accent": "#ff5500",
      "--accent-dim": "rgba(255,85,0,0.14)",
      "--accent-border": "rgba(255,85,0,0.45)",
    },
  },
};

export const RADII: Record<RadiusId, { label: string; value: string; preview: string }> = {
  none: { label: "SHARP", value: "0px", preview: "□" },
  sm:   { label: "SOFT",  value: "4px", preview: "▢" },
  md:   { label: "ROUND", value: "8px", preview: "◻" },
};

export const FONTS: Record<FontId, { label: string; stack: string; sample: string }> = {
  mono:  { label: "MONO",  stack: "'JetBrains Mono', 'Courier New', monospace", sample: "0xDX" },
  sans:  { label: "SANS",  stack: "system-ui, -apple-system, sans-serif",       sample: "AaBb" },
  serif: { label: "SERIF", stack: "'Times New Roman', Georgia, serif",          sample: "ΩΣ" },
};

// ─── HELPERS & STORAGE ─────────────────────────────────────────────────────────

export function getDefaultThemeForDna(dna: AppDnaId = "dx"): ThemeConfig {
  const preset = DNA_PRESETS[dna];
  return {
    dna,
    mode: "dark",
    skin: preset.defaultSkin,
    accent: preset.defaultAccent,
    radius: "none",
    font: preset.defaultFont,
  };
}

export const STORAGE_KEY = "dx-ecosystem-theme-v2";

function applyThemeToDOM(cfg: ThemeConfig) {
  const root = document.documentElement;
  const skinObj = SKINS[cfg.skin] || SKINS.grunge;
  const palette = cfg.mode === "light" ? skinObj.light : skinObj.dark;
  const accentObj = ACCENTS[cfg.accent] || ACCENTS.toxic;
  const radiusObj = RADII[cfg.radius] || RADII.none;
  const fontObj = FONTS[cfg.font] || FONTS.mono;

  // Core unified variables + aliases used across all 4 apps
  const vars: Record<string, string> = {
    "--bg": palette.bg,
    "--panel": palette.panel,
    "--panel2": palette.panel2,
    "--surface": palette.panel,
    "--surface2": palette.panel2,
    "--surface-alt": palette.panel2,
    "--line": palette.line,
    "--line2": palette.line2,
    "--border": palette.line,
    "--text": palette.text,
    "--text-main": palette.text,
    "--muted": palette.muted,
    "--text-dim": palette.muted,
    "--text-muted": palette.muted,
    "--silver-dim": palette.muted,
    "--radius": radiusObj.value,
    "--font-body": fontObj.stack,
    "--mono": FONTS.mono.stack,
    ...accentObj.vars,
  };

  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }

  root.dataset.dna = cfg.dna;
  root.dataset.mode = cfg.mode;
  root.dataset.skin = cfg.skin;
  root.dataset.accent = cfg.accent;
  root.style.colorScheme = cfg.mode;
}

function loadStored(defaultDna: AppDnaId): ThemeConfig {
  const fallback = getDefaultThemeForDna(defaultDna);
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${defaultDna}`) || localStorage.getItem(STORAGE_KEY);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

// ─── CONTEXT ───────────────────────────────────────────────────────────────────

interface ThemeCtx {
  theme: ThemeConfig;
  setDna: (d: AppDnaId) => void;
  setMode: (m: ModeId) => void;
  toggleMode: () => void;
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

export function useThemeSafe() {
  return useContext(ThemeContext);
}

// ─── PROVIDER & CENTRALIZED SHELL ──────────────────────────────────────────────

export function ThemeProvider({
  defaultDna = "dx",
  children,
}: {
  defaultDna?: AppDnaId;
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ThemeConfig>(() => getDefaultThemeForDna(defaultDna));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = loadStored(defaultDna);
    setTheme(stored);
    applyThemeToDOM(stored);
    setMounted(true);
  }, [defaultDna]);

  const update = useCallback(
    (patch: Partial<ThemeConfig>) => {
      setTheme((prev) => {
        const next = { ...prev, ...patch };
        applyThemeToDOM(next);
        localStorage.setItem(`${STORAGE_KEY}:${defaultDna}`, JSON.stringify(next));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    [defaultDna]
  );

  const setDna = useCallback(
    (dna: AppDnaId) => {
      const preset = DNA_PRESETS[dna];
      update({
        dna,
        skin: preset.defaultSkin,
        accent: preset.defaultAccent,
        font: preset.defaultFont,
      });
    },
    [update]
  );

  const setMode    = useCallback((mode: ModeId)     => update({ mode }), [update]);
  const toggleMode = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeConfig = { ...prev, mode: prev.mode === "dark" ? "light" : "dark" };
      applyThemeToDOM(next);
      localStorage.setItem(`${STORAGE_KEY}:${defaultDna}`, JSON.stringify(next));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [defaultDna]);

  const setSkin   = useCallback((skin: SkinId)     => update({ skin }),   [update]);
  const setAccent = useCallback((accent: AccentId) => update({ accent }), [update]);
  const setRadius = useCallback((radius: RadiusId) => update({ radius }), [update]);
  const setFont   = useCallback((font: FontId)     => update({ font }),   [update]);
  const reset     = useCallback(() => {
    const def = getDefaultThemeForDna(defaultDna);
    localStorage.removeItem(`${STORAGE_KEY}:${defaultDna}`);
    setTheme(def);
    applyThemeToDOM(def);
  }, [defaultDna]);

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider
      value={{ theme, setDna, setMode, toggleMode, setSkin, setAccent, setRadius, setFont, reset }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Centralized Shared Shell — Drop this single component into any app's layout.tsx!
 * Eliminates duplicate client-shell.tsx files across workspaces.
 */
export function EcosystemShell({
  dna = "dx",
  children,
}: {
  dna?: AppDnaId;
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ThemeProvider defaultDna={dna}>
        <EcosystemTopBar currentDna={dna} />
        {children}
        <EcosystemFooter currentDna={dna} />
        <ThemeCustomizer />
        <EcosystemLoginModal appName={DNA_PRESETS[dna]?.label} />
      </ThemeProvider>
    </AuthProvider>
  );
}

// ─── VUEXY-STYLE THEME CUSTOMIZER DRAWER ───────────────────────────────────────

export function ThemeCustomizer() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const ctx = useThemeSafe();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ctx) return null;
  const { theme, setDna, setMode, toggleMode, setSkin, setAccent, setRadius, setFont, reset } = ctx;

  const accentColor = ACCENTS[theme.accent]?.color || "#ff0055";
  const skinObj = SKINS[theme.skin] || SKINS.grunge;
  const palette = theme.mode === "light" ? skinObj.light : skinObj.dark;

  const copyConfig = async () => {
    await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <>
      <style>{`
        html, body {
          background-color: var(--bg) !important;
          color: var(--text) !important;
          font-family: var(--font-body);
          transition: background-color 0.22s ease, color 0.22s ease;
        }
        html[data-mode="light"] body,
        html[data-mode="light"] .landing-root,
        html[data-mode="light"] .origin-root,
        html[data-mode="light"] .lunar-root,
        html[data-mode="light"] .app-shell,
        html[data-mode="light"] .main-area {
          background-color: var(--bg) !important;
          color: var(--text) !important;
          background-image:
            linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px) !important;
          background-size: 32px 32px !important;
        }
        html[data-mode="light"] .sidebar,
        html[data-mode="light"] .topbar,
        html[data-mode="light"] .landing-nav,
        html[data-mode="light"] .psx-top-bar,
        html[data-mode="light"] .tawhid-header-banner,
        html[data-mode="light"] .trinity-card,
        html[data-mode="light"] .lab-card,
        html[data-mode="light"] .arsenal-card,
        html[data-mode="light"] .quickstart-card,
        html[data-mode="light"] .comic-panel-box,
        html[data-mode="light"] .repo-table,
        html[data-mode="light"] .modal-card {
          background: var(--panel) !important;
          color: var(--text) !important;
          border-color: var(--line2) !important;
        }
        html[data-mode="light"] h1,
        html[data-mode="light"] h2,
        html[data-mode="light"] h3,
        html[data-mode="light"] b,
        html[data-mode="light"] strong {
          color: var(--text);
        }
        @keyframes tc-pulse {
          0%, 100% { box-shadow: 0 0 0 0 ${accentColor}55; }
          50% { box-shadow: 0 0 0 8px ${accentColor}00; }
        }
      `}</style>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9997,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(2px)",
          }}
        />
      )}

      {/* Floating Dock (Quick Mode Toggle + Customizer Gear) */}
      <div
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: open ? "calc(360px + 1rem)" : "1.5rem",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 8,
          transition: "right 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Quick Dark / Light Toggle Pill */}
        <button
          onClick={toggleMode}
          title={`Switch to ${theme.mode === "dark" ? "Light" : "Dark"} Mode`}
          style={{
            height: 44,
            padding: "0 14px",
            borderRadius: "999px",
            border: `2px solid ${palette.line2}`,
            background: palette.panel,
            color: palette.text,
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.08em",
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: "4px 4px 0 rgba(0,0,0,0.4)",
          }}
        >
          <span>{theme.mode === "dark" ? "☀ LIGHT" : "☾ DARK"}</span>
        </button>

        {/* Main Vuexy-style Customizer Trigger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Open theme customizer"
          title="DNA & Skin Customizer"
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            border: `2px solid ${accentColor}`,
            background: palette.panel,
            color: accentColor,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            transition: "transform 0.2s",
            transform: open ? "rotate(90deg)" : "rotate(0deg)",
            animation: !open ? "tc-pulse 2.5s ease-in-out infinite" : "none",
          }}
        >
          ✦
        </button>
      </div>

      {/* Slide-in Drawer */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-label="DNA & Theme Customizer"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 360,
          zIndex: 9998,
          background: palette.bg,
          color: palette.text,
          borderLeft: `2px solid ${accentColor}`,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          overflowY: "auto",
        }}
      >
        {/* Top Accent Strip */}
        <div style={{ display: "flex", height: 5 }}>
          {(Object.entries(ACCENTS) as [AccentId, typeof ACCENTS[AccentId]][]).map(([id, a]) => (
            <div
              key={id}
              onClick={() => setAccent(id)}
              style={{
                flex: 1,
                background: a.color,
                cursor: "pointer",
                opacity: theme.accent === id ? 1 : 0.35,
              }}
            />
          ))}
        </div>

        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: `1px solid ${palette.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: palette.panel,
          }}
        >
          <div>
            <div style={{ color: accentColor, fontWeight: 900, letterSpacing: "0.16em", fontSize: 12 }}>
              ✦ DNA &amp; SKIN ENGINE
            </div>
            <div style={{ color: palette.muted, fontSize: 9, letterSpacing: "0.08em", marginTop: 3 }}>
              {theme.dna.toUpperCase()} · {theme.mode.toUpperCase()} · {SKINS[theme.skin].label}
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            style={{
              background: palette.panel2,
              border: `1px solid ${palette.line2}`,
              color: palette.text,
              cursor: "pointer",
              width: 28,
              height: 28,
              display: "grid",
              placeItems: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 1. MODE: DARK / LIGHT */}
          <section>
            <SectionLabel color={accentColor}>01 // APPEARANCE MODE</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["dark", "light"] as ModeId[]).map((m) => {
                const active = theme.mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      padding: "10px",
                      border: `2px solid ${active ? accentColor : palette.line}`,
                      background: active ? palette.panel2 : palette.panel,
                      color: active ? accentColor : palette.text,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      fontWeight: 800,
                      fontSize: 10,
                      letterSpacing: "0.12em",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <span>{m === "dark" ? "☾ DARK MODE" : "☀ LIGHT MODE"}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. ECOSYSTEM DNA PRESETS */}
          <section>
            <SectionLabel color={accentColor}>02 // ECOSYSTEM DNA</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {(Object.entries(DNA_PRESETS) as [AppDnaId, typeof DNA_PRESETS[AppDnaId]][]).map(
                ([id, preset]) => {
                  const active = theme.dna === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setDna(id)}
                      style={{
                        padding: "10px 8px",
                        border: `1.5px solid ${active ? accentColor : palette.line}`,
                        background: palette.panel,
                        color: active ? accentColor : palette.text,
                        cursor: "pointer",
                        textAlign: "left",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.08em" }}>
                        {preset.label}
                      </div>
                      <div style={{ fontSize: 8, color: palette.muted, marginTop: 3 }}>
                        {preset.subtitle}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          </section>

          {/* 3. SKIN MATRIX */}
          <section>
            <SectionLabel color={accentColor}>03 // SURFACE SKIN</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {(Object.entries(SKINS) as [SkinId, typeof SKINS[SkinId]][]).map(([id, s]) => {
                const active = theme.skin === id;
                const p = theme.mode === "light" ? s.light : s.dark;
                return (
                  <button
                    key={id}
                    onClick={() => setSkin(id)}
                    style={{
                      padding: "10px 6px",
                      background: p.bg,
                      border: `2px solid ${active ? accentColor : p.line}`,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "inherit",
                    }}
                  >
                    <div style={{ display: "flex", gap: 3 }}>
                      <span style={{ width: 10, height: 10, background: p.bg, border: `1px solid ${p.line2}` }} />
                      <span style={{ width: 10, height: 10, background: p.panel2, border: `1px solid ${p.line2}` }} />
                      <span style={{ width: 10, height: 10, background: accentColor, borderRadius: "50%" }} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color: active ? accentColor : p.text }}>
                      {s.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 4. ACCENT COLOR */}
          <section>
            <SectionLabel color={accentColor}>04 // PRIMARY ACCENT</SectionLabel>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
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
                      border: `2px solid ${palette.bg}`,
                      outline: active ? `3px solid ${a.color}` : "2px solid transparent",
                      outlineOffset: 2,
                      transform: active ? "scale(1.15)" : "scale(1)",
                      transition: "transform 0.12s",
                    }}
                  />
                );
              })}
            </div>
          </section>

          {/* 5. BORDER RADIUS & FONT */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <section>
              <SectionLabel color={accentColor}>05 // RADIUS</SectionLabel>
              <div style={{ display: "flex", gap: 4 }}>
                {(Object.entries(RADII) as [RadiusId, typeof RADII[RadiusId]][]).map(([id, r]) => {
                  const active = theme.radius === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setRadius(id)}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        border: `1.5px solid ${active ? accentColor : palette.line}`,
                        background: palette.panel,
                        color: active ? accentColor : palette.muted,
                        cursor: "pointer",
                        fontSize: 9,
                        fontFamily: "inherit",
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <SectionLabel color={accentColor}>06 // TYPOGRAPHY</SectionLabel>
              <div style={{ display: "flex", gap: 4 }}>
                {(Object.entries(FONTS) as [FontId, typeof FONTS[FontId]][]).map(([id, f]) => {
                  const active = theme.font === id;
                  return (
                    <button
                      key={id}
                      onClick={() => setFont(id)}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        border: `1.5px solid ${active ? accentColor : palette.line}`,
                        background: palette.panel,
                        color: active ? accentColor : palette.muted,
                        cursor: "pointer",
                        fontSize: 9,
                        fontFamily: f.stack,
                      }}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: `1px solid ${palette.line}`,
            background: palette.panel,
            display: "flex",
            gap: 8,
          }}
        >
          <button
            onClick={copyConfig}
            style={{
              ...footerBtn,
              borderColor: palette.line2,
              color: copied ? accentColor : palette.text,
              flex: 1,
            }}
          >
            {copied ? "✓ COPIED" : "COPY JSON"}
          </button>
          <button
            onClick={reset}
            style={{
              ...footerBtn,
              borderColor: palette.line2,
              color: palette.muted,
              flex: 1,
            }}
          >
            RESET DNA
          </button>
        </div>
      </aside>
    </>
  );
}

function SectionLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div
      style={{
        fontSize: 9,
        fontWeight: 800,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

const footerBtn: React.CSSProperties = {
  padding: "9px 10px",
  border: "1.5px solid",
  background: "transparent",
  cursor: "pointer",
  fontSize: 9,
  fontWeight: 800,
  letterSpacing: "0.12em",
  fontFamily: "'JetBrains Mono', monospace",
};

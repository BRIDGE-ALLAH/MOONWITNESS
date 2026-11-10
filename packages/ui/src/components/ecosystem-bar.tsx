"use client";

import React, { useEffect } from "react";
import { useThemeSafe, type AppDnaId, DNA_PRESETS, SKINS } from "./theme-customizer";
import { useAuthSafe } from "./auth-context";
import { Badge, type BadgeProps } from "./badge";
import { Card, CardTitle, CardDescription, CardFooter } from "./card";
import { Button } from "./button";

const ECOSYSTEM_NODES: Array<{
  dna: AppDnaId;
  port: string;
  url: string;
  short: string;
  tag: string;
  variant: "gold" | "cyan" | "toxic" | "lime";
}> = [
  { dna: "empire",      port: ":3001", url: "http://127.0.0.1:3001", short: "EMPIRE",      tag: "TAWHID #1",    variant: "gold" },
  { dna: "moonwitness", port: ":3002", url: "http://127.0.0.1:3002", short: "MOONWITNESS", tag: "OBSERVATORY",  variant: "cyan" },
  { dna: "dx",          port: ":3000", url: "http://127.0.0.1:3000", short: "DX",          tag: "STORY RIOT",   variant: "toxic" },
  { dna: "eisp",        port: ":3003", url: "http://127.0.0.1:3003", short: "E-ISP",       tag: "INFRA MESH",   variant: "lime" },
  { dna: "rid",         port: ":3004", url: "http://127.0.0.1:3004", short: "RID",         tag: "ROOT ID",      variant: "gold" },
];

// ─── 1. UNIVERSAL ECOSYSTEM TOPBAR ────────────────────────────────────────────

export function EcosystemTopBar({ currentDna }: { currentDna?: AppDnaId }) {
  const ctx = useThemeSafe();
  const auth = useAuthSafe();
  const activeDna = currentDna || ctx?.theme.dna || "dx";
  const mode = ctx?.theme.mode || "dark";
  const skinId = ctx?.theme.skin || "grunge";

  return (
    <nav
      aria-label="Sovereign Ecosystem Global Navigation"
      style={{
        background: "var(--panel, #070707)",
        color: "var(--text, #fff)",
        borderBottom: "1.5px solid var(--line, #2a2a2a)",
        padding: "6px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
        fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
        fontSize: "10px",
        letterSpacing: "0.08em",
        zIndex: 90,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <Badge variant="gold" style={{ padding: "3px 8px", fontSize: "10px" }}>☝ ALLAH #1</Badge>
        <span style={{ color: "var(--muted)" }}>//</span>
        <span style={{ fontWeight: 900, color: "var(--accent)" }}>
          DNA: {DNA_PRESETS[activeDna].label}
        </span>
        <span style={{ color: "var(--muted)" }}>
          [{SKINS[skinId]?.label || "GRUNGE"} · {mode.toUpperCase()}]
        </span>
        <span
          title="Sovereign Data Planes: PocketBase (:8091) · ARSY (:4000) · Legend SurrealDB (:8092)"
          style={{
            padding: "2px 6px",
            border: "1px solid var(--line2, #333)",
            color: "var(--muted)",
            fontSize: "9px",
            fontWeight: 700,
          }}
        >
          MESH: PB:8091 · ARSY:4000 · LEGEND:8092
        </span>
        {auth?.lastEvent && (
          <span
            style={{
              padding: "2px 6px",
              background: "rgba(0, 255, 102, 0.15)",
              border: "1px solid #00ff66",
              color: "#00ff66",
              borderRadius: "var(--radius, 0px)",
              fontSize: "9px",
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            ● LIVE: {auth.lastEvent.collection.toUpperCase()} {auth.lastEvent.action.toUpperCase()}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", maxWidth: "100%", overflowX: "auto" }}>
        {ECOSYSTEM_NODES.map((node) => {
          const isCurrent = node.dna === activeDna;
          return (
            <a
              key={node.dna}
              href={node.url}
              aria-current={isCurrent ? "page" : undefined}
              title={`${node.short} — ${node.tag} (${node.port})`}
              style={{
                textDecoration: "none",
                padding: "3px 8px",
                border: `1.5px solid ${isCurrent ? "var(--accent)" : "var(--line2)"}`,
                background: isCurrent ? "var(--panel2)" : "transparent",
                color: isCurrent ? "var(--accent)" : "var(--text)",
                fontWeight: isCurrent ? 900 : 700,
                borderRadius: "var(--radius, 0px)",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.15s",
              }}
            >
              <span>{node.short}</span>
              <span style={{ color: "var(--muted)", fontSize: "9px" }}>{node.port}</span>
            </a>
          );
        })}

        <a
          href="http://127.0.0.1:3000/wiki"
          title="Sovereign Codex — Project Management, Brand DNA & Architecture Wiki"
          style={{
            textDecoration: "none",
            padding: "3px 8px",
            border: "1.5px solid #eab308",
            background: "rgba(234, 179, 8, 0.12)",
            color: "#eab308",
            fontWeight: 900,
            borderRadius: "var(--radius, 0px)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>★ WIKI &amp; PM</span>
        </a>

        <a
          href="http://127.0.0.1:8787"
          target="_blank"
          rel="noreferrer"
          title="Sovereign Codex // Edge Pulse — 100% Decoupled Status & PM Portal (:8787 / Cloudflare D1)"
          style={{
            textDecoration: "none",
            padding: "3px 8px",
            border: "1.5px solid #10b981",
            background: "rgba(16, 185, 129, 0.12)",
            color: "#10b981",
            fontWeight: 900,
            borderRadius: "var(--radius, 0px)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <span>● EDGE :8787</span>
        </a>

        {auth && (
          auth.isAuthenticated ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginLeft: "4px" }}>
              <span
                style={{
                  padding: "3px 8px",
                  background: "var(--panel2)",
                  border: "1.5px solid var(--accent)",
                  color: "var(--accent)",
                  borderRadius: "var(--radius, 0px)",
                  fontWeight: 900,
                  fontSize: "9px",
                }}
                title={`Operator: ${auth.user?.email || auth.user?.username}`}
              >
                ⚡ {auth.user?.name || auth.user?.username || auth.user?.email?.split("@")[0] || "OPERATOR"}
              </span>
              <button
                onClick={auth.logout}
                title="Disconnect Operator Session"
                style={{
                  padding: "3px 7px",
                  background: "transparent",
                  border: "1.5px solid var(--line2)",
                  color: "var(--muted)",
                  fontFamily: "inherit",
                  fontSize: "9px",
                  fontWeight: 700,
                  cursor: "pointer",
                  borderRadius: "var(--radius, 0px)",
                }}
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={auth.openLoginModal}
              title="Sign into Sovereign Mesh"
              style={{
                padding: "3px 9px",
                background: "var(--accent)",
                border: "1.5px solid var(--text)",
                color: "#000",
                fontFamily: "inherit",
                fontSize: "10px",
                fontWeight: 900,
                cursor: "pointer",
                borderRadius: "var(--radius, 0px)",
                marginLeft: "4px",
              }}
            >
              LOGIN ↗
            </button>
          )
        )}

        {ctx && (
          <button
            onClick={ctx.toggleMode}
            title="Toggle Dark / Light Mode"
            style={{
              padding: "3px 9px",
              border: "1.5px solid var(--accent)",
              background: "var(--panel2)",
              color: "var(--accent)",
              fontFamily: "inherit",
              fontSize: "10px",
              fontWeight: 900,
              cursor: "pointer",
              borderRadius: "var(--radius, 0px)",
              marginLeft: "4px",
            }}
          >
            {mode === "dark" ? "☀ LIGHT" : "☾ DARK"}
          </button>
        )}
      </div>
    </nav>
  );
}

// ─── 2. UNIVERSAL ECOSYSTEM FOOTER ────────────────────────────────────────────

export function EcosystemFooter({ currentDna }: { currentDna?: AppDnaId }) {
  const ctx = useThemeSafe();
  const activeDna = currentDna || ctx?.theme.dna || "dx";
  const preset = DNA_PRESETS[activeDna];

  return (
    <footer
      style={{
        background: "var(--panel, #070707)",
        color: "var(--muted, #888)",
        borderTop: "1.5px solid var(--line, #2a2a2a)",
        padding: "20px 5vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
        fontSize: "10px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <b style={{ color: "var(--accent)" }}>{preset.label}</b>
        <span>//</span>
        <span>{preset.subtitle}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span>الله A-L-L-A-H.COM #1</span>
        <span>·</span>
        <span>MOONWITNESS</span>
        <span>·</span>
        <span>DX STORY RIOT</span>
        <span>·</span>
        <span>E-ISP MESH ✳ 2026</span>
      </div>
    </footer>
  );
}

// ─── 3. REUSABLE DNA SECTION HEADER ───────────────────────────────────────────

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badgeVariant?: BadgeProps["variant"];
  align?: "left" | "center";
  rightSlot?: React.ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  badgeVariant = "outline",
  align = "left",
  rightSlot,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: align === "center" ? "column" : "row",
        alignItems: align === "center" ? "center" : "flex-end",
        justifyContent: "space-between",
        textAlign: align,
        gap: "12px",
        marginBottom: "28px",
        paddingBottom: "14px",
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap",
      }}
    >
      <div>
        {eyebrow && (
          <div style={{ marginBottom: "8px" }}>
            <Badge variant={badgeVariant}>{eyebrow}</Badge>
          </div>
        )}
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
            fontWeight: 900,
            fontSize: "clamp(20px, 3vw, 28px)",
            letterSpacing: "-0.02em",
            textTransform: "uppercase",
            color: "var(--text)",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: "13px",
              color: "var(--muted)",
              lineHeight: 1.6,
              maxWidth: "720px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  );
}

// ─── 4. REUSABLE METRIC / STAT CARD ───────────────────────────────────────────

export interface StatMetricProps {
  label: string;
  value: React.ReactNode;
  sub?: string;
  icon?: React.ReactNode;
  variant?: "default" | "grunge" | "neon" | "toxic" | "gold" | "cyan";
  valueColor?: string;
}

export function StatMetric({
  label,
  value,
  sub,
  icon,
  variant = "default",
  valueColor,
}: StatMetricProps) {
  return (
    <Card variant={variant} style={{ padding: "18px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "10px",
          fontFamily: "var(--mono, monospace)",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "8px",
        }}
      >
        <span>{label}</span>
        {icon && <span style={{ color: "var(--accent)" }}>{icon}</span>}
      </div>
      <div
        style={{
          fontSize: "26px",
          fontWeight: 900,
          fontFamily: "var(--mono, monospace)",
          color: valueColor || "var(--text)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: "10px",
            fontFamily: "var(--mono, monospace)",
            color: "var(--muted)",
            marginTop: "6px",
            letterSpacing: "0.08em",
          }}
        >
          {sub}
        </div>
      )}
    </Card>
  );
}

// ─── 5. REUSABLE TERMINAL / CODE WINDOW ───────────────────────────────────────

export interface TerminalWindowProps {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "neon" | "toxic" | "cyan" | "gold";
}

export function TerminalWindow({
  title = "SOVEREIGN-KERNEL // TERMINAL",
  children,
  variant = "default",
}: TerminalWindowProps) {
  return (
    <Card variant={variant} style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          background: "var(--panel2)",
          borderBottom: "1.5px solid var(--line)",
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          fontFamily: "var(--mono, monospace)",
          fontSize: "10px",
          letterSpacing: "0.12em",
          color: "var(--muted)",
        }}
      >
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#ff0055", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#f4ff00", display: "inline-block" }} />
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#00ff66", display: "inline-block" }} />
        <span style={{ marginLeft: 6, fontWeight: 800, color: "var(--text)" }}>{title}</span>
      </div>
      <div
        style={{
          padding: "16px",
          fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
          fontSize: "12px",
          lineHeight: 1.65,
          background: "var(--bg)",
          color: "var(--text)",
        }}
      >
        {children}
      </div>
    </Card>
  );
}

// ─── 6. REUSABLE MODAL DIALOG ─────────────────────────────────────────────────

export interface ModalDialogProps {
  open: boolean;
  onClose: () => void;
  eyebrow?: string;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
}

export function ModalDialog({
  open,
  onClose,
  eyebrow,
  title,
  maxWidth = "560px",
  children,
}: ModalDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9500,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(3px)",
        display: "grid",
        placeItems: "center",
        padding: "20px",
      }}
    >
      <Card
        variant="grunge"
        style={{
          width: "100%",
          maxWidth,
          background: "var(--panel)",
          color: "var(--text)",
          border: "2px solid var(--accent)",
          boxShadow: "8px 8px 0 rgba(0,0,0,0.45)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            paddingBottom: "14px",
            marginBottom: "16px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div>
            {eyebrow && (
              <div style={{ marginBottom: "6px" }}>
                <Badge variant="outline">{eyebrow}</Badge>
              </div>
            )}
            <h2
              style={{
                margin: 0,
                fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
                fontWeight: 900,
                fontSize: "20px",
                textTransform: "uppercase",
                color: "var(--text)",
              }}
            >
              {title}
            </h2>
          </div>
          <Button variant="secondary" size="icon" onClick={onClose} title="Close (Esc)">
            ✕
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}

// ─── 7. REUSABLE STATUS BANNER ────────────────────────────────────────────────

export interface StatusBannerProps {
  variant?: "success" | "error" | "info";
  message: string;
  onDismiss?: () => void;
}

export function StatusBanner({ variant = "info", message, onDismiss }: StatusBannerProps) {
  if (!message) return null;
  const colors = {
    success: { border: "#00ff66", fg: "#00ff66", tag: "OK" },
    error:   { border: "#ff0055", fg: "#ff0055", tag: "ERR" },
    info:    { border: "#00f0ff", fg: "#00f0ff", tag: "INFO" },
  }[variant];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "10px 14px",
        marginBottom: "16px",
        background: "var(--panel2)",
        border: `1.5px solid ${colors.border}`,
        borderRadius: "var(--radius, 0px)",
        fontFamily: "var(--mono, monospace)",
        fontSize: "12px",
        color: "var(--text)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Badge variant={variant === "error" ? "toxic" : variant === "success" ? "lime" : "cyan"}>
          {colors.tag}
        </Badge>
        <span>{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontFamily: "inherit",
            fontSize: "13px",
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}

// ─── 8. REUSABLE EMPTY STATE ──────────────────────────────────────────────────

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        padding: "42px 24px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        background: "var(--panel)",
        color: "var(--text)",
        fontFamily: "var(--mono, monospace)",
      }}
    >
      {icon && <div style={{ color: "var(--accent)", marginBottom: "4px" }}>{icon}</div>}
      <b style={{ fontSize: "14px", letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</b>
      {description && (
        <span style={{ fontSize: "12px", color: "var(--muted)", maxWidth: "420px" }}>
          {description}
        </span>
      )}
      {action && <div style={{ marginTop: "8px" }}>{action}</div>}
    </div>
  );
}

// ─── 9. SHARED ECOSYSTEM BRIDGE GRID (4-NODE PORTAL CARDS) ───────────────────

export function EcosystemBridgeGrid({ excludeDna }: { excludeDna?: AppDnaId }) {
  const nodes = [
    {
      dna: "empire" as AppDnaId,
      port: ":3001 // SUPREME ORIGIN",
      title: "A-L-L-A-H.COM // EMPIRE",
      subtitle: "EMPIRE OF THE LIGHT // IMPERIUM LUMEN",
      desc: "Pusat tauhid, poros moral, dan sumber hakiki dari segala hukum fisika, logika komputasi, dan nurani.",
      url: "http://127.0.0.1:3001",
      cta: "OPEN EMPIRE (:3001) ↗",
      variant: "gold" as const,
      badge: "gold" as const,
    },
    {
      dna: "moonwitness" as AppDnaId,
      port: ":3002 // CREATIVE PRESENCE",
      title: "MOONWITNESS",
      subtitle: "LUNAR CHRONICLES // LIVING OBSERVATORY",
      desc: "When the moon is high we share message and knowledge. Observatorium astronomis & arsip pengetahuan suci.",
      url: "http://127.0.0.1:3002",
      cta: "OPEN OBSERVATORY (:3002) ↗",
      variant: "cyan" as const,
      badge: "cyan" as const,
    },
    {
      dna: "dx" as AppDnaId,
      port: ":3000 // OPERATIONAL ENGINE",
      title: "DX // STORY RIOT",
      subtitle: "CREATIVE CHAOS // DEVELOPER BUSINESS",
      desc: "Senjata bare-metal developer: Native Git Smart HTTP, BaaS PocketBase, Docker PaaS Hub, dan Weapons Lab.",
      url: "http://127.0.0.1:3000",
      cta: "OPEN DX COCKPIT (:3000) ↗",
      variant: "toxic" as const,
      badge: "toxic" as const,
    },
    {
      dna: "eisp" as AppDnaId,
      port: ":3003 // SOVEREIGN INFRA",
      title: "E-ISP // SCALE PLATFORM",
      subtitle: "EDGE SHIELD × COMPUTE × STORAGE MESH",
      desc: "Fondasi tri-cloud mandiri: ingress gateway, Docker/Bun compute orchestration, dan distributed storage mesh.",
      url: "http://127.0.0.1:3003",
      cta: "OPEN E-ISP MESH (:3003) ↗",
      variant: "neon" as const,
      badge: "lime" as const,
    },
    {
      dna: "rid" as AppDnaId,
      port: ":3004 // SOVEREIGN SOUL",
      title: "RID // ROOT ID",
      subtitle: "UR IDENTITY ITS NOT ROCK BUT SOUL",
      desc: "Skang And Roll rhythm. Patch it, stitch it, claim your soul identity under ALLAH #1. Anti-corporate profiling.",
      url: "http://127.0.0.1:3004",
      cta: "OPEN ROOT ID (:3004) ↗",
      variant: "gold" as const,
      badge: "gold" as const,
    },
  ].filter((n) => n.dna !== excludeDna);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "16px",
      }}
    >
      {nodes.map((n) => (
        <Card key={n.dna} variant={n.variant} style={{ display: "flex", flexDirection: "column" }}>
          <Badge variant={n.badge} style={{ alignSelf: "flex-start", marginBottom: "10px" }}>
            {n.port}
          </Badge>
          <CardTitle style={{ fontSize: "20px", marginBottom: "4px" }}>{n.title}</CardTitle>
          <div
            style={{
              fontSize: "10px",
              fontFamily: "var(--mono, monospace)",
              color: "var(--muted)",
              letterSpacing: "0.08em",
              marginBottom: "12px",
            }}
          >
            {n.subtitle}
          </div>
          <CardDescription style={{ flex: 1, marginBottom: "16px" }}>{n.desc}</CardDescription>
          <CardFooter>
            <a href={n.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none", width: "100%" }}>
              <Button variant={n.badge === "lime" ? "primary" : n.badge} size="sm" style={{ width: "100%" }}>
                {n.cta}
              </Button>
            </a>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

// ─── 10. SHARED FORM CONTROLS (TEXTAREA & SELECT) ────────────────────────────

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ style, ...props }, ref) => (
    <textarea
      ref={ref}
      style={{
        display: "flex",
        width: "100%",
        background: "var(--panel2, #050505)",
        color: "var(--text, #ffffff)",
        border: "2px solid var(--line2, #333)",
        borderRadius: "var(--radius, 0px)",
        padding: "10px 12px",
        fontSize: "12px",
        fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
        outline: "none",
        resize: "vertical",
        ...style,
      }}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ style, children, ...props }, ref) => (
    <select
      ref={ref}
      style={{
        display: "flex",
        height: "40px",
        width: "100%",
        background: "var(--panel2, #050505)",
        color: "var(--text, #ffffff)",
        border: "2px solid var(--line2, #333)",
        borderRadius: "var(--radius, 0px)",
        padding: "0 12px",
        fontSize: "12px",
        fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
        outline: "none",
        cursor: "pointer",
        ...style,
      }}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

// ─── 11. SHARED ECOSYSTEM SITE HEADER ─────────────────────────────────────────

export interface EcosystemSiteHeaderProps {
  logoMark: React.ReactNode;
  title: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
}

export function EcosystemSiteHeader({
  logoMark,
  title,
  subtitle,
  rightSlot,
}: EcosystemSiteHeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
        padding: "18px 5vw",
        background: "var(--panel)",
        borderBottom: "1.5px solid var(--line)",
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          textDecoration: "none",
          color: "var(--text)",
        }}
      >
        <div
          style={{
            width: "42px",
            height: "42px",
            border: "2px solid var(--accent)",
            borderRadius: "var(--radius, 0px)",
            background: "var(--panel2)",
            color: "var(--accent)",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: "20px",
          }}
        >
          {logoMark}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <b
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontWeight: 900,
              fontSize: "16px",
              letterSpacing: "0.14em",
              color: "var(--text)",
            }}
          >
            {title}
          </b>
          <span
            style={{
              fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: "var(--accent)",
              textTransform: "uppercase",
            }}
          >
            {subtitle}
          </span>
        </div>
      </a>
      {rightSlot && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {rightSlot}
        </div>
      )}
    </header>
  );
}

// ─── 12. SHARED ECOSYSTEM HERO BANNER ─────────────────────────────────────────

export interface EcosystemHeroProps {
  eyebrow: string;
  badgeVariant?: BadgeProps["variant"];
  monumentalSymbol?: React.ReactNode;
  title: React.ReactNode;
  highlight?: string;
  description: React.ReactNode;
  actions?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  align?: "center" | "left";
}

export function EcosystemHero({
  eyebrow,
  badgeVariant = "outline",
  monumentalSymbol,
  title,
  highlight,
  description,
  actions,
  bottomSlot,
  align = "center",
}: EcosystemHeroProps) {
  return (
    <section
      style={{
        padding: "72px 5vw 60px",
        maxWidth: "1200px",
        margin: "0 auto",
        textAlign: align,
        position: "relative",
      }}
    >
      <div style={{ marginBottom: "22px" }}>
        <Badge variant={badgeVariant} style={{ padding: "6px 16px", fontSize: "11px" }}>
          {eyebrow}
        </Badge>
      </div>

      {monumentalSymbol && (
        <div
          style={{
            fontFamily: "serif",
            fontSize: "clamp(64px, 12vw, 140px)",
            color: "var(--accent)",
            lineHeight: 0.95,
            marginBottom: "18px",
            filter: "drop-shadow(0 0 28px var(--accent-dim))",
            userSelect: "none",
          }}
        >
          {monumentalSymbol}
        </div>
      )}

      <h1
        style={{
          fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
          fontWeight: 900,
          fontSize: "clamp(30px, 5vw, 56px)",
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          textTransform: "uppercase",
          color: "var(--text)",
          margin: "0 0 20px",
        }}
      >
        {title}
        {highlight && (
          <>
            <br />
            <span style={{ color: "var(--accent)" }}>{highlight}</span>
          </>
        )}
      </h1>

      <p
        style={{
          fontSize: "clamp(14px, 1.8vw, 17px)",
          lineHeight: 1.75,
          color: "var(--muted)",
          maxWidth: "820px",
          margin: align === "center" ? "0 auto 32px" : "0 0 32px",
        }}
      >
        {description}
      </p>

      {actions && (
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: align === "center" ? "center" : "flex-start",
            flexWrap: "wrap",
            marginBottom: bottomSlot ? "42px" : 0,
          }}
        >
          {actions}
        </div>
      )}

      {bottomSlot && <div>{bottomSlot}</div>}
    </section>
  );
}





"use client";

import React from "react";
import { useThemeSafe, type AppDnaId, DNA_PRESETS, SKINS } from "./theme-customizer";
import { Badge, type BadgeProps } from "./badge";
import { Card } from "./card";

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
];

// ─── 1. UNIVERSAL ECOSYSTEM TOPBAR ────────────────────────────────────────────

export function EcosystemTopBar({ currentDna }: { currentDna?: AppDnaId }) {
  const ctx = useThemeSafe();
  const activeDna = currentDna || ctx?.theme.dna || "dx";
  const mode = ctx?.theme.mode || "dark";
  const skinId = ctx?.theme.skin || "grunge";

  return (
    <div
      style={{
        background: "var(--panel, #070707)",
        color: "var(--text, #fff)",
        borderBottom: "1.5px solid var(--line, #2a2a2a)",
        padding: "6px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        fontFamily: "var(--mono, 'JetBrains Mono', monospace)",
        fontSize: "10px",
        letterSpacing: "0.1em",
        zIndex: 90,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Badge variant="gold">☝ ALLAH #1</Badge>
        <span style={{ color: "var(--muted)" }}>//</span>
        <span style={{ fontWeight: 900, color: "var(--accent)" }}>
          DNA: {DNA_PRESETS[activeDna].label}
        </span>
        <span style={{ color: "var(--muted)" }}>
          [{SKINS[skinId]?.label || "GRUNGE"} · {mode.toUpperCase()}]
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
        {ECOSYSTEM_NODES.map((node) => {
          const isCurrent = node.dna === activeDna;
          return (
            <a
              key={node.dna}
              href={node.url}
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
    </div>
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

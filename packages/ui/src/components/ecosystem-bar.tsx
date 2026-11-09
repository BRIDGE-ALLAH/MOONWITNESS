"use client";

import React from "react";
import { useThemeSafe, type AppDnaId, DNA_PRESETS, SKINS } from "./theme-customizer";
import { Badge } from "./badge";

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
      {/* Left: Active DNA & Sovereign Creed */}
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

      {/* Right: 4-Node Portal Switcher + Quick Mode Toggle */}
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

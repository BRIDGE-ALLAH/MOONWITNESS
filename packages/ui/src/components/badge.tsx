import React from "react";
import { cn } from "../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "lime" | "toxic" | "gold" | "cyan" | "outline";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", style, children, ...props }, ref) => {
    const palettes: Record<
      NonNullable<BadgeProps["variant"]>,
      { bg: string; fg: string; border: string }
    > = {
      default: { bg: "var(--panel2, #222)", fg: "var(--text, #fff)", border: "var(--line2, #444)" },
      lime:    { bg: "#00ff66",             fg: "#000",              border: "#000" },
      toxic:   { bg: "#ff0055",             fg: "#fff",              border: "#000" },
      gold:    { bg: "#d4af37",             fg: "#000",              border: "#000" },
      cyan:    { bg: "#00f0ff",             fg: "#000",              border: "#000" },
      outline: { bg: "transparent",         fg: "var(--accent, var(--text))", border: "var(--accent, var(--line2))" },
    };

    const p = palettes[variant];

    return (
      <span
        ref={ref}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "3px 10px",
          fontSize: "10px",
          fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          background: p.bg,
          color: p.fg,
          border: `1.5px solid ${p.border}`,
          borderRadius: "var(--radius, 0px)",
          userSelect: "none",
          ...style,
        }}
        className={cn("ui-badge", className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

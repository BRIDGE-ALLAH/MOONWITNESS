import React from "react";
import { cn } from "../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "toxic" | "outline" | "ghost" | "gold" | "cyan";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", style, children, ...props }, ref) => {
    const palettes: Record<
      NonNullable<ButtonProps["variant"]>,
      { bg: string; fg: string; border: string }
    > = {
      primary:   { bg: "var(--accent, #00ff66)", fg: "#000", border: "var(--text, #000)" },
      secondary: { bg: "var(--panel2, #111)",    fg: "var(--text, #fff)", border: "var(--line2, #444)" },
      toxic:     { bg: "#ff0055",                fg: "#fff", border: "var(--text, #000)" },
      gold:      { bg: "#d4af37",                fg: "#000", border: "var(--text, #000)" },
      cyan:      { bg: "#00f0ff",                fg: "#000", border: "var(--text, #000)" },
      outline:   { bg: "transparent",            fg: "var(--text, #fff)", border: "var(--line2, #666)" },
      ghost:     { bg: "transparent",            fg: "var(--muted, #aaa)", border: "transparent" },
    };

    const sizes: Record<NonNullable<ButtonProps["size"]>, React.CSSProperties> = {
      sm:   { height: "32px", padding: "0 12px", fontSize: "11px", gap: "6px" },
      md:   { height: "40px", padding: "0 18px", fontSize: "12px", gap: "8px" },
      lg:   { height: "46px", padding: "0 24px", fontSize: "13px", gap: "10px" },
      icon: { height: "38px", width: "38px", padding: 0 },
    };

    const p = palettes[variant];

    const inlineStyle: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
      fontWeight: 800,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      cursor: "pointer",
      userSelect: "none",
      background: p.bg,
      color: p.fg,
      border: `2px solid ${p.border}`,
      borderRadius: "var(--radius, 0px)",
      boxShadow: variant === "ghost" ? "none" : "3px 3px 0 rgba(0,0,0,0.28)",
      transition: "transform 0.1s, opacity 0.15s",
      maxWidth: "100%",
      whiteSpace: "normal",
      textAlign: "center",
      wordBreak: "break-word",
      ...sizes[size],
      ...style,
    };

    return (
      <button
        ref={ref}
        style={inlineStyle}
        className={cn("ui-btn", className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

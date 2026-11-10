import React from "react";
import { cn } from "../lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "grunge" | "neon" | "toxic" | "gold" | "cyan" | "hud" | "matrix";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", style, children, ...props }, ref) => {
    const borderColors: Record<NonNullable<CardProps["variant"]>, string> = {
      default: "var(--line2, #333)",
      grunge: "var(--text, #fff)",
      neon: "#00ff66",
      toxic: "#ff0055",
      gold: "#d4af37",
      cyan: "#00f0ff",
      hud: "var(--accent, #00f0ff)",
      matrix: "var(--accent, #00ff66)",
    };

    const isGlowing = variant === "hud" || variant === "matrix" || variant === "gold" || variant === "neon";

    const baseInlineStyle: React.CSSProperties = {
      background: "var(--panel, #0a0a0a)",
      color: "var(--text, #ffffff)",
      border: `${variant === "grunge" ? "3px" : "1.5px"} solid ${borderColors[variant]}`,
      borderRadius: "var(--radius, 0px)",
      padding: "20px",
      boxShadow: isGlowing
        ? `0 0 12px ${borderColors[variant]}33, 4px 4px 0 rgba(0,0,0,0.3)`
        : "4px 4px 0 rgba(0,0,0,0.22)",
      transition: "background 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s",
      ...style,
    };

    return (
      <div
        ref={ref}
        style={baseInlineStyle}
        className={cn("ui-card", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export function CardHeader({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px", ...style }}
      className={cn("ui-card-header", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, style, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      style={{
        fontFamily: "var(--font-body, 'JetBrains Mono', monospace)",
        fontWeight: 900,
        fontSize: "18px",
        textTransform: "uppercase",
        letterSpacing: "-0.01em",
        color: "var(--text)",
        margin: 0,
        ...style,
      }}
      className={cn("ui-card-title", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, style, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      style={{
        fontSize: "12px",
        fontFamily: "var(--font-body, monospace)",
        color: "var(--muted)",
        lineHeight: 1.6,
        margin: 0,
        ...style,
      }}
      className={cn("ui-card-desc", className)}
      {...props}
    />
  );
}

export function CardContent({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div style={{ paddingTop: 0, ...style }} className={cn("ui-card-content", className)} {...props} />;
}

export function CardFooter({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: "14px",
        marginTop: "14px",
        borderTop: "1px solid var(--line)",
        fontFamily: "var(--font-body, monospace)",
        fontSize: "11px",
        color: "var(--muted)",
        ...style,
      }}
      className={cn("ui-card-footer", className)}
      {...props}
    />
  );
}

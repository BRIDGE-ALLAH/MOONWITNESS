import React from "react";
import { cn } from "../lib/utils";

export interface ProceduralOrnamentProps {
  ornament: "corner-brackets" | "rosette" | "pcb-trace" | "crosshair";
  size?: number;
  className?: string;
}

export interface OrnamentFrameProps {
  ornament?: "corner-brackets" | "rosette" | "pcb-trace" | "crosshair";
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  borderColor?: string;
}

export function CornerBrackets({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-ornament-corner-brackets shrink-0", className)}
    >
      <path d="M 6 28 L 6 6 L 28 6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <rect x="3" y="3" width="6" height="6" fill="currentColor" />
      <path d="M 72 6 L 94 6 L 94 28" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <rect x="91" y="3" width="6" height="6" fill="currentColor" />
      <path d="M 6 72 L 6 94 L 28 94" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <rect x="3" y="91" width="6" height="6" fill="currentColor" />
      <path d="M 72 94 L 94 94 L 94 72" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <rect x="91" y="91" width="6" height="6" fill="currentColor" />
      <circle cx="50" cy="50" r="3" stroke="currentColor" strokeWidth="1" strokeDasharray="1 1" />
    </svg>
  );
}

export function RosetteOrnament({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-ornament-rosette shrink-0", className)}
    >
      <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="50" cy="50" r="41" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 3" />
      {Array.from({ length: 8 }).map((_, index) => {
        const angle = (index * 360) / 8;
        return (
          <ellipse
            key={index}
            cx="50"
            cy="50"
            rx="14"
            ry="38"
            transform={`rotate(${angle} 50 50)`}
            stroke="currentColor"
            strokeWidth="1.25"
            strokeOpacity="0.75"
            fill="none"
          />
        );
      })}
      <polygon
        points="50,22 56,44 78,50 56,56 50,78 44,56 22,50 44,44"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle cx="50" cy="50" r="6" fill="currentColor" fillOpacity="0.5" />
      <circle cx="50" cy="50" r="2" fill="currentColor" />
    </svg>
  );
}

export function PcbTrace({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-ornament-pcb-trace shrink-0", className)}
    >
      <path d="M 8 18 L 40 18 L 56 34 L 84 34" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="8" cy="18" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="84" cy="34" r="3.5" fill="currentColor" />

      <path d="M 16 52 L 36 52 L 52 68 L 92 68" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="16" cy="52" r="3" fill="currentColor" />
      <circle cx="92" cy="68" r="3" stroke="currentColor" strokeWidth="2" fill="none" />

      <path d="M 28 88 L 60 88 L 74 74 L 74 56" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="88" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <circle cx="74" cy="56" r="2.5" fill="currentColor" />

      <circle cx="56" cy="34" r="2.5" fill="currentColor" />
      <circle cx="52" cy="68" r="2.5" fill="currentColor" />
    </svg>
  );
}

export function CrosshairOrnament({
  size = 48,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-ornament-crosshair shrink-0", className)}
    >
      <path d="M 50 12 A 38 38 0 0 1 88 50" stroke="currentColor" strokeWidth="1.75" fill="none" strokeDasharray="32 10" />
      <path d="M 88 50 A 38 38 0 0 1 50 88" stroke="currentColor" strokeWidth="1.75" fill="none" strokeDasharray="32 10" />
      <path d="M 50 88 A 38 38 0 0 1 12 50" stroke="currentColor" strokeWidth="1.75" fill="none" strokeDasharray="32 10" />
      <path d="M 12 50 A 38 38 0 0 1 50 12" stroke="currentColor" strokeWidth="1.75" fill="none" strokeDasharray="32 10" />

      <line x1="50" y1="2" x2="50" y2="28" stroke="currentColor" strokeWidth="1.5" />
      <line x1="50" y1="72" x2="50" y2="98" stroke="currentColor" strokeWidth="1.5" />
      <line x1="2" y1="50" x2="28" y2="50" stroke="currentColor" strokeWidth="1.5" />
      <line x1="72" y1="50" x2="98" y2="50" stroke="currentColor" strokeWidth="1.5" />

      <line x1="44" y1="20" x2="56" y2="20" stroke="currentColor" strokeWidth="1" />
      <line x1="44" y1="80" x2="56" y2="80" stroke="currentColor" strokeWidth="1" />
      <line x1="20" y1="44" x2="20" y2="56" stroke="currentColor" strokeWidth="1" />
      <line x1="80" y1="44" x2="80" y2="56" stroke="currentColor" strokeWidth="1" />

      <circle cx="50" cy="50" r="5" stroke="currentColor" strokeWidth="1.25" fill="none" />
      <circle cx="50" cy="50" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ProceduralOrnament({
  ornament,
  size = 48,
  className,
}: ProceduralOrnamentProps) {
  switch (ornament) {
    case "corner-brackets":
      return <CornerBrackets size={size} className={className} />;
    case "rosette":
      return <RosetteOrnament size={size} className={className} />;
    case "pcb-trace":
      return <PcbTrace size={size} className={className} />;
    case "crosshair":
      return <CrosshairOrnament size={size} className={className} />;
    default: {
      const _exhaustiveCheck: never = ornament;
      return null;
    }
  }
}

export function OrnamentFrame({
  ornament = "corner-brackets",
  children,
  className,
  contentClassName,
  borderColor = "rgba(255, 255, 255, 0.15)",
}: OrnamentFrameProps) {
  return (
    <div
      className={cn(
        "ui-ornament-frame relative p-4 transition-all duration-200",
        className
      )}
      style={{ border: `1px solid ${borderColor}` }}
    >
      {ornament === "corner-brackets" && (
        <>
          <div className="pointer-events-none absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-current" />
          <div className="pointer-events-none absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-current" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-current" />
          <div className="pointer-events-none absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-current" />
        </>
      )}

      {ornament === "crosshair" && (
        <>
          <div className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-current" />
          <div className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-current" />
          <div className="pointer-events-none absolute top-1/2 -left-1 -translate-y-1/2 w-0.5 h-4 bg-current" />
          <div className="pointer-events-none absolute top-1/2 -right-1 -translate-y-1/2 w-0.5 h-4 bg-current" />
        </>
      )}

      {ornament === "rosette" && (
        <div className="pointer-events-none absolute -top-3.5 -right-3.5 opacity-40">
          <RosetteOrnament size={28} />
        </div>
      )}

      {ornament === "pcb-trace" && (
        <div className="pointer-events-none absolute bottom-0 right-0 opacity-30 overflow-hidden w-16 h-16">
          <PcbTrace size={64} />
        </div>
      )}

      <div className={cn("ui-ornament-frame-content relative z-10", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

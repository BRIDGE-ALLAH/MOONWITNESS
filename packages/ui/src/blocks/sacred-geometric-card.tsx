"use client";

import React, { useCallback } from "react";
import { cn } from "../lib/utils";
import { DnaSoundProfile, sovereignSound } from "../engine/audio/sound-engine";

export interface SacredGeometricCardProps {
  dna?: DnaSoundProfile;
  title: string;
  subtitle?: string;
  pattern?: "octagram" | "flower-of-life" | "arabesque";
  auraColor?: string;
  children?: React.ReactNode;
  className?: string;
}

function OctagramPattern({ color = "#d4af37" }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="100" cy="100" r="84" stroke={color} strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.5" />
      <rect x="42" y="42" width="116" height="116" stroke={color} strokeWidth="1.5" strokeOpacity="0.75" fill="none" />
      <rect
        x="42"
        y="42"
        width="116"
        height="116"
        transform="rotate(45 100 100)"
        stroke={color}
        strokeWidth="1.5"
        strokeOpacity="0.75"
        fill="none"
      />
      {Array.from({ length: 8 }).map((_, i) => {
        const rad = (i * 45 * Math.PI) / 180;
        return (
          <line
            key={i}
            x1="100"
            y1="100"
            x2={100 + 84 * Math.cos(rad)}
            y2={100 + 84 * Math.sin(rad)}
            stroke={color}
            strokeWidth="0.75"
            strokeOpacity="0.5"
          />
        );
      })}
      <circle cx="100" cy="100" r="28" stroke={color} strokeWidth="1" strokeOpacity="0.6" fill={color} fillOpacity="0.05" />
      <circle cx="100" cy="100" r="14" stroke={color} strokeWidth="1" strokeDasharray="2 2" strokeOpacity="0.8" />
      <circle cx="100" cy="100" r="4" fill={color} fillOpacity="0.8" />
    </svg>
  );
}

function FlowerOfLifePattern({ color = "#d4af37" }: { color?: string }) {
  const r = 28;
  const cx = 100;
  const cy = 100;

  const ring1 = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const ring2 = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i * 30 * Math.PI) / 180;
    const dist = i % 2 === 0 ? r * 2 : r * Math.sqrt(3);
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  });

  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="100" cy="100" r="92" stroke={color} strokeWidth="1.25" strokeOpacity="0.5" />
      <circle cx="100" cy="100" r="95" stroke={color} strokeWidth="0.75" strokeOpacity="0.3" strokeDasharray="4 3" />
      <circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth="1" strokeOpacity="0.7" />
      {ring1.map((pt, i) => (
        <circle key={`r1-${i}`} cx={pt.x} cy={pt.y} r={r} stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      ))}
      {ring2.map((pt, i) => (
        <circle key={`r2-${i}`} cx={pt.x} cy={pt.y} r={r} stroke={color} strokeWidth="0.8" strokeOpacity="0.45" />
      ))}
      <circle cx="100" cy="100" r="3" fill={color} />
    </svg>
  );
}

function ArabesquePattern({ color = "#d4af37" }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect x="12" y="12" width="176" height="176" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <rect x="20" y="20" width="160" height="160" stroke={color} strokeWidth="0.75" strokeDasharray="3 3" strokeOpacity="0.3" />
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = i * 30;
        return (
          <rect
            key={i}
            x="48"
            y="48"
            width="104"
            height="104"
            transform={`rotate(${angle} 100 100)`}
            stroke={color}
            strokeWidth="0.9"
            strokeOpacity="0.5"
            fill="none"
          />
        );
      })}
      <path d="M 24 24 Q 60 40 40 60 Z" stroke={color} strokeWidth="1" strokeOpacity="0.5" fill={color} fillOpacity="0.05" />
      <path d="M 176 24 Q 140 40 160 60 Z" stroke={color} strokeWidth="1" strokeOpacity="0.5" fill={color} fillOpacity="0.05" />
      <path d="M 24 176 Q 60 160 40 140 Z" stroke={color} strokeWidth="1" strokeOpacity="0.5" fill={color} fillOpacity="0.05" />
      <path d="M 176 176 Q 140 160 160 140 Z" stroke={color} strokeWidth="1" strokeOpacity="0.5" fill={color} fillOpacity="0.05" />
      <circle cx="100" cy="100" r="18" stroke={color} strokeWidth="1.2" strokeOpacity="0.8" />
      <circle cx="100" cy="100" r="5" fill={color} />
    </svg>
  );
}

export function SacredGeometricCard({
  dna,
  title,
  subtitle,
  pattern = "octagram",
  auraColor = "rgba(212, 175, 55, 0.15)",
  children,
  className,
}: SacredGeometricCardProps) {
  const handleMouseEnter = useCallback(() => {
    if (dna) {
      sovereignSound.playHover(dna);
    }
  }, [dna]);

  const handleClick = useCallback(() => {
    if (dna) {
      sovereignSound.playClick(dna);
    }
  }, [dna]);

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={cn(
        "ui-sacred-geometric-card group relative overflow-hidden bg-neutral-950/90 border border-amber-500/30 text-neutral-100 transition-all duration-300",
        "shadow-[0_8px_32px_rgba(0,0,0,0.85)] hover:border-amber-500/60",
        className
      )}
    >
      <style>{`
        @keyframes ui-sacred-aura-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        .ui-sacred-aura {
          animation: ui-sacred-aura-pulse 5s ease-in-out infinite;
        }
      `}</style>

      <div
        aria-hidden="true"
        className="ui-sacred-aura pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl z-0"
        style={{ backgroundColor: auraColor }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -bottom-8 w-48 h-48 opacity-15 group-hover:opacity-25 transition-opacity duration-300 z-0"
      >
        {pattern === "octagram" && <OctagramPattern color="#d4af37" />}
        {pattern === "flower-of-life" && <FlowerOfLifePattern color="#d4af37" />}
        {pattern === "arabesque" && <ArabesquePattern color="#d4af37" />}
      </div>

      <div className="pointer-events-none absolute top-1.5 left-1.5 right-1.5 bottom-1.5 border border-amber-500/20 pointer-events-none z-10" />

      <div className="relative z-10 px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-500 text-xs">◈</span>
          <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">
            {subtitle || "SACRED GEOMETRY // SOVEREIGN ORDER"}
          </span>
        </div>
        <h3 className="text-lg font-serif tracking-wide text-amber-100 font-bold">
          {title}
        </h3>
        <div className="w-12 h-0.5 bg-gradient-to-r from-amber-500 to-transparent mt-2" />
      </div>

      <div className="relative z-10 px-5 pb-5 pt-1">
        {children}
      </div>
    </div>
  );
}

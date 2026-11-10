"use client";

import React, { useState, useCallback } from "react";
import { cn } from "../lib/utils";
import { DnaSoundProfile, sovereignSound } from "../engine/audio/sound-engine";

export interface TacticalHudBlockProps {
  dna?: DnaSoundProfile;
  title: string;
  callsign?: string;
  coordinates?: string;
  status?: string;
  scanlines?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function TacticalHudBlock({
  dna,
  title,
  callsign = "SYS.01",
  coordinates = "RA 05h 35m / DEC -05°23'",
  status = "ONLINE",
  scanlines = true,
  children,
  className,
}: TacticalHudBlockProps) {
  const [activeScanlines, setActiveScanlines] = useState<boolean>(scanlines);

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

  const toggleScanlines = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setActiveScanlines((prev) => !prev);
      if (dna) {
        sovereignSound.playClick(dna);
      }
    },
    [dna]
  );

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
      className={cn(
        "ui-tactical-hud-block relative overflow-hidden bg-black/90 border border-neutral-800 text-neutral-100 font-mono transition-all duration-200 select-none",
        "shadow-[0_4px_24px_rgba(0,0,0,0.8)]",
        className
      )}
    >
      <style>{`
        @keyframes ui-hud-scan-sweep {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        @keyframes ui-hud-led-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .ui-hud-scanner {
          animation: ui-hud-scan-sweep 8s linear infinite;
        }
        .ui-hud-led {
          animation: ui-hud-led-pulse 2s ease-in-out infinite;
        }
      `}</style>

      {activeScanlines && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-30 opacity-20"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0px, rgba(0, 0, 0, 0.9) 1px, transparent 1px, transparent 2px)",
          }}
        >
          <div className="ui-hud-scanner w-full h-8 bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent" />
        </div>
      )}

      <div className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-emerald-500 z-20" />
      <div className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-emerald-500 z-20" />
      <div className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-emerald-500 z-20" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-emerald-500 z-20" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-neutral-950/80 border-b border-neutral-800/80 text-[11px]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-emerald-400 bg-emerald-950/60 border border-emerald-700/60 uppercase">
            {callsign}
          </span>
          <h3 className="font-bold tracking-wider text-neutral-100 uppercase truncate">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
          <span className="hidden sm:inline-block opacity-70 tracking-tight text-[9px]">
            {coordinates}
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900 border border-neutral-800">
            <span
              className={cn(
                "ui-hud-led w-1.5 h-1.5 rounded-full shrink-0",
                status.toUpperCase() === "ONLINE"
                  ? "bg-emerald-500 shadow-[0_0_6px_#10b981]"
                  : "bg-amber-500 shadow-[0_0_6px_#f59e0b]"
              )}
            />
            <span className="font-semibold text-neutral-200 uppercase text-[9px]">{status}</span>
          </div>

          <button
            type="button"
            onClick={toggleScanlines}
            title="Toggle CRT Scanlines"
            className={cn(
              "px-1.5 py-0.5 text-[9px] border transition-colors cursor-pointer uppercase",
              activeScanlines
                ? "border-emerald-700/60 text-emerald-400 bg-emerald-950/40"
                : "border-neutral-800 text-neutral-500 hover:text-neutral-300"
            )}
          >
            CRT
          </button>
        </div>
      </div>

      <div className="relative z-10 p-4">
        {children}
      </div>

      <div className="relative z-10 flex items-center justify-between px-3 py-1 bg-neutral-950/40 border-t border-neutral-900 text-[9px] text-neutral-500 select-none">
        <span className="tracking-widest">SEC.LEVEL // TACTICAL-HUD</span>
        <span className="tracking-tight text-neutral-600">SOVEREIGN MONOREPO // M1</span>
      </div>
    </div>
  );
}

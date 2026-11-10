"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { cn } from "../lib/utils";

export interface CosmicArchiveItem {
  id: string;
  title: string;
  timestamp: string;
  coordinates?: string;
  tag?: string;
  content?: React.ReactNode;
}

export interface CosmicArchivesProps {
  title?: string;
  items: CosmicArchiveItem[];
  className?: string;
}

function seededFloat(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface StarNode {
  xRatio: number;
  yRatio: number;
  radius: number;
  phase: number;
  speed: number;
}

export function CosmicArchives({
  title = "COSMIC ARCHIVES // CELESTIAL OBSERVATORY",
  items,
  className,
}: CosmicArchivesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);
  const [selectedTag, setSelectedTag] = useState<string>("ALL");

  const stars: StarNode[] = useMemo(() => {
    return Array.from({ length: 72 }).map((_, i) => ({
      xRatio: seededFloat(i * 19.3 + 1.2),
      yRatio: seededFloat(i * 31.7 + 5.8),
      radius: 0.6 + seededFloat(i * 7.1) * 1.6,
      phase: seededFloat(i * 13.9) * Math.PI * 2,
      speed: 1.2 + seededFloat(i * 11.3) * 2.5,
    }));
  }, []);

  const tags = useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.tag) set.add(item.tag);
    });
    return ["ALL", ...Array.from(set)];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedTag === "ALL") return items;
    return items.filter((item) => item.tag === selectedTag);
  }, [items, selectedTag]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, "#030712");
      bgGrad.addColorStop(1, "#0a0f1d");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      for (const star of stars) {
        const currentY = (star.yRatio * h + elapsed * star.speed * 3) % h;
        const currentX = star.xRatio * w;
        const brightness = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(elapsed * star.speed + star.phase));

        ctx.beginPath();
        ctx.arc(currentX, currentY, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224, 242, 254, ${brightness})`;
        ctx.fill();

        if (star.radius > 1.6 && brightness > 0.8) {
          ctx.strokeStyle = `rgba(186, 230, 253, ${brightness * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(currentX - 4, currentY);
          ctx.lineTo(currentX + 4, currentY);
          ctx.moveTo(currentX, currentY - 4);
          ctx.lineTo(currentX, currentY + 4);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [stars]);

  return (
    <div
      className={cn(
        "ui-cosmic-archives relative overflow-hidden bg-slate-950 border border-sky-900/40 text-neutral-100 font-mono shadow-2xl",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="pointer-events-none absolute inset-0 w-full h-full object-cover z-0 opacity-70"
      />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/80 backdrop-blur border-b border-sky-900/40">
        <div className="flex items-center gap-2.5">
          <span className="text-sky-400 text-sm">✦</span>
          <div>
            <h2 className="text-sm font-bold tracking-wider text-sky-100 uppercase">{title}</h2>
            <div className="text-[10px] text-sky-400/70">ASTRAL INDEX // {items.length} RECORDED PHENOMENA</div>
          </div>
        </div>

        {tags.length > 1 && (
          <div className="flex items-center gap-1">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTag(t)}
                className={cn(
                  "px-2 py-0.5 text-[9px] uppercase tracking-wider border transition-colors cursor-pointer",
                  selectedTag === t
                    ? "bg-sky-500/20 border-sky-400 text-sky-200 font-bold"
                    : "bg-slate-900/50 border-sky-950 text-slate-400 hover:text-slate-200"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative z-10 p-3 space-y-2 max-h-[460px] overflow-y-auto">
        {filteredItems.map((item, idx) => {
          const isExpanded = expandedId === item.id;
          const coords = item.coordinates || `RA ${(idx * 3 + 4) % 24}h 20m / DEC +${(idx * 7 + 12) % 90}°`;

          return (
            <div
              key={item.id}
              className={cn(
                "border transition-all duration-200 bg-slate-900/60 backdrop-blur",
                isExpanded ? "border-sky-500/60 shadow-[0_0_15px_rgba(56,189,248,0.15)]" : "border-sky-950/60 hover:border-sky-800/60"
              )}
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full flex items-center justify-between p-3 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sky-400 font-mono text-xs">{isExpanded ? "▼" : "▶"}</span>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-100 tracking-wide uppercase truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-sky-400/60 font-mono mt-0.5">
                      {coords} • {item.timestamp}
                    </div>
                  </div>
                </div>

                {item.tag && (
                  <span className="shrink-0 px-2 py-0.5 text-[9px] font-mono tracking-wider uppercase border border-sky-800/60 text-sky-300 bg-sky-950/50">
                    {item.tag}
                  </span>
                )}
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-sky-900/30 text-xs text-slate-300">
                  {item.content || (
                    <div className="p-3 bg-slate-950/50 border border-sky-900/20 font-mono text-[11px] space-y-1">
                      <div className="text-sky-400/80">OBSERVATION LOG:</div>
                      <div>Telemetry stream verified across celestial sensor array.</div>
                      <div className="text-sky-500/60 text-[10px]">RECORD ID: {item.id}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

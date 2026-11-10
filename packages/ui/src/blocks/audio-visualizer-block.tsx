"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { DnaSoundProfile } from "../engine/audio/sound-engine";

export interface AudioVisualizerBlockProps {
  dna?: DnaSoundProfile;
  mode?: "oscilloscope" | "fft-bars" | "circular-radar";
  analyser?: AnalyserNode;
  height?: number;
  className?: string;
}

const DNA_ACCENTS: Record<DnaSoundProfile, { primary: string; secondary: string }> = {
  dx: { primary: "#00ff66", secondary: "rgba(0, 255, 102, 0.2)" },
  empire: { primary: "#d4af37", secondary: "rgba(212, 175, 55, 0.2)" },
  moonwitness: { primary: "#38bdf8", secondary: "rgba(56, 189, 248, 0.2)" },
  eisp: { primary: "#a855f7", secondary: "rgba(168, 85, 247, 0.2)" },
  rid: { primary: "#f43f5e", secondary: "rgba(244, 63, 94, 0.2)" },
  desktop: { primary: "#6366f1", secondary: "rgba(99, 102, 241, 0.2)" },
  codex: { primary: "#10b981", secondary: "rgba(16, 185, 129, 0.2)" },
};

export function AudioVisualizerBlock({
  dna = "dx",
  mode = "oscilloscope",
  analyser,
  height = 180,
  className,
}: AudioVisualizerBlockProps) {
  const [currentMode, setCurrentMode] = useState<"oscilloscope" | "fft-bars" | "circular-radar">(mode);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const colors = DNA_ACCENTS[dna] || DNA_ACCENTS.dx;

  useEffect(() => {
    setCurrentMode(mode);
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;

    const bufferLength = analyser ? analyser.frequencyBinCount : 128;
    const timeDomainArray = new Uint8Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);
    const peakCaps: number[] = new Array(64).fill(0);

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      let hasLiveAudio = false;
      if (analyser) {
        analyser.getByteTimeDomainData(timeDomainArray);
        analyser.getByteFrequencyData(frequencyArray);
        for (let i = 0; i < 32; i++) {
          if (Math.abs(timeDomainArray[i] - 128) > 2 || frequencyArray[i] > 5) {
            hasLiveAudio = true;
            break;
          }
        }
      }

      if (currentMode === "oscilloscope") {
        ctx.beginPath();
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 8;

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v = 0.5;
          if (hasLiveAudio) {
            v = timeDomainArray[i] / 255.0;
          } else {
            const wave1 = Math.sin(elapsed * 4 + i * 0.12) * 0.28;
            const wave2 = Math.sin(elapsed * 9 + i * 0.3) * 0.12;
            const wave3 = Math.cos(elapsed * 2 + i * 0.04) * 0.08;
            v = 0.5 + wave1 + wave2 + wave3;
          }

          const y = v * h;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      } else if (currentMode === "fft-bars") {
        const barCount = 48;
        const barSpacing = 3;
        const totalBarWidth = (w - (barCount - 1) * barSpacing) / barCount;

        for (let i = 0; i < barCount; i++) {
          let magnitude = 0;
          if (hasLiveAudio) {
            const dataIdx = Math.floor((i / barCount) * (bufferLength / 2));
            magnitude = frequencyArray[dataIdx] / 255.0;
          } else {
            const harmonic = Math.sin(elapsed * 3.5 + i * 0.3) * 0.5 + 0.5;
            const rolloff = Math.exp(-i / 18);
            magnitude = harmonic * rolloff * 0.85 + 0.1;
          }

          const barHeight = Math.max(4, magnitude * (h - 20));
          const x = i * (totalBarWidth + barSpacing);
          const y = h - barHeight - 4;

          const grad = ctx.createLinearGradient(x, y, x, h);
          grad.addColorStop(0, colors.primary);
          grad.addColorStop(1, colors.secondary);

          ctx.fillStyle = grad;
          ctx.fillRect(x, y, totalBarWidth, barHeight);

          if (barHeight > peakCaps[i]) {
            peakCaps[i] = barHeight;
          } else {
            peakCaps[i] = Math.max(0, peakCaps[i] - 0.7);
          }

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, h - peakCaps[i] - 6, totalBarWidth, 2);
        }
      } else if (currentMode === "circular-radar") {
        const cx = w / 2;
        const cy = h / 2;
        const maxRadius = Math.min(cx, cy) - 12;

        ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1;
        [0.35, 0.7, 1.0].forEach((ratio) => {
          ctx.beginPath();
          ctx.arc(cx, cy, maxRadius * ratio, 0, Math.PI * 2);
          ctx.stroke();
        });

        const rayCount = 64;
        for (let i = 0; i < rayCount; i++) {
          const angle = (i * Math.PI * 2) / rayCount;
          let val = 0.3;
          if (hasLiveAudio) {
            val = frequencyArray[i % bufferLength] / 255.0;
          } else {
            const mod = Math.sin(elapsed * 3 + i * 0.2) * 0.4 + 0.6;
            val = 0.2 + 0.6 * mod;
          }

          const rayLen = maxRadius * (0.3 + 0.7 * val);
          const x1 = cx + maxRadius * 0.25 * Math.cos(angle);
          const y1 = cy + maxRadius * 0.25 * Math.sin(angle);
          const x2 = cx + rayLen * Math.cos(angle);
          const y2 = cy + rayLen * Math.sin(angle);

          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }

        const sweepAngle = elapsed * 2.4;
        const sweepX = cx + maxRadius * Math.cos(sweepAngle);
        const sweepY = cy + maxRadius * Math.sin(sweepAngle);

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(sweepX, sweepY);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentMode, analyser, colors]);

  return (
    <div
      className={cn(
        "ui-audio-visualizer-block relative overflow-hidden bg-black/95 border border-neutral-800 select-none",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-950 border-b border-neutral-850 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: colors.primary }}
          />
          <span className="font-bold tracking-wider text-neutral-200 uppercase">
            AUDIO SPECTRUM // {dna.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {(["oscilloscope", "fft-bars", "circular-radar"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setCurrentMode(m)}
              className={cn(
                "px-2 py-0.5 text-[9px] uppercase tracking-wider transition-colors border cursor-pointer",
                currentMode === m
                  ? "bg-neutral-800 text-neutral-100 border-neutral-600 font-bold"
                  : "bg-transparent text-neutral-500 border-transparent hover:text-neutral-300"
              )}
            >
              {m.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="relative w-full" style={{ height }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={height}
          className="w-full h-full block"
        />
      </div>
    </div>
  );
}

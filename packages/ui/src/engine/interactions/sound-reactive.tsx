"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "../../lib/utils";
import { sovereignSound, type DnaSoundProfile, type SoundTriggerEvent } from "../audio/sound-engine";

function seededFloat(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const DNA_THEME_PALETTES: Record<
  DnaSoundProfile,
  { primary: string; secondary: string; glow: string; core: string }
> = {
  dx: { primary: "#00ff66", secondary: "#ff007f", glow: "rgba(0, 255, 102, 0.35)", core: "#ffffff" },
  empire: { primary: "#d4af37", secondary: "#f59e0b", glow: "rgba(212, 175, 55, 0.4)", core: "#ffffff" },
  moonwitness: { primary: "#38bdf8", secondary: "#0284c7", glow: "rgba(56, 189, 248, 0.4)", core: "#ffffff" },
  eisp: { primary: "#a855f7", secondary: "#6366f1", glow: "rgba(168, 85, 247, 0.4)", core: "#ffffff" },
  rid: { primary: "#f43f5e", secondary: "#fb7185", glow: "rgba(244, 63, 94, 0.4)", core: "#ffffff" },
  desktop: { primary: "#6366f1", secondary: "#818cf8", glow: "rgba(99, 102, 241, 0.4)", core: "#ffffff" },
  codex: { primary: "#10b981", secondary: "#059669", glow: "rgba(16, 185, 129, 0.4)", core: "#ffffff" },
};

// ─── HOOK: useSoundReactiveTrigger ───────────────────────────────────────────

export interface SoundReactiveTriggerOptions {
  decayRate?: number;
  filterType?: SoundTriggerEvent["type"];
  filterDna?: DnaSoundProfile;
  historyLimit?: number;
}

export interface SoundReactiveTriggerState {
  lastEvent: SoundTriggerEvent | null;
  intensity: number;
  triggerCount: number;
  history: SoundTriggerEvent[];
  isActive: boolean;
}

export function useSoundReactiveTrigger(
  options: SoundReactiveTriggerOptions = {}
): SoundReactiveTriggerState {
  const { decayRate = 0.92, filterType, filterDna, historyLimit = 8 } = options;

  const [state, setState] = useState<SoundReactiveTriggerState>({
    lastEvent: null,
    intensity: 0,
    triggerCount: 0,
    history: [],
    isActive: false,
  });

  const intensityRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const startDecayLoop = useCallback(() => {
    if (animFrameRef.current !== null) return;

    const decay = () => {
      intensityRef.current *= decayRate;
      if (intensityRef.current < 0.005) {
        intensityRef.current = 0;
        animFrameRef.current = null;
        setState((prev) => ({ ...prev, intensity: 0, isActive: false }));
        return;
      }
      setState((prev) => ({ ...prev, intensity: intensityRef.current, isActive: true }));
      animFrameRef.current = requestAnimationFrame(decay);
    };

    animFrameRef.current = requestAnimationFrame(decay);
  }, [decayRate]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const unsubscribe = sovereignSound.subscribe((event: SoundTriggerEvent) => {
      if (filterType && event.type !== filterType) return;
      if (filterDna && event.dna !== filterDna) return;

      const newIntensity = Math.min(1.0, (event.intensity ?? 0.8) + 0.2);
      intensityRef.current = newIntensity;

      setState((prev) => {
        const nextHistory = [event, ...prev.history].slice(0, historyLimit);
        return {
          lastEvent: event,
          intensity: newIntensity,
          triggerCount: prev.triggerCount + 1,
          history: nextHistory,
          isActive: true,
        };
      });

      startDecayLoop();
    });

    return () => {
      unsubscribe();
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [filterType, filterDna, historyLimit, startDecayLoop]);

  return state;
}

// ─── COMPONENT: SoundReactiveCanvasBlock / SoundReactiveBlock ─────────────────

export interface SoundReactiveCanvasBlockProps {
  dna?: DnaSoundProfile;
  mode?: "shockwave" | "equalizer" | "oscilloscope";
  analyser?: AnalyserNode;
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
  label?: string;
}

export type SoundReactiveBlockProps = SoundReactiveCanvasBlockProps;

interface Spark {
  angle: number;
  dist: number;
  speed: number;
  size: number;
  alpha: number;
}

interface ShockwaveWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  speed: number;
  lineWidth: number;
  sparks: Spark[];
}

export function SoundReactiveCanvasBlock({
  dna = "dx",
  mode = "shockwave",
  analyser,
  height = 180,
  interactive = true,
  className,
  label,
}: SoundReactiveCanvasBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shockwavesRef = useRef<ShockwaveWave[]>([]);
  const peakCapsRef = useRef<number[]>(new Array(32).fill(0));
  const soundTrigger = useSoundReactiveTrigger({ filterDna: dna });

  const palette = DNA_THEME_PALETTES[dna] || DNA_THEME_PALETTES.dx;

  // Handle incoming sound trigger by spawning procedural visual ripples
  useEffect(() => {
    if (!soundTrigger.lastEvent) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const w = canvas.clientWidth || 300;
    const h = canvas.clientHeight || height;
    const originX = soundTrigger.lastEvent.x ?? w / 2;
    const originY = soundTrigger.lastEvent.y ?? h / 2;

    const sparkCount = 12;
    const sparks: Spark[] = [];
    for (let i = 0; i < sparkCount; i++) {
      sparks.push({
        angle: (i / sparkCount) * Math.PI * 2 + seededFloat(soundTrigger.triggerCount * 17.3 + i) * 0.5,
        dist: 0,
        speed: 2 + seededFloat(soundTrigger.triggerCount * 7.1 + i) * 4,
        size: 1 + seededFloat(soundTrigger.triggerCount * 3.7 + i) * 2,
        alpha: 1.0,
      });
    }

    shockwavesRef.current.push({
      x: originX,
      y: originY,
      radius: 4,
      maxRadius: Math.max(w, h) * 0.75,
      alpha: 1.0,
      speed: 4 + soundTrigger.intensity * 6,
      lineWidth: 2 + soundTrigger.intensity * 2,
      sparks,
    });

    if (shockwavesRef.current.length > 8) {
      shockwavesRef.current.shift();
    }
  }, [soundTrigger.triggerCount, height]);

  // Main 60fps Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;

    const bufferLength = analyser ? analyser.frequencyBinCount : 64;
    const timeDomainArray = new Uint8Array(bufferLength);
    const frequencyArray = new Uint8Array(bufferLength);

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const w = displayWidth;
      const h = displayHeight;

      ctx.clearRect(0, 0, w, h);

      // Background scanline grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      if (mode === "shockwave") {
        const activeWaves = shockwavesRef.current;
        for (let idx = activeWaves.length - 1; idx >= 0; idx--) {
          const wave = activeWaves[idx];
          wave.radius += wave.speed;
          wave.alpha = Math.max(0, 1 - wave.radius / wave.maxRadius);

          ctx.beginPath();
          ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
          ctx.strokeStyle = palette.primary;
          ctx.globalAlpha = wave.alpha * 0.8;
          ctx.lineWidth = wave.lineWidth;
          ctx.stroke();

          // Second inner ring
          if (wave.radius > 20) {
            ctx.beginPath();
            ctx.arc(wave.x, wave.y, wave.radius * 0.7, 0, Math.PI * 2);
            ctx.strokeStyle = palette.secondary;
            ctx.globalAlpha = wave.alpha * 0.4;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Sparks
          for (const sp of wave.sparks) {
            sp.dist += sp.speed;
            sp.alpha = Math.max(0, 1 - sp.dist / (wave.maxRadius * 0.6));
            const sx = wave.x + Math.cos(sp.angle) * sp.dist;
            const sy = wave.y + Math.sin(sp.angle) * sp.dist;

            ctx.fillStyle = palette.core;
            ctx.globalAlpha = sp.alpha;
            ctx.fillRect(sx, sy, sp.size, sp.size);
          }

          if (wave.alpha <= 0 || wave.radius >= wave.maxRadius) {
            activeWaves.splice(idx, 1);
          }
        }

        // Ambient center pulse if idle
        if (activeWaves.length === 0) {
          const pulse = Math.sin(elapsed * 2) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(w / 2, h / 2, 8 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = palette.primary;
          ctx.globalAlpha = 0.2 + pulse * 0.25;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      } else if (mode === "equalizer") {
        const barCount = 32;
        const barWidth = Math.max(2, (w - barCount * 3) / barCount);

        let liveAudio = false;
        if (analyser) {
          analyser.getByteFrequencyData(frequencyArray);
          liveAudio = frequencyArray[0] > 0 || frequencyArray[10] > 0;
        }

        for (let i = 0; i < barCount; i++) {
          let magnitude = 0;
          if (liveAudio) {
            magnitude = frequencyArray[i % bufferLength] / 255;
          } else {
            const harmonic = Math.sin(elapsed * 4 + i * 0.35) * 0.5 + 0.5;
            magnitude = harmonic * soundTrigger.intensity;
          }

          const barHeight = Math.max(3, magnitude * (h * 0.85));
          const bx = i * (barWidth + 3) + 4;
          const by = h - barHeight - 4;

          if (barHeight > peakCapsRef.current[i]) {
            peakCapsRef.current[i] = barHeight;
          } else {
            peakCapsRef.current[i] = Math.max(0, peakCapsRef.current[i] - 1.2);
          }

          const grad = ctx.createLinearGradient(0, h, 0, by);
          grad.addColorStop(0, "rgba(0, 0, 0, 0.4)");
          grad.addColorStop(0.7, palette.primary);
          grad.addColorStop(1, palette.core);

          ctx.fillStyle = grad;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(bx, by, barWidth, barHeight);

          const capY = h - peakCapsRef.current[i] - 6;
          ctx.fillStyle = palette.secondary;
          ctx.globalAlpha = 0.95;
          ctx.fillRect(bx, capY, barWidth, 2);
        }
      } else if (mode === "oscilloscope") {
        let liveAudio = false;
        if (analyser) {
          analyser.getByteTimeDomainData(timeDomainArray);
          for (let i = 0; i < 16; i++) {
            if (Math.abs(timeDomainArray[i] - 128) > 2) {
              liveAudio = true;
              break;
            }
          }
        }

        ctx.lineWidth = 2;
        ctx.strokeStyle = palette.primary;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();

        const sliceWidth = w / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          let v: number;
          if (liveAudio) {
            v = timeDomainArray[i] / 128.0;
          } else {
            const synthWave =
              Math.sin(x * 0.04 + elapsed * 6) * (0.15 + soundTrigger.intensity * 0.45) +
              Math.sin(x * 0.1 - elapsed * 3) * (0.05 * soundTrigger.intensity);
            v = 1.0 + synthWave;
          }
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.stroke();

        ctx.lineWidth = 4;
        ctx.strokeStyle = palette.glow;
        ctx.globalAlpha = 0.35;
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [dna, mode, analyser, palette, soundTrigger.intensity]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    sovereignSound.playClick(dna, { x, y });

    shockwavesRef.current.push({
      x,
      y,
      radius: 4,
      maxRadius: Math.max(rect.width, rect.height) * 0.8,
      alpha: 1.0,
      speed: 6,
      lineWidth: 2.5,
      sparks: [],
    });
  };

  return (
    <div
      className={cn(
        "ui-sound-reactive-canvas-block relative overflow-hidden bg-black/90 border border-neutral-800 font-mono",
        className
      )}
    >
      {label && (
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 text-[10px] tracking-wider uppercase text-neutral-400 bg-black/60 px-2 py-0.5 rounded border border-neutral-800">
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: palette.primary }} />
          <span>{label}</span>
          <span className="text-neutral-600">// {mode}</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{ width: "100%", height }}
        className={cn("w-full block", interactive && "cursor-pointer")}
      />
    </div>
  );
}

export const SoundReactiveBlock = SoundReactiveCanvasBlock;

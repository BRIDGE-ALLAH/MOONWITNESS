"use client";

import { useEffect, useRef } from "react";

export interface LivingSurfaceProps {
  dna?: string;
  className?: string;
  opacity?: number;
  interactive?: boolean;
}

export function LivingSurface({
  dna = "dx",
  className = "",
  opacity = 0.85,
  interactive = true,
}: LivingSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let tick = 0;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    window.addEventListener("resize", handleResize);
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    const render = () => {
      tick += 0.02;
      ctx.clearRect(0, 0, width, height);

      switch (dna) {
        case "empire": {
          // Sacred Golden Noor: Rotating sacred geometry & soft golden radial beams
          const cx = width / 2;
          const cy = height / 2;
          const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.7);
          grad.addColorStop(0, "rgba(212, 175, 55, 0.12)");
          grad.addColorStop(0.5, "rgba(212, 175, 55, 0.03)");
          grad.addColorStop(1, "rgba(0, 0, 0, 0)");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, width, height);

          // Golden sacred polygon orbits
          ctx.strokeStyle = "rgba(212, 175, 55, 0.22)";
          ctx.lineWidth = 1;
          const sides = 8;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(tick * 0.1);
          ctx.beginPath();
          for (let i = 0; i < sides; i++) {
            const angle = (i * 2 * Math.PI) / sides;
            const r = 80 + Math.sin(tick + i) * 10;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
          break;
        }

        case "moonwitness": {
          // Celestial Astral Stars & Lunar Orbit Grid
          ctx.fillStyle = "rgba(0, 240, 255, 0.35)";
          for (let i = 0; i < 35; i++) {
            const sx = (Math.sin(i * 99 + tick * 0.2) * 0.5 + 0.5) * width;
            const sy = (Math.cos(i * 33 + tick * 0.1) * 0.5 + 0.5) * height;
            const size = (Math.sin(tick * 2 + i) * 0.5 + 0.5) * 2 + 1;
            ctx.beginPath();
            ctx.arc(sx, sy, size, 0, Math.PI * 2);
            ctx.fill();
          }

          // Subtle orbital rings
          ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.ellipse(mouseX, mouseY, 140, 60, tick * 0.2, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case "eisp": {
          // Living Isometric Topographic Mesh
          ctx.strokeStyle = "rgba(0, 240, 255, 0.08)";
          ctx.lineWidth = 1;
          const gridSize = 48;
          for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
          }
          for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
          // Interactive pulse ring
          ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, (tick * 40) % 120, 0, Math.PI * 2);
          ctx.stroke();
          break;
        }

        case "rid": {
          // Analog Waveform Oscilloscope
          ctx.strokeStyle = "rgba(255, 85, 0, 0.25)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          const waveHeight = height * 0.5;
          for (let x = 0; x < width; x += 12) {
            const freq = Math.sin(x * 0.015 + tick * 2) * Math.cos(tick + x * 0.005) * 35;
            const dist = Math.max(0, 1 - Math.abs(x - mouseX) / 250);
            const y = waveHeight + freq + Math.sin(tick * 5) * 25 * dist;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          break;
        }

        case "desktop": {
          // Tactical Obsidian Cockpit Grid
          ctx.strokeStyle = "rgba(0, 240, 255, 0.12)";
          ctx.lineWidth = 1;
          // Reticle around mouse
          ctx.strokeRect(mouseX - 20, mouseY - 20, 40, 40);
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 32, 0, Math.PI * 2);
          ctx.stroke();

          // Ambient horizontal scanline
          const scanY = (tick * 60) % height;
          ctx.strokeStyle = "rgba(0, 240, 255, 0.04)";
          ctx.beginPath();
          ctx.moveTo(0, scanY);
          ctx.lineTo(width, scanY);
          ctx.stroke();
          break;
        }

        case "codex": {
          // Monastic Matrix Ledger Glow
          ctx.fillStyle = "rgba(0, 255, 102, 0.04)";
          ctx.font = "10px monospace";
          for (let col = 0; col < width; col += 60) {
            const rowY = (tick * 80 + col * 12) % height;
            ctx.fillText("0x" + Math.floor(Math.sin(tick + col) * 99 + 100).toString(16), col, rowY);
          }
          break;
        }

        case "dx":
        default: {
          // Riot Cyberpunk Noise Halftone
          ctx.fillStyle = "rgba(255, 0, 85, 0.06)";
          for (let i = 0; i < 20; i++) {
            const rx = (Math.sin(i * 12 + tick) * 0.5 + 0.5) * width;
            const ry = (Math.cos(i * 18 + tick * 1.5) * 0.5 + 0.5) * height;
            ctx.fillRect(rx, ry, 6, 6);
          }
          // Dynamic crosshair marker
          ctx.strokeStyle = "rgba(255, 0, 85, 0.2)";
          ctx.strokeRect(mouseX - 8, mouseY - 8, 16, 16);
          break;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [dna, interactive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}

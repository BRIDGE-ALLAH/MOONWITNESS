"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "../lib/utils";

export interface IsometricNetworkGraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  z?: number;
  status: "online" | "syncing" | "offline";
}

export interface IsometricNetworkGraphEdge {
  from: string;
  to: string;
  active?: boolean;
}

export interface IsometricNetworkGraphProps {
  nodes?: IsometricNetworkGraphNode[];
  edges?: IsometricNetworkGraphEdge[];
  width?: number;
  height?: number;
  className?: string;
}

const DEFAULT_NODES: IsometricNetworkGraphNode[] = [
  { id: "codex", label: "Codex Edge :8787", x: 0, y: 0, z: 30, status: "online" },
  { id: "dx", label: "DX Cockpit :3000", x: -50, y: -40, z: 15, status: "online" },
  { id: "empire", label: "Empire :3001", x: 50, y: -40, z: 10, status: "online" },
  { id: "eisp", label: "E-ISP :3003", x: -60, y: 30, z: 10, status: "online" },
  { id: "rid", label: "Root ID :3004", x: 60, y: 30, z: 10, status: "syncing" },
  { id: "git", label: "Git Engine :3200", x: -20, y: -10, z: 5, status: "online" },
  { id: "arsy", label: "ARSY :4000", x: -30, y: 50, z: 12, status: "online" },
  { id: "legend", label: "Legend BaaS :8092", x: 20, y: 50, z: 20, status: "online" },
  { id: "pb", label: "PocketBase :8091", x: 30, y: -10, z: 8, status: "online" },
];

const DEFAULT_EDGES: IsometricNetworkGraphEdge[] = [
  { from: "codex", to: "dx", active: true },
  { from: "codex", to: "legend", active: true },
  { from: "dx", to: "git", active: true },
  { from: "empire", to: "pb", active: true },
  { from: "eisp", to: "arsy", active: true },
  { from: "arsy", to: "legend", active: true },
  { from: "rid", to: "pb", active: true },
  { from: "legend", to: "pb", active: false },
];

const STATUS_COLORS: Record<string, { main: string; glow: string }> = {
  online: { main: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
  syncing: { main: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
  offline: { main: "#ef4444", glow: "rgba(239, 68, 68, 0.4)" },
};

export function IsometricNetworkGraph({
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
  width = 600,
  height = 360,
  className,
}: IsometricNetworkGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<IsometricNetworkGraphNode | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const projectIso = useCallback(
    (x: number, y: number, z: number = 0, originX: number, originY: number, scale: number = 1.6) => {
      const cos30 = 0.8660254;
      const sin30 = 0.5;
      const screenX = originX + (x - y) * cos30 * scale;
      const screenY = originY + (x + y) * sin30 * scale - z * scale;
      return { screenX, screenY };
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let startTime: number | null = null;

    const originX = width / 2;
    const originY = height / 2 + 10;
    const scale = Math.min(width, height) / 220;

    const render = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      const gridStep = 20;

      for (let gx = -gridSize; gx <= gridSize; gx += gridStep) {
        const p1 = projectIso(gx, -gridSize, 0, originX, originY, scale);
        const p2 = projectIso(gx, gridSize, 0, originX, originY, scale);
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();
      }

      for (let gy = -gridSize; gy <= gridSize; gy += gridStep) {
        const p1 = projectIso(-gridSize, gy, 0, originX, originY, scale);
        const p2 = projectIso(gridSize, gy, 0, originX, originY, scale);
        ctx.beginPath();
        ctx.moveTo(p1.screenX, p1.screenY);
        ctx.lineTo(p2.screenX, p2.screenY);
        ctx.stroke();
      }

      const projectedMap = new Map<string, { screenX: number; screenY: number; groundX: number; groundY: number }>();

      for (const node of nodes) {
        const nodePt = projectIso(node.x, node.y, node.z ?? 0, originX, originY, scale);
        const groundPt = projectIso(node.x, node.y, 0, originX, originY, scale);
        projectedMap.set(node.id, {
          screenX: nodePt.screenX,
          screenY: nodePt.screenY,
          groundX: groundPt.screenX,
          groundY: groundPt.screenY,
        });

        ctx.beginPath();
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
        ctx.moveTo(nodePt.screenX, nodePt.screenY);
        ctx.lineTo(groundPt.screenX, groundPt.screenY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        ctx.arc(groundPt.screenX, groundPt.screenY, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.fill();
      }

      edges.forEach((edge, edgeIdx) => {
        const fromPt = projectedMap.get(edge.from);
        const toPt = projectedMap.get(edge.to);
        if (!fromPt || !toPt) return;

        ctx.beginPath();
        ctx.moveTo(fromPt.screenX, fromPt.screenY);
        ctx.lineTo(toPt.screenX, toPt.screenY);
        ctx.strokeStyle = edge.active ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = edge.active ? 1.5 : 1;
        ctx.stroke();

        if (edge.active) {
          const progress = ((elapsed * 0.8 + edgeIdx * 0.25) % 1 + 1) % 1;
          const packetX = fromPt.screenX + (toPt.screenX - fromPt.screenX) * progress;
          const packetY = fromPt.screenY + (toPt.screenY - fromPt.screenY) * progress;

          ctx.beginPath();
          ctx.arc(packetX, packetY, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#10b981";
          ctx.shadowColor = "#10b981";
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      for (const node of nodes) {
        const pt = projectedMap.get(node.id);
        if (!pt) continue;

        const colors = STATUS_COLORS[node.status] || STATUS_COLORS.online;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3 + (node.x + node.y) * 0.05);

        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, 7 + pulse * 4, 0, Math.PI * 2);
        ctx.fillStyle = colors.glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(pt.screenX, pt.screenY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = colors.main;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
        ctx.textAlign = "center";
        ctx.fillText(node.label.split(" ")[0], pt.screenX, pt.screenY - 10);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [nodes, edges, width, height, projectIso]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const originX = width / 2;
    const originY = height / 2 + 10;
    const scale = Math.min(width, height) / 220;

    let found: IsometricNetworkGraphNode | null = null;
    for (const node of nodes) {
      const pt = projectIso(node.x, node.y, node.z ?? 0, originX, originY, scale);
      const dist = Math.hypot(mouseX - pt.screenX, mouseY - pt.screenY);
      if (dist < 12) {
        found = node;
        setTooltipPos({ x: pt.screenX, y: pt.screenY - 16 });
        break;
      }
    }

    setHoveredNode(found);
    if (!found) setTooltipPos(null);
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setTooltipPos(null);
  };

  return (
    <div
      className={cn(
        "ui-isometric-network-graph relative overflow-hidden bg-neutral-950 border border-neutral-800 select-none",
        className
      )}
      style={{ width, height }}
    >
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2 font-mono text-[10px] text-neutral-400">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-neutral-200">2.5D MESH TOPOLOGY</span>
        <span className="opacity-60">// {nodes.length} NODES</span>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full h-full block cursor-crosshair"
      />

      {hoveredNode && tooltipPos && (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full px-2.5 py-1.5 bg-black/90 border border-emerald-500/60 font-mono text-[10px] text-neutral-100 shadow-lg"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-emerald-400">{hoveredNode.label}</div>
          <div className="text-[9px] text-neutral-400 flex items-center gap-2">
            <span>STATUS: {hoveredNode.status.toUpperCase()}</span>
            <span>Z: {hoveredNode.z ?? 0}</span>
          </div>
        </div>
      )}
    </div>
  );
}

import React from "react";
import { cn } from "../lib/utils";

export interface ProceduralDividerProps {
  variant?: "tactical" | "hazard" | "sacred" | "pulse" | "matrix" | "celestial";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function TacticalDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-tactical flex items-center justify-center shrink-0 opacity-70",
        isHorizontal ? "w-full h-5 my-2" : "h-full w-5 mx-2 flex-col",
        className
      )}
    >
      <svg
        width={isHorizontal ? "100%" : "20"}
        height={isHorizontal ? "20" : "100%"}
        viewBox={isHorizontal ? "0 0 400 20" : "0 0 20 400"}
        preserveAspectRatio={isHorizontal ? "none" : "none"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {isHorizontal ? (
          <>
            <line x1="0" y1="10" x2="180" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="220" y1="10" x2="400" y2="10" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <polygon points="200,4 206,10 200,16 194,10" fill="currentColor" fillOpacity="0.8" />
            <circle cx="200" cy="10" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
            <line x1="170" y1="5" x2="170" y2="15" stroke="currentColor" strokeWidth="1.5" />
            <line x1="230" y1="5" x2="230" y2="15" stroke="currentColor" strokeWidth="1.5" />
          </>
        ) : (
          <>
            <line x1="10" y1="0" x2="10" y2="180" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <line x1="10" y1="220" x2="10" y2="400" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" />
            <polygon points="4,200 10,206 16,200 10,194" fill="currentColor" fillOpacity="0.8" />
            <circle cx="10" cy="200" r="8" stroke="currentColor" strokeWidth="1" fill="none" />
            <line x1="5" y1="170" x2="15" y2="170" stroke="currentColor" strokeWidth="1.5" />
            <line x1="5" y1="230" x2="15" y2="230" stroke="currentColor" strokeWidth="1.5" />
          </>
        )}
      </svg>
    </div>
  );
}

export function HazardDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-hazard shrink-0 relative overflow-hidden",
        isHorizontal ? "w-full h-3 my-2" : "h-full w-3 mx-2",
        className
      )}
      style={{
        background: isHorizontal
          ? "repeating-linear-gradient(45deg, #d4af37 0px, #d4af37 6px, transparent 6px, transparent 12px)"
          : "repeating-linear-gradient(45deg, #d4af37 0px, #d4af37 6px, transparent 6px, transparent 12px)",
        border: "1px solid rgba(212, 175, 55, 0.4)",
      }}
    />
  );
}

export function SacredDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-sacred flex items-center justify-center shrink-0 opacity-80 text-amber-500",
        isHorizontal ? "w-full h-6 my-2" : "h-full w-6 mx-2 flex-col",
        className
      )}
    >
      <svg
        width={isHorizontal ? "100%" : "24"}
        height={isHorizontal ? "24" : "100%"}
        viewBox={isHorizontal ? "0 0 400 24" : "0 0 24 400"}
        preserveAspectRatio={isHorizontal ? "none" : "none"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {isHorizontal ? (
          <>
            <line x1="0" y1="12" x2="185" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="215" y1="12" x2="400" y2="12" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="60" y1="9" x2="160" y2="9" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="240" y1="9" x2="340" y2="9" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 2" />
            <rect x="194" y="6" width="12" height="12" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="194" y="6" width="12" height="12" transform="rotate(45 200 12)" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="200" cy="12" r="2" fill="currentColor" />
          </>
        ) : (
          <>
            <line x1="12" y1="0" x2="12" y2="185" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <line x1="12" y1="215" x2="12" y2="400" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5" />
            <rect x="6" y="194" width="12" height="12" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <rect x="6" y="194" width="12" height="12" transform="rotate(45 12 200)" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="12" cy="200" r="2" fill="currentColor" />
          </>
        )}
      </svg>
    </div>
  );
}

export function PulseDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-pulse flex items-center justify-center shrink-0",
        isHorizontal ? "w-full h-6 my-2" : "h-full w-6 mx-2 flex-col",
        className
      )}
    >
      <svg
        width={isHorizontal ? "100%" : "24"}
        height={isHorizontal ? "24" : "100%"}
        viewBox={isHorizontal ? "0 0 400 24" : "0 0 24 400"}
        preserveAspectRatio={isHorizontal ? "none" : "none"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        <style>{`
          @keyframes ui-pulse-glow {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; filter: drop-shadow(0 0 4px currentColor); }
          }
          .ui-pulse-node { animation: ui-pulse-glow 2s ease-in-out infinite; }
        `}</style>
        {isHorizontal ? (
          <>
            <path
              d="M 0 12 L 160 12 L 175 12 L 180 3 L 188 21 L 195 7 L 202 16 L 208 12 L 225 12 L 400 12"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <circle cx="188" cy="21" r="3" fill="currentColor" className="ui-pulse-node" />
          </>
        ) : (
          <>
            <path
              d="M 12 0 L 12 160 L 12 175 L 3 180 L 21 188 L 7 195 L 16 202 L 12 208 L 12 225 L 12 400"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinejoin="round"
            />
            <circle cx="21" cy="188" r="3" fill="currentColor" className="ui-pulse-node" />
          </>
        )}
      </svg>
    </div>
  );
}

export function MatrixDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-matrix flex items-center justify-between shrink-0 font-mono text-[9px] text-neutral-500 opacity-75 select-none",
        isHorizontal ? "w-full h-5 my-2 px-1" : "h-full w-5 mx-2 py-1 flex-col",
        className
      )}
    >
      <span className="text-emerald-500/80">[0x00]</span>
      <div className={cn("bg-neutral-800/80", isHorizontal ? "flex-1 h-px mx-3" : "w-px flex-1 my-3")} />
      <span className="text-neutral-400 font-bold">SOV.BUS</span>
      <div className={cn("bg-neutral-800/80", isHorizontal ? "flex-1 h-px mx-3" : "w-px flex-1 my-3")} />
      <span className="text-emerald-500/80">[0xFF]</span>
    </div>
  );
}

export function CelestialDivider({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      role="separator"
      aria-orientation={orientation}
      className={cn(
        "ui-divider-celestial flex items-center justify-center shrink-0 opacity-75 text-cyan-400/90",
        isHorizontal ? "w-full h-5 my-2" : "h-full w-5 mx-2 flex-col",
        className
      )}
    >
      <svg
        width={isHorizontal ? "100%" : "20"}
        height={isHorizontal ? "20" : "100%"}
        viewBox={isHorizontal ? "0 0 400 20" : "0 0 20 400"}
        preserveAspectRatio={isHorizontal ? "none" : "none"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full overflow-visible"
      >
        {isHorizontal ? (
          <>
            <line x1="0" y1="10" x2="160" y2="10" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
            <line x1="240" y1="10" x2="400" y2="10" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="168,6 170,9 173,10 170,11 168,14 166,11 163,10 166,9" fill="currentColor" />
            <circle cx="200" cy="10" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="200" cy="10" r="2" fill="currentColor" />
            <polygon points="232,6 234,9 237,10 234,11 232,14 230,11 227,10 230,9" fill="currentColor" />
          </>
        ) : (
          <>
            <line x1="10" y1="0" x2="10" y2="160" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
            <line x1="10" y1="240" x2="10" y2="400" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="10,163 11,166 14,168 11,170 10,173 9,170 6,168 9,166" fill="currentColor" />
            <circle cx="10" cy="200" r="5" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="10" cy="200" r="2" fill="currentColor" />
            <polygon points="10,227 11,230 14,232 11,234 10,237 9,234 6,232 9,230" fill="currentColor" />
          </>
        )}
      </svg>
    </div>
  );
}

export function ProceduralDivider({
  variant = "tactical",
  orientation = "horizontal",
  className,
}: ProceduralDividerProps) {
  switch (variant) {
    case "tactical":
      return <TacticalDivider orientation={orientation} className={className} />;
    case "hazard":
      return <HazardDivider orientation={orientation} className={className} />;
    case "sacred":
      return <SacredDivider orientation={orientation} className={className} />;
    case "pulse":
      return <PulseDivider orientation={orientation} className={className} />;
    case "matrix":
      return <MatrixDivider orientation={orientation} className={className} />;
    case "celestial":
      return <CelestialDivider orientation={orientation} className={className} />;
    default: {
      const _exhaustiveCheck: never = variant;
      return null;
    }
  }
}

import { cn } from "../lib/utils";

export interface ProceduralBadgeProps {
  variant?: "chamfer" | "shield" | "lozenge" | "hazard" | "led";
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}

const STATUS_THEMES = {
  active: {
    color: "#00ff66",
    bg: "rgba(0, 255, 102, 0.08)",
    border: "rgba(0, 255, 102, 0.45)",
    glow: "rgba(0, 255, 102, 0.35)",
  },
  warning: {
    color: "#d4af37",
    bg: "rgba(212, 175, 55, 0.08)",
    border: "rgba(212, 175, 55, 0.45)",
    glow: "rgba(212, 175, 55, 0.35)",
  },
  danger: {
    color: "#ff0055",
    bg: "rgba(255, 0, 85, 0.08)",
    border: "rgba(255, 0, 85, 0.45)",
    glow: "rgba(255, 0, 85, 0.35)",
  },
  neutral: {
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.08)",
    border: "rgba(148, 163, 184, 0.35)",
    glow: "rgba(148, 163, 184, 0.2)",
  },
} as const;

export function ChamferBadge({
  label,
  status = "neutral",
  className,
}: {
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const theme = STATUS_THEMES[status];
  return (
    <span
      className={cn(
        "ui-badge-chamfer inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider",
        className
      )}
      style={{
        clipPath:
          "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)",
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        boxShadow: `inset 0 0 8px ${theme.glow}`,
      }}
    >
      <span className="w-1.5 h-1.5 shrink-0" style={{ backgroundColor: theme.color }} />
      <span>{label}</span>
    </span>
  );
}

export function ShieldBadge({
  label,
  status = "neutral",
  className,
}: {
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const theme = STATUS_THEMES[status];
  return (
    <span
      className={cn(
        "ui-badge-shield inline-flex items-center gap-1.5 px-3 pt-1 pb-1.5 text-[11px] font-mono uppercase tracking-wider font-semibold",
        className
      )}
      style={{
        clipPath: "polygon(0 0, 100% 0, 100% 74%, 50% 100%, 0 74%)",
        backgroundColor: theme.bg,
        borderTop: `1.5px solid ${theme.border}`,
        borderLeft: `1px solid ${theme.border}`,
        borderRight: `1px solid ${theme.border}`,
        color: theme.color,
        boxShadow: `0 2px 6px ${theme.glow}`,
      }}
    >
      <span className="inline-block transform scale-75">◈</span>
      <span>{label}</span>
    </span>
  );
}

export function LozengeBadge({
  label,
  status = "neutral",
  className,
}: {
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const theme = STATUS_THEMES[status];
  return (
    <span
      className={cn(
        "ui-badge-lozenge inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider",
        className
      )}
      style={{
        backgroundColor: theme.bg,
        border: `1px solid ${theme.border}`,
        color: theme.color,
        boxShadow: `0 0 10px ${theme.glow}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{
          backgroundColor: theme.color,
          boxShadow: `0 0 6px ${theme.color}`,
        }}
      />
      <span>{label}</span>
    </span>
  );
}

export function HazardBadge({
  label,
  status = "warning",
  className,
}: {
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const theme = STATUS_THEMES[status];
  return (
    <span
      className={cn(
        "ui-badge-hazard inline-flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border font-bold",
        className
      )}
      style={{
        backgroundColor: "rgba(10, 10, 10, 0.95)",
        borderColor: theme.border,
        color: theme.color,
      }}
    >
      <span
        className="inline-block w-3 h-3 shrink-0"
        style={{
          background: `repeating-linear-gradient(45deg, ${theme.color} 0px, ${theme.color} 2px, transparent 2px, transparent 5px)`,
        }}
      />
      <span>{label}</span>
      <span className="text-[9px] opacity-70 tracking-tighter">//</span>
    </span>
  );
}

export function LedBadge({
  label,
  status = "neutral",
  className,
}: {
  label: string;
  status?: "active" | "warning" | "danger" | "neutral";
  className?: string;
}) {
  const theme = STATUS_THEMES[status];
  return (
    <span
      className={cn(
        "ui-badge-led inline-flex items-center gap-2 px-2.5 py-1 bg-black/80 border border-neutral-800 text-[11px] font-mono uppercase tracking-wider",
        className
      )}
    >
      <style>{`
        @keyframes ui-led-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .ui-led-dot { animation: ui-led-pulse 1.8s ease-in-out infinite; }
      `}</style>
      <span
        className="ui-led-dot w-2 h-2 rounded-full shrink-0"
        style={{
          backgroundColor: theme.color,
          boxShadow: `0 0 8px ${theme.color}`,
        }}
      />
      <span style={{ color: theme.color }}>{label}</span>
    </span>
  );
}

export function ProceduralBadge({
  variant = "chamfer",
  label,
  status = "neutral",
  className,
}: ProceduralBadgeProps) {
  switch (variant) {
    case "chamfer":
      return <ChamferBadge label={label} status={status} className={className} />;
    case "shield":
      return <ShieldBadge label={label} status={status} className={className} />;
    case "lozenge":
      return <LozengeBadge label={label} status={status} className={className} />;
    case "hazard":
      return <HazardBadge label={label} status={status} className={className} />;
    case "led":
      return <LedBadge label={label} status={status} className={className} />;
    default: {
      return null;
    }
  }
}

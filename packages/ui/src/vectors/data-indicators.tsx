import { cn } from "../lib/utils";

export interface DataIndicatorProps {
  type: "arc-dial" | "segmented-bar" | "radial-ring";
  value: number; // 0..100
  label?: string;
  className?: string;
}

export interface SparklineGraphProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  className?: string;
}

function clampPercentage(val: number): number {
  if (Number.isNaN(val)) return 0;
  return Math.max(0, Math.min(100, val));
}

export function ArcDial({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = clampPercentage(value);
  const startAngle = 150;
  const totalSweep = 240;
  const currentSweep = (clamped / 100) * totalSweep;
  const endAngle = startAngle + currentSweep;

  const radius = 38;
  const cx = 50;
  const cy = 52;

  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x: number, y: number, r: number, start: number, end: number) => {
    const startPoint = polarToCartesian(x, y, r, end);
    const endPoint = polarToCartesian(x, y, r, start);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return ["M", startPoint.x, startPoint.y, "A", r, r, 0, largeArcFlag, 0, endPoint.x, endPoint.y].join(" ");
  };

  const bgPath = describeArc(cx, cy, radius, startAngle, startAngle + totalSweep);
  const activePath = currentSweep > 0.5 ? describeArc(cx, cy, radius, startAngle, endAngle) : "";

  return (
    <div className={cn("ui-indicator-arc-dial flex flex-col items-center justify-center shrink-0", className)}>
      <svg width="84" height="84" viewBox="0 0 100 100" fill="none" className="overflow-visible">
        <path d={bgPath} stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.15" fill="none" />
        {activePath && (
          <path
            d={activePath}
            stroke="var(--accent, #00ff66)"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
            style={{ filter: "drop-shadow(0 0 4px var(--accent, #00ff66))" }}
          />
        )}
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fill="currentColor"
          className="font-mono text-[16px] font-bold tracking-tighter"
        >
          {Math.round(clamped)}%
        </text>
      </svg>
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 -mt-2">
          {label}
        </span>
      )}
    </div>
  );
}

export function SegmentedBar({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = clampPercentage(value);
  const totalSegments = 10;
  const activeCount = Math.round((clamped / 100) * totalSegments);

  return (
    <div className={cn("ui-indicator-segmented-bar flex flex-col gap-1 w-full max-w-[200px]", className)}>
      {label && (
        <div className="flex items-center justify-between text-[10px] font-mono uppercase text-neutral-400">
          <span>{label}</span>
          <span className="font-bold text-neutral-200">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className="flex items-center gap-1 w-full h-3 p-0.5 bg-black/60 border border-neutral-800">
        {Array.from({ length: totalSegments }).map((_, i) => {
          const isActive = i < activeCount;
          return (
            <div
              key={i}
              className="flex-1 h-full transition-all duration-150"
              style={{
                backgroundColor: isActive ? "var(--accent, #00ff66)" : "rgba(255, 255, 255, 0.08)",
                boxShadow: isActive ? "0 0 6px var(--accent, #00ff66)" : "none",
                opacity: isActive ? 1 : 0.4,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function RadialRing({
  value,
  label,
  className,
}: {
  value: number;
  label?: string;
  className?: string;
}) {
  const clamped = clampPercentage(value);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clamped / 100);

  return (
    <div className={cn("ui-indicator-radial-ring flex flex-col items-center justify-center shrink-0", className)}>
      <div className="relative w-20 h-20 flex items-center justify-center">
        <svg width="80" height="80" viewBox="0 0 100 100" fill="none" className="transform -rotate-90">
          <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="6" strokeOpacity="0.15" fill="none" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="var(--accent, #00ff66)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{
              transition: "stroke-dashoffset 0.35s ease",
              filter: "drop-shadow(0 0 4px var(--accent, #00ff66))",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center font-mono text-[14px] font-bold text-neutral-100">
          {Math.round(clamped)}%
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 mt-1">
          {label}
        </span>
      )}
    </div>
  );
}

export function SparklineGraph({
  data,
  width = 120,
  height = 36,
  strokeColor = "var(--accent, #00ff66)",
  fillColor = "rgba(0, 255, 102, 0.12)",
  className,
}: SparklineGraphProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn("ui-sparkline-empty flex items-center justify-center border border-dashed border-neutral-800", className)}
        style={{ width, height }}
      >
        <span className="text-[9px] font-mono text-neutral-500">NO DATA</span>
      </div>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 3;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / Math.max(1, data.length - 1)) * innerWidth;
    const y = height - padding - ((val - min) / range) * innerHeight;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), "");
  const firstPt = points[0];
  const lastPt = points[points.length - 1];
  const areaD = `${pathD} L ${lastPt.x} ${height - padding} L ${firstPt.x} ${height - padding} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-sparkline overflow-visible shrink-0", className)}
    >
      <path d={areaD} fill={fillColor} />
      <path d={pathD} stroke={strokeColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle
        cx={lastPt.x}
        cy={lastPt.y}
        r="2.5"
        fill={strokeColor}
        style={{ filter: `drop-shadow(0 0 3px ${strokeColor})` }}
      />
    </svg>
  );
}

export function DataIndicator({
  type,
  value,
  label,
  className,
}: DataIndicatorProps) {
  switch (type) {
    case "arc-dial":
      return <ArcDial value={value} label={label} className={className} />;
    case "segmented-bar":
      return <SegmentedBar value={value} label={label} className={className} />;
    case "radial-ring":
      return <RadialRing value={value} label={label} className={className} />;
    default: {
      return null;
    }
  }
}

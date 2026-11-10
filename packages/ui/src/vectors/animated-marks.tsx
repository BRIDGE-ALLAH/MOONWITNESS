import { cn } from "../lib/utils";

export interface AnimatedMarkProps {
  mark: "sovereign-seal" | "radar-sweep" | "glitch-glyph" | "celestial-orbit" | "tawhid-ray" | "sine-wave";
  size?: number;
  color?: string;
  className?: string;
}

export function SovereignSeal({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-sovereign-seal shrink-0", className)}
    >
      <style>{`
        @keyframes ui-seal-spin-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ui-seal-spin-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes ui-seal-pulse {
          0%, 100% { opacity: 0.85; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        .ui-spin-cw { transform-origin: 50px 50px; animation: ui-seal-spin-cw 16s linear infinite; }
        .ui-spin-ccw { transform-origin: 50px 50px; animation: ui-seal-spin-ccw 12s linear infinite; }
        .ui-seal-core { transform-origin: 50px 50px; animation: ui-seal-pulse 3s ease-in-out infinite; }
      `}</style>
      <circle cx="50" cy="50" r="47" stroke={color} strokeWidth="1" strokeOpacity="0.3" />
      <g className="ui-spin-cw">
        <circle cx="50" cy="50" r="43" stroke={color} strokeWidth="1.5" strokeDasharray="5 3" />
        <circle cx="50" cy="50" r="38" stroke={color} strokeWidth="0.75" strokeDasharray="1 3" />
        <line x1="50" y1="3" x2="50" y2="7" stroke={color} strokeWidth="1.5" />
        <line x1="50" y1="93" x2="50" y2="97" stroke={color} strokeWidth="1.5" />
        <line x1="3" y1="50" x2="7" y2="50" stroke={color} strokeWidth="1.5" />
        <line x1="93" y1="50" x2="97" y2="50" stroke={color} strokeWidth="1.5" />
      </g>
      <g className="ui-spin-ccw">
        <rect x="25" y="25" width="50" height="50" stroke={color} strokeWidth="1.25" fill="none" />
        <rect x="25" y="25" width="50" height="50" transform="rotate(45 50 50)" stroke={color} strokeWidth="1.25" fill="none" />
      </g>
      <g className="ui-seal-core">
        <circle cx="50" cy="50" r="14" stroke={color} strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="7" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1.5" />
        <circle cx="50" cy="50" r="2.5" fill={color} />
      </g>
    </svg>
  );
}

export function RadarSweep({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-radar-sweep shrink-0", className)}
    >
      <style>{`
        @keyframes ui-radar-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ui-blip-pulse {
          0%, 100% { opacity: 0.15; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.3); }
        }
        .ui-sweep-arm { transform-origin: 50px 50px; animation: ui-radar-rotate 2.6s linear infinite; }
        .ui-blip-1 { transform-origin: 66px 36px; animation: ui-blip-pulse 2.6s ease-in-out infinite; animation-delay: 0.4s; }
        .ui-blip-2 { transform-origin: 34px 68px; animation: ui-blip-pulse 2.6s ease-in-out infinite; animation-delay: 1.7s; }
      `}</style>
      <defs>
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="url(#radar-glow)" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
      <circle cx="50" cy="50" r="32" stroke={color} strokeWidth="1" strokeOpacity="0.35" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="18" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="50" cy="50" r="4" fill={color} fillOpacity="0.5" />
      <line x1="50" y1="4" x2="50" y2="96" stroke={color} strokeWidth="0.75" strokeOpacity="0.3" />
      <line x1="4" y1="50" x2="96" y2="50" stroke={color} strokeWidth="0.75" strokeOpacity="0.3" />
      <g className="ui-sweep-arm">
        <path d="M 50 50 L 50 4 A 46 46 0 0 1 82 17 Z" fill="url(#sweep-gradient)" />
        <line x1="50" y1="50" x2="50" y2="4" stroke={color} strokeWidth="1.75" />
      </g>
      <g className="ui-blip-1">
        <circle cx="66" cy="36" r="3" fill={color} />
        <circle cx="66" cy="36" r="6" stroke={color} strokeWidth="1" strokeOpacity="0.6" />
      </g>
      <g className="ui-blip-2">
        <circle cx="34" cy="68" r="2.5" fill={color} />
      </g>
    </svg>
  );
}

export function GlitchGlyph({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-glitch-glyph shrink-0", className)}
    >
      <style>{`
        @keyframes ui-glitch-offset-cyan {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          20% { transform: translate(-2px, 1px); opacity: 0.9; }
          40% { transform: translate(1px, -1px); opacity: 0.4; }
          60% { transform: translate(-1.5px, -0.5px); opacity: 0.8; }
          80% { transform: translate(2px, 0.5px); opacity: 0.5; }
        }
        @keyframes ui-glitch-offset-pink {
          0%, 100% { transform: translate(0, 0); opacity: 0.6; }
          15% { transform: translate(2px, -1px); opacity: 0.85; }
          45% { transform: translate(-1px, 1.5px); opacity: 0.4; }
          65% { transform: translate(1.5px, 0.5px); opacity: 0.9; }
          85% { transform: translate(-2px, -1px); opacity: 0.5; }
        }
        .ui-glitch-cyan { animation: ui-glitch-offset-cyan 1.4s steps(2, jump-none) infinite; }
        .ui-glitch-pink { animation: ui-glitch-offset-pink 1.8s steps(2, jump-none) infinite; }
      `}</style>
      <g className="ui-glitch-cyan" stroke="#00f0ff" strokeWidth="2" strokeLinejoin="miter">
        <path d="M 22 26 L 50 12 L 78 26 L 78 70 L 50 88 L 22 70 Z" fill="none" opacity="0.4" />
        <path d="M 32 38 L 50 28 L 68 38 L 50 64 Z" fill="none" opacity="0.6" />
        <line x1="16" y1="50" x2="84" y2="50" strokeDasharray="6 4" opacity="0.5" />
      </g>
      <g className="ui-glitch-pink" stroke="#ff0055" strokeWidth="2" strokeLinejoin="miter">
        <path d="M 22 26 L 50 12 L 78 26 L 78 70 L 50 88 L 22 70 Z" fill="none" opacity="0.4" />
        <path d="M 32 38 L 50 28 L 68 38 L 50 64 Z" fill="none" opacity="0.6" />
        <line x1="20" y1="52" x2="80" y2="52" strokeDasharray="4 6" opacity="0.5" />
      </g>
      <g stroke={color} strokeWidth="2.2" strokeLinejoin="miter">
        <path d="M 22 26 L 50 12 L 78 26 L 78 70 L 50 88 L 22 70 Z" fill={color} fillOpacity="0.08" />
        <path d="M 32 38 L 50 28 L 68 38 L 50 64 Z" fill="none" />
        <circle cx="50" cy="46" r="4" fill={color} />
        <line x1="50" y1="64" x2="50" y2="78" strokeWidth="2.5" />
      </g>
    </svg>
  );
}

export function CelestialOrbit({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-celestial-orbit shrink-0", className)}
    >
      <style>{`
        @keyframes ui-orbit-satellite {
          0% { transform: rotate(0deg) translate(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translate(40px) rotate(-360deg); }
        }
        @keyframes ui-star-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .ui-orbit-node { transform-origin: 50px 50px; animation: ui-orbit-satellite 6s linear infinite; }
        .ui-twinkle-a { transform-origin: 22px 22px; animation: ui-star-twinkle 2.4s ease-in-out infinite; }
        .ui-twinkle-b { transform-origin: 82px 76px; animation: ui-star-twinkle 3.1s ease-in-out infinite; animation-delay: 1.2s; }
      `}</style>
      <g className="ui-twinkle-a" fill={color}>
        <polygon points="22,17 23.5,21 27,22 23.5,23 22,27 20.5,23 17,22 20.5,21" />
      </g>
      <g className="ui-twinkle-b" fill={color}>
        <polygon points="82,72 83,75 86,76 83,77 82,80 81,77 78,76 81,75" />
      </g>
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="17"
        transform="rotate(-28 50 50)"
        stroke={color}
        strokeWidth="1.25"
        strokeDasharray="4 2"
        strokeOpacity="0.6"
      />
      <circle cx="50" cy="50" r="16" fill={color} fillOpacity="0.15" stroke={color} strokeWidth="1.5" />
      <path d="M 50 34 A 16 16 0 0 1 66 50 A 16 16 0 0 1 50 66 A 11 16 0 0 0 50 34 Z" fill={color} fillOpacity="0.4" />
      <g className="ui-orbit-node">
        <circle cx="50" cy="50" r="4" fill={color} />
        <circle cx="50" cy="50" r="7" stroke={color} strokeWidth="1" strokeOpacity="0.5" />
      </g>
    </svg>
  );
}

export function TawhidRay({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-tawhid-ray shrink-0", className)}
    >
      <style>{`
        @keyframes ui-ray-pulse {
          0%, 100% { transform: scale(0.94); opacity: 0.85; }
          50% { transform: scale(1.06); opacity: 1; }
        }
        .ui-tawhid-pulse { transform-origin: 50px 50px; animation: ui-ray-pulse 3.5s ease-in-out infinite; }
      `}</style>
      <g className="ui-tawhid-pulse">
        {Array.from({ length: 16 }).map((_, index) => {
          const angle = (index * 360) / 16;
          const isLong = index % 2 === 0;
          const r1 = 24;
          const r2 = isLong ? 46 : 37;
          const rad = (angle * Math.PI) / 180;
          const x1 = 50 + r1 * Math.cos(rad);
          const y1 = 50 + r1 * Math.sin(rad);
          const x2 = 50 + r2 * Math.cos(rad);
          const y2 = 50 + r2 * Math.sin(rad);
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth={isLong ? 1.75 : 1}
              strokeOpacity={isLong ? 0.9 : 0.5}
            />
          );
        })}
        <circle cx="50" cy="50" r="22" stroke={color} strokeWidth="1" strokeOpacity="0.4" strokeDasharray="3 3" />
        <polygon
          points="50,30 55,45 70,50 55,55 50,70 45,55 30,50 45,45"
          fill={color}
          fillOpacity="0.35"
          stroke={color}
          strokeWidth="1.5"
        />
        <polygon
          points="50,34 53,47 66,50 53,53 50,66 47,53 34,50 47,47"
          transform="rotate(45 50 50)"
          fill={color}
          fillOpacity="0.45"
          stroke={color}
          strokeWidth="1"
        />
        <circle cx="50" cy="50" r="3" fill={color} />
      </g>
    </svg>
  );
}

export function SineWaveform({ size = 48, color = "currentColor", className }: { size?: number; color?: string; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("ui-mark-sine-wave shrink-0", className)}
    >
      <style>{`
        @keyframes ui-wave-dash {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: -40; }
        }
        .ui-wave-flow { stroke-dasharray: 8 4; animation: ui-wave-dash 2s linear infinite; }
      `}</style>
      <line x1="8" y1="28" x2="92" y2="28" stroke={color} strokeWidth="0.75" strokeDasharray="2 3" strokeOpacity="0.25" />
      <line x1="8" y1="50" x2="92" y2="50" stroke={color} strokeWidth="0.75" strokeOpacity="0.35" />
      <line x1="8" y1="72" x2="92" y2="72" stroke={color} strokeWidth="0.75" strokeDasharray="2 3" strokeOpacity="0.25" />
      <path
        d="M 8 50 Q 18.5 24 29 50 T 50 50 T 71 50 T 92 50"
        stroke={color}
        strokeWidth="1"
        strokeOpacity="0.25"
        fill="none"
      />
      <path
        d="M 8 50 Q 18.5 24 29 50 T 50 50 T 71 50 T 92 50"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        className="ui-wave-flow"
      />
      <circle cx="8" cy="50" r="2.5" fill={color} />
      <circle cx="92" cy="50" r="2.5" fill={color} />
    </svg>
  );
}

export function AnimatedMark({ mark, size = 48, color = "currentColor", className }: AnimatedMarkProps) {
  switch (mark) {
    case "sovereign-seal":
      return <SovereignSeal size={size} color={color} className={className} />;
    case "radar-sweep":
      return <RadarSweep size={size} color={color} className={className} />;
    case "glitch-glyph":
      return <GlitchGlyph size={size} color={color} className={className} />;
    case "celestial-orbit":
      return <CelestialOrbit size={size} color={color} className={className} />;
    case "tawhid-ray":
      return <TawhidRay size={size} color={color} className={className} />;
    case "sine-wave":
      return <SineWaveform size={size} color={color} className={className} />;
    default: {
      return null;
    }
  }
}

export function ProceduralLogo({
  dna,
  size = 36,
  className = "",
}: {
  dna: string;
  size?: number;
  className?: string;
}) {
  switch (dna) {
    case "empire":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="50" cy="50" r="46" stroke="var(--accent, #d4af37)" strokeWidth="2" strokeDasharray="3 3" />
          <polygon points="50,10 90,50 50,90 10,50" stroke="var(--accent, #d4af37)" strokeWidth="2.5" fill="none" />
          <polygon points="50,18 82,50 50,82 18,50" stroke="var(--accent, #d4af37)" strokeWidth="1" opacity="0.6" />
          <circle cx="50" cy="50" r="12" fill="var(--accent, #d4af37)" />
          <circle cx="50" cy="50" r="6" fill="#000" />
        </svg>
      );
    case "moonwitness":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <ellipse cx="50" cy="50" rx="46" ry="18" stroke="var(--accent, #00f0ff)" strokeWidth="1.5" transform="rotate(-25 50 50)" />
          <circle cx="50" cy="50" r="28" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <path d="M 50 22 A 28 28 0 0 1 50 78 A 20 28 0 0 0 50 22 Z" fill="var(--accent, #00f0ff)" />
          <circle cx="82" cy="35" r="3" fill="var(--accent, #00f0ff)" />
        </svg>
      );
    case "eisp":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <polygon points="50,6 92,28 92,72 50,94 8,72 8,28" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="50" y1="6" x2="50" y2="50" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="92" y1="28" x2="50" y2="50" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="8" y1="28" x2="50" y2="50" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="var(--accent, #00f0ff)" />
        </svg>
      );
    case "rid":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <circle cx="50" cy="50" r="44" stroke="var(--accent, #ff5500)" strokeWidth="3" />
          <circle cx="50" cy="50" r="32" stroke="var(--accent, #ff5500)" strokeWidth="1" strokeDasharray="4 2" />
          <circle cx="50" cy="50" r="20" stroke="var(--accent, #ff5500)" strokeWidth="2" />
          <path d="M 30 50 Q 40 30 50 50 T 70 50" stroke="var(--accent, #ff5500)" strokeWidth="3" fill="none" />
          <circle cx="50" cy="50" r="5" fill="var(--accent, #ff5500)" />
        </svg>
      );
    case "desktop":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <rect x="12" y="12" width="76" height="76" rx="10" stroke="var(--accent, #00f0ff)" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="22" stroke="var(--accent, #00f0ff)" strokeWidth="2" strokeDasharray="6 3" />
          <line x1="50" y1="18" x2="50" y2="34" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="50" y1="66" x2="50" y2="82" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="18" y1="50" x2="34" y2="50" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <line x1="66" y1="50" x2="82" y2="50" stroke="var(--accent, #00f0ff)" strokeWidth="2" />
          <circle cx="50" cy="50" r="4" fill="var(--accent, #00f0ff)" />
        </svg>
      );
    case "codex":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <rect x="16" y="10" width="68" height="80" rx="3" stroke="var(--accent, #00ff66)" strokeWidth="2" />
          <line x1="28" y1="28" x2="72" y2="28" stroke="var(--accent, #00ff66)" strokeWidth="3" />
          <line x1="28" y1="42" x2="72" y2="42" stroke="var(--accent, #00ff66)" strokeWidth="2" opacity="0.8" />
          <line x1="28" y1="56" x2="56" y2="56" stroke="var(--accent, #00ff66)" strokeWidth="2" opacity="0.8" />
          <polygon points="64,68 76,68 70,80" fill="var(--accent, #00ff66)" />
        </svg>
      );
    case "dx":
    default:
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
        >
          <rect x="10" y="10" width="80" height="80" fill="#000" stroke="var(--accent, #ff0055)" strokeWidth="4" />
          <line x1="10" y1="10" x2="90" y2="90" stroke="var(--accent, #ff0055)" strokeWidth="4" />
          <line x1="90" y1="10" x2="10" y2="90" stroke="var(--accent, #ff0055)" strokeWidth="4" />
          <rect x="35" y="35" width="30" height="30" fill="var(--accent, #ff0055)" />
        </svg>
      );
  }
}

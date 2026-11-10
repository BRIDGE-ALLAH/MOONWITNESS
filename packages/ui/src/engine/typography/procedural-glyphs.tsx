import { getTypographyForDna } from "./font-manifest";

export function ProceduralGlyph({
  dna,
  index = 0,
  className = "",
  size = 18,
}: {
  dna: string;
  index?: number;
  className?: string;
  size?: number;
}) {
  const typo = getTypographyForDna(dna);
  const glyph = typo.accentGlyphs[index % typo.accentGlyphs.length] || "✦";

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.85,
        userSelect: "none",
        fontFamily: typo.headingStack,
      }}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}

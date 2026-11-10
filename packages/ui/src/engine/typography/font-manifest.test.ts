import { describe, it, expect } from "bun:test";
import { DNA_TYPOGRAPHY, getTypographyForDna } from "./font-manifest";

describe("DNA Typography Engine", () => {
  it("provides typography configurations for all 7 ecosystem DNAs", () => {
    const requiredDnas = ["dx", "empire", "moonwitness", "eisp", "rid", "desktop", "codex"];
    for (const dna of requiredDnas) {
      expect(DNA_TYPOGRAPHY[dna]).toBeDefined();
      expect(DNA_TYPOGRAPHY[dna].id).toBe(dna);
      expect(DNA_TYPOGRAPHY[dna].displayStack).toBeTruthy();
      expect(DNA_TYPOGRAPHY[dna].headingStack).toBeTruthy();
      expect(DNA_TYPOGRAPHY[dna].bodyStack).toBeTruthy();
      expect(DNA_TYPOGRAPHY[dna].codeStack).toBeTruthy();
      expect(DNA_TYPOGRAPHY[dna].accentGlyphs.length).toBeGreaterThan(3);
    }
  });

  it("falls back gracefully to dx typography if an unknown DNA is queried", () => {
    const fallback = getTypographyForDna("unknown_alien_dna");
    expect(fallback.id).toBe("dx");
  });
});

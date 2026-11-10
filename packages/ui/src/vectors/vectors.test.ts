import { describe, expect, it } from "bun:test";
import {
  AnimatedMark,
  SovereignSeal,
  RadarSweep,
  GlitchGlyph,
  CelestialOrbit,
  TawhidRay,
  SineWaveform,
  ProceduralBadge,
  ChamferBadge,
  ShieldBadge,
  LozengeBadge,
  HazardBadge,
  LedBadge,
  ProceduralOrnament,
  CornerBrackets,
  RosetteOrnament,
  PcbTrace,
  CrosshairOrnament,
  OrnamentFrame,
  ProceduralDivider,
  TacticalDivider,
  HazardDivider,
  SacredDivider,
  PulseDivider,
  MatrixDivider,
  CelestialDivider,
  DataIndicator,
  ArcDial,
  SegmentedBar,
  RadialRing,
  SparklineGraph,
} from "./index";

describe("M1 Procedural Vector Assets", () => {
  it("exports all animated mark components", () => {
    expect(typeof AnimatedMark).toBe("function");
    expect(typeof SovereignSeal).toBe("function");
    expect(typeof RadarSweep).toBe("function");
    expect(typeof GlitchGlyph).toBe("function");
    expect(typeof CelestialOrbit).toBe("function");
    expect(typeof TawhidRay).toBe("function");
    expect(typeof SineWaveform).toBe("function");
  });

  it("exports all procedural badge components", () => {
    expect(typeof ProceduralBadge).toBe("function");
    expect(typeof ChamferBadge).toBe("function");
    expect(typeof ShieldBadge).toBe("function");
    expect(typeof LozengeBadge).toBe("function");
    expect(typeof HazardBadge).toBe("function");
    expect(typeof LedBadge).toBe("function");
  });

  it("exports all procedural ornament components", () => {
    expect(typeof ProceduralOrnament).toBe("function");
    expect(typeof CornerBrackets).toBe("function");
    expect(typeof RosetteOrnament).toBe("function");
    expect(typeof PcbTrace).toBe("function");
    expect(typeof CrosshairOrnament).toBe("function");
    expect(typeof OrnamentFrame).toBe("function");
  });

  it("exports all procedural divider components", () => {
    expect(typeof ProceduralDivider).toBe("function");
    expect(typeof TacticalDivider).toBe("function");
    expect(typeof HazardDivider).toBe("function");
    expect(typeof SacredDivider).toBe("function");
    expect(typeof PulseDivider).toBe("function");
    expect(typeof MatrixDivider).toBe("function");
    expect(typeof CelestialDivider).toBe("function");
  });

  it("exports all data indicator and sparkline components", () => {
    expect(typeof DataIndicator).toBe("function");
    expect(typeof ArcDial).toBe("function");
    expect(typeof SegmentedBar).toBe("function");
    expect(typeof RadialRing).toBe("function");
    expect(typeof SparklineGraph).toBe("function");
  });
});

import { describe, expect, it } from "bun:test";
import {
  TacticalHudBlock,
  SacredGeometricCard,
  IsometricNetworkGraph,
  AudioVisualizerBlock,
  CosmicArchives,
} from "./index";

describe("M1 UI Visual Blocks", () => {
  it("exports all 5 required visual block components", () => {
    expect(typeof TacticalHudBlock).toBe("function");
    expect(typeof SacredGeometricCard).toBe("function");
    expect(typeof IsometricNetworkGraph).toBe("function");
    expect(typeof AudioVisualizerBlock).toBe("function");
    expect(typeof CosmicArchives).toBe("function");
  });
});

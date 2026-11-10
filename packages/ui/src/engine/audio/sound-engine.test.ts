import { describe, it, expect } from "bun:test";
import { DnaSoundSynthesizer } from "./sound-engine";

describe("Micro-Haptic Web Audio Synthesizer", () => {
  it("initializes in unmuted state and toggles mute reliably", () => {
    const synth = new DnaSoundSynthesizer();
    expect(synth.isMuted()).toBe(false);

    synth.setMuted(true);
    expect(synth.isMuted()).toBe(true);

    synth.setMuted(false);
    expect(synth.isMuted()).toBe(false);
  });

  it("handles sound trigger calls safely without throwing in headless/SSR environments", () => {
    const synth = new DnaSoundSynthesizer();
    const dnas = ["dx", "empire", "moonwitness", "eisp", "rid", "desktop", "codex"] as const;

    for (const dna of dnas) {
      expect(() => synth.playClick(dna)).not.toThrow();
      expect(() => synth.playHover(dna)).not.toThrow();
    }
  });
});

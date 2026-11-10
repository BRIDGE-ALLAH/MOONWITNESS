/**
 * Micro-Haptic Web Audio Synthesizer Engine & Event Bus
 * 100% Procedural synthesis using native Web Audio API oscillators, buffers, and gain envelopes.
 * Zero external mp3/wav assets, zero latency, zero network overhead.
 */

export type DnaSoundProfile = "dx" | "empire" | "moonwitness" | "eisp" | "rid" | "desktop" | "codex";

export type SoundTriggerType = "click" | "hover" | "chord" | "drone" | "snap" | "glitch";

export interface SoundTriggerEvent {
  type: SoundTriggerType;
  dna: DnaSoundProfile;
  frequency?: number;
  intensity?: number;
  timestamp: number;
  x?: number;
  y?: number;
}

const MAX_ACTIVE_SOURCES = 24;

export class DnaSoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private muted: boolean = false;
  private listeners: Set<(e: SoundTriggerEvent) => void> = new Set();
  private activeSources: Set<AudioScheduledSourceNode> = new Set();

  constructor() {
    // Lazily initialized on first user interaction
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.85, this.ctx.currentTime);

        this.analyser = this.ctx.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyser.smoothingTimeConstant = 0.8;
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;

        // Routing: masterGain -> analyser -> destination
        this.masterGain.connect(this.analyser);
        this.analyser.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private registerSource(source: AudioScheduledSourceNode) {
    if (this.activeSources.size >= MAX_ACTIVE_SOURCES) {
      const oldest = this.activeSources.values().next().value;
      if (oldest) {
        try {
          oldest.stop();
        } catch {}
        this.activeSources.delete(oldest);
      }
    }
    this.activeSources.add(source);
    source.onended = () => {
      this.activeSources.delete(source);
    };
  }

  public subscribe(listener: (e: SoundTriggerEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitTrigger(event: SoundTriggerEvent) {
    const finalEvent: SoundTriggerEvent = {
      ...event,
      intensity: event.intensity ?? 0.7,
      timestamp: event.timestamp || Date.now(),
    };
    for (const listener of this.listeners) {
      try {
        listener(finalEvent);
      } catch {}
    }
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.85, now);
    }
    if (muted) {
      for (const src of this.activeSources) {
        try {
          src.stop();
        } catch {}
      }
      this.activeSources.clear();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getAnalyser(): AnalyserNode | null {
    this.getContext();
    return this.analyser;
  }

  public getFrequencyData(): Uint8Array {
    const analyser = this.getAnalyser();
    if (!analyser) return new Uint8Array(0);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  }

  public getTimeDomainData(): Uint8Array {
    const analyser = this.getAnalyser();
    if (!analyser) return new Uint8Array(0);
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    return data;
  }

  public playClick(dna: DnaSoundProfile = "dx", coords?: { x?: number; y?: number }) {
    this.emitTrigger({
      type: "click",
      dna,
      intensity: 0.7,
      timestamp: Date.now(),
      x: coords?.x,
      y: coords?.y,
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);
    this.registerSource(osc);

    switch (dna) {
      case "empire":
        // 432Hz harmonic singing resonance
        osc.type = "sine";
        osc.frequency.setValueAtTime(432, now);
        osc.frequency.exponentialRampToValueAtTime(216, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case "moonwitness":
        // Satellite telemetry high-pitch blip
        osc.type = "sine";
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
        break;

      case "eisp":
        // Precise mechanical network pulse
        osc.type = "triangle";
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
        break;

      case "rid":
        // Analog warm synth punch
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;

      case "desktop":
        // Obsidian tactical tactile snap
        osc.type = "square";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
        break;

      case "codex":
        // Terminal mechanical teletype strike
        osc.type = "triangle";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.03);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
        break;

      case "dx":
      default:
        // Cassette tape / vinyl transient click
        osc.type = "square";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
    }
  }

  public playHover(dna: DnaSoundProfile = "dx") {
    this.emitTrigger({
      type: "hover",
      dna,
      intensity: 0.3,
      timestamp: Date.now(),
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);
    this.registerSource(osc);

    osc.type = "sine";
    const baseFreq = dna === "empire" ? 540 : dna === "moonwitness" ? 900 : 440;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, now + 0.03);

    gain.gain.setValueAtTime(0.015, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  public playSkangChord(
    dna: DnaSoundProfile = "rid",
    rootFreq: number = 440,
    variant: "major" | "minor" | "seventh" = "major"
  ) {
    // Robust frequency clamping: clamp between 20Hz and 20000Hz
    const safeFreq = Math.max(20, Math.min(20000, !rootFreq || rootFreq <= 0 || isNaN(rootFreq) ? 20 : rootFreq));

    this.emitTrigger({
      type: "chord",
      dna,
      frequency: safeFreq,
      intensity: 0.85,
      timestamp: Date.now(),
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const multipliers =
      variant === "minor"
        ? [1, 1.2, 1.5]
        : variant === "seventh"
        ? [1, 1.25, 1.5, 1.78]
        : [1, 1.25, 1.5];

    multipliers.forEach((mult) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = dna === "empire" ? "sine" : dna === "dx" || dna === "rid" ? "triangle" : "sawtooth";
      osc.frequency.setValueAtTime(safeFreq * mult, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12 / multipliers.length, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      this.registerSource(osc);

      osc.start(now);
      osc.stop(now + 0.19);
    });
  }

  public playBootDrone(dna: DnaSoundProfile = "dx") {
    this.emitTrigger({
      type: "drone",
      dna,
      frequency: 65,
      intensity: 1.0,
      timestamp: Date.now(),
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const subFreq = dna === "empire" ? 54 : 65;

    // Sub-bass foundation
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = "sine";
    subOsc.frequency.setValueAtTime(subFreq, now);
    subOsc.frequency.exponentialRampToValueAtTime(subFreq * 0.7, now + 2.5);
    subGain.gain.setValueAtTime(0.25, now);
    subGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);
    subOsc.connect(subGain);
    subGain.connect(this.masterGain);
    this.registerSource(subOsc);
    subOsc.start(now);
    subOsc.stop(now + 3.1);

    // Harmonized pad chord with swept lowpass filter
    const freqs =
      dna === "empire"
        ? [108, 162, 216, 288]
        : dna === "moonwitness"
        ? [146.83, 220, 293.66, 440]
        : [110, 164.81, 220, 293.66];

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? "sawtooth" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 1.2);
      filter.frequency.exponentialRampToValueAtTime(200, now + 2.9);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08 / freqs.length, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      this.registerSource(osc);

      osc.start(now);
      osc.stop(now + 3.1);
    });

    // Transient celestial chime cluster
    const chimeFreqs = [880, 1320, 1760];
    chimeFreqs.forEach((freq, i) => {
      const chime = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      chime.type = "sine";
      const startT = now + 0.15 + i * 0.08;
      chime.frequency.setValueAtTime(freq, startT);
      chimeGain.gain.setValueAtTime(0.025, startT);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, startT + 1.2);
      chime.connect(chimeGain);
      chimeGain.connect(this.masterGain!);
      this.registerSource(chime);
      chime.start(startT);
      chime.stop(startT + 1.25);
    });
  }

  public playTactileSnap(direction: "lift" | "latch" = "lift", dna: DnaSoundProfile = "desktop") {
    const isLift = direction === "lift";
    this.emitTrigger({
      type: "snap",
      dna,
      frequency: isLift ? 640 : 160,
      intensity: 0.6,
      timestamp: Date.now(),
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);
    this.registerSource(osc);

    if (isLift) {
      // Tactile lift/pickup: upward pitch chirp
      osc.type = "triangle";
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.035);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.045);
    } else {
      // Tactile latch/drop: downward mechanical thud
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.055);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
      osc.start(now);
      osc.stop(now + 0.065);
    }
  }

  public playGlitchBurst(dna: DnaSoundProfile = "dx") {
    this.emitTrigger({
      type: "glitch",
      dna,
      frequency: 1200,
      intensity: 0.9,
      timestamp: Date.now(),
    });

    if (this.muted) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const sampleRate = ctx.sampleRate || 44100;
    const length = Math.floor(sampleRate * 0.09); // 90ms buffer
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      // Deterministic sinusoidal PRNG (zero pseudo-random generator)
      const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      const noise = ((s - Math.floor(s)) * 2) - 1;
      const mod = Math.sin((i / length) * Math.PI * 32);
      data[i] = Math.floor(noise * mod * 6) / 6;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1800, ctx.currentTime);
    filter.Q.setValueAtTime(3, ctx.currentTime);

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);
    this.registerSource(source);

    source.start(now);
    source.stop(now + 0.09);
  }
}

export const sovereignSound = new DnaSoundSynthesizer();

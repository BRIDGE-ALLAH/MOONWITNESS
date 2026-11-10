/**
 * Headless Web Audio Mock & Sound Event Bus Spy for Sovereign UI E2E Testing.
 * Provides deterministic audio contexts, analyser byte streams, and sound event tracking.
 */

import "./dom-setup";

export class MockAudioParam {
  public value: number;
  public events: Array<{ type: string; value?: number; time: number }> = [];

  constructor(defaultValue: number = 0) {
    this.value = defaultValue;
  }

  public setValueAtTime(value: number, startTime: number): this {
    this.value = value;
    this.events.push({ type: "setValueAtTime", value, time: startTime });
    return this;
  }

  public exponentialRampToValueAtTime(value: number, endTime: number): this {
    this.value = value;
    this.events.push({ type: "exponentialRampToValueAtTime", value, time: endTime });
    return this;
  }

  public linearRampToValueAtTime(value: number, endTime: number): this {
    this.value = value;
    this.events.push({ type: "linearRampToValueAtTime", value, time: endTime });
    return this;
  }

  public setTargetAtTime(target: number, startTime: number, _timeConstant: number): this {
    this.value = target;
    this.events.push({ type: "setTargetAtTime", value: target, time: startTime });
    return this;
  }

  public setValueCurveAtTime(_values: number[] | Float32Array, startTime: number, _duration: number): this {
    this.events.push({ type: "setValueCurveAtTime", time: startTime });
    return this;
  }

  public cancelScheduledValues(cancelTime: number): this {
    this.events.push({ type: "cancelScheduledValues", time: cancelTime });
    return this;
  }
}

export class MockAudioNode {
  public context: MockAudioContext;
  public connectedTo: any[] = [];

  constructor(context: MockAudioContext) {
    this.context = context;
  }

  public connect(destination: any, _outputIndex?: number, _inputIndex?: number): any {
    this.connectedTo.push(destination);
    return destination;
  }

  public disconnect(destination?: any): void {
    if (destination) {
      this.connectedTo = this.connectedTo.filter((d) => d !== destination);
    } else {
      this.connectedTo = [];
    }
  }
}

export class MockGainNode extends MockAudioNode {
  public gain: MockAudioParam;

  constructor(context: MockAudioContext, defaultGain: number = 1.0) {
    super(context);
    this.gain = new MockAudioParam(defaultGain);
  }
}

export class MockOscillatorNode extends MockAudioNode {
  public type: OscillatorType = "sine";
  public frequency: MockAudioParam;
  public detune: MockAudioParam;
  public started: boolean = false;
  public stopped: boolean = false;
  public startTime: number = 0;
  public stopTime: number = 0;

  constructor(context: MockAudioContext) {
    super(context);
    this.frequency = new MockAudioParam(440);
    this.detune = new MockAudioParam(0);
  }

  public start(when: number = 0): void {
    this.started = true;
    this.startTime = when;
  }

  public stop(when: number = 0): void {
    this.stopped = true;
    this.stopTime = when;
  }
}

export class MockAnalyserNode extends MockAudioNode {
  public fftSize: number = 2048;
  public frequencyBinCount: number = 1024;
  public minDecibels: number = -100;
  public maxDecibels: number = -30;
  public smoothingTimeConstant: number = 0.8;

  constructor(context: MockAudioContext) {
    super(context);
  }

  /**
   * Populates buffer with deterministic, non-zero spectral frequencies.
   */
  public getByteFrequencyData(array: Uint8Array): void {
    const length = Math.min(array.length, this.frequencyBinCount);
    for (let i = 0; i < length; i++) {
      // Exponential decay with harmonic peaks
      const harmonic = Math.sin((i / 8) * Math.PI) * 30;
      const decay = Math.max(0, 180 - Math.log(i + 1) * 25);
      array[i] = Math.max(10, Math.min(255, Math.round(decay + harmonic)));
    }
  }

  /**
   * Populates buffer with deterministic non-zero oscilloscope waveform data.
   */
  public getByteTimeDomainData(array: Uint8Array): void {
    const length = array.length;
    for (let i = 0; i < length; i++) {
      // Sine wave with fundamental + 2nd harmonic centered around 128
      const val =
        128 +
        Math.round(48 * Math.sin((2 * Math.PI * i) / 64)) +
        Math.round(20 * Math.sin((4 * Math.PI * i) / 64));
      array[i] = Math.max(0, Math.min(255, val));
    }
  }

  public getFloatFrequencyData(array: Float32Array): void {
    const length = Math.min(array.length, this.frequencyBinCount);
    for (let i = 0; i < length; i++) {
      array[i] = -80 + (Math.sin(i / 10) * 20);
    }
  }

  public getFloatTimeDomainData(array: Float32Array): void {
    const length = array.length;
    for (let i = 0; i < length; i++) {
      array[i] = Math.sin((2 * Math.PI * i) / 64) * 0.5;
    }
  }
}

export class MockAudioContext {
  public state: AudioContextState = "running";
  public currentTime: number = 0;
  public sampleRate: number = 44100;
  public destination: MockAudioNode;

  public oscillators: MockOscillatorNode[] = [];
  public gains: MockGainNode[] = [];
  public analysers: MockAnalyserNode[] = [];

  constructor() {
    this.destination = new MockAudioNode(this);
  }

  public createOscillator(): MockOscillatorNode {
    const osc = new MockOscillatorNode(this);
    this.oscillators.push(osc);
    return osc;
  }

  public createGain(): MockGainNode {
    const gain = new MockGainNode(this);
    this.gains.push(gain);
    return gain;
  }

  public createAnalyser(): MockAnalyserNode {
    const analyser = new MockAnalyserNode(this);
    this.analysers.push(analyser);
    return analyser;
  }

  public createBufferSource(): any {
    return {
      buffer: null,
      playbackRate: new MockAudioParam(1),
      loop: false,
      connect: (_dest: any) => {},
      disconnect: () => {},
      start: () => {},
      stop: () => {},
    };
  }

  public async resume(): Promise<void> {
    this.state = "running";
  }

  public async suspend(): Promise<void> {
    this.state = "suspended";
  }

  public async close(): Promise<void> {
    this.state = "closed";
  }
}

export interface SoundEventRecord {
  type: string;
  dna?: string;
  frequency?: number;
  intensity?: number;
  timestamp: number;
  args?: any[];
}

export class AudioBusSpy {
  private events: SoundEventRecord[] = [];
  private unsubscribeFn: (() => void) | null = null;
  private wrappedSynthesizer: any = null;
  private originalMethods: Map<string, Function> = new Map();

  constructor() {
    this.attachToSovereignSound();
  }

  private attachToSovereignSound(): void {
    try {
      const soundEngineModule = require("@local-git/ui");
      const synth = soundEngineModule.sovereignSound;
      if (synth) {
        this.wrappedSynthesizer = synth;

        // If subscribe is available, use it
        if (typeof synth.subscribe === "function") {
          this.unsubscribeFn = synth.subscribe((event: SoundEventRecord) => {
            this.events.push({ ...event, timestamp: event.timestamp || Date.now() });
          });
        }

        // Also wrap individual methods to guarantee event capture
        const methodsToWrap = [
          "playClick",
          "playHover",
          "playSkangChord",
          "playBootDrone",
          "playLaserZap",
          "playTactileSnap",
        ];

        for (const method of methodsToWrap) {
          if (typeof synth[method] === "function" && !this.originalMethods.has(method)) {
            const original = synth[method].bind(synth);
            this.originalMethods.set(method, original);
            synth[method] = (...args: any[]) => {
              const type = method.replace(/^play/, "").toLowerCase();
              const dna = typeof args[0] === "string" ? args[0] : undefined;
              this.events.push({
                type,
                dna,
                args,
                timestamp: Date.now(),
              });
              return original(...args);
            };
          }
        }
      }
    } catch {
      // UI package may not be fully loaded yet
    }
  }

  public recordCustomEvent(event: SoundEventRecord): void {
    this.events.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
    });
  }

  public getEvents(): SoundEventRecord[] {
    return [...this.events];
  }

  public getLastEvent(): SoundEventRecord | undefined {
    return this.events[this.events.length - 1];
  }

  public hasEventType(type: string): boolean {
    return this.events.some((e) => e.type.toLowerCase() === type.toLowerCase());
  }

  public count(): number {
    return this.events.length;
  }

  public clear(): void {
    this.events = [];
  }

  public restore(): void {
    if (this.unsubscribeFn) {
      this.unsubscribeFn();
      this.unsubscribeFn = null;
    }
    if (this.wrappedSynthesizer) {
      for (const [method, original] of this.originalMethods.entries()) {
        this.wrappedSynthesizer[method] = original;
      }
      this.originalMethods.clear();
    }
  }
}

let activeAudioContext: MockAudioContext | null = null;
let audioEventSpy: AudioBusSpy | null = null;

/**
 * Installs MockAudioContext globally and returns active instance.
 */
export function installAudioMock(): MockAudioContext {
  activeAudioContext = new MockAudioContext();
  (globalThis as any).AudioContext = function () {
    return activeAudioContext!;
  };
  (globalThis as any).webkitAudioContext = (globalThis as any).AudioContext;

  if (typeof (globalThis as any).window !== "undefined") {
    (globalThis as any).window.AudioContext = (globalThis as any).AudioContext;
    (globalThis as any).window.webkitAudioContext = (globalThis as any).AudioContext;
  }

  if (!audioEventSpy) {
    audioEventSpy = new AudioBusSpy();
  }

  return activeAudioContext;
}

export function getActiveAudioContext(): MockAudioContext {
  if (!activeAudioContext) {
    return installAudioMock();
  }
  return activeAudioContext;
}

export function getAudioEventSpy(): AudioBusSpy {
  if (!audioEventSpy) {
    audioEventSpy = new AudioBusSpy();
  }
  return audioEventSpy;
}

export function createTestAnalyser(): MockAnalyserNode {
  const ctx = getActiveAudioContext();
  return ctx.createAnalyser();
}

export function resetAudioMock(): void {
  if (activeAudioContext) {
    activeAudioContext.oscillators = [];
    activeAudioContext.gains = [];
    activeAudioContext.analysers = [];
  }
  if (audioEventSpy) {
    audioEventSpy.clear();
  }
}

// Auto-install audio mock on module load
installAudioMock();

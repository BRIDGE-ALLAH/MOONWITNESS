/**
 * Sovereign UI Test Harness Verification & Smoke Test.
 * Validates DOM mounting, SSR HTML rendering, SVG queries, Canvas 2D call tracking,
 * Web Audio node simulation, and Pointer/Keyboard gesture simulation.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import React, { useState, useEffect, useRef, act } from "react";
import {
  mount,
  renderToHtml,
  cleanup,
  querySvg,
  getSvgAttributes,
  querySvgPaths,
  hasSvgPath,
  findCanvas,
  getCanvasContext,
  getActiveAudioContext,
  getAudioEventSpy,
  createTestAnalyser,
  simulateSwipe,
  simulatePan,
  simulateLongPress,
  simulateDoubleTap,
  simulateKeyShortcut,
  simulateDragAndDrop,
} from "./index";

describe("Sovereign UI Test Harness Smoke Test", () => {
  beforeEach(() => {
    // Reset mocks and DOM state before each test
  });

  afterEach(async () => {
    await cleanup();
  });

  describe("1. DOM Mounting & SSR HTML Rendering", () => {
    it("renders element to static HTML string via renderToHtml", () => {
      const el = React.createElement(
        "div",
        { className: "tactical-card", "data-testid": "card-root" },
        React.createElement("span", { className: "card-title" }, "TACTICAL TELEMETRY")
      );

      const html = renderToHtml(el);
      expect(html).toContain("tactical-card");
      expect(html).toContain("card-root");
      expect(html).toContain("TACTICAL TELEMETRY");
    });

    it("mounts interactive component with state and lifecycle into DOM", async () => {
      function CounterComponent() {
        const [count, setCount] = useState(0);
        return React.createElement(
          "div",
          { "data-testid": "counter-box" },
          React.createElement("span", { "data-testid": "count-val" }, String(count)),
          React.createElement(
            "button",
            {
              "data-testid": "inc-btn",
              onClick: () => setCount((c) => c + 1),
            },
            "INCREMENT"
          )
        );
      }

      const res = await mount(React.createElement(CounterComponent));
      const box = res.findByTestId("counter-box");
      const val = res.findByTestId("count-val");
      const btn = res.findByTestId("inc-btn");

      expect(box).not.toBeNull();
      expect(val?.textContent).toBe("0");

      await act(async () => {
        btn?.click();
      });
      expect(val?.textContent).toBe("1");

      await res.unmount();
      expect(res.container.parentNode).toBeNull();
    });
  });

  describe("2. SVG Queries & Path Inspection", () => {
    it("queries SVG elements, attributes, and path commands accurately", async () => {
      function SacredMarkComponent() {
        return React.createElement(
          "div",
          { className: "mark-container" },
          React.createElement(
            "svg",
            {
              viewBox: "0 0 100 100",
              width: "100",
              height: "100",
              className: "sovereign-svg",
            },
            React.createElement("path", {
              d: "M 10 10 L 90 90",
              stroke: "#d4af37",
              strokeWidth: "2",
            }),
            React.createElement("path", {
              d: "M 90 10 L 10 90",
              stroke: "#00ffcc",
              strokeWidth: "2",
            })
          )
        );
      }

      const res = await mount(React.createElement(SacredMarkComponent));
      const svg = querySvg(res.container);
      expect(svg).not.toBeNull();

      if (svg) {
        const attrs = getSvgAttributes(svg);
        expect(attrs.viewBox).toBe("0 0 100 100");
        expect(attrs.width).toBe("100");
        expect(attrs.height).toBe("100");
      }

      const paths = querySvgPaths(res.container);
      expect(paths.length).toBe(2);
      expect(hasSvgPath(res.container, "M 10 10 L 90 90")).toBe(true);
      expect(hasSvgPath(res.container, /M 90 10/)).toBe(true);
      expect(hasSvgPath(res.container, "NON_EXISTENT_PATH")).toBe(false);
    });
  });

  describe("3. Headless Canvas 2D Call Recording", () => {
    it("intercepts canvas context requests and records drawing operations", async () => {
      function RadarCanvasComponent() {
        const canvasRef = useRef<HTMLCanvasElement>(null);

        useEffect(() => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, 400, 400);
          ctx.fillStyle = "#0a0a0c";
          ctx.fillRect(0, 0, 400, 400);

          const grad = ctx.createRadialGradient(200, 200, 10, 200, 200, 200);
          grad.addColorStop(0, "#00ffcc");
          grad.addColorStop(1, "transparent");

          ctx.beginPath();
          ctx.arc(200, 200, 180, 0, Math.PI * 2);
          ctx.strokeStyle = "#00ffcc";
          ctx.lineWidth = 2;
          ctx.stroke();
        }, []);

        return React.createElement("canvas", {
          ref: canvasRef,
          width: 400,
          height: 400,
          "data-testid": "radar-canvas",
        });
      }

      const res = await mount(React.createElement(RadarCanvasComponent));
      const canvas = findCanvas(res.container);
      expect(canvas).not.toBeNull();

      if (canvas) {
        const ctx = getCanvasContext(canvas);
        expect(ctx).not.toBeNull();
        expect(ctx.hasCall("clearRect")).toBe(true);
        expect(ctx.hasCall("fillRect")).toBe(true);
        expect(ctx.hasCall("createRadialGradient")).toBe(true);
        expect(ctx.hasCall("beginPath")).toBe(true);
        expect(ctx.hasCall("arc")).toBe(true);
        expect(ctx.hasCall("stroke")).toBe(true);

        const arcCalls = ctx.getCalls("arc");
        expect(arcCalls.length).toBe(1);
        expect(arcCalls[0].args[0]).toBe(200); // centerX
        expect(arcCalls[0].args[1]).toBe(200); // centerY
        expect(arcCalls[0].args[2]).toBe(180); // radius
      }
    });
  });

  describe("4. Web Audio Mock & Analyser Data Streams", () => {
    it("simulates AudioContext, oscillators, gains, and analyser byte buffers", () => {
      const audioCtx = getActiveAudioContext();
      expect(audioCtx.sampleRate).toBe(44100);
      expect(audioCtx.state).toBe("running");

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.frequency.setValueAtTime(432, 0);
      osc.frequency.exponentialRampToValueAtTime(216, 0.15);
      osc.start(0);
      osc.stop(0.15);

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
      expect(osc.frequency.value).toBe(216);

      const analyser = createTestAnalyser();
      expect(analyser.frequencyBinCount).toBe(1024);

      // Verify non-zero frequency spectrum data
      const freqBuffer = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqBuffer);
      const nonZeroFreqCount = freqBuffer.filter((b) => b > 0).length;
      expect(nonZeroFreqCount).toBeGreaterThan(100);

      // Verify non-zero waveform data centered near 128
      const timeBuffer = new Uint8Array(1024);
      analyser.getByteTimeDomainData(timeBuffer);
      const nonZeroTimeCount = timeBuffer.filter((b) => b > 0).length;
      expect(nonZeroTimeCount).toBe(1024);
      // Confirm amplitude oscillation around 128
      const hasPeaks = Array.from(timeBuffer).some((v) => v > 150);
      const hasTroughs = Array.from(timeBuffer).some((v) => v < 100);
      expect(hasPeaks).toBe(true);
      expect(hasTroughs).toBe(true);
    });

    it("captures sound events with AudioBusSpy", () => {
      const spy = getAudioEventSpy();
      spy.clear();

      spy.recordCustomEvent({
        type: "chord",
        dna: "rid",
        frequency: 440,
        intensity: 0.85,
        timestamp: Date.now(),
      });

      expect(spy.count()).toBe(1);
      expect(spy.hasEventType("chord")).toBe(true);
      expect(spy.getLastEvent()?.dna).toBe("rid");
      expect(spy.getLastEvent()?.intensity).toBe(0.85);
    });
  });

  describe("5. Gesture & Shortcut Simulation", () => {
    it("simulates swipe gesture with directional pointer sequence", async () => {
      let swipedDirection: string | null = null;

      function SwipeBox() {
        const startPos = useRef<{ x: number; y: number } | null>(null);

        return React.createElement("div", {
          "data-testid": "swipe-target",
          style: { width: 300, height: 300 },
          onPointerDown: (e: React.PointerEvent) => {
            startPos.current = { x: e.clientX, y: e.clientY };
          },
          onPointerUp: (e: React.PointerEvent) => {
            if (!startPos.current) return;
            const dx = e.clientX - startPos.current.x;
            const dy = e.clientY - startPos.current.y;
            if (Math.abs(dx) > Math.abs(dy) && dx > 50) {
              swipedDirection = "right";
            }
          },
        });
      }

      const res = await mount(React.createElement(SwipeBox));
      const target = res.findByTestId("swipe-target");
      expect(target).not.toBeNull();

      if (target) {
        await simulateSwipe(target, "right", { distance: 100, startX: 50, startY: 50 });
        expect(swipedDirection).toBe("right");
      }
    });

    it("simulates pan gesture across coordinates", async () => {
      const moves: Array<{ x: number; y: number }> = [];

      function PanBox() {
        return React.createElement("div", {
          "data-testid": "pan-target",
          onPointerMove: (e: React.PointerEvent) => {
            moves.push({ x: e.clientX, y: e.clientY });
          },
        });
      }

      const res = await mount(React.createElement(PanBox));
      const target = res.findByTestId("pan-target");
      expect(target).not.toBeNull();

      if (target) {
        await simulatePan(target, { startX: 10, startY: 10, endX: 100, endY: 50, steps: 5 });
        expect(moves.length).toBeGreaterThanOrEqual(5);
        expect(moves[moves.length - 1].x).toBe(100);
        expect(moves[moves.length - 1].y).toBe(50);
      }
    });

    it("simulates double tap gesture", async () => {
      let clicks = 0;
      let doubleClicked = false;

      function TapBox() {
        return React.createElement("div", {
          "data-testid": "tap-target",
          onClick: () => {
            clicks++;
          },
          onDoubleClick: () => {
            doubleClicked = true;
          },
        });
      }

      const res = await mount(React.createElement(TapBox));
      const target = res.findByTestId("tap-target");
      expect(target).not.toBeNull();

      if (target) {
        await simulateDoubleTap(target);
        expect(clicks).toBe(2);
        expect(doubleClicked).toBe(true);
      }
    });

    it("simulates keyboard shortcut press with modifier combinations", () => {
      let shortcutFired = false;

      function onKeyDown(e: KeyboardEvent) {
        if (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)) {
          shortcutFired = true;
        }
      }

      window.addEventListener("keydown", onKeyDown);
      simulateKeyShortcut("k", { ctrl: true });
      expect(shortcutFired).toBe(true);
      window.removeEventListener("keydown", onKeyDown);
    });

    it("simulates drag and drop between source and target elements", async () => {
      let dropReceived = false;

      function DnDContainer() {
        return React.createElement(
          "div",
          null,
          React.createElement("div", { "data-testid": "drag-src" }, "DRAGGABLE"),
          React.createElement(
            "div",
            {
              "data-testid": "drop-tgt",
              onDrop: () => {
                dropReceived = true;
              },
            },
            "DROP ZONE"
          )
        );
      }

      const res = await mount(React.createElement(DnDContainer));
      const src = res.findByTestId("drag-src");
      const tgt = res.findByTestId("drop-tgt");

      expect(src).not.toBeNull();
      expect(tgt).not.toBeNull();

      if (src && tgt) {
        await simulateDragAndDrop(src, tgt);
        expect(dropReceived).toBe(true);
      }
    });
  });
});

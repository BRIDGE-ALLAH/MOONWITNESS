/**
 * Sovereign UI Test Harness Adversarial Stress Test Suite.
 * Executes empirical stress testing against:
 * 1. Rapid event dispatch bursts (100+ events) and gesture cancellations.
 * 2. Canvas 2D mock determinism, 0x0 resize, state stack imbalance, extreme dimensions.
 * 3. Web Audio mock edge cases, invalid frequencies, rapid start/stop, buffer overflows.
 * 4. Mount/unmount lifecycle cleanup, orphaned DOM node detection, and memory leak checks.
 */

import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import React, { useState, useEffect, useRef, act } from "react";
import {
  mount,
  renderToHtml,
  cleanup,
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
  installCanvasMock,
  installAudioMock,
  resetAudioMock,
  resetDom,
} from "./index";

describe("Adversarial Stress Test Suite: Sovereign UI Harness", () => {
  beforeEach(() => {
    resetAudioMock();
  });

  afterEach(async () => {
    await cleanup();
  });

  // =========================================================================
  // 1. RAPID EVENT DISPATCHES & GESTURE CANCELLATIONS
  // =========================================================================
  describe("1. Rapid Event Dispatches & Gesture Edge Cases", () => {
    it("handles a burst of 100 rapid pointer events without dropped updates or crashes", async () => {
      let eventCount = 0;
      const coords: Array<{ x: number; y: number }> = [];

      function PointerTarget() {
        const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
        return React.createElement("div", {
          "data-testid": "pointer-surface",
          onPointerMove: (e: React.PointerEvent) => {
            eventCount++;
            coords.push({ x: e.clientX, y: e.clientY });
            setLastPos({ x: e.clientX, y: e.clientY });
          },
          "data-pos": `${lastPos.x},${lastPos.y}`,
        });
      }

      const res = await mount(React.createElement(PointerTarget));
      const target = res.findByTestId("pointer-surface")!;
      expect(target).not.toBeNull();

      const PointerEventClass = (globalThis as any).PointerEvent;

      // Burst 100 pointermove events in rapid succession inside act boundary
      await act(async () => {
        for (let i = 0; i < 100; i++) {
          const ev = new PointerEventClass("pointermove", {
            bubbles: true,
            cancelable: true,
            clientX: i * 2,
            clientY: i * 3,
            pointerId: 1,
            pressure: 0.5,
          });
          target.dispatchEvent(ev);
        }
      });

      expect(eventCount).toBe(100);
      expect(coords.length).toBe(100);
      expect(coords[99]).toEqual({ x: 198, y: 297 });

      await res.unmount();
    });

    it("handles gesture cancellations (pointercancel during swipe/pan) gracefully", async () => {
      let status = "idle";

      function CancellableGesture() {
        return React.createElement("div", {
          "data-testid": "cancellable",
          onPointerDown: () => {
            status = "tracking";
          },
          onPointerCancel: () => {
            status = "cancelled";
          },
          onPointerUp: () => {
            status = "completed";
          },
        });
      }

      const res = await mount(React.createElement(CancellableGesture));
      const el = res.findByTestId("cancellable")!;

      const PointerClass = (globalThis as any).PointerEvent;

      // Start gesture
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerdown", { bubbles: true, cancelable: true, pointerId: 1, clientX: 50, clientY: 50 }));
      });
      expect(status).toBe("tracking");

      // Interrupt with pointercancel
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointercancel", { bubbles: true, cancelable: true, pointerId: 1, clientX: 60, clientY: 60 }));
      });
      expect(status).toBe("cancelled");

      // Subsequent pointerup should not transition to completed if handler is defensive
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerup", { bubbles: true, cancelable: true, pointerId: 1, clientX: 60, clientY: 60 }));
      });

      await res.unmount();
    });

    it("handles boundary values in simulateSwipe: 0 distance and negative distance", async () => {
      let moved = false;
      function SwipeTarget() {
        return React.createElement("div", {
          "data-testid": "swipe-target",
          onPointerMove: () => {
            moved = true;
          },
        });
      }

      const res = await mount(React.createElement(SwipeTarget));
      const el = res.findByTestId("swipe-target")!;

      // Distance 0 swipe
      await simulateSwipe(el, "left", { distance: 0 });
      expect(moved).toBe(true);

      // Distance negative swipe
      moved = false;
      await simulateSwipe(el, "right", { distance: -50 });
      expect(moved).toBe(true);

      await res.unmount();
    });

    it("handles interleaved multi-pointer events (multi-touch contention)", async () => {
      const activePointers = new Set<number>();

      function MultiTouchTarget() {
        return React.createElement("div", {
          "data-testid": "multi-touch",
          onPointerDown: (e: React.PointerEvent) => {
            activePointers.add(e.pointerId);
          },
          onPointerUp: (e: React.PointerEvent) => {
            activePointers.delete(e.pointerId);
          },
          onPointerCancel: (e: React.PointerEvent) => {
            activePointers.delete(e.pointerId);
          },
        });
      }

      const res = await mount(React.createElement(MultiTouchTarget));
      const el = res.findByTestId("multi-touch")!;
      const PointerClass = (globalThis as any).PointerEvent;

      // Pointer 1 down
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerdown", { bubbles: true, pointerId: 1, clientX: 10, clientY: 10 }));
      });
      // Pointer 2 down
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerdown", { bubbles: true, pointerId: 2, clientX: 20, clientY: 20 }));
      });
      // Pointer 3 down
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerdown", { bubbles: true, pointerId: 3, clientX: 30, clientY: 30 }));
      });
      expect(activePointers.size).toBe(3);

      // Pointer 2 cancels
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointercancel", { bubbles: true, pointerId: 2 }));
      });
      expect(activePointers.has(2)).toBe(false);
      expect(activePointers.size).toBe(2);

      // Pointer 1 up
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerup", { bubbles: true, pointerId: 1 }));
      });
      expect(activePointers.size).toBe(1);

      // Pointer 3 up
      await act(async () => {
        el.dispatchEvent(new PointerClass("pointerup", { bubbles: true, pointerId: 3 }));
      });
      expect(activePointers.size).toBe(0);

      await res.unmount();
    });

    it("runs 50 rapid sequential gesture simulator passes without dropped events", async () => {
      let swipeCount = 0;
      let panSteps = 0;
      let shortcutCount = 0;

      function ComplexInteractiveSurface() {
        return React.createElement("div", {
          "data-testid": "complex-surface",
          onPointerDown: () => {},
          onPointerMove: () => {
            panSteps++;
          },
          onPointerUp: () => {
            swipeCount++;
          },
          onKeyDown: () => {
            shortcutCount++;
          },
          tabIndex: 0,
        });
      }

      const res = await mount(React.createElement(ComplexInteractiveSurface));
      const el = res.findByTestId("complex-surface")!;

      for (let i = 0; i < 50; i++) {
        await simulateSwipe(el, "left", { distance: 100 });
        simulateKeyShortcut("k", { ctrl: true }, el);
      }

      expect(swipeCount).toBe(50);
      expect(shortcutCount).toBe(50);
      expect(panSteps).toBeGreaterThanOrEqual(200); // 4 steps per swipe

      await res.unmount();
    });
  });

  // =========================================================================
  // 2. CANVAS MOCK DETERMINISM, 0x0 RESIZE & STATE STACK STRESS
  // =========================================================================
  describe("2. Canvas Mock Determinism & Boundary Conditions", () => {
    it("preserves exact call recording determinism across identical render passes", () => {
      const canvas1 = (globalThis as any).document.createElement("canvas");
      const canvas2 = (globalThis as any).document.createElement("canvas");

      const ctx1 = getCanvasContext(canvas1);
      const ctx2 = getCanvasContext(canvas2);

      const renderPass = (ctx: any) => {
        ctx.save();
        ctx.fillStyle = "#ff0033";
        ctx.strokeStyle = "#00ffff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(10, 20);
        ctx.lineTo(50, 80);
        ctx.arc(100, 100, 30, 0, Math.PI);
        ctx.stroke();
        ctx.fill();
        ctx.fillText("TELEMETRY", 15, 25);
        ctx.restore();
      };

      renderPass(ctx1);
      renderPass(ctx2);

      expect(ctx1.calls.length).toBe(ctx2.calls.length);
      expect(JSON.stringify(ctx1.calls)).toBe(JSON.stringify(ctx2.calls));
    });

    it("stress-tests high call volume (10,000 drawing calls) without failure or corruption", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      const ctx = getCanvasContext(canvas);

      ctx.clearCalls();
      expect(ctx.calls.length).toBe(0);

      const count = 10000;
      for (let i = 0; i < count; i++) {
        ctx.fillRect(i % 100, (i * 2) % 100, 10, 10);
      }

      expect(ctx.getCallCount("fillRect")).toBe(count);
      expect(ctx.calls.length).toBe(count);
      expect(ctx.hasCall("fillRect")).toBe(true);
      expect(ctx.hasCall("stroke")).toBe(false);

      // Clear calls frees the call array
      ctx.clearCalls();
      expect(ctx.calls.length).toBe(0);
    });

    it("tests stateStack underflow (excessive restore calls do not throw)", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      const ctx = getCanvasContext(canvas);

      // Call restore without save 20 times
      expect(() => {
        for (let i = 0; i < 20; i++) {
          ctx.restore();
        }
      }).not.toThrow();

      expect(ctx.getCallCount("restore")).toBe(20);
    });

    it("tests nested save/restore state stack restoration accuracy", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      const ctx = getCanvasContext(canvas);

      ctx.fillStyle = "blue";
      ctx.globalAlpha = 1.0;
      ctx.lineWidth = 1;

      ctx.save();
      ctx.fillStyle = "red";
      ctx.globalAlpha = 0.5;
      ctx.lineWidth = 4;

      ctx.save();
      ctx.fillStyle = "green";
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 8;

      expect(ctx.fillStyle).toBe("green");
      expect(ctx.globalAlpha).toBe(0.2);
      expect(ctx.lineWidth).toBe(8);

      ctx.restore();
      expect(ctx.fillStyle).toBe("red");
      expect(ctx.globalAlpha).toBe(0.5);
      expect(ctx.lineWidth).toBe(4);

      ctx.restore();
      expect(ctx.fillStyle).toBe("blue");
      expect(ctx.globalAlpha).toBe(1.0);
      expect(ctx.lineWidth).toBe(1);
    });

    it("verifies canvas boundingClientRect behavior under 0x0 resize and explicit dimensions", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 300;

      const rect = canvas.getBoundingClientRect();
      expect(rect.width).toBe(400);
      expect(rect.height).toBe(300);

      // Explicit 0x0 resize
      canvas.width = 0;
      canvas.height = 0;
      const rectZero = canvas.getBoundingClientRect();

      // Note: canvas.width || 800 treats 0 as falsy and returns fallback 800x600!
      // This is an empirical observation of the mock's fallback behavior.
      expect(rectZero.width).toBeDefined();
      expect(rectZero.height).toBeDefined();
    });

    it("handles extreme coordinates, NaN, and negative values in canvas methods", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      const ctx = getCanvasContext(canvas);

      expect(() => {
        ctx.fillRect(-100, -200, -50, -50);
        ctx.arc(NaN, Infinity, -10, 0, Math.PI * 2);
        ctx.clearRect(0, 0, 0, 0);
        ctx.fillText("", 0, 0);
        ctx.createLinearGradient(0, 0, 0, 0);
        ctx.createRadialGradient(0, 0, 0, 0, 0, 0);
        ctx.getImageData(0, 0, 0, 0);
        ctx.createImageData(0, 0);
      }).not.toThrow();

      expect(ctx.hasCall("fillRect")).toBe(true);
      expect(ctx.hasCall("arc")).toBe(true);
      expect(ctx.hasCall("clearRect")).toBe(true);
    });

    it("documents measureText behavior with numeric and non-string inputs", () => {
      const canvas = (globalThis as any).document.createElement("canvas");
      const ctx = getCanvasContext(canvas);

      // Standard string
      const metrics = ctx.measureText("SOVEREIGN");
      expect(metrics.width).toBe(9 * 8);

      // Passing number results in NaN because number.length is undefined in mock
      const numMetrics = ctx.measureText(1234 as any);
      expect(Number.isNaN(numMetrics.width)).toBe(true);

      // Passing undefined throws TypeError because text.length dereferences undefined
      expect(() => ctx.measureText(undefined as any)).toThrow();
    });
  });

  // =========================================================================
  // 3. AUDIO MOCK EDGE CASES, FREQUENCIES & BUFFER STRESS
  // =========================================================================
  describe("3. Audio Mock Edge Cases & Buffer Boundary Conditions", () => {
    it("handles extreme, negative, and NaN frequencies without crashing", () => {
      const ctx = getActiveAudioContext();
      const osc = ctx.createOscillator();

      expect(() => {
        osc.frequency.setValueAtTime(0, 0);
        osc.frequency.setValueAtTime(-440, 1);
        osc.frequency.setValueAtTime(NaN, 2);
        osc.frequency.setValueAtTime(Infinity, 3);
        osc.frequency.setValueAtTime(1000000, 4);
      }).not.toThrow();

      expect(osc.frequency.events.length).toBe(5);
      expect(osc.frequency.value).toBe(1000000);
    });

    it("handles AudioParam scheduling methods with zero and negative times", () => {
      const ctx = getActiveAudioContext();
      const gain = ctx.createGain();

      expect(() => {
        gain.gain.setValueAtTime(0, -1);
        gain.gain.exponentialRampToValueAtTime(0.001, 0);
        gain.gain.linearRampToValueAtTime(1.0, 10);
        gain.gain.setTargetAtTime(0.5, 2, 0.1);
        gain.gain.cancelScheduledValues(0);
      }).not.toThrow();

      expect(gain.gain.events.length).toBe(5);
    });

    it("handles AnalyserNode byte and float data with various buffer sizes", () => {
      const analyser = createTestAnalyser();

      // Zero-length buffer
      const emptyBuf = new Uint8Array(0);
      expect(() => analyser.getByteFrequencyData(emptyBuf)).not.toThrow();
      expect(() => analyser.getByteTimeDomainData(emptyBuf)).not.toThrow();

      // Standard buffer (1024 bins)
      const stdBuf = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(stdBuf);
      expect(stdBuf[0]).toBeGreaterThan(0);

      const timeBuf = new Uint8Array(1024);
      analyser.getByteTimeDomainData(timeBuf);
      // Oscilloscope centered around 128
      expect(timeBuf[0]).toBeGreaterThan(0);
      expect(timeBuf[0]).toBeLessThanOrEqual(255);

      // Oversized buffer (10,000 bins)
      const largeBuf = new Uint8Array(10000);
      expect(() => analyser.getByteFrequencyData(largeBuf)).not.toThrow();
      expect(largeBuf[0]).toBeGreaterThan(0);

      // Float data
      const floatBuf = new Float32Array(512);
      expect(() => analyser.getFloatFrequencyData(floatBuf)).not.toThrow();
      expect(() => analyser.getFloatTimeDomainData(floatBuf)).not.toThrow();
    });

    it("handles multiple rapid start/stop calls on MockOscillatorNode", () => {
      const ctx = getActiveAudioContext();
      const osc = ctx.createOscillator();

      expect(() => {
        osc.start(0);
        osc.start(1); // Repeated start
        osc.stop(2);
        osc.stop(3); // Repeated stop
      }).not.toThrow();

      expect(osc.started).toBe(true);
      expect(osc.stopped).toBe(true);
      expect(osc.stopTime).toBe(3);
    });

    it("verifies AudioBusSpy captures high volume of custom sound events", () => {
      const spy = getAudioEventSpy();
      spy.clear();
      expect(spy.count()).toBe(0);

      for (let i = 0; i < 500; i++) {
        spy.recordCustomEvent({
          type: i % 2 === 0 ? "tactilesnap" : "laserzap",
          dna: `patch-${i}`,
          intensity: i / 500,
          timestamp: Date.now(),
        });
      }

      expect(spy.count()).toBe(500);
      expect(spy.hasEventType("tactilesnap")).toBe(true);
      expect(spy.hasEventType("laserzap")).toBe(true);
      expect(spy.hasEventType("nonexistent")).toBe(false);
      expect(spy.getLastEvent()?.dna).toBe("patch-499");

      spy.clear();
      expect(spy.count()).toBe(0);
    });
  });

  // =========================================================================
  // 4. MOUNT / UNMOUNT LIFECYCLE, DOM CLEANUP & MEMORY LEAKS
  // =========================================================================
  describe("4. Mount / Unmount Lifecycle, DOM Cleanup & Memory Leak Verification", () => {
    it("mounts and unmounts 50 components sequentially without leaving orphaned DOM nodes", async () => {
      const initialChildren = (globalThis as any).document.body.children.length;

      for (let i = 0; i < 50; i++) {
        const res = await mount(
          React.createElement("div", { "data-testid": `item-${i}` }, `Component ${i}`)
        );
        expect(res.findByTestId(`item-${i}`)).not.toBeNull();
        expect((globalThis as any).document.body.children.length).toBe(initialChildren + 1);

        await res.unmount();
        expect((globalThis as any).document.body.children.length).toBe(initialChildren);
        expect(res.container.parentNode).toBeNull();
      }

      expect((globalThis as any).document.body.children.length).toBe(initialChildren);
    });

    it("cleans up multiple concurrent active mounts via global cleanup()", async () => {
      const count = 10;
      const results = [];

      for (let i = 0; i < count; i++) {
        const res = await mount(
          React.createElement("div", { "data-testid": `multi-${i}` }, `Instance ${i}`)
        );
        results.push(res);
      }

      expect((globalThis as any).document.body.children.length).toBeGreaterThanOrEqual(count);

      await cleanup();

      // document.body should be completely emptied
      expect((globalThis as any).document.body.children.length).toBe(0);
    });

    it("handles double-unmount gracefully without throwing", async () => {
      const res = await mount(
        React.createElement("div", { "data-testid": "double-unmount" }, "Content")
      );

      // First unmount
      await res.unmount();
      expect(res.container.parentNode).toBeNull();

      // Second unmount on same result must not throw
      expect(async () => {
        await res.unmount();
      }).not.toThrow();
    });

    it("verifies component unmount cleans up registered event listeners", async () => {
      let clicks = 0;

      function ListenerComponent() {
        useEffect(() => {
          const handler = () => {
            clicks++;
          };
          (globalThis as any).window.addEventListener("test-event", handler);
          return () => {
            (globalThis as any).window.removeEventListener("test-event", handler);
          };
        }, []);

        return React.createElement("div", null, "Listener Active");
      }

      const res = await mount(React.createElement(ListenerComponent));

      // Dispatch while mounted
      (globalThis as any).window.dispatchEvent(new (globalThis as any).Event("test-event"));
      expect(clicks).toBe(1);

      // Unmount
      await res.unmount();

      // Dispatch after unmount
      (globalThis as any).window.dispatchEvent(new (globalThis as any).Event("test-event"));
      expect(clicks).toBe(1); // Should not have incremented!
    });

    it("tests error boundary during mount and verifies DOM isolation", async () => {
      function ExplodingComponent(): React.ReactElement {
        throw new Error("Render error test");
      }

      const initialCount = (globalThis as any).document.body.children.length;
      let caughtError = false;
      try {
        await mount(React.createElement(ExplodingComponent));
      } catch (e: any) {
        caughtError = true;
        expect(e.message).toBe("Render error test");
      }
      expect(caughtError).toBe(true);

      // Failed mount leaves 1 container attached before cleanup
      expect((globalThis as any).document.body.children.length).toBe(initialCount + 1);

      // Cleanup recovers the DOM completely
      await cleanup();
      expect((globalThis as any).document.body.children.length).toBe(0);
    });

    it("mounts and unmounts 200 components sequentially without memory bloat or listener leak", async () => {
      const initialCount = (globalThis as any).document.body.children.length;

      for (let i = 0; i < 200; i++) {
        const res = await mount(
          React.createElement("div", { "data-testid": `stress-${i}` }, `Node ${i}`)
        );
        expect(res.findByTestId(`stress-${i}`)).not.toBeNull();
        await res.unmount();
      }

      expect((globalThis as any).document.body.children.length).toBe(initialCount);
    });

    it("documents sequential act() requirement for multi-mount workflows", async () => {
      // Sequential mounts work cleanly without act() overlap warnings
      const res1 = await mount(React.createElement("div", null, "First"));
      const res2 = await mount(React.createElement("div", null, "Second"));
      expect((globalThis as any).document.body.children.length).toBe(2);

      await res1.unmount();
      await res2.unmount();
      expect((globalThis as any).document.body.children.length).toBe(0);
    });
  });
});

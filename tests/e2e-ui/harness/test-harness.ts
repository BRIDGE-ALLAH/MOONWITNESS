/**
 * Unified Test Harness for Sovereign UI E2E Testing.
 * Provides mount, renderToHtml, SVG queries, Canvas context inspection, and cleanup.
 */

import "./dom-setup";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  MockCanvasRenderingContext2D,
  getCanvasMock,
} from "./canvas-mock";

export interface RenderResult {
  container: HTMLElement;
  unmount: () => Promise<void>;
  querySelector: <E extends Element = Element>(selector: string) => E | null;
  querySelectorAll: <E extends Element = Element>(selector: string) => E[];
  findByTestId: (testId: string) => HTMLElement | null;
  getSvg: () => SVGElement | null;
  getCanvas: () => HTMLCanvasElement | null;
  getCanvasMockContext: () => MockCanvasRenderingContext2D | null;
}

const activeRoots: Array<{ root: Root; container: HTMLElement }> = [];

/**
 * Mounts a React component tree into the headless DOM within an act() boundary.
 */
export async function mount(element: React.ReactElement): Promise<RenderResult> {
  const container = (globalThis as any).document.createElement("div");
  (globalThis as any).document.body.appendChild(container);

  const root = createRoot(container);
  await act(async () => {
    root.render(element);
  });

  const entry = { root, container };
  activeRoots.push(entry);

  const unmount = async () => {
    await act(async () => {
      root.unmount();
    });
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    const idx = activeRoots.indexOf(entry);
    if (idx !== -1) {
      activeRoots.splice(idx, 1);
    }
  };

  return {
    container,
    unmount,
    querySelector: <E extends Element = Element>(selector: string) =>
      container.querySelector<E>(selector),
    querySelectorAll: <E extends Element = Element>(selector: string) =>
      Array.from(container.querySelectorAll<E>(selector)),
    findByTestId: (testId: string) =>
      container.querySelector<HTMLElement>(`[data-testid="${testId}"]`),
    getSvg: () => container.querySelector<SVGElement>("svg"),
    getCanvas: () => container.querySelector<HTMLCanvasElement>("canvas"),
    getCanvasMockContext: () => {
      const canvas = container.querySelector<HTMLCanvasElement>("canvas");
      return canvas ? getCanvasMock(canvas) : null;
    },
  };
}

/**
 * Synchronously renders a React component tree to an HTML string using SSR.
 */
export function renderToHtml(element: React.ReactElement): string {
  return renderToString(element);
}

/**
 * Flushes React effects, state transitions, and microtask queues.
 */
export async function flush(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

/**
 * Unmounts all active mounted component roots and clears DOM.
 */
export async function cleanup(): Promise<void> {
  while (activeRoots.length > 0) {
    const item = activeRoots.pop()!;
    try {
      await act(async () => {
        item.root.unmount();
      });
    } catch {
      // Ignore teardown errors
    }
    if (item.container.parentNode) {
      item.container.parentNode.removeChild(item.container);
    }
  }
  if ((globalThis as any).document?.body) {
    (globalThis as any).document.body.innerHTML = "";
  }
}

// --- SVG Query Utilities ---

/**
 * Queries the first SVG element inside a container.
 */
export function querySvg(container: HTMLElement): SVGElement | null {
  return container.querySelector<SVGElement>("svg");
}

/**
 * Extracts all attributes from an SVG element as key-value pairs.
 */
export function getSvgAttributes(svg: SVGElement): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (let i = 0; i < svg.attributes.length; i++) {
    const attr = svg.attributes[i];
    result[attr.name] = attr.value;
  }
  return result;
}

/**
 * Queries all path elements inside an SVG/container.
 */
export function querySvgPaths(container: HTMLElement): SVGPathElement[] {
  return Array.from(container.querySelectorAll<SVGPathElement>("path"));
}

/**
 * Checks if any SVG path in the container has a 'd' attribute matching pattern.
 */
export function hasSvgPath(container: HTMLElement, pattern?: RegExp | string): boolean {
  const paths = querySvgPaths(container);
  if (!pattern) return paths.length > 0;

  return paths.some((p) => {
    const d = p.getAttribute("d") || "";
    if (typeof pattern === "string") {
      return d.includes(pattern);
    }
    return pattern.test(d);
  });
}

// --- Canvas Query Utilities ---

/**
 * Finds canvas element inside container.
 */
export function findCanvas(container: HTMLElement): HTMLCanvasElement | null {
  return container.querySelector<HTMLCanvasElement>("canvas");
}

/**
 * Retrieves the mock 2D rendering context for a canvas.
 */
export function getCanvasContext(canvas: HTMLCanvasElement): MockCanvasRenderingContext2D {
  return getCanvasMock(canvas);
}

/**
 * Headless DOM Environment Setup for Sovereign UI E2E Testing.
 * Instantiates GlobalWindow from happy-dom and registers browser globals on globalThis.
 */

import { GlobalWindow } from "happy-dom";

// 1. Instantiate the global window immediately
const globalWindow = new GlobalWindow({
  url: "http://localhost:3000",
  width: 1920,
  height: 1080,
});

const win = globalWindow as any;

// 2. React 19 Act configuration
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// 3. Essential window and document globals
(globalThis as any).window = win;
(globalThis as any).document = win.document;
(globalThis as any).navigator = win.navigator;
(globalThis as any).location = win.location;
(globalThis as any).history = win.history;
(globalThis as any).screen = win.screen;

// 4. Core DOM Classes
(globalThis as any).Node = win.Node;
(globalThis as any).Attr = win.Attr;
(globalThis as any).Element = win.Element;
(globalThis as any).HTMLElement = win.HTMLElement;
(globalThis as any).HTMLCanvasElement = win.HTMLCanvasElement;
(globalThis as any).SVGElement = win.SVGElement;
(globalThis as any).SVGPathElement = win.SVGPathElement;
(globalThis as any).SVGSVGElement = win.SVGSVGElement;

// 5. Event Classes
(globalThis as any).Event = win.Event;
(globalThis as any).CustomEvent = win.CustomEvent;
(globalThis as any).UIEvent = win.UIEvent;
(globalThis as any).MouseEvent = win.MouseEvent;
(globalThis as any).KeyboardEvent = win.KeyboardEvent;
(globalThis as any).FocusEvent = win.FocusEvent;
(globalThis as any).WheelEvent = win.WheelEvent;
(globalThis as any).DragEvent = win.DragEvent || win.MouseEvent;

export interface DomEnvironment {
  window: any;
  document: Document;
  cleanup: () => void;
}

/**
 * Custom PointerEvent polyfill extending MouseEvent for headless environments.
 */
export class PolyfillPointerEvent extends win.MouseEvent {
  public pointerId: number;
  public width: number;
  public height: number;
  public pressure: number;
  public tangentialPressure: number;
  public tiltX: number;
  public tiltY: number;
  public twist: number;
  public pointerType: string;
  public isPrimary: boolean;

  constructor(type: string, params: any = {}) {
    super(type, params);
    this.pointerId = params.pointerId ?? 1;
    this.width = params.width ?? 1;
    this.height = params.height ?? 1;
    this.pressure = params.pressure ?? (type === "pointerup" ? 0 : 0.5);
    this.tangentialPressure = params.tangentialPressure ?? 0;
    this.tiltX = params.tiltX ?? 0;
    this.tiltY = params.tiltY ?? 0;
    this.twist = params.twist ?? 0;
    this.pointerType = params.pointerType ?? "mouse";
    this.isPrimary = params.isPrimary ?? true;
  }
}

/**
 * ResizeObserver polyfill for headless DOM environments.
 */
export class PolyfillResizeObserver {
  private callback: (entries: any[], observer: any) => void;
  private observedElements = new Set<Element>();

  constructor(callback: (entries: any[], observer: any) => void) {
    this.callback = callback;
  }

  public observe(target: Element): void {
    this.observedElements.add(target);
    const rect = target.getBoundingClientRect();
    this.callback([
      {
        target,
        contentRect: rect,
        borderBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
        contentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
        devicePixelContentBoxSize: [{ inlineSize: rect.width, blockSize: rect.height }],
      },
    ], this);
  }

  public unobserve(target: Element): void {
    this.observedElements.delete(target);
  }

  public disconnect(): void {
    this.observedElements.clear();
  }
}

// 6. Polyfill PointerEvent on globals
const PointerClass = win.PointerEvent || PolyfillPointerEvent;
(globalThis as any).PointerEvent = PointerClass;
win.PointerEvent = PointerClass;

// 7. Polyfill ResizeObserver on globals
const ResizeClass = win.ResizeObserver || PolyfillResizeObserver;
(globalThis as any).ResizeObserver = ResizeClass;
win.ResizeObserver = ResizeClass;

// 8. Observers & Animation Frames
(globalThis as any).MutationObserver = win.MutationObserver;
(globalThis as any).getComputedStyle = win.getComputedStyle?.bind(win) || (() => ({
  getPropertyValue: () => "",
}));

(globalThis as any).requestAnimationFrame = win.requestAnimationFrame?.bind(win) || ((cb: (ts: number) => void) => {
  return setTimeout(() => cb(Date.now()), 16);
});
(globalThis as any).cancelAnimationFrame = win.cancelAnimationFrame?.bind(win) || ((id: number) => {
  clearTimeout(id);
});

// 9. Provide default bounding client rect for elements, specifically Canvas
const originalGetBoundingClientRect = win.HTMLElement.prototype.getBoundingClientRect;
win.HTMLElement.prototype.getBoundingClientRect = function (this: HTMLElement) {
  if (this.tagName === "CANVAS") {
    const canvas = this as HTMLCanvasElement;
    const width = canvas.width || 800;
    const height = canvas.height || 600;
    return {
      width,
      height,
      top: 0,
      left: 0,
      bottom: height,
      right: width,
      x: 0,
      y: 0,
      toJSON() {
        return this;
      },
    };
  }
  if (originalGetBoundingClientRect) {
    return originalGetBoundingClientRect.call(this);
  }
  return {
    width: 100,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 100,
    x: 0,
    y: 0,
    toJSON() {
      return this;
    },
  };
};

/**
 * Initializes and populates globalThis with DOM globals.
 */
export function setupDomEnvironment(): DomEnvironment {
  return {
    window: (globalThis as any).window,
    document: (globalThis as any).document,
    cleanup: resetDom,
  };
}

/**
 * Clears DOM body and resets state between tests.
 */
export function resetDom(): void {
  if ((globalThis as any).document?.body) {
    (globalThis as any).document.body.innerHTML = "";
  }
}

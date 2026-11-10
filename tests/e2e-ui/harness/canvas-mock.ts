/**
 * Headless Canvas 2D Mock for Sovereign UI E2E Testing.
 * Records all drawing, path, style, and transform calls for assertion without a GPU.
 */

import "./dom-setup";

export interface CanvasCall {
  method: string;
  args: any[];
}

export class MockCanvasGradient implements CanvasGradient {
  public stops: Array<{ offset: number; color: string }> = [];

  public addColorStop(offset: number, color: string): void {
    this.stops.push({ offset, color });
  }
}

export class MockCanvasPattern implements CanvasPattern {
  public setTransform(_transform?: DOMMatrix2DInit): void {}
}

export class MockCanvasRenderingContext2D {
  public canvas: HTMLCanvasElement;
  public calls: CanvasCall[] = [];

  // Rendering style properties
  public fillStyle: string | CanvasGradient | CanvasPattern = "#000000";
  public strokeStyle: string | CanvasGradient | CanvasPattern = "#000000";
  public lineWidth: number = 1;
  public lineCap: CanvasLineCap = "butt";
  public lineJoin: CanvasLineJoin = "miter";
  public miterLimit: number = 10;
  public lineDashOffset: number = 0;
  private lineDashSegments: number[] = [];

  // Text properties
  public font: string = "10px sans-serif";
  public textAlign: CanvasTextAlign = "start";
  public textBaseline: CanvasTextBaseline = "alphabetic";
  public direction: CanvasDirection = "inherit";

  // Compositing & effects
  public globalAlpha: number = 1.0;
  public globalCompositeOperation: GlobalCompositeOperation = "source-over";
  public shadowBlur: number = 0;
  public shadowColor: string = "rgba(0,0,0,0)";
  public shadowOffsetX: number = 0;
  public shadowOffsetY: number = 0;
  public imageSmoothingEnabled: boolean = true;
  public imageSmoothingQuality: ImageSmoothingQuality = "low";

  // State stack
  private stateStack: Array<{
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    globalAlpha: number;
    globalCompositeOperation: GlobalCompositeOperation;
  }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  private record(method: string, args: any[]): void {
    this.calls.push({ method, args });
  }

  // --- Path & Shape Methods ---

  public beginPath(): void {
    this.record("beginPath", []);
  }

  public closePath(): void {
    this.record("closePath", []);
  }

  public moveTo(x: number, y: number): void {
    this.record("moveTo", [x, y]);
  }

  public lineTo(x: number, y: number): void {
    this.record("lineTo", [x, y]);
  }

  public arc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean = false
  ): void {
    this.record("arc", [x, y, radius, startAngle, endAngle, counterclockwise]);
  }

  public arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void {
    this.record("arcTo", [x1, y1, x2, y2, radius]);
  }

  public bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void {
    this.record("bezierCurveTo", [cp1x, cp1y, cp2x, cp2y, x, y]);
  }

  public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
    this.record("quadraticCurveTo", [cpx, cpy, x, y]);
  }

  public rect(x: number, y: number, w: number, h: number): void {
    this.record("rect", [x, y, w, h]);
  }

  public roundRect(x: number, y: number, w: number, h: number, radii?: number | number[]): void {
    this.record("roundRect", [x, y, w, h, radii]);
  }

  public ellipse(
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number,
    counterclockwise: boolean = false
  ): void {
    this.record("ellipse", [x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise]);
  }

  // --- Drawing Methods ---

  public fill(fillRule?: CanvasFillRule): void {
    this.record("fill", fillRule ? [fillRule] : []);
  }

  public stroke(): void {
    this.record("stroke", []);
  }

  public fillRect(x: number, y: number, w: number, h: number): void {
    this.record("fillRect", [x, y, w, h]);
  }

  public strokeRect(x: number, y: number, w: number, h: number): void {
    this.record("strokeRect", [x, y, w, h]);
  }

  public clearRect(x: number, y: number, w: number, h: number): void {
    this.record("clearRect", [x, y, w, h]);
  }

  // --- Text Methods ---

  public fillText(text: string, x: number, y: number, maxWidth?: number): void {
    this.record("fillText", maxWidth !== undefined ? [text, x, y, maxWidth] : [text, x, y]);
  }

  public strokeText(text: string, x: number, y: number, maxWidth?: number): void {
    this.record("strokeText", maxWidth !== undefined ? [text, x, y, maxWidth] : [text, x, y]);
  }

  public measureText(text: string): TextMetrics {
    this.record("measureText", [text]);
    const width = text.length * 8; // Deterministic approximation
    return {
      width,
      actualBoundingBoxAscent: 8,
      actualBoundingBoxDescent: 2,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: width,
      fontBoundingBoxAscent: 10,
      fontBoundingBoxDescent: 2,
      alphabeticBaseline: 0,
      emHeightAscent: 10,
      emHeightDescent: 2,
      hangingBaseline: 8,
      ideographicBaseline: -2,
    };
  }

  // --- Transformations ---

  public save(): void {
    this.record("save", []);
    this.stateStack.push({
      fillStyle: this.fillStyle,
      strokeStyle: this.strokeStyle,
      lineWidth: this.lineWidth,
      globalAlpha: this.globalAlpha,
      globalCompositeOperation: this.globalCompositeOperation,
    });
  }

  public restore(): void {
    this.record("restore", []);
    const popped = this.stateStack.pop();
    if (popped) {
      this.fillStyle = popped.fillStyle;
      this.strokeStyle = popped.strokeStyle;
      this.lineWidth = popped.lineWidth;
      this.globalAlpha = popped.globalAlpha;
      this.globalCompositeOperation = popped.globalCompositeOperation;
    }
  }

  public scale(x: number, y: number): void {
    this.record("scale", [x, y]);
  }

  public rotate(angle: number): void {
    this.record("rotate", [angle]);
  }

  public translate(x: number, y: number): void {
    this.record("translate", [x, y]);
  }

  public transform(a: number, b: number, c: number, d: number, e: number, f: number): void {
    this.record("transform", [a, b, c, d, e, f]);
  }

  public setTransform(a?: any, b?: any, c?: any, d?: any, e?: any, f?: any): void {
    this.record("setTransform", [a, b, c, d, e, f]);
  }

  public resetTransform(): void {
    this.record("resetTransform", []);
  }

  // --- Gradients & Patterns ---

  public createLinearGradient(x0: number, y0: number, x1: number, y1: number): CanvasGradient {
    this.record("createLinearGradient", [x0, y0, x1, y1]);
    return new MockCanvasGradient();
  }

  public createRadialGradient(
    x0: number,
    y0: number,
    r0: number,
    x1: number,
    y1: number,
    r1: number
  ): CanvasGradient {
    this.record("createRadialGradient", [x0, y0, r0, x1, y1, r1]);
    return new MockCanvasGradient();
  }

  public createPattern(image: any, repetition: string | null): CanvasPattern | null {
    this.record("createPattern", [image, repetition]);
    return new MockCanvasPattern();
  }

  // --- Line Dash ---

  public setLineDash(segments: number[]): void {
    this.record("setLineDash", [segments]);
    this.lineDashSegments = [...segments];
  }

  public getLineDash(): number[] {
    return [...this.lineDashSegments];
  }

  // --- Image Data ---

  public createImageData(sw: number, sh: number): ImageData {
    this.record("createImageData", [sw, sh]);
    return {
      width: sw,
      height: sh,
      data: new Uint8ClampedArray(sw * sh * 4),
      colorSpace: "srgb",
    };
  }

  public getImageData(sx: number, sy: number, sw: number, sh: number): ImageData {
    this.record("getImageData", [sx, sy, sw, sh]);
    return {
      width: sw,
      height: sh,
      data: new Uint8ClampedArray(sw * sh * 4),
      colorSpace: "srgb",
    };
  }

  public putImageData(imagedata: ImageData, dx: number, dy: number): void {
    this.record("putImageData", [imagedata, dx, dy]);
  }

  public drawImage(...args: any[]): void {
    this.record("drawImage", args);
  }

  public clip(fillRule?: CanvasFillRule): void {
    this.record("clip", fillRule ? [fillRule] : []);
  }

  public isPointInPath(...args: any[]): boolean {
    return true;
  }

  public isPointInStroke(...args: any[]): boolean {
    return true;
  }

  // --- Query Helpers for Assertions ---

  public hasCall(method: string): boolean {
    return this.calls.some((c) => c.method === method);
  }

  public getCalls(method?: string): CanvasCall[] {
    if (!method) return [...this.calls];
    return this.calls.filter((c) => c.method === method);
  }

  public getCallCount(method: string): number {
    return this.calls.filter((c) => c.method === method).length;
  }

  public clearCalls(): void {
    this.calls = [];
  }
}

const canvasContextRegistry = new WeakMap<HTMLCanvasElement, MockCanvasRenderingContext2D>();

/**
 * Installs MockCanvasRenderingContext2D on HTMLCanvasElement.prototype.getContext.
 */
export function installCanvasMock(): void {
  const CanvasClass = (globalThis as any).HTMLCanvasElement;
  if (!CanvasClass) return;

  CanvasClass.prototype.getContext = function (contextId: string, _options?: any) {
    if (contextId === "2d") {
      let ctx = canvasContextRegistry.get(this);
      if (!ctx) {
        ctx = new MockCanvasRenderingContext2D(this);
        canvasContextRegistry.set(this, ctx);
      }
      return ctx;
    }
    return null;
  };
}

/**
 * Retrieves the mock 2D rendering context for a given canvas element.
 */
export function getCanvasMock(canvas: HTMLCanvasElement): MockCanvasRenderingContext2D {
  let ctx = canvasContextRegistry.get(canvas);
  if (!ctx) {
    ctx = new MockCanvasRenderingContext2D(canvas);
    canvasContextRegistry.set(canvas, ctx);
  }
  return ctx;
}

// Auto-install canvas mock on import
installCanvasMock();

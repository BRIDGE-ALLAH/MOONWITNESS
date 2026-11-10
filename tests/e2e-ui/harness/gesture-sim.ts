/**
 * Pointer & Keyboard Gesture Simulators for Sovereign UI E2E Testing.
 * Dispatches realistic sequences of PointerEvent, MouseEvent, and KeyboardEvent instances.
 */

import "./dom-setup";
import { act } from "react";

/**
 * Flushes React updates and microtasks.
 */
async function flushAsync(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function createPointerEvent(type: string, init: any = {}): PointerEvent {
  const PointerClass = (globalThis as any).PointerEvent;
  return new PointerClass(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: init.pointerId ?? 1,
    pointerType: init.pointerType ?? "touch",
    isPrimary: init.isPrimary ?? true,
    clientX: init.clientX ?? 0,
    clientY: init.clientY ?? 0,
    screenX: init.clientX ?? 0,
    screenY: init.clientY ?? 0,
    button: init.button ?? 0,
    buttons: init.buttons ?? (type === "pointerup" ? 0 : 1),
    pressure: init.pressure ?? (type === "pointerup" ? 0 : 0.5),
    ...init,
  });
}

/**
 * Simulates a directional swipe gesture across an element.
 */
export async function simulateSwipe(
  element: HTMLElement,
  direction: "left" | "right" | "up" | "down",
  options: { distance?: number; duration?: number; startX?: number; startY?: number } = {}
): Promise<void> {
  const distance = options.distance ?? 120;
  const startX = options.startX ?? 100;
  const startY = options.startY ?? 100;

  let endX = startX;
  let endY = startY;

  switch (direction) {
    case "left":
      endX = startX - distance;
      break;
    case "right":
      endX = startX + distance;
      break;
    case "up":
      endY = startY - distance;
      break;
    case "down":
      endY = startY + distance;
      break;
  }

  // 1. pointerdown at start
  element.dispatchEvent(
    createPointerEvent("pointerdown", {
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    })
  );
  await flushAsync();

  // 2. intermediate pointermove steps
  const steps = 4;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const curX = startX + (endX - startX) * progress;
    const curY = startY + (endY - startY) * progress;
    element.dispatchEvent(
      createPointerEvent("pointermove", {
        clientX: curX,
        clientY: curY,
        buttons: 1,
      })
    );
  }
  await flushAsync();

  // 3. pointerup at end
  element.dispatchEvent(
    createPointerEvent("pointerup", {
      clientX: endX,
      clientY: endY,
      button: 0,
      buttons: 0,
    })
  );
  await flushAsync();
}

/**
 * Simulates continuous panning movement between two coordinate points.
 */
export async function simulatePan(
  element: HTMLElement,
  options: { startX: number; startY: number; endX: number; endY: number; steps?: number }
): Promise<void> {
  const steps = options.steps ?? 6;
  const { startX, startY, endX, endY } = options;

  element.dispatchEvent(
    createPointerEvent("pointerdown", {
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    })
  );
  await flushAsync();

  for (let i = 1; i <= steps; i++) {
    const curX = startX + ((endX - startX) * i) / steps;
    const curY = startY + ((endY - startY) * i) / steps;
    element.dispatchEvent(
      createPointerEvent("pointermove", {
        clientX: curX,
        clientY: curY,
        buttons: 1,
      })
    );
    await flushAsync();
  }

  element.dispatchEvent(
    createPointerEvent("pointerup", {
      clientX: endX,
      clientY: endY,
      button: 0,
      buttons: 0,
    })
  );
  await flushAsync();
}

/**
 * Simulates a long press touch event (pointer held stationary > 500ms).
 */
export async function simulateLongPress(
  element: HTMLElement,
  options: { x?: number; y?: number; durationMs?: number } = {}
): Promise<void> {
  const x = options.x ?? 50;
  const y = options.y ?? 50;
  const durationMs = options.durationMs ?? 550;

  element.dispatchEvent(
    createPointerEvent("pointerdown", {
      clientX: x,
      clientY: y,
      button: 0,
      buttons: 1,
    })
  );
  await flushAsync();

  // Wait for long press threshold
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, durationMs));
  });

  element.dispatchEvent(
    createPointerEvent("pointerup", {
      clientX: x,
      clientY: y,
      button: 0,
      buttons: 0,
    })
  );
  await flushAsync();
}

/**
 * Simulates a double-tap gesture (two quick taps within 300ms).
 */
export async function simulateDoubleTap(
  element: HTMLElement,
  options: { x?: number; y?: number; intervalMs?: number } = {}
): Promise<void> {
  const x = options.x ?? 50;
  const y = options.y ?? 50;
  const intervalMs = options.intervalMs ?? 100;

  // First tap
  element.dispatchEvent(createPointerEvent("pointerdown", { clientX: x, clientY: y, button: 0, buttons: 1 }));
  element.dispatchEvent(createPointerEvent("pointerup", { clientX: x, clientY: y, button: 0, buttons: 0 }));
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  await flushAsync();

  // Gap between taps
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  });

  // Second tap
  element.dispatchEvent(createPointerEvent("pointerdown", { clientX: x, clientY: y, button: 0, buttons: 1 }));
  element.dispatchEvent(createPointerEvent("pointerup", { clientX: x, clientY: y, button: 0, buttons: 0 }));
  element.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  element.dispatchEvent(new MouseEvent("dblclick", { bubbles: true, cancelable: true, clientX: x, clientY: y }));
  await flushAsync();
}

/**
 * Simulates a two-finger pinch-to-zoom gesture on an element.
 */
export async function simulatePinch(
  element: HTMLElement,
  scale: number,
  options: { centerX?: number; centerY?: number } = {}
): Promise<void> {
  const centerX = options.centerX ?? 100;
  const centerY = options.centerY ?? 100;
  const baseSpan = 50;
  const targetSpan = baseSpan * scale;

  // Multi-pointer start
  element.dispatchEvent(
    createPointerEvent("pointerdown", {
      pointerId: 1,
      clientX: centerX - baseSpan,
      clientY: centerY,
      isPrimary: true,
      buttons: 1,
    })
  );
  element.dispatchEvent(
    createPointerEvent("pointerdown", {
      pointerId: 2,
      clientX: centerX + baseSpan,
      clientY: centerY,
      isPrimary: false,
      buttons: 1,
    })
  );
  await flushAsync();

  // Pointer move to target distance
  element.dispatchEvent(
    createPointerEvent("pointermove", {
      pointerId: 1,
      clientX: centerX - targetSpan,
      clientY: centerY,
      isPrimary: true,
      buttons: 1,
    })
  );
  element.dispatchEvent(
    createPointerEvent("pointermove", {
      pointerId: 2,
      clientX: centerX + targetSpan,
      clientY: centerY,
      isPrimary: false,
      buttons: 1,
    })
  );
  await flushAsync();

  // End pointers
  element.dispatchEvent(
    createPointerEvent("pointerup", {
      pointerId: 1,
      clientX: centerX - targetSpan,
      clientY: centerY,
      isPrimary: true,
      buttons: 0,
    })
  );
  element.dispatchEvent(
    createPointerEvent("pointerup", {
      pointerId: 2,
      clientX: centerX + targetSpan,
      clientY: centerY,
      isPrimary: false,
      buttons: 0,
    })
  );
  await flushAsync();
}

/**
 * Simulates a drag and drop operation from a source element into a target element.
 */
export async function simulateDragAndDrop(
  source: HTMLElement,
  target: HTMLElement,
  options: { steps?: number } = {}
): Promise<void> {
  const steps = options.steps ?? 4;
  const sourceRect = source.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const startX = sourceRect.left + sourceRect.width / 2;
  const startY = sourceRect.top + sourceRect.height / 2;
  const endX = targetRect.left + targetRect.width / 2;
  const endY = targetRect.top + targetRect.height / 2;

  // 1. Pointer Down on Source
  source.dispatchEvent(
    createPointerEvent("pointerdown", {
      clientX: startX,
      clientY: startY,
      button: 0,
      buttons: 1,
    })
  );

  // Dispatch HTML5 dragstart if supported
  const dragStartEvent = new (globalThis as any).MouseEvent("dragstart", {
    bubbles: true,
    cancelable: true,
    clientX: startX,
    clientY: startY,
  });
  source.dispatchEvent(dragStartEvent);
  await flushAsync();

  // 2. Drag movement steps
  for (let i = 1; i <= steps; i++) {
    const curX = startX + ((endX - startX) * i) / steps;
    const curY = startY + ((endY - startY) * i) / steps;
    source.dispatchEvent(
      createPointerEvent("pointermove", {
        clientX: curX,
        clientY: curY,
        buttons: 1,
      })
    );
  }
  await flushAsync();

  // 3. Pointer Enter / Over Target
  target.dispatchEvent(
    createPointerEvent("pointerenter", {
      clientX: endX,
      clientY: endY,
      buttons: 1,
    })
  );
  target.dispatchEvent(
    createPointerEvent("pointerover", {
      clientX: endX,
      clientY: endY,
      buttons: 1,
    })
  );

  const dragOverEvent = new (globalThis as any).MouseEvent("dragover", {
    bubbles: true,
    cancelable: true,
    clientX: endX,
    clientY: endY,
  });
  target.dispatchEvent(dragOverEvent);
  await flushAsync();

  // 4. Pointer Up / Drop on Target
  target.dispatchEvent(
    createPointerEvent("pointerup", {
      clientX: endX,
      clientY: endY,
      button: 0,
      buttons: 0,
    })
  );

  const dropEvent = new (globalThis as any).MouseEvent("drop", {
    bubbles: true,
    cancelable: true,
    clientX: endX,
    clientY: endY,
  });
  target.dispatchEvent(dropEvent);

  const dragEndEvent = new (globalThis as any).MouseEvent("dragend", {
    bubbles: true,
    cancelable: true,
    clientX: endX,
    clientY: endY,
  });
  source.dispatchEvent(dragEndEvent);
  await flushAsync();
}

/**
 * Simulates a keyboard shortcut press (keydown followed by keyup).
 */
export function simulateKeyShortcut(
  key: string,
  modifiers: { ctrl?: boolean; meta?: boolean; alt?: boolean; shift?: boolean } = {},
  target: EventTarget = (globalThis as any).window
): void {
  const init: KeyboardEventInit = {
    key,
    code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
    bubbles: true,
    cancelable: true,
    composed: true,
    ctrlKey: !!modifiers.ctrl,
    metaKey: !!modifiers.meta,
    altKey: !!modifiers.alt,
    shiftKey: !!modifiers.shift,
  };

  const KeyboardEventClass = (globalThis as any).KeyboardEvent;
  const downEvent = new KeyboardEventClass("keydown", init);
  const upEvent = new KeyboardEventClass("keyup", init);

  target.dispatchEvent(downEvent);
  target.dispatchEvent(upEvent);
}

import { describe, expect, it } from "bun:test";
import { cn } from "./utils";

describe("@local-git/ui: cn utility", () => {
  it("merges multiple class strings and ignores falsy values", () => {
    expect(cn("px-4", false && "hidden", undefined, "py-2")).toBe("px-4 py-2");
  });

  it("resolves conflicting Tailwind utility classes deterministically", () => {
    expect(cn("p-2 text-zinc-400", "p-6 text-white")).toBe("p-6 text-white");
  });

  it("supports conditional object maps", () => {
    expect(cn("border", { "border-amber-500": true, "border-red-500": false })).toBe(
      "border border-amber-500"
    );
  });
});


import { describe, expect, test } from "bun:test";
import { createPersonalAccessToken, hashPersonalAccessToken, safeEqualHex, isValidRecordId } from "./security";

// Tests run with TOKEN_PEPPER set by the test command or environment.
describe("personal access token primitives", () => {
  test("creates an opaque token and a deterministic HMAC digest", () => {
    const created = createPersonalAccessToken();
    expect(created.token.startsWith("lgh_")).toBe(true);
    expect(created.tokenHash).toBe(hashPersonalAccessToken(created.token));
    expect(created.token).not.toContain(created.tokenHash);
  });

  test("compares only valid SHA-256 hex digests", () => {
    const digest = "a".repeat(64);
    expect(safeEqualHex(digest, digest)).toBe(true);
    expect(safeEqualHex(digest, "b".repeat(64))).toBe(false);
    expect(safeEqualHex("invalid", digest)).toBe(false);
  });

  test("accepts only PocketBase record-id shaped identifiers", () => {
    expect(isValidRecordId("a1b2c3d4e5f6g7h")).toBe(true);
    expect(isValidRecordId("short")).toBe(false);
    expect(isValidRecordId("..\\..\\windows\\evil")).toBe(false);
    expect(isValidRecordId('x" || owner != "')).toBe(false);
    expect(isValidRecordId("")).toBe(false);
  });
});

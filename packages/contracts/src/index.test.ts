import { describe, expect, it } from "bun:test";
import {
  createRepositorySchema,
  createTokenSchema,
  repositorySlugSchema,
  repositoryVisibilitySchema,
} from "./index";

describe("contracts: repositorySlugSchema", () => {
  it("accepts valid alphanumeric slugs with hyphens", () => {
    expect(repositorySlugSchema.safeParse("moonwitness-hq").success).toBe(true);
    expect(repositorySlugSchema.safeParse("dx").success).toBe(true);
    expect(repositorySlugSchema.safeParse("alpha-123-beta").success).toBe(true);
  });

  it("rejects invalid slugs with uppercase, consecutive hyphens, or symbols", () => {
    expect(repositorySlugSchema.safeParse("Moon-Witness").success).toBe(false);
    expect(repositorySlugSchema.safeParse("moon--witness").success).toBe(false);
    expect(repositorySlugSchema.safeParse("-leading-hyphen").success).toBe(false);
    expect(repositorySlugSchema.safeParse("trailing-hyphen-").success).toBe(false);
    expect(repositorySlugSchema.safeParse("special@slug!").success).toBe(false);
  });
});

describe("contracts: createRepositorySchema", () => {
  it("defaults visibility to private and description to empty string", () => {
    const parsed = createRepositorySchema.parse({
      name: "Sovereign Core",
      slug: "sovereign-core",
    });
    expect(parsed.visibility).toBe("private");
    expect(parsed.description).toBe("");
  });

  it("rejects invalid visibility", () => {
    const result = repositoryVisibilitySchema.safeParse("internal");
    expect(result.success).toBe(false);
  });
});

describe("contracts: createTokenSchema", () => {
  it("validates token input and scope constraints", () => {
    const valid = createTokenSchema.safeParse({
      name: "CI/CD Token",
      scopes: ["repo:read", "repo:write"],
      expiresInDays: 30,
    });
    expect(valid.success).toBe(true);

    const emptyScopes = createTokenSchema.safeParse({
      name: "Bad Token",
      scopes: [],
    });
    expect(emptyScopes.success).toBe(false);
  });
});

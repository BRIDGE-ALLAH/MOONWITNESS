import { z } from "zod";

export const repositoryVisibilitySchema = z.enum(["private", "public"]);
export const repositorySlugSchema = z.string()
  .min(1).max(48)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters, numbers and single hyphens.");

export const createRepositorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: repositorySlugSchema,
  description: z.string().trim().max(280).optional().default(""),
  visibility: repositoryVisibilitySchema.default("private"),
});

export const createTokenSchema = z.object({
  name: z.string().trim().min(1).max(80),
  scopes: z.array(z.enum(["repo:read", "repo:write"])).min(1).max(2),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export type CreateRepositoryInput = z.infer<typeof createRepositorySchema>;
export type CreateTokenInput = z.infer<typeof createTokenSchema>;

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { config } from "./config";
import { getAdmin, type AuthUser } from "./pocketbase";

export type GitToken = {
  owner: string;
  scopes: string[];
  id: string;
};

export function createPersonalAccessToken() {
  const token = `lgh_${randomBytes(32).toString("base64url")}`;
  return {
    token,
    tokenPrefix: token.slice(0, 12),
    tokenHash: hashPersonalAccessToken(token),
  };
}

export function hashPersonalAccessToken(token: string) {
  return createHmac("sha256", config.tokenPepper).update(token).digest("hex");
}

export function safeEqualHex(left: string, right: string) {
  if (!/^[a-f0-9]{64}$/i.test(left) || !/^[a-f0-9]{64}$/i.test(right)) return false;
  return timingSafeEqual(Buffer.from(left, "hex"), Buffer.from(right, "hex"));
}

export async function authenticatePersonalAccessToken(token: string): Promise<GitToken | null> {
  if (!token.startsWith("lgh_") || token.length < 40) return null;
  const hash = hashPersonalAccessToken(token);
  const admin = await getAdmin();
  try {
    const record = await admin.collection("personal_access_tokens").getFirstListItem(
      `token_hash = "${hash}" && revoked = false`,
    );
    if (record.expires_at && new Date(record.expires_at).getTime() <= Date.now()) return null;
    const scopes = Array.isArray(record.scopes) ? record.scopes.filter((s: unknown) => typeof s === "string") : [];
    return { owner: String(record.owner), scopes, id: String(record.id) };
  } catch {
    return null;
  }
}

export async function checkRepositoryAccess(
  repository: Record<string, any>,
  user: AuthUser | null,
  scopes: string[],
  write: boolean,
): Promise<boolean> {
  if (!user) return !write && repository.visibility === "public";
  const isOwner = repository.owner === user.id;
  if (!isOwner) {
    // Public repositories remain readable to authenticated users with a read-capable PAT.
    return !write && repository.visibility === "public" &&
      (scopes.includes("repo:read") || scopes.includes("repo:write"));
  }
  if (write) return scopes.includes("repo:write");
  return scopes.includes("repo:read") || scopes.includes("repo:write");
}

export function parseBasicToken(request: Request): { username: string; token: string } | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Basic\s+([A-Za-z0-9+/=]+)$/i);
  if (!match) return null;
  try {
    const decoded = Buffer.from(match[1], "base64").toString("utf8");
    const separator = decoded.indexOf(":");
    if (separator < 1) return null;
    return { username: decoded.slice(0, separator), token: decoded.slice(separator + 1) };
  } catch { return null; }
}

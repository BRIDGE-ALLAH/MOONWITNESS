import PocketBase from "pocketbase";
import { config } from "./config";

let cachedAdmin: PocketBase | null = null;
let adminLogin: Promise<PocketBase> | null = null;

export async function getAdmin(): Promise<PocketBase> {
  if (cachedAdmin?.authStore.isValid) return cachedAdmin;
  if (adminLogin) return adminLogin;

  adminLogin = (async () => {
    const client = new PocketBase(config.pbUrl);
    client.autoCancellation(false);
    await client.collection("_superusers").authWithPassword(
      config.pbSuperuserEmail,
      config.pbSuperuserPassword,
    );
    cachedAdmin = client;
    return client;
  })();

  try {
    return await adminLogin;
  } finally {
    adminLogin = null;
  }
}

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name?: string;
};

export async function authenticateUserRequest(request: Request): Promise<AuthUser | null> {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;

  const response = await fetch(`${config.pbUrl}/api/collections/users/auth-refresh`, {
    method: "POST",
    headers: { Authorization: match[1] },
  });
  if (!response.ok) return null;
  const payload = await response.json() as { record?: Record<string, unknown> };
  const record = payload.record;
  if (!record || typeof record.id !== "string" || typeof record.username !== "string") return null;
  return {
    id: record.id,
    email: typeof record.email === "string" ? record.email : "",
    username: record.username,
    name: typeof record.name === "string" ? record.name : "",
  };
}

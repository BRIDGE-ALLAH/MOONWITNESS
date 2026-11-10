import { mkdir } from "node:fs/promises";
import { config, assertRuntimeConfig } from "./config";
import { getAdmin, authenticateUserRequest } from "./pocketbase";
import { createPersonalAccessToken, authenticatePersonalAccessToken, checkRepositoryAccess, parseBasicToken } from "./security";
import { createRepository, findRepository, listRepositories, getRepositoryCommits } from "./repositories";
import { runGitHttpBackend } from "./git-http";
import { listDockerContainers, controlDockerContainer } from "./docker";
import { createTokenSchema } from "@local-git/contracts";

import { listPersonalAccessTokens, revokePersonalAccessToken, unrevokePersonalAccessToken } from "./security";

function json(data: unknown, status = 200, headers?: HeadersInit) {
  return Response.json(data, { status, headers });
}

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin");
  const headers = new Headers({ Vary: "Origin" });
  if (origin && config.corsOrigins.includes(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  }
  return headers;
}

function withCors(response: Response, request: Request) {
  const headers = new Headers(response.headers);
  corsHeaders(request).forEach((value, key) => headers.set(key, value));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function requireUser(request: Request) {
  const user = await authenticateUserRequest(request);
  return user;
}

async function handleApi(request: Request, url: URL): Promise<Response> {
  if (url.pathname === "/api/v1/health") return json({ ok: true, service: "local-git-engine", version: "0.1.0" });

  if (url.pathname === "/api/v1/repositories" && request.method === "GET") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    return json({ items: await listRepositories(user) });
  }

  if (url.pathname.startsWith("/api/v1/repositories/") && url.pathname.endsWith("/commits") && request.method === "GET") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const parts = url.pathname.split("/");
    // /api/v1/repositories/:repoId/commits
    const repoId = parts[4];
    if (!repoId) return json({ error: "Repository ID required." }, 400);
    const commits = await getRepositoryCommits(repoId);
    return json({ items: commits });
  }

  if (url.pathname === "/api/v1/repositories" && request.method === "POST") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const body = await request.json().catch(() => null);
    if (!body) return json({ error: "Invalid JSON body." }, 400);
    try { return json(await createRepository(user, body), 201); }
    catch (error) {
      const status = (error as Error & { status?: number }).status ?? 500;
      console.error("create repository failed:", error);
      return json({ error: status === 500 ? "Repository creation failed." : (error as Error).message }, status);
    }
  }

  if (url.pathname === "/api/v1/tokens" && request.method === "POST") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const body = await request.json().catch(() => null);
    const parsed = createTokenSchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.issues.map((issue) => issue.message).join(" ") }, 400);
    const created = createPersonalAccessToken();
    const expiresAt = parsed.data.expiresInDays
      ? new Date(Date.now() + parsed.data.expiresInDays * 86_400_000).toISOString()
      : "";
    const admin = await getAdmin();
    const record = await admin.collection("personal_access_tokens").create({
      owner: user.id,
      name: parsed.data.name,
      token_hash: created.tokenHash,
      token_prefix: created.tokenPrefix,
      scopes: parsed.data.scopes,
      expires_at: expiresAt,
      revoked: false,
    });
    return json({ id: record.id, name: parsed.data.name, token: created.token, token_prefix: created.tokenPrefix }, 201);
  }

  // --- PERSONAL ACCESS TOKEN MANAGEMENT ---
  if (url.pathname === "/api/v1/tokens" && request.method === "GET") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const tokens = await listPersonalAccessTokens(user.id);
    return json({ items: tokens });
  }

  if (url.pathname.startsWith("/api/v1/tokens/") && request.method === "DELETE") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const tokenId = url.pathname.split("/").pop() ?? "";
    if (!tokenId) return json({ error: "Token ID required." }, 400);
    const ok = await revokePersonalAccessToken(user.id, tokenId);
    if (!ok) return json({ error: "Token not found." }, 404);
    return json({ ok: true, revoked: true });
  }

  if (url.pathname.startsWith("/api/v1/tokens/") && request.method === "PATCH") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const tokenId = url.pathname.split("/").pop() ?? "";
    if (!tokenId) return json({ error: "Token ID required." }, 400);
    const body = await request.json().catch(() => null) as { action?: "revoke" | "unrevoke" } | null;
    if (!body?.action || !["revoke", "unrevoke"].includes(body.action)) {
      return json({ error: "Action 'revoke' or 'unrevoke' required." }, 400);
    }
    let ok = false;
    if (body.action === "revoke") {
      ok = await revokePersonalAccessToken(user.id, tokenId);
    } else {
      ok = await unrevokePersonalAccessToken(user.id, tokenId);
    }
    if (!ok) return json({ error: "Token not found or cannot be unrevoked (expired)." }, 404);
    return json({ ok: true, action: body.action });
  }

  // --- DOCKER PAAS MANAGEMENT ENDPOINTS ---
  if (url.pathname === "/api/v1/containers" && request.method === "GET") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    try {
      const containers = await listDockerContainers();
      return json({ items: containers });
    } catch (err) {
      console.error("listDockerContainers error:", err);
      return json({ error: (err as Error).message }, 500);
    }
  }

  if (url.pathname === "/api/v1/containers/action" && request.method === "POST") {
    const user = await requireUser(request);
    if (!user) return json({ error: "Authentication required." }, 401);
    const body = await request.json().catch(() => null) as { containerId?: string; action?: "start" | "stop" | "restart" | "logs" } | null;
    if (!body?.containerId || !body?.action) {
      return json({ error: "containerId and action ('start' | 'stop' | 'restart' | 'logs') required." }, 400);
    }
    try {
      const result = await controlDockerContainer(body.containerId, body.action);
      return json({ ok: true, action: body.action, result });
    } catch (err) {
      console.error("controlDockerContainer error:", err);
      return json({ error: (err as Error).message }, 500);
    }
  }

  return json({ error: "Not found." }, 404);
}

async function handleGit(request: Request, url: URL): Promise<Response> {
  const match = url.pathname.match(/^\/git\/([a-zA-Z0-9_-]{3,40})\/([a-z0-9]+(?:-[a-z0-9]+)*)\.git(\/.*)?$/);
  if (!match) return new Response("Not found", { status: 404 });
  if (!["GET", "POST", "HEAD"].includes(request.method)) return new Response("Method not allowed", { status: 405 });
  const [, ownerUsername, slug, subPath = ""] = match;
  const allowedGitPath = /^\/(?:info\/refs|git-upload-pack|git-receive-pack|HEAD)$/.test(subPath);
  if (!allowedGitPath) return new Response("Unsupported Git HTTP endpoint", { status: 404 });
  if ((subPath === "/git-upload-pack" || subPath === "/git-receive-pack") && request.method !== "POST") {
    return new Response("Git service endpoints require POST", { status: 405 });
  }
  if ((subPath === "/info/refs" || subPath === "/HEAD") && !["GET", "HEAD"].includes(request.method)) {
    return new Response("Git discovery endpoints require GET", { status: 405 });
  }
  const repository = await findRepository(ownerUsername, slug);
  if (!repository || repository.storage_key !== repository.id) return new Response("Repository not found", { status: 404 });

  const service = url.searchParams.get("service") ?? "";
  const isWrite = subPath.endsWith("/git-receive-pack") || subPath === "/git-receive-pack" || service === "git-receive-pack";
  const basic = parseBasicToken(request);
  let tokenOwner: string | null = null;
  let scopes: string[] = [];
  if (basic) {
    const credential = await authenticatePersonalAccessToken(basic.token);
    if (!credential) return new Response("Invalid personal access token", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Local Git HQ"' } });
    tokenOwner = credential.owner;
    scopes = credential.scopes;
  }

  const user = tokenOwner ? { id: tokenOwner, username: basic?.username ?? "", email: "" } : null;
  const allowed = await checkRepositoryAccess(repository, user, scopes, isWrite);
  if (!allowed) {
    if (!basic && repository.visibility === "private") {
      return new Response("Authentication required", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Local Git HQ"' } });
    }
    return new Response("Repository access denied", { status: 403 });
  }

  return runGitHttpBackend(request, repository.id, subPath, tokenOwner);
}

async function main() {
  assertRuntimeConfig();
  await mkdir(config.dataDir, { recursive: true });
  // Fail fast if PocketBase credentials are invalid. The health endpoint remains simple.
  await getAdmin();
  console.info(`[local-git-engine] listening on :${config.port}`);

  Bun.serve({
    hostname: config.host,
    port: config.port,
    async fetch(request) {
      const url = new URL(request.url);
      if (request.method === "OPTIONS") return withCors(new Response(null, { status: 204 }), request);
      if (url.pathname === "/healthz") return json({ ok: true, service: "git-engine", version: "0.1.0" });
      try {
        const response = url.pathname.startsWith("/api/")
          ? await handleApi(request, url)
          : url.pathname.startsWith("/git/")
            ? await handleGit(request, url)
            : json({ error: "Not found." }, 404);
        return withCors(response, request);
      } catch (error) {
        console.error("request failed:", error);
        return withCors(json({ error: "Internal server error." }, 500), request);
      }
    },
  });
}

main().catch((error) => {
  console.error("[local-git-engine] startup failed:", error);
  process.exit(1);
});

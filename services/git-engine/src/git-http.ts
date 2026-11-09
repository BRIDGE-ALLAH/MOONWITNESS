import { spawn, execFileSync } from "node:child_process";
import type { Readable } from "node:stream";
import { config } from "./config";

let backendPathCache: string | null = null;
function getBackendPath() {
  if (config.gitBackend) return config.gitBackend;
  if (backendPathCache) return backendPathCache;
  const execPath = execFileSync("git", ["--exec-path"], { encoding: "utf8" }).trim();
  backendPathCache = `${execPath}/git-http-backend`;
  return backendPathCache;
}

function findHeaderBoundary(buffer: Buffer) {
  const crlf = buffer.indexOf("\r\n\r\n");
  const lf = buffer.indexOf("\n\n");
  if (crlf >= 0 && (lf < 0 || crlf <= lf)) return { index: crlf, length: 4 };
  if (lf >= 0) return { index: lf, length: 2 };
  return null;
}

function parseCgiHeaders(raw: string) {
  const headers = new Headers();
  let status = 200;
  for (const line of raw.split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key.toLowerCase() === "status") {
      const parsed = Number(value.split(/\s+/, 1)[0]);
      if (Number.isInteger(parsed) && parsed >= 100 && parsed <= 599) status = parsed;
      continue;
    }
    // Forward only response headers needed for Git Smart HTTP; do not leak arbitrary CGI headers.
    if (["content-type", "cache-control", "expires", "pragma", "location", "content-encoding"].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  }
  return { status, headers };
}

export async function runGitHttpBackend(request: Request, repositoryId: string, subPath: string, remoteUser: string | null): Promise<Response> {
  const backend = getBackendPath();
  const url = new URL(request.url);
  const contentLength = request.headers.get("content-length") ?? "0";
  // Do not inherit process secrets (PocketBase superuser credentials or TOKEN_PEPPER)
  // into Git subprocesses and any repository hooks they may execute.
  const env: NodeJS.ProcessEnv = {
    PATH: process.env.PATH ?? "/usr/local/bin:/usr/bin:/bin",
    HOME: process.env.HOME ?? "/tmp",
    LANG: process.env.LANG ?? "C.UTF-8",
    GIT_PROJECT_ROOT: config.dataDir,
    GIT_HTTP_EXPORT_ALL: "1",
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_CONFIG_GLOBAL: "/dev/null",
    PATH_INFO: `/${repositoryId}.git${subPath}`,
    SCRIPT_NAME: "",
    QUERY_STRING: url.search.slice(1),
    REQUEST_METHOD: request.method,
    REQUEST_URI: `${url.pathname}${url.search}`,
    CONTENT_TYPE: request.headers.get("content-type") ?? "",
    CONTENT_LENGTH: contentLength,
    SERVER_PROTOCOL: "HTTP/1.1",
    SERVER_NAME: url.hostname,
    SERVER_PORT: url.port || "80",
    REMOTE_ADDR: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1",
    GATEWAY_INTERFACE: "CGI/1.1",
    ...(request.headers.get("git-protocol") ? { HTTP_GIT_PROTOCOL: request.headers.get("git-protocol")! } : {}),
    ...(remoteUser ? { REMOTE_USER: remoteUser, AUTH_TYPE: "Basic" } : {}),
  };

  const child = spawn(backend, [], { env, stdio: ["pipe", "pipe", "pipe"] });
  child.on("error", (error) => console.error("Git CGI process could not start:", error.message));
  request.signal.addEventListener("abort", () => child.kill(), { once: true });
  child.stdin.on("error", () => undefined);
  child.stderr.on("data", (chunk: Buffer) => {
    // Avoid logging request bodies or credentials. Git CGI errors are truncated and sanitized.
    const detail = chunk.toString("utf8").replace(/[\r\n]+/g, " ").slice(0, 500);
    if (detail) console.warn(`[git-http-backend] ${detail}`);
  });

  const pumpRequest = async () => {
    if (!request.body) { child.stdin.end(); return; }
    const writer = child.stdin;
    const reader = request.body.getReader();
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!writer.write(Buffer.from(value))) await new Promise<void>((resolve) => writer.once("drain", resolve));
      }
      writer.end();
    } catch (error) {
      writer.destroy(error instanceof Error ? error : undefined);
      child.kill();
    } finally { reader.releaseLock(); }
  };
  void pumpRequest();

  const stdout = child.stdout as Readable;
  const iterator = stdout[Symbol.asyncIterator]();
  let accumulated = Buffer.alloc(0);
  let boundary: ReturnType<typeof findHeaderBoundary> = null;
  while (!boundary && accumulated.length < 64 * 1024) {
    const next = await iterator.next();
    if (next.done) break;
    accumulated = Buffer.concat([accumulated, Buffer.from(next.value)]);
    boundary = findHeaderBoundary(accumulated);
  }
  if (!boundary) {
    child.kill();
    return new Response("Git backend returned an invalid CGI response.", { status: 502 });
  }

  const headerText = accumulated.subarray(0, boundary.index).toString("utf8");
  const firstBody = accumulated.subarray(boundary.index + boundary.length);
  const { status, headers } = parseCgiHeaders(headerText);
  if (!headers.has("content-type")) headers.set("content-type", "application/octet-stream");

  let firstChunkPending = firstBody.length > 0;
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        if (firstChunkPending) {
          firstChunkPending = false;
          controller.enqueue(new Uint8Array(firstBody));
          return;
        }
        const next = await iterator.next();
        if (next.done) controller.close();
        else controller.enqueue(new Uint8Array(next.value));
      } catch (error) { controller.error(error); }
    },
    cancel() { child.kill(); },
  });
  return new Response(body, { status, headers });
}

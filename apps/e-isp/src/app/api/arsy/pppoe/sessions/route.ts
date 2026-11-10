import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextResponse } from "next/server";

function resolveEnv(key: string, fallback = ""): string {
  if (process.env[key]) return process.env[key] as string;
  for (const rel of [".env", "../../.env"]) {
    const p = resolve(process.cwd(), rel);
    if (existsSync(p)) {
      const match = readFileSync(p, "utf8").match(new RegExp(`^${key}=(.+)$`, "m"));
      if (match?.[1]) return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return fallback;
}

export async function GET() {
  const endpoint = resolveEnv("ARSY_ENDPOINT", "http://127.0.0.1:4000");
  try {
    const upstream = await fetch(`${endpoint}/api/v1/pppoe/sessions`, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json({ message: "Failed to fetch sessions from ARSY" }, { status: upstream.status });
    }
    const data = await upstream.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "ARSY orchestrator unreachable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const endpoint = resolveEnv("ARSY_ENDPOINT", "http://127.0.0.1:4000");
  const token = resolveEnv("ARSY_SERVICE_TOKEN");
  if (!token) {
    return NextResponse.json(
      { message: "ARSY_SERVICE_TOKEN not configured on E-ISP server" },
      { status: 503 }
    );
  }
  try {
    const upstream = await fetch(`${endpoint}/api/v1/pppoe/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: await request.text(),
      signal: AbortSignal.timeout(3000),
    });
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "ARSY orchestrator unreachable" }, { status: 502 });
  }
}

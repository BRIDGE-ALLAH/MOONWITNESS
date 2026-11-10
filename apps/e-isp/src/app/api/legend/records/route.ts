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

export async function GET(request: Request) {
  const endpoint = resolveEnv("LEGEND_ENDPOINT", "http://127.0.0.1:8092");
  const serviceToken = resolveEnv("LEGEND_SERVICE_TOKEN");
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") || "pppoe_sessions";
  const limit = searchParams.get("limit") || "50";

  try {
    const upstream = await fetch(`${endpoint}/api/v1/records/${table}?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${serviceToken}`,
      },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch from Legend" }, { status: upstream.status });
    }

    const records = await upstream.json();
    return NextResponse.json(records);
  } catch {
    return NextResponse.json({ error: "Legend BaaS unreachable" }, { status: 502 });
  }
}

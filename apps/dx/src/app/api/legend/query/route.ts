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

export async function POST(request: Request) {
  const endpoint = resolveEnv("LEGEND_ENDPOINT", "http://127.0.0.1:8092");
  const adminToken = resolveEnv("LEGEND_ADMIN_TOKEN");
  if (!adminToken) {
    return NextResponse.json({ error: "LEGEND_ADMIN_TOKEN not configured" }, { status: 503 });
  }

  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query payload" }, { status: 400 });
    }

    const upstream = await fetch(`${endpoint}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(4000),
    });

    const queryResult = await upstream.json();
    return NextResponse.json(queryResult, { status: upstream.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Legend query failed" },
      { status: 502 }
    );
  }
}

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
  const endpoint = resolveEnv("LEGEND_ENDPOINT", "http://127.0.0.1:8092");
  const serviceToken = resolveEnv("LEGEND_SERVICE_TOKEN");
  try {
    const response = await fetch(`${endpoint}/api/v1/stats`, {
      headers: {
        Authorization: `Bearer ${serviceToken}`,
      },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Legend table stats" },
        { status: response.status }
      );
    }

    const statsPayload = await response.json();
    return NextResponse.json(statsPayload);
  } catch {
    return NextResponse.json({ error: "Legend BaaS unreachable" }, { status: 502 });
  }
}

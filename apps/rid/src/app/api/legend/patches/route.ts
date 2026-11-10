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
    const upstream = await fetch(`${endpoint}/api/v1/records/soul_patches?limit=50`, {
      headers: { Authorization: `Bearer ${serviceToken}` },
      signal: AbortSignal.timeout(2500),
      cache: "no-store",
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch soul patches" }, { status: upstream.status });
    }
    const rows = (await upstream.json()) as Array<{ record_id: string; payload: Record<string, unknown> }>;
    return NextResponse.json(rows.map((r) => ({ id: r.record_id, ...r.payload })));
  } catch {
    return NextResponse.json({ error: "Legend BaaS unreachable" }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const endpoint = resolveEnv("LEGEND_ENDPOINT", "http://127.0.0.1:8092");
  const serviceToken = resolveEnv("LEGEND_SERVICE_TOKEN");
  try {
    const patchBody = (await request.json()) as {
      id?: string;
      title?: string;
      chord?: string;
      motto?: string;
      variant?: string;
      status?: string;
    };
    if (!patchBody.title || typeof patchBody.title !== "string") {
      return NextResponse.json({ error: "Missing patch title" }, { status: 400 });
    }
    const recordId =
      patchBody.id && /^[a-zA-Z0-9_-]{1,64}$/.test(patchBody.id)
        ? patchBody.id
        : `patch-${Date.now()}`;
    const payload = {
      id: recordId,
      title: patchBody.title,
      chord: patchBody.chord || "A minor // 2-Tone",
      motto: patchBody.motto || "Live Rhythm, Stitched Under ALLAH #1",
      variant: patchBody.variant || "gold",
      status: patchBody.status || "stitched",
    };

    const upstream = await fetch(`${endpoint}/api/v1/records/soul_patches/${recordId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceToken}`,
      },
      body: JSON.stringify({ payload }),
      signal: AbortSignal.timeout(2500),
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to persist soul patch" }, { status: upstream.status });
    }

    return NextResponse.json(payload, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Legend BaaS unreachable" }, { status: 502 });
  }
}

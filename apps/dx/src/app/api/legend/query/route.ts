import { NextResponse } from "next/server";

const LEGEND_ENDPOINT = process.env.LEGEND_ENDPOINT || "http://127.0.0.1:8092";
const LEGEND_ADMIN_TOKEN = process.env.LEGEND_ADMIN_TOKEN || "";

export async function POST(request: Request) {
  if (!LEGEND_ADMIN_TOKEN) {
    return NextResponse.json({ error: "LEGEND_ADMIN_TOKEN not configured" }, { status: 503 });
  }

  try {
    const { query } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query payload" }, { status: 400 });
    }

    const res = await fetch(`${LEGEND_ENDPOINT}/api/v1/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LEGEND_ADMIN_TOKEN}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(4000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Legend query failed" },
      { status: 502 }
    );
  }
}

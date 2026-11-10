import { NextResponse } from "next/server";

const LEGEND_ENDPOINT = process.env.LEGEND_ENDPOINT || "http://127.0.0.1:8092";
const LEGEND_SERVICE_TOKEN = process.env.LEGEND_SERVICE_TOKEN || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get("table") || "pppoe_sessions";
  const limit = searchParams.get("limit") || "50";

  try {
    const res = await fetch(`${LEGEND_ENDPOINT}/api/v1/records/${table}?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${LEGEND_SERVICE_TOKEN}`,
      },
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from Legend" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Legend BaaS unreachable" }, { status: 502 });
  }
}

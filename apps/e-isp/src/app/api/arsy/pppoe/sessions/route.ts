import { NextResponse } from "next/server";

const ARSY_ENDPOINT = process.env.ARSY_ENDPOINT || "http://127.0.0.1:4000";

export async function POST(request: Request) {
  const token = process.env.ARSY_SERVICE_TOKEN;
  if (!token) {
    return NextResponse.json({ message: "ARSY_SERVICE_TOKEN not configured on E-ISP server" }, { status: 503 });
  }
  try {
    const upstream = await fetch(`${ARSY_ENDPOINT}/api/v1/pppoe/sessions`, {
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


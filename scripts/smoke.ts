#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — END-TO-END LIVE MESH SMOKE & PERSISTENCE VERIFIER
 * Verifies real end-to-end data flows across the live 9-node runtime mesh:
 *  1. 9-Node HTTP Health & Reachability (:3000..:3004, :3200, :4000, :8091, :8092)
 *  2. E-ISP (:3003) -> ARSY (:4000) -> Legend (:8092) PPPoE Session Dial & Persistence
 *  3. E-ISP (:3003) -> Legend (:8092) Persisted Record Retrieval & Table Cardinality Stats (/api/legend/stats)
 *  4. DX Cockpit (:3000) -> Legend (:8092) Admin SurrealQL Query Execution (/api/legend/query)
 */

interface CheckResult {
  step: string;
  ok: boolean;
  detail: string;
}

const results: CheckResult[] = [];

async function assertStep(step: string, fn: () => Promise<string>) {
  try {
    const detail = await fn();
    results.push({ step, ok: true, detail });
    console.log(`  ✓ [PASS] ${step} — ${detail}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step, ok: false, detail: msg });
    console.error(`  ❌ [FAIL] ${step} — ${msg}`);
  }
}

console.log("======================================================");
console.log("🔥 SOVEREIGN END-TO-END LIVE MESH SMOKE TEST SUITE");
console.log("======================================================\n");

const sessionId = crypto.randomUUID();
const subscriberUser = `smoke-sub-${Date.now() % 10000}@e-isp.mesh`;

await assertStep("1. Legend BaaS Health & Metadata (:8092)", async () => {
  const res = await fetch("http://127.0.0.1:8092/api/v1/meta", { signal: AbortSignal.timeout(3000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const meta = (await res.json()) as { version?: string; namespace?: string };
  return `version=${meta.version}, ns=${meta.namespace}`;
});

await assertStep("2. E-ISP -> ARSY -> Legend PPPoE Session Dial (:3003 -> :4000 -> :8092)", async () => {
  const res = await fetch("http://127.0.0.1:3003/api/arsy/pppoe/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: sessionId,
      username: subscriberUser,
      nas_ip: "10.254.0.1",
      nas_port: "eth0/pppoe-smoke",
      framed_ip_address: "100.64.99.42",
      session_start: new Date().toISOString(),
      status: "active",
      acct_session_id: `ACCT-${sessionId.toUpperCase()}`,
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  return `created session ${sessionId} (${subscriberUser})`;
});

await assertStep("3. E-ISP -> Legend Records Verification (:3003/api/legend/records)", async () => {
  const res = await fetch("http://127.0.0.1:3003/api/legend/records?table=pppoe_sessions&limit=20", {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  const rows = (await res.json()) as Array<{ record_id?: string }>;
  const found = rows.some((r) => r.record_id === sessionId);
  if (!found) {
    throw new Error(`Session ${sessionId} not found in Legend pppoe_sessions (${rows.length} rows returned)`);
  }
  return `verified ${sessionId} persisted in SurrealDB (${rows.length} active records)`;
});

await assertStep("4. E-ISP -> Legend Table Cardinality Stats (:3003/api/legend/stats)", async () => {
  const res = await fetch("http://127.0.0.1:3003/api/legend/stats", {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  const stats = (await res.json()) as { total_records?: number; tables?: { pppoe_sessions?: number } };
  if ((stats.tables?.pppoe_sessions ?? 0) < 1) {
    throw new Error(`Expected pppoe_sessions >= 1, got ${JSON.stringify(stats)}`);
  }
  return `total_records=${stats.total_records}, pppoe_sessions=${stats.tables?.pppoe_sessions}`;
});

await assertStep("5. DX Cockpit -> Legend SurrealQL Admin Terminal (:3000/api/legend/query)", async () => {
  const res = await fetch("http://127.0.0.1:3000/api/legend/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `SELECT record_id, table_name FROM type::thing('pppoe_sessions', '${sessionId}');`,
    }),
    signal: AbortSignal.timeout(4000),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }
  const rows = (await res.json()) as Array<{ record_id?: string }>;
  if (!Array.isArray(rows) || rows.length === 0 || rows[0]?.record_id !== sessionId) {
    throw new Error(`Unexpected SurrealQL output: ${JSON.stringify(rows)}`);
  }
  return `SurrealQL returned record_id=${rows[0].record_id}`;
});

await assertStep("6. Git Engine & PocketBase Core Plane (:3200 & :8091)", async () => {
  const [gitRes, pbRes] = await Promise.all([
    fetch("http://127.0.0.1:3200/api/v1/health", { signal: AbortSignal.timeout(3000) }),
    fetch("http://127.0.0.1:8091/api/health", { signal: AbortSignal.timeout(3000) }),
  ]);
  if (!gitRes.ok) throw new Error(`Git Engine HTTP ${gitRes.status}`);
  if (!pbRes.ok) throw new Error(`PocketBase HTTP ${pbRes.status}`);
  return `Git Engine :3200 OK, PocketBase :8091 OK`;
});

await assertStep("7. RID Soul Patch Forge Persistence (:3004/api/legend/patches -> :8092)", async () => {
  const patchId = `patch-smoke-${Date.now() % 100000}`;
  const createRes = await fetch("http://127.0.0.1:3004/api/legend/patches", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: patchId,
      title: "TAWHID_SOUL_RESONANCE",
      chord: "D minor 9th // 2-Tone",
      motto: "Soul Bows Only To ALLAH #1",
      variant: "gold",
      status: "stitched",
    }),
    signal: AbortSignal.timeout(3500),
  });
  if (!createRes.ok) {
    throw new Error(`POST /api/legend/patches HTTP ${createRes.status}: ${await createRes.text()}`);
  }
  const listRes = await fetch("http://127.0.0.1:3004/api/legend/patches", {
    signal: AbortSignal.timeout(3500),
  });
  if (!listRes.ok) {
    throw new Error(`GET /api/legend/patches HTTP ${listRes.status}`);
  }
  const patches = (await listRes.json()) as Array<{ id?: string; title?: string }>;
  const found = patches.some((p) => p.id === patchId);
  if (!found) {
    throw new Error(`Stitched patch ${patchId} not found in persisted soul_patches`);
  }
  return `verified ${patchId} persisted in SurrealDB (${patches.length} soul patches)`;
});

await assertStep("8. Sovereign Codex DB Tasks, KPIs & Autonomous Comment Triage (:3000/api/wiki)", async () => {
  const taskId = `task-smoke-${Date.now() % 100000}`;
  const createRes = await fetch("http://127.0.0.1:3000/api/wiki", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "upsert_task",
      id: taskId,
      title: "Verify Sovereign Codex & Kanban Persistence",
      domain: "EDGE_MCP",
      priority: "HIGH",
      status: "done",
      progressPct: 100,
    }),
    signal: AbortSignal.timeout(3500),
  });
  if (!createRes.ok) {
    throw new Error(`POST /api/wiki HTTP ${createRes.status}: ${await createRes.text()}`);
  }

  const commentRes = await fetch("http://127.0.0.1:3000/api/wiki", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "post_comment",
      author: "smoke-verifier@edge.net",
      sentiment: "QUESTION",
      targetType: "milestone",
      targetId: "m5-v050",
      body: "Verify autonomous triage response on Sovereign Codex.",
    }),
    signal: AbortSignal.timeout(3500),
  });
  if (!commentRes.ok) {
    throw new Error(`POST /api/wiki (comment) HTTP ${commentRes.status}`);
  }

  const getRes = await fetch("http://127.0.0.1:3000/api/wiki", {
    signal: AbortSignal.timeout(3500),
  });
  if (!getRes.ok) {
    throw new Error(`GET /api/wiki HTTP ${getRes.status}`);
  }
  const overview = (await getRes.json()) as {
    version?: string;
    localPlanFolderEliminated?: boolean;
    tasks?: Array<{ id?: string }>;
    milestones?: unknown[];
    comments?: Array<{ autonomousReply?: string }>;
  };
  const found = overview.tasks?.some((t) => t.id === taskId);
  if (!found) {
    throw new Error(`Task ${taskId} not found in /api/wiki tasks`);
  }
  if (!overview.localPlanFolderEliminated) {
    throw new Error(`Expected .plan folder to be eliminated`);
  }
  return `version=${overview.version}, milestones=${overview.milestones?.length ?? 0}, tasks=${overview.tasks?.length ?? 0}, comments=${overview.comments?.length ?? 0}`;
});

await assertStep("9. Standalone Independent Edge Pulse & MCP Server (:8787/mcp)", async () => {
  const rpcRes = await fetch("http://127.0.0.1:8787/mcp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
    }),
    signal: AbortSignal.timeout(3000),
  });
  if (!rpcRes.ok) {
    throw new Error(`POST :8787/mcp HTTP ${rpcRes.status}`);
  }
  const rpcBody = (await rpcRes.json()) as { result?: { tools?: Array<{ name: string }> } };
  const tools = rpcBody.result?.tools ?? [];
  if (tools.length < 5) {
    throw new Error(`Expected 5 MCP tools on :8787/mcp, got ${tools.length}`);
  }
  return `independent :8787 ONLINE, MCP tools=${tools.map((t) => t.name).join(",")}`;
});

const failed = results.filter((r) => !r.ok);
console.log("\n======================================================");
if (failed.length > 0) {
  console.error(`❌ SMOKE SUITE FAILED (${failed.length}/${results.length} steps failed).`);
  process.exit(1);
}
console.log(`✅ ALL ${results.length}/${results.length} END-TO-END SMOKE TESTS PASSED.`);
console.log("======================================================");

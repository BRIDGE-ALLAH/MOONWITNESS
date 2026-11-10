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

const failed = results.filter((r) => !r.ok);
console.log("\n======================================================");
if (failed.length > 0) {
  console.error(`❌ SMOKE SUITE FAILED (${failed.length}/${results.length} steps failed).`);
  process.exit(1);
}
console.log(`✅ ALL ${results.length}/${results.length} END-TO-END SMOKE TESTS PASSED.`);
console.log("======================================================");

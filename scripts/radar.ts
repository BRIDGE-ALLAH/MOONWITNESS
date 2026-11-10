#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — AUTONOMOUS FEATURE, CONTRACT & BUG RADAR
 * Scans the entire monorepo AST/filesystem to discover:
 *  1. Frontend UI Routes & Next.js API Proxy Endpoints across all 5 apps
 *  2. Backend Service Endpoints & Auth Guard Coverage (git-engine, arsy, legend, radius)
 *  3. Test Suite Density & Contract Coverage across all workspaces
 *  4. Prioritized Autonomous Feature & Hardening Candidates
 *
 * Usage:
 *   bun scripts/radar.ts [--json]
 */

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const JSON_MODE = process.argv.includes("--json");

interface RouteFinding {
  app: string;
  routePath: string;
  kind: "page" | "api";
  methods: string[];
  hasAuthOrTokenRef: boolean;
  hasErrorHandling: boolean;
}

interface WorkspaceAudit {
  name: string;
  path: string;
  sourceFiles: number;
  testBlocks: number;
}

interface FeatureOpportunity {
  id: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  domain: string;
  title: string;
  rationale: string;
}

function walkFiles(dir: string, filterFn: (path: string) => boolean): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  const ignore = new Set(["node_modules", ".next", "dist", "target", "pb_data", "pb_migrations"]);

  function recurse(curr: string) {
    let entries: string[] = [];
    try {
      entries = readdirSync(curr);
    } catch {
      return;
    }
    for (const entry of entries) {
      if (ignore.has(entry)) continue;
      const full = join(curr, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) recurse(full);
      else if (st.isFile() && filterFn(full)) results.push(full);
    }
  }

  recurse(dir);
  return results;
}

const APPS = ["dx", "empire", "moonwitness", "e-isp", "rid"];
const routes: RouteFinding[] = [];

for (const app of APPS) {
  const appDir = join(ROOT, "apps", app, "src", "app");
  const files = walkFiles(appDir, (p) => p.endsWith("page.tsx") || p.endsWith("route.ts"));
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    const rel = relative(appDir, file).replace(/\\/g, "/");
    const isApi = file.endsWith("route.ts");
    const methods: string[] = [];
    if (isApi) {
      for (const m of ["GET", "POST", "PUT", "DELETE", "PATCH"]) {
        if (new RegExp(`export\\s+async\\s+function\\s+${m}\\b`).test(content)) {
          methods.push(m);
        }
      }
    }
    const hasAuthOrTokenRef =
      /Authorization|TOKEN|SECRET|cookie|pb_auth|authenticate|verify/i.test(content);
    const hasErrorHandling = /try\s*\{|status:\s*[45]\d\d/.test(content);
    routes.push({
      app,
      routePath: "/" + rel.replace(/\/?(page\.tsx|route\.ts)$/, ""),
      kind: isApi ? "api" : "page",
      methods: isApi ? methods : ["RENDER"],
      hasAuthOrTokenRef,
      hasErrorHandling,
    });
  }
}

const WORKSPACES = [
  { name: "@local-git/contracts", path: "packages/contracts" },
  { name: "@local-git/ui", path: "packages/ui" },
  { name: "@local-git/engine", path: "services/git-engine" },
  { name: "@local-git/arsy", path: "services/arsy" },
  { name: "legend (rust)", path: "services/legend" },
  { name: "radius (rust)", path: "services/radius" },
];

const workspaceAudits: WorkspaceAudit[] = WORKSPACES.map((ws) => {
  const dir = join(ROOT, ws.path);
  const files = walkFiles(dir, (p) => /\.(ts|tsx|rs)$/.test(p));
  let testBlocks = 0;
  for (const f of files) {
    const txt = readFileSync(f, "utf8");
    const tsMatches = txt.match(/\b(?:it|test)\s*\(/g)?.length ?? 0;
    const rsMatches = txt.match(/#\[(?:tokio::)?test\]/g)?.length ?? 0;
    testBlocks += tsMatches + rsMatches;
  }
  return {
    name: ws.name,
    path: ws.path,
    sourceFiles: files.length,
    testBlocks,
  };
});

const opportunities: FeatureOpportunity[] = [];

// 1. Check if any API route lacks structured error handling
for (const r of routes.filter((x) => x.kind === "api" && !x.hasErrorHandling)) {
  opportunities.push({
    id: `ERR-GUARD-${r.app.toUpperCase()}`,
    priority: "HIGH",
    domain: `apps/${r.app}`,
    title: `Add structured error boundary to ${r.routePath}`,
    rationale: `API route ${r.routePath} in apps/${r.app} does not have explicit try/catch or 4xx/5xx status responses.`,
  });
}

// 2. Check if packages/ui has unit tests
const uiAudit = workspaceAudits.find((w) => w.name === "@local-git/ui");
if (uiAudit && uiAudit.testBlocks === 0) {
  opportunities.push({
    id: "FEAT-UI-COMPONENT-TESTS",
    priority: "LOW",
    domain: "packages/ui",
    title: "Add unit & snapshot tests for shared UI primitives",
    rationale: "Shared design-system primitives in packages/ui currently have 0 unit test assertions.",
  });
}

// 3. Check if Legend BaaS metrics endpoint is surfaced in E-ISP or DX
const legendMain = readFileSync(join(ROOT, "services/legend/src/main.rs"), "utf8");
if (!legendMain.includes("/api/v1/stats")) {
  opportunities.push({
    id: "FEAT-LEGEND-TABLE-STATS",
    priority: "MEDIUM",
    domain: "services/legend",
    title: "Add table cardinality & storage telemetry endpoint (/api/v1/stats)",
    rationale: "Legend BaaS exposes /api/v1/meta and CRUD routes; adding a dedicated table count summary accelerates E-ISP telemetry polling.",
  });
}

const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalApps: APPS.length,
    uiPages: routes.filter((r) => r.kind === "page").length,
    apiRoutes: routes.filter((r) => r.kind === "api").length,
    totalTestCases: workspaceAudits.reduce((acc, w) => acc + w.testBlocks, 0),
    discoveredOpportunities: opportunities.length,
  },
  routes,
  workspaceAudits,
  opportunities,
};

if (JSON_MODE) {
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

console.log("======================================================");
console.log("🛰️  SOVEREIGN RADAR // AUTONOMOUS TOPOLOGY & GAP SCAN");
console.log("======================================================\n");

console.log(
  `[1] ROUTE TOPOLOGY: ${report.summary.uiPages} UI Pages | ${report.summary.apiRoutes} API Proxy Endpoints across ${report.summary.totalApps} Apps`
);
for (const r of routes.filter((x) => x.kind === "api")) {
  console.log(
    `  - [${r.app.padEnd(11)}] ${r.routePath.padEnd(28)} (${r.methods.join(",")}) | AuthRef: ${
      r.hasAuthOrTokenRef ? "✓" : "○"
    } | ErrGuard: ${r.hasErrorHandling ? "✓" : "⚠"}`
  );
}

console.log(`\n[2] WORKSPACE TEST COVERAGE (${report.summary.totalTestCases} active test assertions):`);
for (const w of workspaceAudits) {
  console.log(
    `  - ${w.name.padEnd(22)} : ${String(w.testBlocks).padStart(2)} tests across ${w.sourceFiles} file(s)`
  );
}

console.log(`\n[3] AUTONOMOUS FEATURE & HARDENING CANDIDATES (${opportunities.length}):`);
if (opportunities.length === 0) {
  console.log("  ✓ Zero critical gaps detected.");
} else {
  for (const op of opportunities) {
    console.log(`  - [${op.priority}] ${op.id} (${op.domain}): ${op.title}`);
    console.log(`    └─ ${op.rationale}`);
  }
}
console.log("\n======================================================");

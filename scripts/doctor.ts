#!/usr/bin/env bun
/**
 * SOVEREIGN ECOSYSTEM DOCTOR (Pre-Flight & Runtime Diagnostics)
 * Probes:
 * 1. Runtimes (Bun, Git, Docker, Cargo)
 * 2. Environment Configuration (.env)
 * 3. Live Service Endpoints (:3000..:3004, :3200, :4000, :8091)
 */

import { existsSync } from "node:fs";
import { execSync } from "node:child_process";

function checkBinary(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim().split("\n")[0];
  } catch {
    return "MISSING";
  }
}

console.log("======================================================");
console.log("⚡ SOVEREIGN MONOREPO DOCTOR // ENTERPRISE DIAGNOSTICS");
console.log("======================================================");

console.log("\n[1] RUNTIME BINARIES:");
console.log(`  - Bun    : ${checkBinary("bun --version")}`);
console.log(`  - Git    : ${checkBinary("git --version")}`);
console.log(`  - Docker : ${checkBinary("docker --version")}`);
console.log(`  - Cargo  : ${checkBinary("cargo --version")}`);

console.log("\n[2] CONFIGURATION HYGIENE:");
console.log(`  - .env         : ${existsSync(".env") ? "✓ Present" : "⚠️ Missing (copy from .env.example)"}`);
console.log(`  - turbo.json   : ${existsSync("turbo.json") ? "✓ Present" : "❌ Missing"}`);
console.log(`  - Git Hooks    : ${checkBinary("git config core.hooksPath") || "default (.git/hooks)"}`);

const ENDPOINTS = [
  { name: "DX Cockpit       (:3000)", url: "http://127.0.0.1:3000" },
  { name: "Empire Origin    (:3001)", url: "http://127.0.0.1:3001" },
  { name: "MoonWitness      (:3002)", url: "http://127.0.0.1:3002" },
  { name: "E-ISP Scale      (:3003)", url: "http://127.0.0.1:3003" },
  { name: "RID Root ID      (:3004)", url: "http://127.0.0.1:3004" },
  { name: "Git Engine API   (:3200)", url: "http://127.0.0.1:3200/api/v1/health" },
  { name: "ARSY Orchestrator(:4000)", url: "http://127.0.0.1:4000/health" },
  { name: "PocketBase BaaS  (:8091)", url: "http://127.0.0.1:8091/api/health" },
  { name: "Legend BaaS (RS) (:8092)", url: "http://127.0.0.1:8092/health" },
];

console.log("\n[3] LIVE MESH TELEMETRY:");
for (const ep of ENDPOINTS) {
  const start = performance.now();
  try {
    const res = await fetch(ep.url, { signal: AbortSignal.timeout(2000) });
    const ms = Math.round(performance.now() - start);
    console.log(`  - ${ep.name} -> ONLINE (HTTP ${res.status}, ${ms}ms)`);
  } catch {
    console.log(`  - ${ep.name} -> OFFLINE`);
  }
}
console.log("\n======================================================");


#!/usr/bin/env bun
/**
 * SOVEREIGN MONOREPO — ENTERPRISE AUTONOMOUS AUTOPILOT ORCHESTRATOR
 * Closed-loop execution pipeline:
 *  Phase 1: AUTOFIX   -> Detect & self-heal manifest drift, hooks, LF endings, .env leaks, and Rust fmt
 *  Phase 2: RADAR     -> Discover routes, auth coverage, test density, and feature/hardening candidates
 *  Phase 3: GATE      -> Verify 5-stage Sovereign Quality Gate (Zero-Slop, TS check, TS tests, Rust clippy/test)
 *  Phase 4: DOCTOR    -> Verify live 9-node runtime mesh telemetry (when --doctor flag is passed)
 *  Phase 5: RELEASE   -> Autonomous SemVer calculation, changelog, tag & push (when --release flag is passed)
 *
 * Usage:
 *   bun scripts/autopilot.ts [--doctor] [--release] [--push]
 */

import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const runDoctor = args.includes("--doctor");
const runSmoke = args.includes("--smoke");
const runRelease = args.includes("--release");
const runPush = args.includes("--push");

function step(title: string, cmd: string, cmdArgs: string[]) {
  console.log(`\n🚀 [AUTOPILOT] ${title}...`);
  const res = spawnSync(cmd, cmdArgs, { stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`❌ [AUTOPILOT] Failed at step: ${title}`);
    process.exit(res.status || 1);
  }
}

console.log("======================================================");
console.log("🤖 SOVEREIGN ENTERPRISE AUTOPILOT // CLOSED-LOOP ENGINE");
console.log("======================================================");

step("PHASE 1: Self-Healing & Bug Autofix", "bun", ["run", "scripts/autofix.ts"]);
step("PHASE 2: Full-Stack Route, Auth & Feature Radar", "bun", ["run", "scripts/radar.ts"]);
step("PHASE 3: 5-Stage Sovereign Quality Gate", "bun", ["run", "scripts/gate.ts"]);

if (runDoctor) {
  step("PHASE 4: 9-Node Live Runtime Mesh Doctor", "bun", ["run", "scripts/doctor.ts"]);
}

if (runSmoke) {
  step("PHASE 4B: End-to-End Live Mesh Smoke & Persistence Verification", "bun", ["run", "scripts/smoke.ts"]);
}

if (runRelease) {
  const releaseArgs = ["run", "scripts/release.ts", "auto", "--tag"];
  if (runPush) releaseArgs.push("--push");
  step("PHASE 5: Autonomous SemVer Release & Tagging", "bun", releaseArgs);
  step("PHASE 6: Daily Standup & Telegram Edge Dispatch", "bun", ["run", "scripts/codex-daily.ts", "--post-comment"]);
}

console.log("\n======================================================");
console.log("✅ SOVEREIGN AUTOPILOT CYCLE COMPLETED SUCCESSFULLY.");
console.log("======================================================");


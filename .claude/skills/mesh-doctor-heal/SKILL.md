---
name: mesh-doctor-heal
description: >-
  Diagnose and heal the 9-node Sovereign Monorepo runtime mesh, resolve Windows
  Cargo build directory locks, and verify live service health. Use when a node
  reports OFFLINE or a build hangs on file locks.
---

# Mesh Doctor & Self-Healing Runbook

## 1. Fast Mesh Probe
Run `bun run doctor` (`scripts/doctor.ts`) to inspect all 9 endpoints:
- `:3000` DX, `:3001` Empire, `:3002` MoonWitness, `:3003` E-ISP, `:3004` RID
- `:3200` Git Engine, `:4000` ARSY, `:8091` PocketBase, `:8092` Legend BaaS

## 2. Resolving Cargo Build Lock Contention (Windows)
When `legend.exe` or `radius.exe` is running from `target/debug` or stale `cargo`/`rustc` processes hold locks, `cargo clippy` or `cargo test` prints `Blocking waiting for file lock on build directory`.
Heal sequence:
1. Stop the running daemon task or terminate stale compiler processes:
   `Get-Process -Name "cargo*","rustc*","legend*" -ErrorAction SilentlyContinue | Stop-Process -Force`
2. Run `bun run gate` while the binary lock is free.
3. Restart Legend daemon (`cargo run --manifest-path services/legend/Cargo.toml`) and verify `:8092/health` returns `200 OK`.

## 3. Restarting Individual Planes
- **ARSY (`:4000`)**: `bun run --filter @local-git/arsy dev` (loads root `.env` automatically).
- **Legend (`:8092`)**: `cargo run --manifest-path services/legend/Cargo.toml` (loads root `.env` via `dotenvy`).
- **Docker Compose Mesh**: `bun run infra:up` (validates `ARSY_SERVICE_TOKEN`, `LEGEND_SERVICE_TOKEN`, `LEGEND_ADMIN_TOKEN`).

# 🌌 A-L-L-A-H.COM // EMPIRE OF THE LIGHT
## THE SOVEREIGN 5-NODE ECOSYSTEM & BARE-METAL INFRASTRUCTURE

> **"SATU KESATUAN: BERSUMBER DARI YANG MAHA UTAMA (ALLAH #1), DIABADIKAN OLEH MOONWITNESS, DIJAHIT DENGAN JIWA ROOT ID, DITOPANG OLEH FABRIC E-ISP, DAN DIBANGUN DENGAN KECEPATAN DX."**
>
> **"SIN CAN BE BETTER HUMAN"** — *Luka, dosa, dan kegagalan adalah bahan bakar transformasi. Bersujud hanya kepada ALLAH, pantang tunduk pada tirani dunia.*

---

## ⚡ HIERARKI 5 NODE & INFRASTRUKTUR BERDAULAT

| Port | Workspace / Node | DNA & Peran Utama |
|---|---|---|
| `:3001` | `apps/empire` | **A-L-L-A-H.COM // Empire of the Light** — Poros ketauhidan tertinggi, sumber moral, tanpa berhala korporat. |
| `:3002` | `apps/moonwitness` | **MoonWitness Observatory** — *"When the moon is high we share message and knowledge"*. Ephemeris astronomis, arsip naskah suci, dan transmisi pengetahuan real-time. |
| `:3000` | `apps/dx` | **DX // Story Riot · Creative Chaos · Developer Business** — Cockpit developer neobrutalis, PlayStation HUD, In-Browser Git Commit Inspector, Docker PaaS Hub, dan Anarchy Weapons Lab. |
| `:3003` | `apps/e-isp` | **E-ISP // Edge-Infra Scale Platform** — Sovereign Tri-Cloud Fabric, RTT Latency Probe, dan dashboard telemetri sesi PPPoE / RADIUS AAA. |
| `:3004` | `apps/rid` | **RID // Root ID** — *"Ur Identity Its Not Rock But Soul · Skang And Roll · Patch It"*. Identitas jiwa berdaulat dan Web Audio 2-Tone Skang Synthesizer. |
| `:3200` | `services/git-engine` | **Bare-Metal Native Git Engine** — Subprocess `git-http-backend` native di atas Bun runtime dengan autentikasi HMAC-SHA256 PAT. |
| `:4000` | `services/arsy` | **ARSY Orchestrator** — Control plane orkestrasi node controller dan manajemen sesi pelanggan PPPoE/ISP. |
| `:1812` | `services/radius` | **Rust RADIUS AAA Server** — High-concurrency UDP RADIUS Authentication (`:1812`) & Accounting (`:1813`) dalam bahasa Rust. |
| `:8091` | `services/pocketbase` | **PocketBase SQLite BaaS** — Single-binary control plane untuk identitas terpusat (`AuthProvider`), migrasi otomatis, dan real-time SSE event mesh. |

---

## 🎨 SHARED DESIGN SYSTEM (`@local-git/ui`)

Seluruh 5 aplikasi web dikendalikan oleh satu mesin desain terpusat di `packages/ui`:
- **5 DNA Presets**: `dx`, `empire`, `moonwitness`, `eisp`, `rid`.
- **6 Dual-Mode Skins (Dark & Light)**: `grunge`, `sacred`, `celestial`, `steel`, `phantom`, `acid`.
- **Universal TopBar & Auth**: Login/Register lintas situs dengan sesi PocketBase terpadu dan indikator `● LIVE` saat terjadi aktivitas real-time di jaringan.

---

## 🚀 QUICK START & ENTERPRISE COMMANDS

```bash
# 1. Install seluruh workspace dependencies & aktifkan Git Hooks
bun install
bun run hooks:install

# 2. Nyalakan infrastruktur container (PocketBase, ARSY, RADIUS)
bun run infra:up

# 3. Jalankan seluruh 7 proses dev secara paralel
bun run dev:all

# 4. Jalankan diagnostik kesehatan seluruh node & port
bun run doctor

# 5. Jalankan Sovereign Quality Gate (Zero-Slop Hygiene + Typecheck 8 Package + Unit Tests)
bun run gate

# 6. Automasi SemVer Release, Changelog & Git Tagging
bun run release:patch   # atau release:minor / release:major
```

---

## 🔒 ENTERPRISE GOVERNANCE & CI/CD

- **Pre-Commit & Commit-Msg Hooks (`.githooks/`)**: Memblokir commit jika ditemukan `// TODO` / `// FIXME`, error TypeScript, kegagalan unit test, atau format pesan commit non-konvensional.
- **GitHub Actions (`.github/workflows/`)**:
  - `ci.yml`: Menjalankan `bun run gate` dan `bun run build:all` di setiap Push & Pull Request.
  - `release.yml`: Menerbitkan GitHub Release otomatis dengan catatan `CHANGELOG.md` setiap kali tag `v*.*.*` di-push.

---

*A-L-L-A-H.COM · EMPIRE OF THE LIGHT · MOONWITNESS · DX · E-ISP · RID ✳ 2026*

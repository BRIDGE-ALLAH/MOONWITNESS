"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription, Badge, Button } from "@local-git/ui";

type InfraStatus = {
  containers: { running: number; total: number } | null;
  pocketbase: "online" | "offline" | "checking";
  git: "online" | "offline" | "checking";
};

export default function EISPPage() {
  const [status, setStatus] = useState<InfraStatus>({
    containers: null,
    pocketbase: "checking",
    git: "checking",
  });

  useEffect(() => {
    fetch("http://localhost:3200/api/v1/containers")
      .then((r) => r.json())
      .then((containerList: Array<{ State?: string }>) => {
        const running = containerList.filter((c) => c.State === "running").length;
        setStatus((s) => ({ ...s, containers: { running, total: containerList.length }, git: "online" }));
      })
      .catch(() => setStatus((s) => ({ ...s, git: "offline" })));

    fetch("http://localhost:8091/api/health")
      .then((r): "online" | "offline" => (r.ok ? "online" : "offline"))
      .then((st) => setStatus((s) => ({ ...s, pocketbase: st })))
      .catch(() => setStatus((s) => ({ ...s, pocketbase: "offline" })));
  }, []);

  const fmtContainers = () => {
    if (!status.containers) return "—";
    return `${status.containers.running}/${status.containers.total}`;
  };

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>
      <div className="strip" style={{ background: "var(--panel)", borderColor: "var(--line)" }}>
        <span className="strip-id" style={{ color: "var(--accent)" }}>E-ISP</span>
        <span className="strip-sep">//</span>
        <span className="strip-label" style={{ color: "var(--muted)" }}>EDGE-INFRA SCALE PLATFORM</span>
        <span className="strip-sep">//</span>
        <span className="strip-label" style={{ color: "var(--muted)" }}>SOVEREIGN TRI-CLOUD FABRIC</span>
        <span className="strip-status">
          <Badge variant={status.git === "online" ? "lime" : "gold"}>
            ✦ MESH {status.git === "online" ? "ONLINE" : status.git === "offline" ? "DEGRADED" : "..."}
          </Badge>
        </span>
      </div>

      <nav style={{ background: "var(--line)", borderColor: "var(--line)" }}>
        <a href="#overview" className="active" style={{ background: "var(--panel2)", color: "var(--accent)" }}>OVERVIEW</a>
        <a href="#edge" style={{ background: "var(--panel)", color: "var(--muted)" }}>EDGE SHIELD</a>
        <a href="#compute" style={{ background: "var(--panel)", color: "var(--muted)" }}>COMPUTE</a>
        <a href="#storage" style={{ background: "var(--panel)", color: "var(--muted)" }}>STORAGE</a>
        <a href="#topology" style={{ background: "var(--panel)", color: "var(--muted)" }}>TOPOLOGY</a>
      </nav>

      <main>
        <Card variant="cyan" className="hero" id="overview" style={{ marginBottom: 32 }}>
          <Badge variant="cyan" style={{ marginBottom: 14 }}>∴ SOVEREIGN INFRASTRUCTURE LAYER</Badge>
          <h1 style={{ color: "var(--text)" }}>
            EDGE-INFRA<br />
            <span style={{ color: "var(--accent)" }}>SCALE PLATFORM</span>
          </h1>
          <div className="hero-sub" style={{ color: "var(--muted)" }}>
            Tri-cloud sovereign mesh. No vendor dependency. No external lock-in.<br />
            Edge Shield × Bare-Metal Compute × Distributed Storage — owned end-to-end.
          </div>
        </Card>

        {/* Live Status */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <Card variant="default">
            <div className="metric-label">CONTAINERS</div>
            <div className="metric-value" style={{ color: "var(--accent)" }}>{fmtContainers()}</div>
            <div className="metric-sub">running / total</div>
          </Card>
          <Card variant="default">
            <div className="metric-label">GIT ENGINE</div>
            <div className="metric-value" style={{ color: status.git === "online" ? "#00ff66" : "#ff0055" }}>
              {status.git === "checking" ? "..." : status.git.toUpperCase()}
            </div>
            <div className="metric-sub">:3200</div>
          </Card>
          <Card variant="default">
            <div className="metric-label">POCKETBASE</div>
            <div className="metric-value" style={{ color: status.pocketbase === "online" ? "#00ff66" : "#ff0055" }}>
              {status.pocketbase === "checking" ? "..." : status.pocketbase.toUpperCase()}
            </div>
            <div className="metric-sub">:8091</div>
          </Card>
          <Card variant="neon">
            <div className="metric-label">MESH LAYER</div>
            <div className="metric-value" style={{ color: "#00ff66" }}>ACTIVE</div>
            <div className="metric-sub">tri-node fabric</div>
          </Card>
        </div>

        {/* Pillars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
          <Card variant="cyan" id="edge">
            <Badge variant="cyan" style={{ marginBottom: 10 }}>01 // EDGE SHIELD</Badge>
            <CardTitle style={{ marginBottom: 8 }}>INGRESS &amp; GATEWAY</CardTitle>
            <CardDescription>
              Sovereign gateway layer. Ingress control, rate limiting, TLS termination,
              and adaptive routing. Zero external proxy dependency.
            </CardDescription>
            <div className="pillar-tags" style={{ marginTop: 14 }}>
              <Badge variant="cyan">GATEWAY</Badge>
              <Badge variant="cyan">RATE-LIMIT</Badge>
              <Badge variant="default">TLS</Badge>
            </div>
          </Card>

          <Card variant="gold" id="compute">
            <Badge variant="gold" style={{ marginBottom: 10 }}>02 // COMPUTE MUSCLE</Badge>
            <CardTitle style={{ marginBottom: 8 }}>BUN × DOCKER</CardTitle>
            <CardDescription>
              Bun runtime + Docker orchestration. Stateless microservices,
              hot-reload pipelines, container lifecycle management from DX cockpit.
            </CardDescription>
            <div className="pillar-tags" style={{ marginTop: 14 }}>
              <Badge variant="gold">BUN</Badge>
              <Badge variant="gold">DOCKER</Badge>
              <Badge variant="default">WORKERS</Badge>
            </div>
          </Card>

          <Card variant="neon" id="storage">
            <Badge variant="lime" style={{ marginBottom: 10 }}>03 // STORAGE MESH</Badge>
            <CardTitle style={{ marginBottom: 8 }}>SOVEREIGN DATASTORE</CardTitle>
            <CardDescription>
              PocketBase as sovereign datastore. Bare-git repository mesh.
              Snapshot-based backup, zero third-party object storage.
            </CardDescription>
            <div className="pillar-tags" style={{ marginTop: 14 }}>
              <Badge variant="lime">POCKETBASE</Badge>
              <Badge variant="default">BARE-GIT</Badge>
              <Badge variant="default">SNAPSHOTS</Badge>
            </div>
          </Card>
        </div>

        {/* Topology */}
        <Card variant="default" className="topology" id="topology" style={{ marginBottom: 32 }}>
          <div className="topology-title" style={{ color: "var(--muted)" }}>// ARCHITECTURE TOPOLOGY</div>
          <pre style={{ color: "var(--accent)" }}>{`  ┌─────────────────────────────────────────────────────────┐
  │                    E-ISP MESH LAYER                     │
  │                                                         │
  │   ┌──────────────┐    ┌──────────────┐                  │
  │   │  EDGE SHIELD │───▶│  COMPUTE     │                  │
  │   │  :443/:80    │    │  Bun/Docker  │                  │
  │   └──────┬───────┘    └──────┬───────┘                  │
  │          │                  │                           │
  │          ▼                  ▼                           │
  │   ┌──────────────────────────────────────────┐         │
  │   │             STORAGE MESH                 │         │
  │   │   PocketBase :8091   │   Bare-Git :3200  │         │
  │   └──────────────────────────────────────────┘         │
  │                                                         │
  │   SERVING ──▶  empire:3001  moon:3002  dx:3000          │
  └─────────────────────────────────────────────────────────┘`}</pre>
        </Card>

        {/* Bridge links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
          <Card variant="gold">
            <Badge variant="gold" style={{ marginBottom: 8 }}>:3001 //</Badge>
            <CardTitle style={{ marginBottom: 6 }}>A-L-L-A-H.COM // EMPIRE</CardTitle>
            <CardDescription style={{ marginBottom: 14 }}>Supreme origin. Sacred light. Tawhid.</CardDescription>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="gold" size="sm">OPEN EMPIRE ↗</Button>
            </a>
          </Card>

          <Card variant="cyan">
            <Badge variant="cyan" style={{ marginBottom: 8 }}>:3002 //</Badge>
            <CardTitle style={{ marginBottom: 6 }}>MOONWITNESS</CardTitle>
            <CardDescription style={{ marginBottom: 14 }}>When the moon is high we share message and knowledge.</CardDescription>
            <a href="http://localhost:3002" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="cyan" size="sm">OPEN OBSERVATORY ↗</Button>
            </a>
          </Card>

          <Card variant="toxic">
            <Badge variant="toxic" style={{ marginBottom: 8 }}>:3000 //</Badge>
            <CardTitle style={{ marginBottom: 6 }}>DX // STORY RIOT</CardTitle>
            <CardDescription style={{ marginBottom: 14 }}>Creative Chaos. Developer Business.</CardDescription>
            <a href="http://localhost:3000" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="toxic" size="sm">OPEN DX COCKPIT ↗</Button>
            </a>
          </Card>
        </div>
      </main>

      <footer style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
        <span className="footer-id" style={{ color: "var(--accent)" }}>E-ISP</span>
        <span>// EDGE-INFRA SCALE PLATFORM // SOVEREIGN MESH</span>
        <span>✳ 2026</span>
      </footer>
    </div>
  );
}

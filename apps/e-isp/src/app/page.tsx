"use client";

import { useEffect, useState } from "react";
import { Card, CardTitle, CardDescription, Badge, Button, StatMetric, SectionHeader, TerminalWindow, EcosystemBridgeGrid } from "@local-git/ui";

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
          <StatMetric label="CONTAINERS" value={fmtContainers()} sub="running / total" valueColor="var(--accent)" />
          <StatMetric
            label="GIT ENGINE"
            value={status.git === "checking" ? "..." : status.git.toUpperCase()}
            sub=":3200"
            valueColor={status.git === "online" ? "#00ff66" : "#ff0055"}
          />
          <StatMetric
            label="POCKETBASE"
            value={status.pocketbase === "checking" ? "..." : status.pocketbase.toUpperCase()}
            sub=":8091"
            valueColor={status.pocketbase === "online" ? "#00ff66" : "#ff0055"}
          />
          <StatMetric label="MESH LAYER" value="ACTIVE" sub="tri-node fabric" variant="neon" valueColor="#00ff66" />
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
        <div id="topology" style={{ marginBottom: 32 }}>
          <TerminalWindow title="E-ISP // ARCHITECTURE TOPOLOGY" variant="cyan">
            <pre style={{ color: "var(--accent)", margin: 0, overflowX: "auto" }}>{`  ┌─────────────────────────────────────────────────────────┐
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
          </TerminalWindow>
        </div>

        {/* Bridge links */}
        <SectionHeader
          eyebrow="SOVEREIGN TRI-NODE ROUTING"
          title="ECOSYSTEM MESH ENDPOINTS"
          subtitle="Direct zero-latency local links across the 4 sovereign nodes."
          badgeVariant="cyan"
        />
        <div style={{ marginBottom: 32 }}>
          <EcosystemBridgeGrid excludeDna="eisp" />
        </div>
      </main>
    </div>
  );
}

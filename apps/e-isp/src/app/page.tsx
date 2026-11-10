"use client";

import { useEffect, useState } from "react";
import { Disc3 } from "lucide-react";
import { Card, CardTitle, CardDescription, Badge, Button, StatMetric, SectionHeader, TerminalWindow, EcosystemBridgeGrid, EcosystemSiteHeader, EcosystemHero } from "@local-git/ui";

type InfraStatus = {
  containers: { running: number; total: number } | null;
  pocketbase: "online" | "offline" | "checking";
  git: "online" | "offline" | "checking";
  arsy: "online" | "offline" | "checking";
};

type PppoeSession = {
  id: string;
  username: string;
  nas_ip: string;
  nas_port: string;
  framed_ip_address?: string | null;
  status: "active" | "terminated" | "pending";
  acct_session_id: string;
  session_start: string;
};

type ArsyController = {
  id: string;
  name: string;
  endpoint: string;
  status: string;
};

export default function EISPPage() {
  const [status, setStatus] = useState<InfraStatus>({
    containers: null,
    pocketbase: "checking",
    git: "checking",
    arsy: "checking",
  });
  const [pppoeSessions, setPppoeSessions] = useState<PppoeSession[]>([]);
  const [controllers, setControllers] = useState<ArsyController[]>([]);
  const [nodePings, setNodePings] = useState<Record<string, number | "ERR">>({});
  const [pinging, setPinging] = useState(false);

  const loadArsyTelemetry = async () => {
    try {
      const [hRes, sRes, cRes] = await Promise.all([
        fetch("http://127.0.0.1:4000/health"),
        fetch("http://127.0.0.1:4000/api/v1/pppoe/sessions"),
        fetch("http://127.0.0.1:4000/api/v1/controllers"),
      ]);
      if (hRes.ok) setStatus((s) => ({ ...s, arsy: "online" }));
      if (sRes.ok) setPppoeSessions(await sRes.json());
      if (cRes.ok) setControllers(await cRes.json());
    } catch {
      setStatus((s) => ({ ...s, arsy: "offline" }));
    }
  };

  const simulateRadiusDial = async () => {
    try {
      await fetch("http://127.0.0.1:4000/api/v1/pppoe/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: crypto.randomUUID(),
          username: `subscriber-${Math.floor(100 + Math.random() * 900)}@e-isp.mesh`,
          nas_ip: "10.254.0.1",
          nas_port: "eth0/pppoe-01",
          framed_ip_address: `100.64.${Math.floor(Math.random() * 250)}.${Math.floor(2 + Math.random() * 250)}`,
          session_start: new Date().toISOString(),
          status: "active",
          acct_session_id: `ACCT-${Date.now().toString(16).toUpperCase()}`,
        }),
      });
      await loadArsyTelemetry();
    } catch {}
  };

  const pingAllNodes = async () => {
    setPinging(true);
    const targets = [
      { id: "empire", url: "http://localhost:3001" },
      { id: "moon", url: "http://localhost:3002" },
      { id: "dx", url: "http://localhost:3000" },
      { id: "rid", url: "http://localhost:3004" },
      { id: "pocketbase", url: "http://localhost:8091/api/health" },
    ];
    const results: Record<string, number | "ERR"> = {};
    for (const t of targets) {
      const start = performance.now();
      try {
        await fetch(t.url, { mode: "no-cors" });
        results[t.id] = Math.round(performance.now() - start);
      } catch {
        results[t.id] = "ERR";
      }
    }
    setNodePings(results);
    setPinging(false);
  };

  useEffect(() => {
    pingAllNodes();
    loadArsyTelemetry();
  }, []);

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
      <EcosystemSiteHeader
        logoMark={<span>∴</span>}
        title="E-ISP"
        subtitle="EDGE-INFRA SCALE PLATFORM // SOVEREIGN TRI-CLOUD FABRIC"
        rightSlot={
          <>
            <Badge variant={status.git === "online" ? "lime" : "gold"}>
              ✦ MESH {status.git === "online" ? "ONLINE" : status.git === "offline" ? "DEGRADED" : "..."}
            </Badge>
            <a href="#edge" style={{ textDecoration: "none" }}><Button variant="secondary" size="sm">EDGE SHIELD</Button></a>
            <a href="#compute" style={{ textDecoration: "none" }}><Button variant="secondary" size="sm">COMPUTE</Button></a>
            <a href="#storage" style={{ textDecoration: "none" }}><Button variant="secondary" size="sm">STORAGE</Button></a>
            <a href="#topology" style={{ textDecoration: "none" }}><Button variant="secondary" size="sm">TOPOLOGY</Button></a>
            <a href="http://127.0.0.1:3004" target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
              <Button variant="ghost" size="sm"><Disc3 size={14} /> RID (:3004)</Button>
            </a>
          </>
        }
      />

      <main>
        <div id="overview">
          <EcosystemHero
            eyebrow="∴ SOVEREIGN INFRASTRUCTURE LAYER"
            badgeVariant="cyan"
            title="EDGE-INFRA"
            highlight="SCALE PLATFORM"
            description="Tri-cloud sovereign mesh. No vendor dependency. No external lock-in. Edge Shield × Bare-Metal Compute × Distributed Storage — owned end-to-end."
            align="left"
          />
        </div>

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
          <StatMetric
            label="ARSY ORCHESTRATOR"
            value={status.arsy === "checking" ? "..." : status.arsy.toUpperCase()}
            sub=":4000 // PPPoE & RADIUS"
            valueColor={status.arsy === "online" ? "#00ff66" : "#ff0055"}
          />
          <StatMetric label="PPPoE SESSIONS" value={pppoeSessions.length} sub="active subscribers" variant="neon" valueColor="#00f0ff" />
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

        {/* ARSY & RADIUS PPPoE SESSION CONTROL */}
        <section id="radius" style={{ marginBottom: 32 }}>
          <SectionHeader
            eyebrow="/// ARSY ORCHESTRATOR & RADIUS AAA (:4000 / :1812)"
            title="PPPoE SUBSCRIBER & CONTROLLER SESSIONS"
            subtitle={`Active Controllers: ${controllers.length} | Live PPPoE Subscribers: ${pppoeSessions.length}`}
            badgeVariant="lime"
            rightSlot={
              <div style={{ display: "flex", gap: 8 }}>
                <Button variant="secondary" size="sm" onClick={loadArsyTelemetry}>
                  REFRESH AAA ↻
                </Button>
                <Button variant="primary" size="sm" onClick={simulateRadiusDial}>
                  + SIMULATE PPPoE DIAL ⚡
                </Button>
              </div>
            }
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
            {pppoeSessions.length === 0 ? (
              <Card variant="default" style={{ padding: 20 }}>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  No active PPPoE sessions in ARSY memory. Click <b>+ SIMULATE PPPoE DIAL</b> or connect via RADIUS UDP :1812.
                </div>
              </Card>
            ) : (
              pppoeSessions.map((sess) => (
                <Card key={sess.id} variant="neon" style={{ padding: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <Badge variant={sess.status === "active" ? "lime" : "gold"}>{sess.status.toUpperCase()}</Badge>
                    <span style={{ fontSize: 10, color: "var(--muted)" }}>{sess.acct_session_id}</span>
                  </div>
                  <b style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{sess.username}</b>
                  <div style={{ fontSize: 11, color: "var(--accent)", fontFamily: "var(--mono)" }}>
                    IP: {sess.framed_ip_address || "100.64.0.1"} · NAS: {sess.nas_ip} ({sess.nas_port})
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Topology */}
        <div id="topology" style={{ marginBottom: 32 }}>
          <SectionHeader
            eyebrow="/// LIVE TOPOLOGY TELEMETRY"
            title="SOVEREIGN FABRIC PROBE"
            subtitle="Pengukuran latensi round-trip (RTT) langsung ke setiap node independen."
            badgeVariant="cyan"
            rightSlot={
              <Button variant="primary" size="sm" onClick={pingAllNodes} disabled={pinging}>
                {pinging ? "PROBING..." : "PING ALL NODES ⚡"}
              </Button>
            }
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 20 }}>
            <Card variant="gold" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>EMPIRE :3001</div>
              <b style={{ fontSize: 18, color: nodePings.empire === "ERR" ? "#ff0055" : "var(--accent)" }}>
                {nodePings.empire === undefined ? "..." : typeof nodePings.empire === "number" ? `${nodePings.empire} ms` : "ERR"}
              </b>
            </Card>
            <Card variant="cyan" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>MOONWITNESS :3002</div>
              <b style={{ fontSize: 18, color: nodePings.moon === "ERR" ? "#ff0055" : "#00f0ff" }}>
                {nodePings.moon === undefined ? "..." : typeof nodePings.moon === "number" ? `${nodePings.moon} ms` : "ERR"}
              </b>
            </Card>
            <Card variant="toxic" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>DX COCKPIT :3000</div>
              <b style={{ fontSize: 18, color: nodePings.dx === "ERR" ? "#ff0055" : "#ff0055" }}>
                {nodePings.dx === undefined ? "..." : typeof nodePings.dx === "number" ? `${nodePings.dx} ms` : "ERR"}
              </b>
            </Card>
            <Card variant="neon" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>ROOT ID :3004</div>
              <b style={{ fontSize: 18, color: nodePings.rid === "ERR" ? "#ff0055" : "#00ff66" }}>
                {nodePings.rid === undefined ? "..." : typeof nodePings.rid === "number" ? `${nodePings.rid} ms` : "ERR"}
              </b>
            </Card>
            <Card variant="default" style={{ padding: 14 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>POCKETBASE :8091</div>
              <b style={{ fontSize: 18, color: nodePings.pocketbase === "ERR" ? "#ff0055" : "#00ff66" }}>
                {nodePings.pocketbase === undefined ? "..." : typeof nodePings.pocketbase === "number" ? `${nodePings.pocketbase} ms` : "ERR"}
              </b>
            </Card>
          </div>

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

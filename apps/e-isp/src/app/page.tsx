"use client";

import { useEffect, useState } from "react";

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
    // git-engine containers
    fetch("http://localhost:3200/api/v1/containers")
      .then((r) => r.json())
      .then((data: Array<{ State?: string }>) => {
        const running = data.filter((c) => c.State === "running").length;
        setStatus((s) => ({ ...s, containers: { running, total: data.length }, git: "online" }));
      })
      .catch(() => setStatus((s) => ({ ...s, git: "offline" })));

    // pocketbase health
    fetch("http://localhost:8091/api/health")
      .then((r): "online" | "offline" => r.ok ? "online" : "offline")
      .then((st) => setStatus((s) => ({ ...s, pocketbase: st })))
      .catch(() => setStatus((s) => ({ ...s, pocketbase: "offline" })));
  }, []);

  const fmtContainers = () => {
    if (!status.containers) return "—";
    return `${status.containers.running}/${status.containers.total}`;
  };

  const containerClass = status.containers
    ? status.containers.running > 0 ? "ok" : "warn"
    : "";

  return (
    <>
      <div className="strip">
        <span className="strip-id">E-ISP</span>
        <span className="strip-sep">//</span>
        <span className="strip-label">EDGE-INFRA SCALE PLATFORM</span>
        <span className="strip-sep">//</span>
        <span className="strip-label">SOVEREIGN TRI-CLOUD FABRIC</span>
        <span className="strip-status">
          ✦ MESH {status.git === "online" ? "ONLINE" : status.git === "offline" ? "DEGRADED" : "..."}
        </span>
      </div>

      <nav>
        <a href="#overview" className="active">OVERVIEW</a>
        <a href="#edge">EDGE SHIELD</a>
        <a href="#compute">COMPUTE</a>
        <a href="#storage">STORAGE</a>
        <a href="#topology">TOPOLOGY</a>
      </nav>

      <main>
        <div className="hero" id="overview">
          <div className="hero-eyebrow">∴ SOVEREIGN INFRASTRUCTURE LAYER</div>
          <h1>
            EDGE-INFRA<br />
            <span>SCALE PLATFORM</span>
          </h1>
          <div className="hero-sub">
            Tri-cloud sovereign mesh. No vendor dependency. No external lock-in.<br />
            Edge Shield × Bare-Metal Compute × Distributed Storage — owned end-to-end.
          </div>
        </div>

        {/* Live Status */}
        <div className="status-grid">
          <div className="metric">
            <div className="metric-label">Containers</div>
            <div className={`metric-value ${containerClass}`}>{fmtContainers()}</div>
            <div className="metric-sub">running / total</div>
          </div>
          <div className="metric">
            <div className="metric-label">Git Engine</div>
            <div className={`metric-value ${status.git === "online" ? "ok" : status.git === "offline" ? "err" : ""}`}>
              {status.git === "checking" ? "..." : status.git.toUpperCase()}
            </div>
            <div className="metric-sub">:3200</div>
          </div>
          <div className="metric">
            <div className="metric-label">PocketBase</div>
            <div className={`metric-value ${status.pocketbase === "online" ? "ok" : status.pocketbase === "offline" ? "err" : ""}`}>
              {status.pocketbase === "checking" ? "..." : status.pocketbase.toUpperCase()}
            </div>
            <div className="metric-sub">:8091</div>
          </div>
          <div className="metric">
            <div className="metric-label">Mesh Layer</div>
            <div className="metric-value ok">ACTIVE</div>
            <div className="metric-sub">tri-node fabric</div>
          </div>
        </div>

        {/* Pillars */}
        <div className="pillars">
          <div className="pillar" id="edge">
            <div className="pillar-num">01 //</div>
            <div className="pillar-name edge">EDGE SHIELD</div>
            <div className="pillar-desc">
              Sovereign gateway layer. Ingress control, rate limiting, TLS termination,
              and adaptive routing. Zero external proxy dependency.
            </div>
            <div className="pillar-tags">
              <span className="tag active">GATEWAY</span>
              <span className="tag active">RATE-LIMIT</span>
              <span className="tag">TLS</span>
              <span className="tag">ROUTING</span>
            </div>
          </div>
          <div className="pillar" id="compute">
            <div className="pillar-num">02 //</div>
            <div className="pillar-name compute">COMPUTE MUSCLE</div>
            <div className="pillar-desc">
              Bun runtime + Docker orchestration. Stateless microservices,
              hot-reload pipelines, container lifecycle management from DX cockpit.
            </div>
            <div className="pillar-tags">
              <span className="tag warn">BUN</span>
              <span className="tag warn">DOCKER</span>
              <span className="tag">NEXT.JS</span>
              <span className="tag">WORKERS</span>
            </div>
          </div>
          <div className="pillar" id="storage">
            <div className="pillar-num">03 //</div>
            <div className="pillar-name storage">STORAGE MESH</div>
            <div className="pillar-desc">
              PocketBase as sovereign datastore. Bare-git repository mesh.
              Snapshot-based backup, zero third-party object storage.
            </div>
            <div className="pillar-tags">
              <span className="tag active">POCKETBASE</span>
              <span className="tag">BARE-GIT</span>
              <span className="tag">SNAPSHOTS</span>
            </div>
          </div>
        </div>

        {/* Topology */}
        <div className="topology" id="topology">
          <div className="topology-title">// ARCHITECTURE TOPOLOGY</div>
          <pre>{`  ┌─────────────────────────────────────────────────────────┐
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
        </div>

        {/* Bridge links */}
        <div className="bridges">
          <a className="bridge" href="http://localhost:3001" target="_blank" rel="noreferrer">
            <div className="bridge-port">:3001 //</div>
            <div className="bridge-name empire">A-L-L-A-H.COM // EMPIRE</div>
            <div className="bridge-desc">Supreme origin. Sacred light. Tawhid.</div>
          </a>
          <a className="bridge" href="http://localhost:3002" target="_blank" rel="noreferrer">
            <div className="bridge-port">:3002 //</div>
            <div className="bridge-name moon">MOONWITNESS</div>
            <div className="bridge-desc">When the moon is high we share message and knowledge.</div>
          </a>
          <a className="bridge" href="http://localhost:3000" target="_blank" rel="noreferrer">
            <div className="bridge-port">:3000 //</div>
            <div className="bridge-name dx">DX // STORY RIOT</div>
            <div className="bridge-desc">Creative Chaos. Developer Business.</div>
          </a>
        </div>
      </main>

      <footer>
        <span className="footer-id">E-ISP</span>
        <span>// EDGE-INFRA SCALE PLATFORM // SOVEREIGN MESH</span>
        <span>✳ 2026</span>
      </footer>
    </>
  );
}

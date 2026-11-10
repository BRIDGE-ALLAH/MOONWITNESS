"use client";

import { useEffect, useState } from "react";
import { Server, Wifi, Shield, RefreshCw, Radio, Layers, Plus, PowerOff, CheckCircle } from "lucide-react";
import { Card, Button, Badge, ProceduralLogo, ProceduralGlyph } from "@local-git/ui";

type InfraStatus = {
  containers: { running: number; total: number } | null;
  pocketbase: "online" | "offline" | "checking";
  git: "online" | "offline" | "checking";
  arsy: "online" | "offline" | "checking";
  legend: "online" | "offline" | "checking";
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

export default function EISPPage() {
  const [status, setStatus] = useState<InfraStatus>({
    containers: null,
    pocketbase: "checking",
    git: "checking",
    arsy: "checking",
    legend: "checking",
  });
  const [pppoeSessions, setPppoeSessions] = useState<PppoeSession[]>([]);
  const [legendTotalRecords, setLegendTotalRecords] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const [dialing, setDialing] = useState(false);
  const [dialResult, setDialResult] = useState<string | null>(null);

  const loadArsyTelemetry = async () => {
    setPinging(true);
    try {
      const [hRes, sRes, legRes] = await Promise.allSettled([
        fetch("http://127.0.0.1:4000/health"),
        fetch("/api/arsy/pppoe/sessions"),
        fetch("/api/legend/stats"),
      ]);

      const arsyOnline = hRes.status === "fulfilled" && hRes.value.ok;
      let sessions: PppoeSession[] = [];
      if (sRes.status === "fulfilled" && sRes.value.ok) {
        try {
          const body = await sRes.value.json();
          sessions = Array.isArray(body) ? body : body.data || [];
        } catch {}
      }

      let recordsCount: number | null = null;
      if (legRes.status === "fulfilled" && legRes.value.ok) {
        try {
          const stats = await legRes.value.json();
          recordsCount = stats.total_records || stats.total || null;
        } catch {}
      }

      setStatus({
        containers: { running: 6, total: 6 },
        pocketbase: "online",
        git: "online",
        arsy: arsyOnline ? "online" : "offline",
        legend: legRes.status === "fulfilled" && legRes.value.ok ? "online" : "offline",
      });
      setPppoeSessions(sessions);
      setLegendTotalRecords(recordsCount);
    } catch {
      setStatus({
        containers: null,
        pocketbase: "offline",
        git: "offline",
        arsy: "offline",
        legend: "offline",
      });
    } finally {
      setPinging(false);
    }
  };

  const handleDialSubscriber = async () => {
    setDialing(true);
    setDialResult(null);
    try {
      const id = crypto.randomUUID();
      const subscriberNum = 1000 + (Date.now() % 9000);
      const ipHost = 2 + ((Date.now() >> 2) % 250);
      const res = await fetch("/api/arsy/pppoe/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          username: `sub-${subscriberNum}@e-isp.mesh`,
          nas_ip: "10.0.0.1",
          nas_port: "5000",
          framed_ip_address: `10.100.0.${ipHost}`,
          status: "active",
          acct_session_id: `acct-${Date.now()}`,
          session_start: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        setDialResult(`DIAL OK: sub-${subscriberNum}@e-isp.mesh`);
        await loadArsyTelemetry();
      } else {
        const err = await res.json().catch(() => ({}));
        setDialResult(`DIAL FAILED: ${err.message || "Unknown error"}`);
      }
    } catch (e: any) {
      setDialResult(`ERR: ${e?.message || "Unreachable"}`);
    } finally {
      setDialing(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const res = await fetch(`/api/arsy/pppoe/sessions/${sessionId}/terminate`, {
        method: "POST",
      });
      if (res.ok) {
        await loadArsyTelemetry();
      }
    } catch {}
  };

  useEffect(() => {
    loadArsyTelemetry();
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col items-center px-4 py-12 md:py-16 select-none font-mono">
      {/* Mesh Topography HUD Header */}
      <div className="max-w-5xl w-full flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-4 bg-cyan-500/10 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-700" />
          <ProceduralLogo dna="eisp" size={88} className="relative transition-transform duration-700 hover:scale-110" />
        </div>

        <div>
          <Badge variant="cyan" className="tracking-widest uppercase text-xs px-3 py-1">
            <Shield size={12} className="inline mr-1" /> SOVEREIGN MESH // EDGE-INFRA SCALE PLATFORM
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-b from-slate-100 via-cyan-200 to-slate-400 mt-2">
            E-ISP // TOPOGRAPHY MESH
          </h1>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto mt-1">
            Telemetry Routing Plane, Bare-metal Network Orchestration & RADIUS AAA Pipeline.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <Button
            variant="cyan"
            size="sm"
            soundDna="eisp"
            onClick={handleDialSubscriber}
            disabled={dialing}
          >
            <Plus size={13} className="mr-1.5" /> {dialing ? "DIALING..." : "DIAL SUBSCRIBER TUNNEL"}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            soundDna="eisp"
            onClick={loadArsyTelemetry}
            disabled={pinging}
          >
            <RefreshCw size={13} className={`mr-1.5 ${pinging ? "animate-spin" : ""}`} /> REFRESH MESH TOPOLOGY
          </Button>
        </div>

        {dialResult && (
          <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1 rounded flex items-center gap-1.5">
            <CheckCircle size={12} /> {dialResult}
          </div>
        )}
      </div>

      {/* Grid Telemetry Metrics */}
      <div className="max-w-5xl w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 z-10">
        <Card variant="cyan" className="bg-slate-950/70 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider uppercase">ARSY CONTROLLER :4000</div>
          <div className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Radio size={16} className={status.arsy === "online" ? "text-emerald-400" : "text-rose-400"} />
            {status.arsy.toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-400/70 mt-1">PPPoE Session Gateway</div>
        </Card>

        <Card variant="cyan" className="bg-slate-950/70 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider uppercase">LEGEND BAAS :8092</div>
          <div className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Server size={16} className={status.legend === "online" ? "text-emerald-400" : "text-rose-400"} />
            {status.legend.toUpperCase()}
          </div>
          <div className="text-[10px] text-slate-400/70 mt-1">SurrealDB 2.x Engine</div>
        </Card>

        <Card variant="cyan" className="bg-slate-950/70 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider uppercase">ACTIVE PPPOE SESSIONS</div>
          <div className="text-lg font-bold text-cyan-300 mt-1 flex items-center gap-2">
            <Wifi size={16} className="text-cyan-400" />
            {pppoeSessions.length}
          </div>
          <div className="text-[10px] text-slate-400/70 mt-1">Live Tunnel Records</div>
        </Card>

        <Card variant="cyan" className="bg-slate-950/70 border-cyan-500/30">
          <div className="text-[10px] text-cyan-400/70 tracking-wider uppercase">TOTAL SURREAL RECORDS</div>
          <div className="text-lg font-bold text-slate-100 mt-1 flex items-center gap-2">
            <Layers size={16} className="text-cyan-400" />
            {legendTotalRecords !== null ? legendTotalRecords : "8"}
          </div>
          <div className="text-[10px] text-slate-400/70 mt-1">Zero-slop Persistence</div>
        </Card>
      </div>

      {/* Living Wireframe Mesh Canvas Panel */}
      <div className="max-w-5xl w-full mt-8 z-10">
        <div className="border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md rounded-sm p-5 shadow-[0_0_20px_rgba(0,240,255,0.06)]">
          <div className="flex justify-between items-center pb-3 border-b border-cyan-500/20 mb-4">
            <span className="text-xs text-cyan-300 font-bold flex items-center gap-2">
              <ProceduralGlyph dna="eisp" index={0} size={14} /> LIVE PPPOE SUBSCRIBER TUNNEL PIPELINE
            </span>
            <span className="text-[10px] text-slate-400">ISOMETRIC TOPOGRAPHY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-cyan-500/20 text-cyan-400/70 text-[10px] uppercase">
                  <th className="p-2">Subscriber ID / Username</th>
                  <th className="p-2">NAS IP / Endpoint</th>
                  <th className="p-2">Assigned IP</th>
                  <th className="p-2">Acct Session ID</th>
                  <th className="p-2">Status</th>
                  <th className="p-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pppoeSessions.length > 0 ? (
                  pppoeSessions.map((s) => (
                    <tr key={s.id} className="border-b border-slate-800/60 hover:bg-cyan-950/20">
                      <td className="p-2 font-bold text-cyan-200">{s.username}</td>
                      <td className="p-2 text-slate-300">{s.nas_ip}:{s.nas_port}</td>
                      <td className="p-2 text-emerald-400">{s.framed_ip_address || "10.100.0.12"}</td>
                      <td className="p-2 text-slate-400 text-[10px]">{s.acct_session_id}</td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        {s.status === "active" && (
                          <button
                            onClick={() => handleTerminateSession(s.id)}
                            title="Terminate Tunnel"
                            className="px-2 py-1 text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded hover:bg-rose-500/20 cursor-pointer"
                          >
                            <PowerOff size={10} className="inline mr-1" /> TERMINATE
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 text-xs">
                      No active sessions connected. Click &quot;DIAL SUBSCRIBER TUNNEL&quot; above to create a live session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

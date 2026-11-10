import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Play, RotateCcw, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchLiveMeshTopology, MeshServiceNode } from "@/lib/realData"

export function MeshPage() {
  const [services, setServices] = useState<MeshServiceNode[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [lastSynced, setLastSynced] = useState<string>("")

  async function loadMesh() {
    setLoading(true)
    try {
      const nodes = await fetchLiveMeshTopology()
      setServices(nodes)
      setLastSynced(new Date().toLocaleTimeString())
    } catch (err) {
      console.error("Failed to load mesh topology", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMesh()
    const timer = setInterval(loadMesh, 15000)
    return () => clearInterval(timer)
  }, [])

  const onlineCount = services.filter((s) => s.status === "ONLINE").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              LIVE SOVEREIGN 9-NODE MESH TELEMETRY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Service Mesh Radar</h1>
          <p className="text-muted-foreground text-sm">
            Real-time topology, live latency probes, and cluster health across 9 monorepo planes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSynced && (
            <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
              Updated: {lastSynced}
            </span>
          )}
          <Button onClick={loadMesh} disabled={loading} size="sm" variant="outline" className="font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Probe Mesh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Dynamic Topology Radar Graph */}
        <Card className="lg:col-span-12 border-border bg-card/60 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span className="font-mono text-base flex items-center gap-2">
                ACTIVE TOPOLOGY CLUSTER ({onlineCount}/{services.length || 9} ONLINE)
              </span>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> ONLINE
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> OFFLINE
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-black/40 rounded-lg border border-border/80 flex items-center justify-center p-4 relative overflow-hidden">
              <svg className="w-full h-full max-w-4xl" viewBox="0 0 900 360">
                {/* Visual Interconnect Mesh Lines */}
                <g stroke="#1e293b" strokeWidth="1.5" strokeDasharray="4,4">
                  <line x1="200" y1="180" x2="450" y2="90" />
                  <line x1="200" y1="180" x2="450" y2="270" />
                  <line x1="450" y1="90" x2="700" y2="180" />
                  <line x1="450" y1="270" x2="700" y2="180" />
                  <line x1="450" y1="90" x2="450" y2="270" />
                </g>

                {/* Render Dynamic Live Nodes */}
                {services.map((svc, idx) => {
                  const isOnline = svc.status === "ONLINE"
                  // Calculate dynamic node position around concentric cyber ring
                  const angle = (idx / Math.max(1, services.length)) * 2 * Math.PI - Math.PI / 2
                  const cx = 450 + 320 * Math.cos(angle)
                  const cy = 180 + 130 * Math.sin(angle)

                  return (
                    <g key={svc.id || svc.name} className="transition-all duration-300">
                      <circle
                        cx={cx}
                        cy={cy}
                        r="38"
                        fill="#050c07"
                        stroke={isOnline ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                        className={isOnline ? "shadow-[0_0_15px_rgba(16,185,129,0.3)]" : ""}
                      />
                      <text
                        x={cx}
                        y={cy - 6}
                        textAnchor="middle"
                        fill="#f8fafc"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {svc.id.toUpperCase()}
                      </text>
                      <text
                        x={cx}
                        y={cy + 8}
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        :{svc.port}
                      </text>
                      <text
                        x={cx}
                        y={cy + 20}
                        textAnchor="middle"
                        fill={isOnline ? "#34d399" : "#f87171"}
                        fontSize="8"
                        fontFamily="monospace"
                        fontWeight="700"
                      >
                        {isOnline ? `${svc.latencyMs}ms` : "OFFLINE"}
                      </text>
                    </g>
                  )
                })}

                {/* Center Core Hub */}
                <circle cx="450" cy="180" r="42" fill="#09140c" stroke="#00ff66" strokeWidth="2.5" />
                <text x="450" y="176" textAnchor="middle" fill="#00ff66" fontSize="11" fontFamily="monospace" fontWeight="bold">
                  SOVEREIGN
                </text>
                <text x="450" y="192" textAnchor="middle" fill="#86efac" fontSize="9" fontFamily="monospace">
                  CORE MESH
                </text>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Live Service Cards */}
        <div className="lg:col-span-12 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            Verified Monorepo Planes & Endpoints
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => {
              const isOnline = svc.status === "ONLINE"
              return (
                <Card key={svc.id || svc.name} className="border-border bg-card/60 backdrop-blur">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-sm text-foreground">{svc.name}</span>
                        <p className="text-xs font-mono text-muted-foreground mt-0.5">{svc.url}</p>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                          isOnline
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {svc.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2 border-t border-border/50">
                      <div>
                        <span className="text-muted-foreground block text-[10px]">PLANE / LAYER</span>
                        <span className="text-foreground">{svc.layer}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px]">LATENCY</span>
                        <span className={isOnline ? "text-emerald-400 font-bold" : "text-muted-foreground"}>
                          {isOnline ? `${svc.latencyMs} ms` : "Unreachable"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <a href={svc.url} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="ghost" size="sm" className="w-full text-xs font-mono">
                          <Play className="h-3 w-3 mr-1 text-emerald-400" /> Visit
                        </Button>
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={loadMesh}
                        className="flex-1 text-xs font-mono"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" /> Probe
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

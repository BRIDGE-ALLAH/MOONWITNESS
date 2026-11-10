import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, Play, Square, RotateCcw, Logs } from "lucide-react"

export function MeshPage() {
  const services = [
    { name: "git-engine", status: "healthy", port: 3200, uptime: "2h 15m", cpu: "2%", mem: "45MB" },
    { name: "arsy", status: "healthy", port: 4000, uptime: "2h 10m", cpu: "5%", mem: "78MB" },
    { name: "legend", status: "healthy", port: 8092, uptime: "2h 5m", cpu: "8%", mem: "120MB" },
    { name: "pocketbase", status: "healthy", port: 8091, uptime: "2h 0m", cpu: "3%", mem: "32MB" },
    { name: "radius", status: "degraded", port: 1812, uptime: "1h 55m", cpu: "1%", mem: "18MB" },
  ]

  function getStatusBadge(status: string) {
    return status === "healthy"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800"
  }

  function getPipelineBadge(index: number) {
    if (index < 3) return "bg-green-100 text-green-800"
    if (index === 3) return "bg-blue-100 text-blue-800"
    return "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Service Mesh</h1>
          <p className="text-muted-foreground">Topology, health, logs, deploy, secrets</p>
        </div>
        <Button><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Topology Graph */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Topology
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Healthy</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Degraded</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Down</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted/30 rounded flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {/* Service nodes */}
                <g>
                  {/* git-engine */}
                  <circle cx="100" cy="200" r="50" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="100" y="205" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">git-engine:3200</text>

                  {/* arsy */}
                  <circle cx="300" cy="100" r="50" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="300" y="105" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">arsy:4000</text>

                  {/* legend */}
                  <circle cx="500" cy="100" r="50" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="500" y="105" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">legend:8092</text>

                  {/* pocketbase */}
                  <circle cx="300" cy="300" r="50" fill="#0f172a" stroke="#22c55e" strokeWidth="2" />
                  <text x="300" y="305" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">pocketbase:8091</text>

                  {/* radius */}
                  <circle cx="700" cy="200" r="50" fill="#0f172a" stroke="#eab308" strokeWidth="2" />
                  <text x="700" y="205" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="monospace">radius:1812</text>
                </g>

                {/* Connections */}
                <g stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5,5">
                  <line x1="150" y1="200" x2="250" y2="100" />
                  <line x1="150" y1="200" x2="250" y2="300" />
                  <line x1="350" y1="100" x2="450" y2="100" />
                  <line x1="350" y1="300" x2="450" y2="100" />
                  <line x1="550" y1="100" x2="650" y2="200" />
                </g>
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Service Details */}
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {services.map((svc) => (
                <div key={svc.name} className="p-3 bg-muted/30 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-medium">{svc.name}</span>
                    <span className={"text-xs px-2 py-0.5 rounded " + getStatusBadge(svc.status)}>
                      {svc.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground">Port:</span> <span className="font-mono">{svc.port}</span></div>
                    <div><span className="text-muted-foreground">Uptime:</span> <span className="font-mono">{svc.uptime}</span></div>
                    <div><span className="text-muted-foreground">CPU:</span> <span className="font-mono">{svc.cpu}</span></div>
                    <div><span className="text-muted-foreground">Mem:</span> <span className="font-mono">{svc.mem}</span></div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button variant="ghost" size="sm" disabled={svc.status !== "healthy"}><Play className="h-3 w-3 mr-1" /> Start</Button>
                    <Button variant="ghost" size="sm" disabled={svc.status === "healthy"}><Square className="h-3 w-3 mr-1" /> Stop</Button>
                    <Button variant="ghost" size="sm"><RotateCcw className="h-3 w-3 mr-1" /> Restart</Button>
                    <Button variant="ghost" size="sm"><Logs className="h-3 w-3 mr-1" /> Logs</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Deploy Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Deploy Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["Build", "Test", "Stage", "Canary", "Production"].map((stage, i) => (
                <div key={stage} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                  <span className="font-medium">{stage}</span>
                  <span className={"text-xs px-2 py-0.5 rounded " + getPipelineBadge(i)}>
                    {i < 3 ? "Passed" : i === 3 ? "Running" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
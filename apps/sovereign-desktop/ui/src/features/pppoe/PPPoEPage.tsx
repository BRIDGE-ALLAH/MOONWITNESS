import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Search, Filter, MapPin, AlertTriangle, Download } from "lucide-react"

export function PPPoEPage() {
  const sessions = [
    { id: "sess_001", nas: "10.0.1.5", user: "john.doe", ip: "10.10.1.100", status: "active", duration: "2h 15m", rx: "1.2 GB", tx: "512 MB" },
    { id: "sess_002", nas: "10.0.1.5", user: "jane.smith", ip: "10.10.1.101", status: "active", duration: "1h 45m", rx: "890 MB", tx: "445 MB" },
    { id: "sess_003", nas: "10.0.2.1", user: "bob.wilson", ip: "10.10.2.50", status: "connecting", duration: "30s", rx: "0 B", tx: "0 B" },
    { id: "sess_004", nas: "10.0.3.1", user: "alice.brown", ip: "10.10.3.200", status: "disconnected", duration: "4h 20m", rx: "3.4 GB", tx: "1.7 GB" },
    { id: "sess_005", nas: "10.0.1.5", user: "charlie.davis", ip: "10.10.1.102", status: "active", duration: "5h 10m", rx: "2.1 GB", tx: "980 MB" },
  ]

  function getStatusBadge(status: string) {
    if (status === "active") return "bg-green-100 text-green-800"
    if (status === "connecting") return "bg-blue-100 text-blue-800"
    return "bg-red-100 text-red-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">PPPoE / RADIUS</h1>
          <p className="text-muted-foreground">Session radar, RADIUS trace, NAS map</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
          <Button variant="outline" size="sm"><Wifi className="h-4 w-4 mr-2" /> Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Session Table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Sessions
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {["Session ID", "NAS IP", "Username", "Assigned IP", "Status", "Duration", "RX", "TX", "Actions"].map((h) => (
                      <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="p-3 font-mono">{s.id}</td>
                      <td className="p-3 font-mono">{s.nas}</td>
                      <td className="p-3">{s.user}</td>
                      <td className="p-3 font-mono">{s.ip || "-"}</td>
                      <td className="p-3">
                        <span className={"text-xs px-2 py-0.5 rounded " + getStatusBadge(s.status)}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono">{s.duration}</td>
                      <td className="p-3 font-mono">{s.rx}</td>
                      <td className="p-3 font-mono">{s.tx}</td>
                      <td className="p-3">
                        <Button variant="ghost" size="icon" title="RADIUS Trace"><Wifi className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" title="Disconnect"><AlertTriangle className="h-3 w-3" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* RADIUS Trace */}
        <Card>
          <CardHeader>
            <CardTitle>RADIUS Trace (sess_001)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm space-y-1 max-h-96 overflow-auto">
              <p className="text-blue-500">→ Access-Request (id=42)</p>
              <p className="text-muted-foreground">  User-Name: john.doe</p>
              <p className="text-muted-foreground">  NAS-IP-Address: 10.0.1.5</p>
              <p className="text-muted-foreground">  Called-Station-Id: 00:11:22:33:44:55</p>
              <p className="text-yellow-500">← Access-Challenge (id=42)</p>
              <p className="text-muted-foreground">  EAP-Message: 0x02...</p>
              <p className="text-blue-500">→ Access-Request (id=43)</p>
              <p className="text-muted-foreground">  EAP-Message: 0x02...</p>
              <p className="text-green-500">← Access-Accept (id=43)</p>
              <p className="text-muted-foreground">  Framed-IP-Address: 10.10.1.100</p>
              <p className="text-muted-foreground">  Session-Timeout: 86400</p>
            </div>
          </CardContent>
        </Card>

        {/* NAS Map */}
        <Card>
          <CardHeader>
            <CardTitle>NAS Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-muted/30 rounded flex items-center justify-center relative">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">MapLibre GL integration</p>
                <p className="text-xs text-muted-foreground">NAS markers with health status</p>
              </div>
              <div className="absolute bottom-4 right-4 bg-card p-2 rounded border text-xs">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Online (3)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Degraded (1)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Offline (0)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

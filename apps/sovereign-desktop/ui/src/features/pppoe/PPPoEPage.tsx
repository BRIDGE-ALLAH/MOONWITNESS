import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, ShieldCheck, UserCheck, Activity } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchLivePPPoESessions, terminatePPPoESession, PPPoESession, ARSY_URL } from "@/lib/realData"

export function PPPoEPage() {
  const [sessions, setSessions] = useState<PPPoESession[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function loadSessions() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const data = await fetchLivePPPoESessions()
      setSessions(data)
    } catch (err) {
      setErrorMsg(`Could not connect to ARSY orchestrator on ${ARSY_URL}: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()
  }, [])

  async function handleTerminate(sessionId: string) {
    setTerminatingId(sessionId)
    try {
      await terminatePPPoESession(sessionId)
      await loadSessions()
    } catch (err) {
      alert(`Termination failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setTerminatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              FASTIFY ARSY (:4000) LIVE SESSIONS & RADIUS AAA (:1812)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">PPPoE Session Orchestrator</h1>
          <p className="text-muted-foreground text-sm">
            Live subscriber tunnels, RADIUS AAA authorization state, and dynamic circuit termination.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSessions} disabled={loading} size="sm" variant="outline" className="font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Sessions
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-amber-400 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">Active Sessions</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                {sessions.filter((s) => s.status === "active").length}
              </h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">RADIUS Status</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">AUTHENTICATED</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">Total Ingested Records</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">{sessions.length}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Sessions Table */}
      <Card className="border-border bg-card/60 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-mono text-sm">ACTIVE SUBSCRIBER CIRCUITS</span>
            <span className="text-xs font-mono text-muted-foreground">{sessions.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && sessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs">
              Loading active subscriber sessions from ARSY (:4000)...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs border border-dashed border-border rounded">
              Zero active PPPoE sessions currently connected to ARSY. Dial a session from E-ISP (:3003) to inspect.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">SESSION UUID</th>
                    <th className="p-3">SUBSCRIBER</th>
                    <th className="p-3">NAS IP</th>
                    <th className="p-3">NAS PORT</th>
                    <th className="p-3">FRAMED IP</th>
                    <th className="p-3">STARTED AT</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => {
                    const isTerminating = terminatingId === s.id
                    return (
                      <tr key={s.id} className="border-b border-border/40 hover:bg-muted/30">
                        <td className="p-3 font-semibold text-emerald-400 truncate max-w-[140px]">{s.id}</td>
                        <td className="p-3 text-foreground">{s.username}</td>
                        <td className="p-3 text-muted-foreground">{s.nas_ip}</td>
                        <td className="p-3 text-muted-foreground">{s.nas_port}</td>
                        <td className="p-3 text-foreground font-bold">{s.framed_ip_address}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(s.session_start).toLocaleTimeString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              s.status === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isTerminating}
                            onClick={() => handleTerminate(s.id)}
                            className="h-7 text-[10px] font-mono px-2"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {isTerminating ? "Terminating..." : "Terminate"}
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Terminal } from "lucide-react"
import { useState } from "react"
import { executeSurrealQL, LEGEND_URL } from "@/lib/realData"

export function SurrealQLPage() {
  const [query, setQuery] = useState("SELECT * FROM pppoe_sessions ORDER BY session_start DESC LIMIT 10;")
  const [result, setResult] = useState<string>("")
  const [executing, setExecuting] = useState<boolean>(false)
  const [latencyMs, setLatencyMs] = useState<number | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function runQuery() {
    if (!query.trim()) return
    setExecuting(true)
    setErrorMsg(null)
    const start = Date.now()
    try {
      const data = await executeSurrealQL(query.trim())
      setLatencyMs(Date.now() - start)
      setResult(JSON.stringify(data, null, 2))
      setHistory((prev) => [query, ...prev.filter((h) => h !== query).slice(0, 9)])
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setResult("")
    } finally {
      setExecuting(false)
    }
  }

  const sampleQueries = [
    { title: "Active PPPoE Sessions", sql: "SELECT * FROM pppoe_sessions WHERE status = 'active';" },
    { title: "Session Count Aggregation", sql: "SELECT count() FROM pppoe_sessions GROUP ALL;" },
    { title: "RID Soul Patches", sql: "SELECT * FROM soul_patches ORDER BY created_at DESC LIMIT 5;" },
    { title: "Table Cardinality Stats", sql: "SELECT * FROM telemetry_stats LIMIT 5;" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              LEGEND BAAS (:8092) // SURREALKV 2.X ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">SurrealQL Operational Terminal</h1>
          <p className="text-muted-foreground text-sm">
            Live query execution and real database records against persistent Legend SurrealKV engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={runQuery}
            disabled={executing || !query.trim()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs"
          >
            <Play className={`h-3.5 w-3.5 mr-1.5 ${executing ? "animate-spin" : ""}`} />
            {executing ? "Executing..." : "Run Query"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Editor & Presets */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="border-border bg-card/60 backdrop-blur">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                QUERY BUFFER
              </CardTitle>
              {latencyMs !== null && (
                <span className="text-xs font-mono text-emerald-400">
                  Execution time: {latencyMs} ms
                </span>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
                className="w-full rounded-md border border-input bg-black/80 text-emerald-400 p-3 font-mono text-xs shadow-inner focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-y"
                placeholder="SELECT * FROM pppoe_sessions;"
                spellCheck={false}
              />

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-400 text-xs font-mono">
                  ❌ {errorMsg}
                </div>
              )}

              {/* Quick Presets */}
              <div className="pt-2 border-t border-border/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground block mb-2">
                  LIVE SURREALDB OPERATIONAL PRESETS:
                </span>
                <div className="flex flex-wrap gap-2">
                  {sampleQueries.map((preset) => (
                    <button
                      key={preset.title}
                      onClick={() => setQuery(preset.sql)}
                      className="px-2.5 py-1 rounded bg-muted/50 hover:bg-muted text-xs font-mono text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Viewer */}
          <Card className="border-border bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center justify-between">
                <span>SURREALDB QUERY RESULT</span>
                <span className="text-xs text-muted-foreground font-mono">Target: {LEGEND_URL}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded bg-black/90 p-4 font-mono text-xs text-emerald-300 border border-emerald-950/60 max-h-96 overflow-y-auto whitespace-pre leading-relaxed">
                {result || "Execute a query above to view live SurrealDB response."}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Schema & History */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="border-border bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono">VERIFIED LIVE TABLES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 font-mono text-xs">
              {[
                { table: "pppoe_sessions", desc: "Live subscriber circuits" },
                { table: "soul_patches", desc: "Root ID synthesis patches" },
                { table: "telemetry_stats", desc: "Operational counts & metrics" },
              ].map((item) => (
                <div
                  key={item.table}
                  onClick={() => setQuery(`SELECT * FROM ${item.table} LIMIT 10;`)}
                  className="p-2.5 rounded bg-muted/40 hover:bg-muted/70 cursor-pointer border border-border/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{item.table}</span>
                    <span className="text-[10px] text-emerald-400 uppercase">SurrealKV</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Query History */}
          {history.length > 0 && (
            <Card className="border-border bg-card/60 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono">RECENT QUERIES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    onClick={() => setQuery(h)}
                    className="p-2 rounded bg-muted/30 hover:bg-muted/60 cursor-pointer truncate text-muted-foreground hover:text-foreground text-[11px]"
                  >
                    {h}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, Download, Upload, Search, Filter } from "lucide-react"
import { useState } from "react"

export function SurrealQLPage() {
  const [query, setQuery] = useState("SELECT * FROM pppoe_sessions WHERE status = \"active\" LIMIT 10;")
  const [result, setResult] = useState("")
  const [history, setHistory] = useState<string[]>([])

  const executeQuery = () => {
    setResult(`[
  { id: pppoe_sessions:abc123, session_id: "sess_001", nas_ip: "10.0.1.5", username: "user1", status: "active", bytes_in: 1024000, bytes_out: 512000 },
  { id: pppoe_sessions:def456, session_id: "sess_002", nas_ip: "10.0.1.5", username: "user2", status: "active", bytes_in: 2048000, bytes_out: 1024000 },
  { id: pppoe_sessions:ghi789, session_id: "sess_003", nas_ip: "10.0.2.1", username: "user3", status: "active", bytes_in: 512000, bytes_out: 256000 }
]`)
    setHistory([query, ...history.slice(0, 9)])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SurrealQL Console</h1>
          <p className="text-muted-foreground">Syntax-highlighted editor, history, EXPLAIN, schema browser</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Export</Button>
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-2" /> Import</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Editor
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" title="Format"><Filter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Explain"><Search className="h-4 w-4" /></Button>
                <Button onClick={executeQuery}><Play className="h-4 w-4 mr-2" /> Execute</Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="font-mono text-sm w-full h-[400px] bg-muted p-4 rounded border border-input resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="SELECT * FROM table WHERE condition LIMIT 10;"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        {/* Schema Browser */}
        <Card>
          <CardHeader>
            <CardTitle>Schema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-auto">
              {["pppoe_sessions", "radius_logs", "tenants", "api_keys", "git_repositories", "service_config", "sync_operations", "settings", "license"].map((table) => (
                <div key={table} className="p-2 hover:bg-accent rounded cursor-pointer flex items-center justify-between">
                  <span className="font-mono text-sm">{table}</span>
                  <Button variant="ghost" size="icon"><RefreshCw className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Results
              <span className="text-sm text-muted-foreground">3 rows 45ms</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-sm bg-muted p-4 rounded max-h-96 overflow-auto whitespace-pre-wrap">
              {result || "No results yet. Execute a query to see results."}
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-auto">
              {history.map((h, i) => (
                <div key={i} className="p-2 hover:bg-accent rounded cursor-pointer font-mono text-sm text-muted-foreground truncate">
                  {h}
                </div>
              ))}
              {history.length === 0 && <p className="text-sm text-muted-foreground">No history yet</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
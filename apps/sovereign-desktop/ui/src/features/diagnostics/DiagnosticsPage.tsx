import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileText, Flame, Archive, Loader2 } from "lucide-react"
import { useState } from "react"

export function DiagnosticsPage() {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const generateBundle = async () => {
    setGenerating(true)
    setProgress(0)
    const steps = ["Collecting logs", "Gathering config", "System info", "Sidecar metrics", "Compressing"]
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500))
      setProgress(((i + 1) / steps.length) * 100)
    }
    setGenerating(false)
    alert("Diagnostic bundle saved to Downloads/Sovereign-Diagnostic-2026-11-10.zip")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Diagnostics</h1>
          <p className="text-muted-foreground">Support bundles, session replay, flamegraphs</p>
        </div>
        <Button onClick={generateBundle} disabled={generating}>
          {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
          {generating ? "Generating..." : "Generate Support Bundle"}
        </Button>
      </div>

      {generating && (
        <Card>
          <CardContent className="py-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating diagnostic bundle...</span>
                <span className="font-mono">{progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: progress + "%" }} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Support Bundle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">One-click diagnostic package with logs, config, system info, and sidecar metrics</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Logs</span> <span className="font-mono text-green-500">Included</span></div>
              <div className="flex justify-between"><span>Config</span> <span className="font-mono text-green-500">Included</span></div>
              <div className="flex justify-between"><span>System Info</span> <span className="font-mono text-green-500">Included</span></div>
              <div className="flex justify-between"><span>Sidecar Metrics</span> <span className="font-mono text-green-500">Included</span></div>
              <div className="flex justify-between"><span>SurrealDB State</span> <span className="font-mono text-green-500">Included</span></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Flame className="h-5 w-5" /> Flamegraph</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">CPU profiling visualization via speedscope</p>
            <Button variant="outline" className="w-full" disabled>Generate Flamegraph</Button>
            <p className="text-xs text-muted-foreground mt-2">Available in v1.0 (requires rr integration)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Archive className="h-5 w-5" /> Session Replay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">rr trace replay with timeline</p>
            <Button variant="outline" className="w-full" disabled>Open Replay</Button>
            <p className="text-xs text-muted-foreground mt-2">Available in v1.0 (requires rr integration)</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Diagnostic Bundles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">File</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Size</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-mono">Sovereign-Diagnostic-2026-11-09.zip</td>
                    <td className="p-3">12.4 MB</td>
                    <td className="p-3">2026-11-09 14:32</td>
                    <td className="p-3"><Button variant="ghost" size="icon"><Download className="h-3 w-3" /></Button></td>
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="p-3 font-mono">Sovereign-Diagnostic-2026-11-08.zip</td>
                    <td className="p-3">11.8 MB</td>
                    <td className="p-3">2026-11-08 09:15</td>
                    <td className="p-3"><Button variant="ghost" size="icon"><Download className="h-3 w-3" /></Button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
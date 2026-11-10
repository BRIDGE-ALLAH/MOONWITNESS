import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Download,
  Send,
  RefreshCw,
  ExternalLink,
  Radio,
  Terminal,
  Clock,
  Sparkles,
} from "lucide-react"

interface ReleaseArtifact {
  name: string
  directUrl: string
  targetOs: string
}

interface ReleaseItem {
  tagName: string
  version: string
  title: string
  channel: string
  changelogMd: string
  publishedAt: string
  githubReleaseUrl: string
  artifacts: ReleaseArtifact[]
}

interface CodexPayload {
  version: string
  storageEngine: string
  kpis: {
    overallCompletionPct: number
    tasksDone: number
    tasksInProgress: number
    totalTasks: number
    totalReleases: number
    edgePlatform: string
  }
  releases: ReleaseItem[]
  publicDomains: string[]
}

const EDGE_CODEX_URL = "https://codex.a-l-l-a-h.com"
const TELEGRAM_CHAT_ID = -1002220498754

export function ReleasesPage() {
  const [data, setData] = useState<CodexPayload | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [taskInput, setTaskInput] = useState<string>("")
  const [chatopsOutput, setChatopsOutput] = useState<string>("Sovereign Desktop ChatOps ready. Dispatch interactive commands.")
  const [executing, setExecuting] = useState<boolean>(false)

  async function fetchReleases() {
    try {
      setLoading(true)
      const res = await fetch(`${EDGE_CODEX_URL}/api/codex`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: CodexPayload = await res.json()
      setData(json)
    } catch (err) {
      setChatopsOutput(`Failed fetching releases: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReleases()
  }, [])

  async function dispatchChatOps(commandText: string) {
    if (!commandText.trim()) return
    try {
      setExecuting(true)
      setChatopsOutput(`[DISPATCHING] ${commandText} -> ${EDGE_CODEX_URL}/api/telegram-webhook ...`)
      const res = await fetch(`${EDGE_CODEX_URL}/api/telegram-webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: {
            chat: { id: TELEGRAM_CHAT_ID },
            text: commandText,
            from: { username: "DesktopConsole" },
          },
        }),
      })
      const result = await res.json()
      setChatopsOutput(
        `[SUCCESS] Command: "${commandText}"\nStatus: ${res.status} OK\nTelegram Webhook Response: ${JSON.stringify(result, null, 2)}`
      )
      // Auto refresh data if task was created
      if (commandText.startsWith("/task ")) {
        setTaskInput("")
        setTimeout(fetchReleases, 1000)
      }
    } catch (err) {
      setChatopsOutput(`[ERROR] Command failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setExecuting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              CLOUDFLARE EDGE D1 SYNC // CHATOPS TELEGRAM
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
            Releases & ChatOps Controller
          </h1>
          <p className="text-sm text-muted-foreground">
            Direct binary mirrors, CycloneDX SBOM, and bi-directional Moonwitness Telegram orchestration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReleases}
            disabled={loading}
            className="font-mono text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync Codex
          </Button>
          <a
            href="https://t.me/rocksouldx_bot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs">
              <Radio className="h-3.5 w-3.5 mr-1.5" />
              @rocksouldx_bot
            </Button>
          </a>
        </div>
      </div>

      {/* Grid: Releases & ChatOps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official Releases */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              Published Binaries & Artifacts
            </h2>
            <span className="text-xs font-mono text-muted-foreground">
              {data?.releases?.length ?? 0} official build(s)
            </span>
          </div>

          {loading && !data ? (
            <Card className="border-dashed border-border/80 p-8 text-center text-muted-foreground font-mono text-xs">
              Loading releases from Cloudflare D1...
            </Card>
          ) : data?.releases && data.releases.length > 0 ? (
            data.releases.map((rel) => (
              <Card key={rel.tagName} className="border-border bg-card/60 backdrop-blur">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {rel.tagName}
                        </span>
                        <span className="text-xs uppercase font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {rel.channel}
                        </span>
                      </div>
                      <CardTitle className="text-base mt-2">{rel.title}</CardTitle>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 font-mono">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(rel.publishedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <a
                      href={rel.githubReleaseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      GitHub Release <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Artifacts Download Buttons */}
                  <div className="space-y-2">
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                      Direct Downloads:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {rel.artifacts.map((art) => {
                        const isWindows = art.name.endsWith(".exe")
                        const isLinux = art.name.endsWith(".AppImage")
                        const isSbom = art.name.endsWith(".json")
                        return (
                          <a
                            key={art.name}
                            href={art.directUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-start text-xs font-mono truncate border-border/80 hover:border-emerald-500 hover:text-emerald-400"
                            >
                              <Download className="h-3.5 w-3.5 mr-2 shrink-0 text-emerald-500" />
                              <span className="truncate">
                                {isWindows ? "Windows .exe" : isLinux ? "Linux .AppImage" : isSbom ? "CycloneDX SBOM" : art.name}
                              </span>
                            </Button>
                          </a>
                        )
                      })}
                    </div>
                  </div>

                  {/* Changelog excerpt */}
                  <div className="rounded bg-muted/40 p-3 font-mono text-xs border border-border/50 text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {rel.changelogMd}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border p-6 text-center text-xs font-mono text-muted-foreground">
              No releases recorded in D1 yet.
            </Card>
          )}
        </div>

        {/* Right Column: Telegram ChatOps Controller */}
        <div className="lg:col-span-5 space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Radio className="h-4 w-4 text-sky-400" />
            Interactive ChatOps Webhook
          </h2>

          <Card className="border-border bg-card/60 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center justify-between">
                <span>MOONWITNESS DISPATCHER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  LIVE 2-WAY
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={executing}
                  onClick={() => dispatchChatOps("/status")}
                  className="font-mono text-xs"
                >
                  /status
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={executing}
                  onClick={() => dispatchChatOps("/releases")}
                  className="font-mono text-xs"
                >
                  /releases
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={executing}
                  onClick={() => dispatchChatOps("/tasks")}
                  className="font-mono text-xs"
                >
                  /tasks
                </Button>
              </div>

              {/* Task Creation Form */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-xs font-mono text-muted-foreground">
                  Dispatch Task to Telegram & D1 (/task &lt;title&gt;):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && taskInput.trim()) {
                        dispatchChatOps(`/task ${taskInput.trim()}`)
                      }
                    }}
                    placeholder="e.g. Audit Legend Redis TTL cache"
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-xs font-mono shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <Button
                    size="sm"
                    disabled={executing || !taskInput.trim()}
                    onClick={() => dispatchChatOps(`/task ${taskInput.trim()}`)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    Send
                  </Button>
                </div>
              </div>

              {/* ChatOps Console Output */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3 w-3" /> Console Telemetry
                  </span>
                  <button
                    onClick={() => setChatopsOutput("Console cleared.")}
                    className="hover:text-foreground text-[10px]"
                  >
                    clear
                  </button>
                </div>
                <div className="rounded bg-black/80 p-3 font-mono text-[11px] text-emerald-400 border border-emerald-900/40 h-44 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                  {chatopsOutput}
                </div>
              </div>

              {/* KPI Status Strip */}
              {data && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border font-mono text-xs">
                  <div className="p-2 rounded bg-muted/40">
                    <span className="text-muted-foreground block text-[10px]">PROGRESS</span>
                    <span className="font-bold text-foreground">{data.kpis.overallCompletionPct}%</span>
                  </div>
                  <div className="p-2 rounded bg-muted/40">
                    <span className="text-muted-foreground block text-[10px]">ACTIVE TASKS</span>
                    <span className="font-bold text-foreground">
                      {data.kpis.tasksDone} done / {data.kpis.tasksInProgress} active
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

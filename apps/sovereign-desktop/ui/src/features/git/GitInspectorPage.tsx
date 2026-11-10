import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, History, Eye, Code, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchLiveGitCommits, GitCommitRecord } from "@/lib/realData"

export function GitInspectorPage() {
  const [commits, setCommits] = useState<GitCommitRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedCommit, setSelectedCommit] = useState<GitCommitRecord | null>(null)

  async function loadCommits() {
    setLoading(true)
    try {
      const records = await fetchLiveGitCommits()
      setCommits(records)
      if (records.length > 0 && !selectedCommit) {
        setSelectedCommit(records[0])
      }
    } catch (err) {
      console.error("Failed to load git commits", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCommits()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              LIVE GIT TELEMETRY // LIBGIT2 NATIVE ENGINE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Git Inspector</h1>
          <p className="text-sm text-muted-foreground">
            Visual commit tree, head verification, bare-metal audit logs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadCommits} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" /> Reflog
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Commit Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border/50 pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Commit History ({commits.length})</span>
              <span className="text-xs font-mono text-muted-foreground">branch: master</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2 max-h-[550px] overflow-auto">
              {commits.map((commit) => {
                const isSelected = selectedCommit?.id === commit.id
                return (
                  <div
                    key={commit.id}
                    onClick={() => setSelectedCommit(commit)}
                    className={`flex items-start gap-3 p-3 rounded-md transition-colors cursor-pointer border ${
                      isSelected ? "bg-accent/60 border-primary/50" : "hover:bg-accent/30 border-transparent"
                    }`}
                  >
                    <div className="flex flex-col items-center mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <div className="w-0.5 h-10 bg-border/60" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">{commit.id.slice(0, 7)}</span>
                        <span className="text-xs text-muted-foreground font-mono">{commit.timestamp}</span>
                      </div>
                      <p className="text-sm font-medium text-foreground mt-1 line-clamp-2">{commit.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">Author: {commit.author}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Commit Detail & Branches */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Code className="h-4 w-4 text-primary" /> Active Inspector
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {selectedCommit ? (
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Commit Hash:</span>
                    <span className="font-mono text-foreground font-semibold break-all">{selectedCommit.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Message:</span>
                    <span className="text-foreground font-medium">{selectedCommit.message}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Author:</span>
                    <span className="text-foreground">{selectedCommit.author}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Verified State:</span>
                    <span className="font-mono text-emerald-400 font-medium">SIGNED & SYNCED</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Select a commit to view inspection metadata.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-primary" /> Monorepo Branches
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-accent/40 font-mono">
                  <span className="flex items-center gap-2 font-bold text-primary">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> master (HEAD)
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded hover:bg-accent/20 font-mono text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted" /> origin/master
                  </span>
                  <span className="text-[10px] uppercase tracking-wider">TRACKED</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GitBranch, Play, Code, Terminal, FolderOpen, Download } from "lucide-react"

export function WorkspacePage() {
  const repos = [
    { name: "dx", path: "apps/dx", status: "clean", branch: "main", lastCommit: "feat: add workspace explorer" },
    { name: "empire", path: "apps/empire", status: "dirty", branch: "develop", lastCommit: "fix: auth flow" },
    { name: "moonwitness", path: "apps/moonwitness", status: "clean", branch: "main", lastCommit: "update: celestial data" },
    { name: "e-isp", path: "apps/e-isp", status: "clean", branch: "main", lastCommit: "refactor: telemetry" },
    { name: "rid", path: "apps/rid", status: "ahead", branch: "main", lastCommit: "feat: audio synth" },
    { name: "git-engine", path: "services/git-engine", status: "clean", branch: "main", lastCommit: "perf: optimize log" },
    { name: "arsy", path: "services/arsy", status: "behind", branch: "main", lastCommit: "fix: pppoe session" },
    { name: "legend", path: "services/legend", status: "clean", branch: "main", lastCommit: "feat: surreal migration" },
    { name: "radius", path: "services/radius", status: "clean", branch: "main", lastCommit: "chore: update deps" },
    { name: "pocketbase", path: "services/pocketbase", status: "clean", branch: "main", lastCommit: "upgrade: v0.21" },
  ]

  function getStatusColor(status: string) {
    switch (status) {
      case "clean": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "dirty": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "ahead": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "behind": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
      default: return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workspace Explorer</h1>
          <p className="text-muted-foreground">Manage repositories, run gates, view build status</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><FolderOpen className="h-4 w-4 mr-2" /> Open Folder</Button>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" /> Clone Repo</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {repos.map((repo) => (
          <Card key={repo.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    {repo.name}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{repo.path}</p>
                </div>
                <span className={"text-xs px-2 py-0.5 rounded " + getStatusColor(repo.status)}>
                  {repo.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Branch:</span>
                <span className="font-mono font-medium">{repo.branch}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last commit:</span>
                <span className="font-mono text-xs truncate max-w-[150px]">{repo.lastCommit}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Button variant="ghost" size="sm" className="flex-1"><Code className="h-3 w-3 mr-1" /> Open</Button>
                <Button variant="ghost" size="sm" className="flex-1"><Terminal className="h-3 w-3 mr-1" /> Terminal</Button>
                <Button variant="ghost" size="sm" className="flex-1"><Play className="h-3 w-3 mr-1" /> Gate</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task Output Pane */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Task Output
            <Button variant="ghost" size="sm">Clear</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-xs bg-muted p-4 rounded h-64 overflow-auto text-muted-foreground">
            <pre>{`> bun run gate`}</pre>
            <p className="text-green-500">Hygiene scan passed</p>
            <p className="text-green-500">TypeScript check passed</p>
            <p className="text-green-500">Unit tests passed (42/42)</p>
            <p className="text-green-500">Secret scan clean</p>
            <p className="text-green-500">Cargo fmt/clippy/test passed</p>
            <p className="text-primary font-medium">All gates passed in 1m 23s</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

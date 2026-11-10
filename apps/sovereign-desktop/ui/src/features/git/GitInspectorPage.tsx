import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Filter, Download, GitBranch, History, Eye, Code } from "lucide-react"

export function GitInspectorPage() {
  const diffContent = `diff --git a/src/commands/git.rs b/src/commands/git.rs
+use git2::{Repository, Revwalk, Commit};
+use anyhow::Result;

+pub fn git_log(repo_path: &str, limit: usize, offset: usize) -> Result<Vec<CommitInfo>> {
+    let repo = Repository::open(repo_path)?;
+    let mut revwalk = repo.revwalk()?;
+    revwalk.push_head()?;

+    let commits: Vec<CommitInfo> = revwalk
+        .skip(offset)
+        .take(limit)
+        .filter_map(|oid| oid.ok())
+        .filter_map(|oid| repo.find_commit(oid).ok())
+        .map(|commit| CommitInfo {
+            id: commit.id().to_string(),
+            author: commit.author().name().unwrap_or("Unknown").to_string(),
+            message: commit.message().unwrap_or("").to_string(),
+            timestamp: commit.time().seconds(),
+            parents: commit.parent_ids().map(|id| id.to_string()).collect(),
+        })
+        .collect();

+    Ok(commits)
+}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Git Inspector</h1>
          <p className="text-muted-foreground">Visual log, diff, blame, branch graph, PR checkout</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><GitBranch className="h-4 w-4 mr-2" /> Checkout PR</Button>
          <Button variant="outline" size="sm"><History className="h-4 w-4 mr-2" /> Reflog</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Commit Log */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Commit Log
              <div className="flex gap-2">
                <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon"><Filter className="h-4 w-4" /></Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-auto">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 hover:bg-accent rounded transition-colors cursor-pointer">
                  <div className="flex flex-col items-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                    <div className="w-0.5 h-8 bg-muted" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-medium">a1b2c3d</p>
                    <p className="text-sm text-foreground truncate">feat: add git inspector with libgit2 backend</p>
                    <p className="text-xs text-muted-foreground">John Doe 2 hours ago</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" title="View diff"><Code className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" title="View blame"><Eye className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Branches, Diff, Blame */}
        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {["main", "develop", "feature/git-inspector", "hotfix/auth", "release/v1.0"].map((branch) => (
                <div key={branch} className="flex items-center justify-between p-2 hover:bg-accent rounded cursor-pointer">
                  <span className="font-mono text-sm flex items-center gap-2">
                    <GitBranch className="h-3 w-3 text-muted-foreground" />
                    {branch}
                  </span>
                  <Button variant="ghost" size="icon"><Download className="h-3 w-3" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diff Viewer */}
      <Card>
        <CardHeader>
          <CardTitle>Diff Viewer (a1b2c3d)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="font-mono text-sm bg-muted p-4 rounded h-96 overflow-auto">
            <pre>{diffContent}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
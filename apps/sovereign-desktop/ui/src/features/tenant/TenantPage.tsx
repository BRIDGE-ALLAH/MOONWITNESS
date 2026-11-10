import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Key, Search, Filter, Plus, Edit, Trash2, Download } from "lucide-react"
import { useState } from "react"

export function TenantPage() {
  const [view, setView] = useState<"list" | "detail">("list")
  const [selectedTenant, setSelectedTenant] = useState<any>(null)

  const tenants = [
    { id: "tnt_001", name: "Acme Corp", slug: "acme-corp", plan: "pro", apiKeys: 5, users: 23, bandwidth: "2.4 TB" },
    { id: "tnt_002", name: "Globex Inc", slug: "globex", plan: "enterprise", apiKeys: 12, users: 156, bandwidth: "15.7 TB" },
    { id: "tnt_003", name: "Wayne Enterprises", slug: "wayne", plan: "free", apiKeys: 1, users: 3, bandwidth: "120 GB" },
    { id: "tnt_004", name: "Stark Industries", slug: "stark", plan: "pro", apiKeys: 8, users: 42, bandwidth: "5.1 TB" },
  ]

  function getPlanBadge(plan: string) {
    if (plan === "enterprise") return "bg-purple-100 text-purple-800"
    if (plan === "pro") return "bg-blue-100 text-blue-800"
    return "bg-gray-100 text-gray-800"
  }

  if (view === "detail" && selectedTenant) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView("list")}><Users className="h-4 w-4 mr-2" /> Back</Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{selectedTenant.name}</h1>
            <p className="text-muted-foreground">{selectedTenant.slug} {selectedTenant.plan}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader><CardTitle>API Keys</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: selectedTenant.apiKeys }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="font-mono text-sm">sk_live_****{i + 1}</span>
                    <Button variant="ghost" size="icon"><Edit className="h-3 w-3" /></Button>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-2"><Plus className="h-4 w-4 mr-2" /> Create Key</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Usage</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span>Bandwidth</span> <span className="font-mono">{selectedTenant.bandwidth}</span></div>
                <div className="flex justify-between text-sm"><span>Users</span> <span className="font-mono">{selectedTenant.users}</span></div>
                <div className="flex justify-between text-sm"><span>API Calls</span> <span className="font-mono">1.2M</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full"><Key className="h-4 w-4 mr-2" /> Rotate Keys</Button>
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Export Data</Button>
                <Button variant="destructive" className="w-full"><Trash2 className="h-4 w-4 mr-2" /> Delete Tenant</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tenants</h1>
          <p className="text-muted-foreground">Customer tenant view, API keys, usage analytics</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" /> Add Tenant</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Tenant List
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
                  {["Name", "Slug", "Plan", "API Keys", "Users", "Bandwidth", "Actions"].map((h) => (
                    <th key={h} className="text-left p-3 font-medium text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 cursor-pointer" onClick={() => { setSelectedTenant(t); setView("detail"); }}>
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 font-mono text-sm">{t.slug}</td>
                    <td className="p-3">
                      <span className={"text-xs px-2 py-0.5 rounded " + getPlanBadge(t.plan)}>{t.plan}</span>
                    </td>
                    <td className="p-3 font-mono">{t.apiKeys}</td>
                    <td className="p-3 font-mono">{t.users}</td>
                    <td className="p-3 font-mono">{t.bandwidth}</td>
                    <td className="p-3"><Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedTenant(t); setView("detail"); }}><Users className="h-3 w-3" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

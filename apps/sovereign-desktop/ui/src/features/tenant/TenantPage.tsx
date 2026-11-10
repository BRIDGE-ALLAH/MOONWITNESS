import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, RefreshCw, ShieldCheck, UserCheck, ExternalLink } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchLiveTenants, TenantAccount, POCKETBASE_URL } from "@/lib/realData"

export function TenantPage() {
  const [tenants, setTenants] = useState<TenantAccount[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  async function loadTenants() {
    setLoading(true)
    setErrorMsg(null)
    try {
      const data = await fetchLiveTenants()
      setTenants(data)
    } catch (err) {
      setErrorMsg(`Failed fetching tenant identities: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTenants()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              POCKETBASE (:8091) ROOT IDENTITY (RID) & TENANTS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">Tenant & Identity Management</h1>
          <p className="text-muted-foreground text-sm">
            Live authenticated tenants, role-based access control, and centralized RID identity records.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={loadTenants} disabled={loading} size="sm" variant="outline" className="font-mono text-xs">
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync Tenants
          </Button>
          <a href={`${POCKETBASE_URL}/_/`} target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs">
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              PB Admin
            </Button>
          </a>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 text-xs font-mono">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">Registered Tenants</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">{tenants.length}</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">Security Scope</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">RBAC STRICT</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/60 backdrop-blur">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">Active Auth Plane</p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">POCKETBASE :8091</h3>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real Tenants Table */}
      <Card className="border-border bg-card/60 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="font-mono text-sm">AUTHENTICATED TENANT ACCOUNTS</span>
            <span className="text-xs font-mono text-muted-foreground">{tenants.length} record(s)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && tenants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs">
              Loading tenant identities from PocketBase (:8091)...
            </div>
          ) : tenants.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground font-mono text-xs border border-dashed border-border rounded">
              Zero tenant records found in PocketBase users collection.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-left">
                    <th className="p-3">TENANT ID</th>
                    <th className="p-3">ACCOUNT NAME</th>
                    <th className="p-3">SLUG / USERNAME</th>
                    <th className="p-3">EMAIL</th>
                    <th className="p-3">ROLE</th>
                    <th className="p-3">REGISTERED AT</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((t) => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="p-3 font-semibold text-emerald-400">{t.id}</td>
                      <td className="p-3 text-foreground font-medium">{t.name}</td>
                      <td className="p-3 text-muted-foreground">{t.slug}</td>
                      <td className="p-3 text-muted-foreground">{t.email || "system@local"}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          {t.role}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(t.created).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

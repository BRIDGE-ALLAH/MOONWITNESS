import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Shield, Key, Palette, Github, RefreshCw } from "lucide-react"
import { useState } from "react"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/hooks/useAuthStore"

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const { user, logout } = useAuthStore()
  const [syncEnabled, setSyncEnabled] = useState(true)

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Preferences, sync, updates, license</p>
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="h-5 w-5" /> Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {["light", "dark", "system"].map((t) => (
              <Button
                key={t}
                variant={theme === t ? "default" : "outline"}
                onClick={() => setTheme(t as "light" | "dark" | "system")}
                className="w-full py-3"
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {theme === t && <span className="ml-2 text-primary">Check</span>}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Current: {resolvedTheme} mode</p>
        </CardContent>
      </Card>

      {/* Offline Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Offline Sync</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable background sync</p>
              <p className="text-sm text-muted-foreground">Automatically sync with remote Legend/PocketBase when online</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/50 rounded-full peer dark:bg-gray-700 peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Tables to sync</p>
            <div className="grid gap-2 md:grid-cols-2">
              {["pppoe_sessions", "radius_logs", "tenants", "api_keys", "git_repositories", "service_config"].map((table) => (
                <label key={table} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="font-mono text-sm">{table}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <p className="text-sm font-medium">Bandwidth limit</p>
            <input type="range" min="0" max="10000" defaultValue={0} className="w-full h-2 bg-muted rounded-lg appearance-none accent-primary" />
            <p className="text-xs text-muted-foreground mt-1">0 = unlimited (KB/s)</p>
          </div>

          <Button variant="outline" className="w-full"><RefreshCw className="h-4 w-4 mr-2" /> Force Sync Now</Button>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Github className="h-5 w-5" /> Updates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between border-t pt-4">
            <div>
              <p className="font-medium">Current version</p>
              <p className="text-sm text-muted-foreground font-mono">0.1.0</p>
            </div>
            <Button variant="outline" size="sm"><RefreshCw className="h-3 w-3 mr-1" /> Check for Updates</Button>
          </div>
        </CardContent>
      </Card>

      {/* License */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="h-5 w-5" /> License</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted/50 rounded">
            <p className="font-medium">Status: <span className="text-green-500">Valid</span></p>
            <p className="text-sm text-muted-foreground mt-1">Features: All Seats: 10 Expires: 2027-12-31</p>
            <p className="text-sm text-muted-foreground">Hardware-bound: TPM 2.0 + SMBIOS</p>
          </div>
          <Button variant="outline" className="w-full"><Key className="h-4 w-4 mr-2" /> Enter License Key</Button>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded">
            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-medium text-primary-foreground">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <p className="font-medium">{user?.name || "Windows User"}</p>
              <p className="text-sm text-muted-foreground capitalize">{user?.role || "developer"}</p>
              <p className="text-xs text-muted-foreground font-mono">{user?.id || "user-1"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={logout} className="w-full"><Settings className="h-4 w-4 mr-2" /> Sign Out</Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><Settings className="h-5 w-5" /> Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">Irreversible actions</p>
          <Button variant="destructive" className="w-full">Reset All Data (Offline DB, Settings, Cache)</Button>
          <Button variant="destructive" className="w-full">Revoke License</Button>
        </CardContent>
      </Card>
    </div>
  )
}
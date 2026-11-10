import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { invoke } from "@tauri-apps/api/core"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function LoginPage() {
  const [pat, setPat] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleWindowsHello = async () => {
    setLoading(true)
    setError(null)
    try {
      await invoke("auth_windows_hello")
      const token = await invoke("get_jwt") as string
      localStorage.setItem("auth_token", token)
      navigate({ to: "/app/workspace" })
    } catch (e) {
      setError("Windows Hello failed: " + String(e))
    } finally {
      setLoading(false)
    }
  }

  const handlePat = async () => {
    if (!pat.trim()) {
      setError("Please enter a PAT")
      return
    }
    setLoading(true)
    setError(null)
    try {
      await invoke("auth_pat", { pat })
      const token = await invoke("get_jwt") as string
      localStorage.setItem("auth_token", token)
      navigate({ to: "/app/workspace" })
    } catch (e) {
      setError("PAT authentication failed: " + String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Sovereign Desktop</h1>
          <p className="text-muted-foreground mt-2">Offline-first control surface</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">OR</span>
            </div>
          </div>

          <Button
            className={cn("w-full")}
            onClick={handleWindowsHello}
            disabled={loading}
            variant="default"
            size="lg"
          >
            {loading ? "Authenticating..." : "Sign in with Windows Hello"}
          </Button>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Personal Access Token</label>
            <input
              type="password"
              value={pat}
              onChange={(e) => setPat(e.target.value)}
              placeholder="Enter PAT"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Button
              className="w-full"
              onClick={handlePat}
              disabled={loading || !pat.trim()}
              variant="outline"
            >
              {loading ? "Authenticating..." : "Sign in with PAT"}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive text-center" role="alert">
              {error}
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>No cloud dependency Works offline Hardware-bound license</p>
        </div>
      </div>
    </div>
  )
}

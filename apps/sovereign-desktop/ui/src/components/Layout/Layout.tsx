import { Outlet, Link, useLocation } from "@tanstack/react-router"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toaster"
import { LivingSurface } from "@local-git/ui"
import {
  LayoutDashboard,
  GitBranch,
  Server,
  Database,
  Wifi,
  Users,
  Stethoscope,
  Settings,
  Menu,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
} from "lucide-react"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/hooks/useAuthStore"
import { SyncStatusBadge } from "@/offline/SyncStatusProvider"

const navigation = [
  { name: "Workspace", href: "/app/workspace", icon: LayoutDashboard, roles: ["developer", "platform"] },
  { name: "Git Inspector", href: "/app/git", icon: GitBranch, roles: ["developer"] },
  { name: "Service Mesh", href: "/app/mesh", icon: Server, roles: ["platform"] },
  { name: "SurrealQL", href: "/app/surreal", icon: Database, roles: ["platform", "network"] },
  { name: "PPPoE/RADIUS", href: "/app/pppoe", icon: Wifi, roles: ["network"] },
  { name: "Tenants", href: "/app/tenant", icon: Users, roles: ["support", "customer"] },
  { name: "Diagnostics", href: "/app/diagnostics", icon: Stethoscope, roles: ["support"] },
  { name: "Settings", href: "/app/settings", icon: Settings, roles: ["developer", "platform", "network", "support", "customer"] },
]

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuthStore()

  const filteredNav = navigation.filter((item) => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  return (
    <div className="min-h-screen bg-background relative">
      <LivingSurface dna="desktop" opacity={0.65} />
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-200",
          sidebarOpen ? (collapsed ? "w-16" : "w-64") : "w-0 overflow-hidden"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className={cn("flex h-16 items-center justify-between px-4 border-b border-border", collapsed && "justify-center")}>
            {!collapsed && (
              <Link to="/app/workspace" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-lg text-foreground">Sovereign</span>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronLeft className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main navigation">
            {filteredNav.map((item) => {
              const isActive = location.pathname.startsWith(item.href)
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    collapsed && "justify-center"
                  )}
                  title={collapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className={cn("p-3 border-t border-border", collapsed && "hidden")}>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <Monitor className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "guest"}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && !collapsed && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-200 lg:pl-64",
          sidebarOpen ? (collapsed ? "pl-16" : "pl-64") : "pl-0"
        )}
      >
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex h-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden h-10 w-10"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <h1 className="text-xl font-semibold text-foreground hidden sm:block">
                {filteredNav.find((n) => location.pathname.startsWith(n.href))?.name || "Sovereign Desktop"}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Sync status */}
              <SyncStatusBadge />

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-10 w-10"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* User menu */}
              <div className="relative">
                <Button variant="ghost" className="h-10 w-10 rounded-full" aria-label="User menu">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xs font-medium text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  )
}

import { createRouter, createRootRoute, createRoute, Outlet } from "@tanstack/react-router"
import { useAuthStore } from "@/hooks/useAuthStore"
import { Layout } from "@/components/Layout/Layout"
import { LoginPage } from "@/features/auth/LoginPage"
import { WorkspacePage } from "@/features/workspace/WorkspacePage"
import { GitInspectorPage } from "@/features/git/GitInspectorPage"
import { MeshPage } from "@/features/mesh/MeshPage"
import { SurrealQLPage } from "@/features/surreal/SurrealQLPage"
import { PPPoEPage } from "@/features/pppoe/PPPoEPage"
import { TenantPage } from "@/features/tenant/TenantPage"
import { DiagnosticsPage } from "@/features/diagnostics/DiagnosticsPage"
import { SettingsPage } from "@/features/settings/SettingsPage"

const rootRoute = createRootRoute({
  component: () => (
    <QueryProvider>
      <Layout />
    </QueryProvider>
  ),
})

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/",
  component: () => <Outlet />,
  beforeLoad: async () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw { redirect: "/login" }
    }
  },
})

const workspaceRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "workspace",
  component: WorkspacePage,
  beforeLoad: () => requireRole(["developer", "platform"]),
})

const gitRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "git",
  component: GitInspectorPage,
  beforeLoad: () => requireRole(["developer"]),
})

const meshRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "mesh",
  component: MeshPage,
  beforeLoad: () => requireRole(["platform"]),
})

const surrealRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "surreal",
  component: SurrealQLPage,
  beforeLoad: () => requireRole(["platform", "network"]),
})

const pppoeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "pppoe",
  component: PPPoEPage,
  beforeLoad: () => requireRole(["network"]),
})

const tenantRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "tenant",
  component: TenantPage,
  beforeLoad: () => requireRole(["support", "customer"]),
})

const diagnosticsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "diagnostics",
  component: DiagnosticsPage,
  beforeLoad: () => requireRole(["support"]),
})

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: "settings",
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  authRoute,
  appRoute.addChildren([
    workspaceRoute,
    gitRoute,
    meshRoute,
    surrealRoute,
    pppoeRoute,
    tenantRoute,
    diagnosticsRoute,
    settingsRoute,
  ]),
])

export const router = createRouter({ routeTree })
export type Router = typeof router

declare module "@tanstack/react-router" {
  interface Register {
    router: Router
  }
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  return children
}

function requireRole(allowedRoles: string[]) {
  const { user } = useAuthStore.getState()
  if (!user || !allowedRoles.includes(user.role)) {
    throw { redirect: "/app/settings" }
  }
}

export default router
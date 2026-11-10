import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { router } from "./App"
import "./styles/globals.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
)
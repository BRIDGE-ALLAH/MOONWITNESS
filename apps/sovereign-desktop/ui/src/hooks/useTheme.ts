import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

type Theme = "light" | "dark" | "system"

interface ThemeState {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: (theme) => {
        const resolved = theme === "system"
          ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
          : theme
        document.documentElement.classList.toggle("dark", resolved === "dark")
        set({ theme, resolvedTheme: resolved })
      },
      toggleTheme: () => {
        const { theme } = get()
        const newTheme = theme === "dark" ? "light" : "dark"
        get().setTheme(newTheme)
      },
    }),
    {
      name: "sovereign-theme",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle("dark", state.resolvedTheme === "dark")
        }
      },
    }
  )
)

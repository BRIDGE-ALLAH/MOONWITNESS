import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

interface User {
  id: string
  name: string
  role: string
  tenant_id?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateRole: (role: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      updateRole: (role) => set((state) => ({
        user: state.user ? { ...state.user, role } : null
      })),
    }),
    {
      name: "sovereign-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
)

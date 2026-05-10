import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UiState = {
  sidebarCollapsed: boolean
  lastTripId: string | null
  theme: 'light' | 'dark'
  setSidebarCollapsed: (v: boolean) => void
  setLastTripId: (id: string | null) => void
  setTheme: (t: 'light' | 'dark') => void
  toggleTheme: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      lastTripId: null,
      theme: 'light',
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setLastTripId: (lastTripId) => set({ lastTripId }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'traveloop-ui' },
  ),
)

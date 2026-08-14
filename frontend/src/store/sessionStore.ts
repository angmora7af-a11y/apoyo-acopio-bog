import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SessionData } from '@/types'

interface SessionStore {
  session:      SessionData | null
  setSession:   (s: SessionData) => void
  clearSession: () => void
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set) => ({
      session:      null,
      setSession:   (s) => set({ session: s }),
      clearSession: () => set({ session: null }),
    }),
    { name: 'ayudalog-session' },
  ),
)

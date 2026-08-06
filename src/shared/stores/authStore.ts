/**
 * Zustand store for authentication tokens.
 * Replaces direct localStorage access with a reactive store.
 */

import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
    accessToken: string | null
    refreshToken: string | null
    setTokens: (accessToken: string, refreshToken: string) => void
    setAccessToken: (accessToken: string) => void
    clearTokens: () => void
    getAccessToken: () => string | null
    getRefreshToken: () => string | null
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set, get) => ({
            accessToken: null,
            refreshToken: null,

            setTokens: (accessToken: string, refreshToken: string) => {
                set({ accessToken, refreshToken })
            },

            setAccessToken: (accessToken: string) => {
                set({ accessToken })
            },

            clearTokens: () => {
                set({ accessToken: null, refreshToken: null })
            },

            getAccessToken: () => get().accessToken,

            getRefreshToken: () => get().refreshToken,
        }),
        {
            name: "auth-storage",
        },
    ),
)

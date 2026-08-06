/**
 * Token storage wrapper using Zustand store.
 * Centralizes token management with reactive state.
 */

import { useAuthStore } from "@/shared/stores/authStore"

export const tokenStorage = {
    getAccessToken(): string | null {
        return useAuthStore.getState().getAccessToken()
    },

    getRefreshToken(): string | null {
        return useAuthStore.getState().getRefreshToken()
    },

    setTokens(accessToken: string, refreshToken: string): void {
        useAuthStore.getState().setTokens(accessToken, refreshToken)
    },

    setAccessToken(accessToken: string): void {
        useAuthStore.getState().setAccessToken(accessToken)
    },

    clearTokens(): void {
        useAuthStore.getState().clearTokens()
    },
}

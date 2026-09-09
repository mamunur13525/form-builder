/**
 * Auth feature hooks — TanStack Query wrappers around the auth entity API.
 *
 * Query keys:
 *   ["auth", "me"]  — current user profile
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { QueryClient } from "@tanstack/react-query"
import { tokenStorage } from "@/shared/utils/storage"
import { useWorkspaceStore } from "@/shared/stores/workspaceStore"
import type { AuthResponse, LoginRequest, RegisterRequest, GoogleLoginRequest } from "@/entities/auth/model/types"
import {
    changePassword,
    forgotPassword,
    getCurrentUser,
    googleAuth,
    loginUser,
    logoutUser,
    registerUser,
    resetPassword,
    verifyEmail,
} from "@/entities/auth/api/auth.api"

const AUTH_QUERY_KEY = ["auth", "me"]

/** Prefix of every workspace-scoped cache. A literal, to avoid a feature cycle. */
const WORKSPACE_SCOPED_KEYS = [["workspaces"], ["forms"]]

/**
 * Everything a successful sign-in has to do besides storing the user.
 *
 * The previous account's workspace and form caches are dropped first: both are
 * keyed by workspace, and the persisted `activeWorkspaceId` outlives a logout, so
 * signing in as someone else on the same browser would otherwise start out
 * pointing at a workspace this user cannot load.
 */
const adoptSession = (
    queryClient: QueryClient,
    data: AuthResponse,
    setActiveWorkspaceId: (workspaceId: string | null) => void,
): void => {
    tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken)
    for (const queryKey of WORKSPACE_SCOPED_KEYS) {
        queryClient.removeQueries({ queryKey })
    }
    // Seeded from the auth response so the dashboard is scoped on first render
    // instead of after a round trip to /workspaces.
    setActiveWorkspaceId(data.workspace?.id ?? null)
    queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /auth/me — fetch the current authenticated user. */
export function useCurrentUser() {
    const hasToken = !!tokenStorage.getAccessToken()

    return useQuery({
        queryKey: AUTH_QUERY_KEY,
        queryFn: getCurrentUser,
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /auth/login — authenticate and store tokens. */
export function useLogin() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (data: LoginRequest) => loginUser(data),
        onSuccess: (data: AuthResponse) => {
            adoptSession(queryClient, data, setActiveWorkspaceId)
        },
    })
}

/** POST /auth/register — register a new user and store tokens. */
export function useRegister() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (data: RegisterRequest) => registerUser(data),
        onSuccess: (data: AuthResponse) => {
            // A workspace is created alongside the account, so a brand-new user
            // lands in one without ever seeing an empty-state.
            adoptSession(queryClient, data, setActiveWorkspaceId)
        },
    })
}

/** POST /auth/logout — clear tokens and invalidate auth state. */
export function useLogout() {
    const queryClient = useQueryClient()
    const clearActiveWorkspaceId = useWorkspaceStore((state) => state.clearActiveWorkspaceId)

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            tokenStorage.clearTokens()
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
            // The workspace choice is persisted, so it has to be cleared here or
            // it would follow the next account signed in on this browser.
            clearActiveWorkspaceId()
            for (const queryKey of WORKSPACE_SCOPED_KEYS) {
                queryClient.removeQueries({ queryKey })
            }
        },
    })
}

/** POST /auth/forgot-password — send a password-reset link. */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => forgotPassword({ email }),
    })
}

/** POST /auth/reset-password — reset password using a reset token. */
export function useResetPassword() {
    return useMutation({
        mutationFn: ({ token, password }: { token: string; password: string }) =>
            resetPassword({ token, password }),
    })
}

/** POST /auth/verify-email — verify an email address. */
export function useVerifyEmail() {
    return useMutation({
        mutationFn: (token: string) => verifyEmail(token),
    })
}

/** POST /auth/google — sign up or sign in with Google using a Google ID token. */
export function useGoogleAuth() {
    const queryClient = useQueryClient()
    const setActiveWorkspaceId = useWorkspaceStore((state) => state.setActiveWorkspaceId)

    return useMutation({
        mutationFn: (data: GoogleLoginRequest) => googleAuth(data),
        onSuccess: (data: AuthResponse) => {
            adoptSession(queryClient, data, setActiveWorkspaceId)
        },
    })
}

/** PATCH /auth/change-password — change the current user's password. */
export function useChangePassword() {
    return useMutation({
        mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
            changePassword({ currentPassword, newPassword }),
    })
}

// ---------------------------------------------------------------------------
// Combined auth hook
// ---------------------------------------------------------------------------

/**
 * Convenience hook that bundles the current-user query with login/register/logout
 * mutations and exposes a simple `isAuthenticated` flag.
 */
export function useAuth() {
    const { data: user, isLoading, isError } = useCurrentUser()
    const login = useLogin()
    const register = useRegister()
    const logout = useLogout()

    const isAuthenticated = !!tokenStorage.getAccessToken()

    return {
        user,
        isAuthenticated,
        isLoading,
        isError,
        login,
        register,
        logout,
    }
}

/**
 * Auth feature hooks — TanStack Query wrappers around the auth entity API.
 *
 * Query keys:
 *   ["auth", "me"]  — current user profile
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tokenStorage } from "@/shared/utils/storage"
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

    return useMutation({
        mutationFn: (data: LoginRequest) => loginUser(data),
        onSuccess: (data: AuthResponse) => {
            tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken)
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
        },
    })
}

/** POST /auth/register — register a new user and store tokens. */
export function useRegister() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RegisterRequest) => registerUser(data),
        onSuccess: (data: AuthResponse) => {
            tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken)
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
        },
    })
}

/** POST /auth/logout — clear tokens and invalidate auth state. */
export function useLogout() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            tokenStorage.clearTokens()
            queryClient.removeQueries({ queryKey: AUTH_QUERY_KEY })
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

    return useMutation({
        mutationFn: (data: GoogleLoginRequest) => googleAuth(data),
        onSuccess: (data: AuthResponse) => {
            tokenStorage.setTokens(data.tokens.accessToken, data.tokens.refreshToken)
            queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
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

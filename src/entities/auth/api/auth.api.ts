/**
 * Auth API — wraps every endpoint documented under "Auth Endpoints" in API_DOCUMENTATION.md.
 * All functions are fully typed and delegate HTTP communication to the shared client.
 */

import { apiRequest, apiRequestVoid, buildQuery } from "@/shared/api/client"
import type {
    AuthResponse,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
} from "@/entities/auth/model/types"
import type { User } from "@/entities/user/model/types"

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/** POST /auth/register — register a new user and receive tokens. */
export async function registerUser(
    data: RegisterRequest,
): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /auth/login — authenticate and receive tokens. */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /auth/logout — client-side token removal. */
export async function logoutUser(): Promise<void> {
    return apiRequestVoid("/auth/logout", { method: "POST" })
}

/** POST /auth/refresh-token — exchange a refresh token for new tokens. */
export async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/auth/refresh-token", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
    })
}

/** POST /auth/forgot-password — send a password-reset link to an email. */
export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    return apiRequestVoid("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /auth/reset-password — reset password using a reset token. */
export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
    return apiRequestVoid("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /auth/verify-email — verify an email address via a verification token. */
export async function verifyEmail(token: string): Promise<void> {
    return apiRequestVoid(`/auth/verify-email${buildQuery({ token })}`, {
        method: "POST",
    })
}

/** GET /auth/me — retrieve the current authenticated user's profile. */
export async function getCurrentUser(): Promise<User> {
    return apiRequest<User>("/auth/me")
}

/** PATCH /auth/change-password — change the current user's password. */
export async function changePassword(data: ChangePasswordRequest): Promise<void> {
    return apiRequestVoid("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

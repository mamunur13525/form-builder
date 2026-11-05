/** Auth-related types that match the backend API documentation. */

export interface AuthTokens {
    accessToken: string
    refreshToken: string
}

export interface AuthUser {
    id: string
    name: string
    email: string
    role: "admin" | "editor" | "viewer"
    avatarUrl: string
}

/** Response for register / login / refresh-token / google-auth. */
export interface AuthResponse {
    user: AuthUser
    tokens: AuthTokens
    /**
     * The workspace the account landed in — created on signup, resolved on login.
     * The client seeds its active workspace from this so the first dashboard
     * render is already scoped. Absent if server-side provisioning failed, in
     * which case `GET /workspaces/active` is the fallback.
     */
    workspace?: {
        id: string
        name: string
        slug: string
    }
}

export interface RegisterRequest {
    name: string
    email: string
    password: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface GoogleLoginRequest {
    idToken: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    password: string
}

export interface ChangePasswordRequest {
    currentPassword: string
    newPassword: string
}
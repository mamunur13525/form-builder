/** User-related types that match the backend API documentation. */

export type UserRole = "admin" | "editor" | "viewer"

export interface User {
    id: string
    name: string
    email: string
    role: UserRole
    avatarUrl: string
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
    updatedAt: string
}

export interface UpdateProfileRequest {
    name?: string
    avatarUrl?: string
}

export interface UpdateUserRequest {
    name?: string
    email?: string
    role?: UserRole
    isActive?: boolean
}

export interface UpdateUserRoleRequest {
    role: UserRole
}

export interface UpdateUserStatusRequest {
    isActive: boolean
}

export interface UsersListParams {
    page?: number
    limit?: number
    sort?: string
}

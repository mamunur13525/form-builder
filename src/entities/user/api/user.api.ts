/**
 * User API — wraps every endpoint documented under "Users Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid, buildQuery } from "@/shared/api/client"
import type { User, UpdateProfileRequest, UpdateUserRequest, UpdateUserRoleRequest, UpdateUserStatusRequest, UsersListParams } from "@/entities/user/model/types"

// ---------------------------------------------------------------------------
// Current-user profile
// ---------------------------------------------------------------------------

/** GET /users/me — retrieve the current user's profile. */
export async function getCurrentUserProfile(): Promise<User> {
    return apiRequest<User>("/users/me")
}

/** PATCH /users/me — update the current user's profile. */
export async function updateCurrentUserProfile(data: UpdateProfileRequest): Promise<User> {
    return apiRequest<User>("/users/me", {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

// ---------------------------------------------------------------------------
// Admin user management
// ---------------------------------------------------------------------------

/** GET /users — list all users (admin only). */
export async function getAllUsers(params?: UsersListParams): Promise<User[]> {
    return apiRequest<User[]>(`/users${buildQuery(params as Record<string, unknown> | undefined)}`)
}

/** GET /users/:id — retrieve a single user by ID (admin only). */
export async function getUserById(id: string): Promise<User> {
    return apiRequest<User>(`/users/${id}`)
}

/** PATCH /users/:id — update a user (admin only). */
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return apiRequest<User>(`/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /users/:id — delete a user (admin only). */
export async function deleteUser(id: string): Promise<void> {
    return apiRequestVoid(`/users/${id}`, { method: "DELETE" })
}

/** PATCH /users/:id/role — update a user's role (admin only). */
export async function updateUserRole(id: string, data: UpdateUserRoleRequest): Promise<User> {
    return apiRequest<User>(`/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /users/:id/status — update a user's active status (admin only). */
export async function updateUserStatus(id: string, data: UpdateUserStatusRequest): Promise<User> {
    return apiRequest<User>(`/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

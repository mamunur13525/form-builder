/**
 * Users feature hooks — TanStack Query wrappers around the user entity API.
 *
 * Query keys:
 *   ["users"]                       — list of all users
 *   ["users", id]                   — single user by ID
 *   ["users", "me"]                 — current user profile
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    UpdateProfileRequest,
    UpdateUserRequest,
    UpdateUserRoleRequest,
    UpdateUserStatusRequest,
    User,
    UserRole,
    UsersListParams,
} from "@/entities/user/model/types"
import {
    deleteUser,
    getAllUsers,
    getCurrentUserProfile,
    getUserById,
    updateUser,
    updateUserRole,
    updateUserStatus,
    updateCurrentUserProfile,
} from "@/entities/user/api/user.api"

const USERS_QUERY_KEY = ["users"]
const CURRENT_USER_QUERY_KEY = ["users", "me"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /users — list all users (admin only). */
export function useUsers(params?: UsersListParams) {
    return useQuery({
        queryKey: [...USERS_QUERY_KEY, params],
        queryFn: () => getAllUsers(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /users/:id — retrieve a single user by ID (admin only). */
export function useUser(id: string) {
    return useQuery({
        queryKey: [...USERS_QUERY_KEY, id],
        queryFn: () => getUserById(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /users/me — retrieve the current user's profile. */
export function useCurrentUserProfile() {
    return useQuery({
        queryKey: CURRENT_USER_QUERY_KEY,
        queryFn: getCurrentUserProfile,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** PATCH /users/me — update the current user's profile. */
export function useUpdateCurrentUserProfile() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => updateCurrentUserProfile(data),
        onSuccess: (updated: User) => {
            queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updated)
        },
    })
}

/** PATCH /users/:id — update a user (admin only). */
export function useUpdateUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
            updateUser(id, data),
        onSuccess: (updated: User) => {
            queryClient.setQueryData([...USERS_QUERY_KEY, updated.id], updated)
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
        },
    })
}

/** DELETE /users/:id — delete a user (admin only). */
export function useDeleteUser() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
        },
    })
}

/** PATCH /users/:id/role — update a user's role (admin only). */
export function useUpdateUserRole() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
            updateUserRole(id, { role } as UpdateUserRoleRequest),
        onSuccess: (updated: User) => {
            queryClient.setQueryData([...USERS_QUERY_KEY, updated.id], updated)
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
        },
    })
}

/** PATCH /users/:id/status — update a user's active status (admin only). */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            updateUserStatus(id, { isActive } as UpdateUserStatusRequest),
        onSuccess: (updated: User) => {
            queryClient.setQueryData([...USERS_QUERY_KEY, updated.id], updated)
            queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
        },
    })
}

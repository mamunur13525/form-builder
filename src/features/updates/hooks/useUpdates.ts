/**
 * Updates / changelog feature hooks — TanStack Query wrappers around the update
 * entity API. Public reads plus the admin-only create/edit/delete mutations
 * used by the /admin/updates dashboard.
 *
 * Query keys:
 *   ["updates", "list"]
 *   ["updates", "detail", slug]
 *   ["updates", "activity"]
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
    createUpdate,
    deleteUpdate,
    fetchProductActivity,
    fetchUpdate,
    fetchUpdates,
    updateUpdate,
} from "@/entities/update/api/update.api"
import type {
    CreateUpdateRequest,
    UpdateUpdateRequest,
} from "@/entities/update/model/types"

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useUpdates() {
    return useQuery({ queryKey: ["updates", "list"], queryFn: fetchUpdates })
}

export function useUpdate(slug: string | undefined) {
    return useQuery({
        queryKey: ["updates", "detail", slug],
        queryFn: () => fetchUpdate(slug as string),
        enabled: !!slug,
    })
}

export function useProductActivity() {
    return useQuery({ queryKey: ["updates", "activity"], queryFn: fetchProductActivity })
}

// ---------------------------------------------------------------------------
// Admin mutations
// ---------------------------------------------------------------------------

function invalidateUpdates(qc: ReturnType<typeof useQueryClient>) {
    qc.invalidateQueries({ queryKey: ["updates"] })
}

export function useCreateUpdate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateUpdateRequest) => createUpdate(input),
        onSuccess: () => invalidateUpdates(qc),
    })
}

export function useUpdateUpdate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: ({ id, input }: { id: string; input: UpdateUpdateRequest }) =>
            updateUpdate(id, input),
        onSuccess: () => invalidateUpdates(qc),
    })
}

export function useDeleteUpdate() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => deleteUpdate(id),
        onSuccess: () => invalidateUpdates(qc),
    })
}

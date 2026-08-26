/**
 * Updates / changelog API — wrappers over the backend updates module.
 *
 * Public reads:
 *   GET    /updates
 *   GET    /updates/activity
 *   GET    /updates/:slug
 *
 * Admin-only writes (role === "admin"):
 *   POST   /updates
 *   PATCH  /updates/:id
 *   DELETE /updates/:id
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateUpdateRequest,
    ProductActivity,
    UpdateEntry,
    UpdateUpdateRequest,
} from "@/entities/update/model/types"

/** GET /updates — the changelog, newest first. */
export async function fetchUpdates(): Promise<UpdateEntry[]> {
    return apiRequest<UpdateEntry[]>("/updates")
}

/** GET /updates/:slug — a single update by slug. */
export async function fetchUpdate(slug: string): Promise<UpdateEntry> {
    return apiRequest<UpdateEntry>(`/updates/${slug}`)
}

/** GET /updates/activity — product-activity heat data for the sidebar. */
export async function fetchProductActivity(): Promise<ProductActivity> {
    return apiRequest<ProductActivity>("/updates/activity")
}

/** POST /updates — create an update (admin only). */
export async function createUpdate(input: CreateUpdateRequest): Promise<UpdateEntry> {
    return apiRequest<UpdateEntry>("/updates", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

/** PATCH /updates/:id — edit an update (admin only). */
export async function updateUpdate(
    id: string,
    input: UpdateUpdateRequest,
): Promise<UpdateEntry> {
    return apiRequest<UpdateEntry>(`/updates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
    })
}

/** DELETE /updates/:id — remove an update (admin only). */
export async function deleteUpdate(id: string): Promise<void> {
    return apiRequestVoid(`/updates/${id}`, { method: "DELETE" })
}

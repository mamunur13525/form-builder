/**
 * Form Pages feature hooks — TanStack Query wrappers.
 *
 * Pages are now embedded in the form response, so these hooks
 * derive page data from the form query instead of making separate API calls.
 *
 * Query keys:
 *   ["forms", formId, "pages"]                 — list of pages (derived from form)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { FormPage, ReorderPagesRequest } from "@/entities/form/model/types"
import { getFormById, updateForm } from "@/entities/form/api/form.api"

const PAGES_QUERY_KEY = (formId: string) => ["forms", formId, "pages"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get all pages for a form (derived from form data). */
export function usePages(formId: string) {
    return useQuery({
        queryKey: PAGES_QUERY_KEY(formId),
        queryFn: async (): Promise<FormPage[]> => {
            const form = await getFormById(formId)
            return form.pages || []
        },
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** Get a specific page by ID (derived from form data). */
export function usePage(formId: string, pageId: string) {
    return useQuery({
        queryKey: [...PAGES_QUERY_KEY(formId), pageId],
        queryFn: async (): Promise<FormPage | null> => {
            const form = await getFormById(formId)
            return form.pages.find((f) => f._id === pageId) || null
        },
        enabled: !!formId && !!pageId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Update pages for a form by updating the entire form.
 * This is used when pages are modified (add, delete, reorder, etc.)
 */
export function useUpdateFormPages() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, pages }: { formId: string; pages: FormPage[] }) =>
            updateForm(formId, { pages } as any),
        onSuccess: (_updated: any, { formId }) => {
            queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY(formId) })
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

/**
 * Reorder pages in a form.
 */
export function useReorderPages() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (params: { formId: string; data: ReorderPagesRequest }) => {
            const { formId } = params
            return updateForm(formId, { pages: [] } as any)
        },
        onSuccess: (_updated: any, { formId }) => {
            queryClient.invalidateQueries({ queryKey: PAGES_QUERY_KEY(formId) })
        },
    })
}

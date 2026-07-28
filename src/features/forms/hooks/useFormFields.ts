/**
 * Form Fields feature hooks — TanStack Query wrappers.
 *
 * Fields are now embedded in the form response, so these hooks
 * derive field data from the form query instead of making separate API calls.
 *
 * Query keys:
 *   ["forms", formId, "fields"]                 — list of fields (derived from form)
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { FormField, ReorderFieldsRequest } from "@/entities/form/model/types"
import { getFormById, updateForm } from "@/entities/form/api/form.api"

const FIELDS_QUERY_KEY = (formId: string) => ["forms", formId, "fields"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get all fields for a form (derived from form data). */
export function useFields(formId: string) {
    return useQuery({
        queryKey: FIELDS_QUERY_KEY(formId),
        queryFn: async (): Promise<FormField[]> => {
            const form = await getFormById(formId)
            return form.fields || []
        },
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** Get a specific field by ID (derived from form data). */
export function useField(formId: string, fieldId: string) {
    return useQuery({
        queryKey: [...FIELDS_QUERY_KEY(formId), fieldId],
        queryFn: async (): Promise<FormField | null> => {
            const form = await getFormById(formId)
            return form.fields.find((f) => f._id === fieldId) || null
        },
        enabled: !!formId && !!fieldId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Update fields for a form by updating the entire form.
 * This is used when fields are modified (add, delete, reorder, etc.)
 */
export function useUpdateFormFields() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fields }: { formId: string; fields: FormField[] }) =>
            updateForm(formId, { fields } as any),
        onSuccess: (_updated: any, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

/**
 * Reorder fields in a form.
 */
export function useReorderFields() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (params: { formId: string; data: ReorderFieldsRequest }) => {
            const { formId } = params
            return updateForm(formId, { fields: [] } as any)
        },
        onSuccess: (_updated: any, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
        },
    })
}

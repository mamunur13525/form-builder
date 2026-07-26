/**
 * Form Fields feature hooks — TanStack Query wrappers around the field entity API.
 *
 * Query keys:
 *   ["forms", formId, "fields"]                 — list of fields
 *   ["forms", formId, "fields", fieldId]        — single field
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    CreateFieldRequest,
    FormField,
    ReorderFieldsRequest,
    UpdateFieldLogicRequest,
    UpdateFieldRequest,
} from "@/entities/form/model/types"
import {
    createField,
    deleteField,
    deleteFieldLogic,
    duplicateField,
    getFieldById,
    getFields,
    reorderFields,
    updateField,
    updateFieldLogic,
} from "@/entities/form/api/field.api"

const FIELDS_QUERY_KEY = (formId: string) => ["forms", formId, "fields"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms/:formId/fields — get all fields for a form. */
export function useFields(formId: string) {
    return useQuery({
        queryKey: FIELDS_QUERY_KEY(formId),
        queryFn: () => getFields(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId/fields/:fieldId — get a specific field by ID. */
export function useField(formId: string, fieldId: string) {
    return useQuery({
        queryKey: [...FIELDS_QUERY_KEY(formId), fieldId],
        queryFn: () => getFieldById(formId, fieldId),
        enabled: !!formId && !!fieldId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /forms/:formId/fields — create a new field in a form. */
export function useCreateField() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: CreateFieldRequest }) =>
            createField(formId, data),
        onSuccess: (_updated: FormField, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/fields/:fieldId — update a field. */
export function useUpdateField() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fieldId, data }: { formId: string; fieldId: string; data: UpdateFieldRequest }) =>
            updateField(formId, fieldId, data),
        onSuccess: (updated: FormField, { formId }) => {
            queryClient.setQueryData([...FIELDS_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** DELETE /forms/:formId/fields/:fieldId — delete a field. */
export function useDeleteField() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fieldId }: { formId: string; fieldId: string }) =>
            deleteField(formId, fieldId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/fields/reorder — reorder fields in a form. */
export function useReorderFields() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: ReorderFieldsRequest }) =>
            reorderFields(formId, data),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/fields/:fieldId/duplicate — duplicate a field. */
export function useDuplicateField() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fieldId }: { formId: string; fieldId: string }) =>
            duplicateField(formId, fieldId),
        onSuccess: (_updated: FormField, { formId }) => {
            queryClient.invalidateQueries({ queryKey: FIELDS_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/fields/:fieldId/logic — update field logic. */
export function useUpdateFieldLogic() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fieldId, data }: { formId: string; fieldId: string; data: UpdateFieldLogicRequest }) =>
            updateFieldLogic(formId, fieldId, data),
        onSuccess: (updated: FormField, { formId }) => {
            queryClient.setQueryData([...FIELDS_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** DELETE /forms/:formId/fields/:fieldId/logic — delete field logic. */
export function useDeleteFieldLogic() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, fieldId }: { formId: string; fieldId: string }) =>
            deleteFieldLogic(formId, fieldId),
        onSuccess: (updated: FormField, { formId }) => {
            queryClient.setQueryData([...FIELDS_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

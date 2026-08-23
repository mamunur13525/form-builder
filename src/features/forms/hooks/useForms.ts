/**
 * Forms feature hooks — TanStack Query wrappers around the form entity API.
 *
 * Query keys:
 *   ["forms"]                       — list of all forms
 *   ["forms", formId]               — single form
 *   ["forms", formId, "slug"]       — form slug
 *   ["forms", formId, "pages"]     — form pages
 *   ["forms", formId, "blocks"]     — form blocks
 *   ["forms", formId, "logic"]      — form logic rules
 *   ["forms", formId, "analytics"]  — form analytics
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    CreateFormRequest,
    Form,
    FormShare,
    UpdateFormRequest,
    UpdateFormShareRequest,
    UpdateFormSettingsRequest,
    UpdateFormThemeRequest,
} from "@/entities/form/model/types"
import {
    archiveForm,
    createForm,
    deleteForm,
    duplicateForm,
    getFormById,
    getFormSlug,
    getForms,
    publishForm,
    restoreForm,
    unpublishForm,
    updateForm,
    updateFormSettings,
    updateFormShare,
    updateFormTheme,
} from "@/entities/form/api/form.api"

const FORMS_QUERY_KEY = ["forms"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms — list all forms for the authenticated user. */
export function useForms(params?: { page?: number; limit?: number; sort?: string }) {
    return useQuery({
        queryKey: [...FORMS_QUERY_KEY, params],
        queryFn: () => getForms(params),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId — retrieve a single form by ID. */
export function useForm(formId: string) {
    return useQuery({
        queryKey: [...FORMS_QUERY_KEY, formId],
        queryFn: () => getFormById(formId),
        enabled: !!formId,
        staleTime: 0,
        gcTime: 10 * 60 * 1000,
        refetchOnMount: "always",
    })
}

/** GET /forms/:formId/slug — retrieve the slug and public URL for a form. */
export function useFormSlug(formId: string) {
    return useQuery({
        queryKey: [...FORMS_QUERY_KEY, formId, "slug"],
        queryFn: () => getFormSlug(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /forms — create a new form. */
export function useCreateForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateFormRequest) => createForm(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
        },
    })
}

/** PATCH /forms/:formId — update a form's title */
export function useUpdateForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: UpdateFormRequest }) =>
            updateForm(formId, data),
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** DELETE /forms/:formId — delete a form. */
export function useDeleteForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: deleteForm,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
        },
    })
}

/** PATCH /forms/:formId/duplicate — duplicate a form. */
export function useDuplicateForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, title }: { formId: string; title: string }) =>
            duplicateForm(formId, title),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: FORMS_QUERY_KEY })
        },
    })
}

/** PATCH /forms/:formId/archive — archive a form. */
export function useArchiveForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: archiveForm,
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/restore — restore an archived form. */
export function useRestoreForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: restoreForm,
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/publish — publish a form. */
export function usePublishForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: publishForm,
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/unpublish — unpublish a form. */
export function useUnpublishForm() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: unpublishForm,
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/settings — update form settings. */
export function useUpdateFormSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: UpdateFormSettingsRequest }) =>
            updateFormSettings(formId, data),
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/theme — update form theme. */
export function useUpdateFormTheme() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: UpdateFormThemeRequest }) =>
            updateFormTheme(formId, data),
        onSuccess: (updated: Form) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/share — update form share settings. */
export function useUpdateFormShare() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: UpdateFormShareRequest }) =>
            updateFormShare(formId, data),
        onSuccess: (updated: FormShare) => {
            queryClient.setQueryData([...FORMS_QUERY_KEY, updated.formId, "share"], updated)
        },
    })
}

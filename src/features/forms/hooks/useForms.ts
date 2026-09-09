/**
 * Forms feature hooks — TanStack Query wrappers around the form entity API.
 *
 * Query keys:
 *   ["forms"]                          — prefix every form query shares
 *   ["forms", "list", workspaceId, p]  — list of forms in one workspace
 *   ["forms", formId]                  — single form
 *   ["forms", formId, "slug"]          — form slug
 *   ["forms", formId, "pages"]         — form pages
 *   ["forms", formId, "blocks"]        — form blocks
 *   ["forms", formId, "logic"]         — form logic rules
 *   ["forms", formId, "analytics"]     — form analytics
 *
 * The list key carries the workspace id because forms belong to a workspace:
 * switching workspaces has to show a different list, and caching both under one
 * key would flash the wrong team's forms. The `"list"` segment keeps that key
 * from colliding with `["forms", formId]`, which sits at the same depth.
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
import { useActiveWorkspace } from "@/features/workspaces/hooks/useWorkspaces"

const FORMS_QUERY_KEY = ["forms"]

interface FormListParams {
    page?: number
    limit?: number
    sort?: string
}

/** Key for a workspace's form list. Exported so a switch can drop just that list. */
export const formListKey = (
    workspaceId: string | null,
    params?: FormListParams,
) => [...FORMS_QUERY_KEY, "list", workspaceId, params ?? null] as const

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * GET /forms — the forms in the caller's active workspace.
 *
 * The workspace id comes from `useActiveWorkspace`, which has already reconciled
 * the persisted choice against the workspaces the user actually belongs to — so
 * a workspace they were removed from cannot leak into the request. The fetch
 * waits for that reconciliation; while it is loading, `workspaceId` is null and
 * the query stays idle rather than fetching an unscoped list it would throw away.
 */
export function useForms(params?: FormListParams) {
    const { activeWorkspaceId, isLoading: isLoadingWorkspaces } = useActiveWorkspace()

    return useQuery({
        queryKey: formListKey(activeWorkspaceId, params),
        queryFn: () =>
            getForms({
                ...params,
                ...(activeWorkspaceId ? { workspaceId: activeWorkspaceId } : {}),
            }),
        // An account with no workspace at all still gets a list: the server
        // provisions one on demand. Only the reconciliation itself blocks.
        enabled: !isLoadingWorkspaces,
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

/**
 * POST /forms — create a form in the active workspace.
 *
 * Callers pass a title; the workspace is filled in here so no page has to know
 * about workspace state to make a form. An explicit `workspaceId` in the payload
 * still wins, which is what a "create in another workspace" flow would use.
 */
export function useCreateForm() {
    const queryClient = useQueryClient()
    const { activeWorkspaceId } = useActiveWorkspace()

    return useMutation({
        mutationFn: (data: CreateFormRequest) => {
            const workspaceId = data.workspaceId ?? activeWorkspaceId
            return createForm({ ...data, ...(workspaceId ? { workspaceId } : {}) })
        },
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

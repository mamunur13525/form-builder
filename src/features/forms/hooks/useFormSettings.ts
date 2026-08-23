/**
 * Form Settings feature hooks — TanStack Query wrappers around the settings
 * entity API. The GET is shared across every settings section (one query key),
 * so whichever section is mounted reads from the same cache; each section owns
 * one PATCH mutation.
 *
 * Query key:
 *   ["forms", formId, "settings"] — the grouped draft settings object
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
    FormSettingsResponse,
    UpdateAccessSettingsRequest,
    UpdateEmailSettingsRequest,
    UpdateGeneralSettingsRequest,
    UpdateHiddenFieldsRequest,
    UpdateVariablesRequest,
} from "@/entities/form/model/types"
import {
    getFormSettings,
    updateAccessSettings,
    updateEmailSettings,
    updateGeneralSettings,
    updateHiddenFields,
    updateVariables,
} from "@/entities/form/api/settings.api"

export const SETTINGS_QUERY_KEY = (formId: string) => [
    "forms",
    formId,
    "settings",
]

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/** GET /forms/:formId/settings — load the current draft settings. */
export function useFormSettings(formId: string) {
    return useQuery({
        queryKey: SETTINGS_QUERY_KEY(formId),
        queryFn: () => getFormSettings(formId),
        enabled: !!formId && formId !== "new",
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        // Editing state is seeded from this query; a focus refetch mid-edit
        // would be surprising, so opt out (the section hook re-seeds on load).
        refetchOnWindowFocus: false,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/**
 * Shared cache handling: settings PATCH endpoints return the full normalized
 * settings, so write that straight into the cache; if a backend ever returns a
 * partial body, fall back to a refetch.
 */
function useSettingsMutation<TData>(
    mutationFn: (args: { formId: string; data: TData }) => Promise<FormSettingsResponse>,
) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn,
        onSuccess: (updated, { formId }) => {
            if (updated?.settings) {
                queryClient.setQueryData(SETTINGS_QUERY_KEY(formId), updated)
            } else {
                queryClient.invalidateQueries({
                    queryKey: SETTINGS_QUERY_KEY(formId),
                })
            }
        },
    })
}

/** PATCH /forms/:formId/settings/general */
export function useUpdateGeneralSettings() {
    return useSettingsMutation<UpdateGeneralSettingsRequest>(
        ({ formId, data }) => updateGeneralSettings(formId, data),
    )
}

/** PATCH /forms/:formId/settings/email */
export function useUpdateEmailSettings() {
    return useSettingsMutation<UpdateEmailSettingsRequest>(({ formId, data }) =>
        updateEmailSettings(formId, data),
    )
}

/** PATCH /forms/:formId/settings/access */
export function useUpdateAccessSettings() {
    return useSettingsMutation<UpdateAccessSettingsRequest>(({ formId, data }) =>
        updateAccessSettings(formId, data),
    )
}

/** PATCH /forms/:formId/settings/hidden-fields */
export function useUpdateHiddenFields() {
    return useSettingsMutation<UpdateHiddenFieldsRequest>(({ formId, data }) =>
        updateHiddenFields(formId, data),
    )
}

/** PATCH /forms/:formId/settings/variables */
export function useUpdateVariables() {
    return useSettingsMutation<UpdateVariablesRequest>(({ formId, data }) =>
        updateVariables(formId, data),
    )
}

/**
 * Form Logic feature hooks — TanStack Query wrappers around the logic entity API.
 *
 * Query keys:
 *   ["forms", formId, "logic"]              — list of logic rules
 *   ["forms", formId, "logic", logicId]     — single logic rule
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    CreateLogicRequest,
    FormLogic,
    UpdateLogicRequest,
} from "@/entities/form/model/types"
import {
    createLogic,
    deleteLogicRule,
    getLogicRules,
    replaceLogicRules,
    updateLogicRule,
} from "@/entities/form/api/logic.api"

const LOGIC_QUERY_KEY = (formId: string) => ["forms", formId, "logic"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms/:formId/logic — get all logic for a form. */
export function useLogicRules(formId: string) {
    return useQuery({
        queryKey: LOGIC_QUERY_KEY(formId),
        queryFn: () => getLogicRules(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /forms/:formId/logic — create form-level logic. */
export function useCreateLogic() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data }: { formId: string; data: CreateLogicRequest }) =>
            createLogic(formId, data),
        onSuccess: (_updated: FormLogic, { formId }) => {
            queryClient.invalidateQueries({ queryKey: LOGIC_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/logic/:logicId — update a logic rule. */
export function useUpdateLogicRule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, logicId, data }: { formId: string; logicId: string; data: UpdateLogicRequest }) =>
            updateLogicRule(formId, logicId, data),
        onSuccess: (updated: FormLogic, { formId }) => {
            queryClient.setQueryData([...LOGIC_QUERY_KEY(formId), updated.id], updated)
            // The list (used by the Logic Builder canvas + rules dialog) must
            // reflect the edit right away.
            queryClient.invalidateQueries({ queryKey: LOGIC_QUERY_KEY(formId) })
        },
    })
}

/** DELETE /forms/:formId/logic/:logicId — delete a logic rule. */
export function useDeleteLogicRule() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, logicId }: { formId: string; logicId: string }) =>
            deleteLogicRule(formId, logicId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: LOGIC_QUERY_KEY(formId) })
        },
    })
}

/** PUT /forms/:formId/logic — replace all logic rules at once. */
export function useReplaceLogic() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, rules }: { formId: string; rules: CreateLogicRequest[] }) =>
            replaceLogicRules(formId, rules),
        onSuccess: (updated: FormLogic[], { formId }) => {
            queryClient.setQueryData(LOGIC_QUERY_KEY(formId), updated)
        },
    })
}

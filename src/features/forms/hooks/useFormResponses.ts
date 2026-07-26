/**
 * Form Responses feature hooks — TanStack Query wrappers around the response entity API.
 *
 * Query keys:
 *   ["forms", formId, "responses"]                       — list of responses
 *   ["forms", formId, "responses", responseId]           — single response
 *   ["forms", formId, "responses", "stats"]              — response stats
 *   ["forms", formId, "responses", "summary"]            — response summary
 *   ["forms", formId, "responses", "export"]             — exported responses
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    ExportParams,
    FormResponse,
    ResponsesListParams,
    UpdateResponseRequest,
} from "@/entities/response/model/types"
import {
    deleteResponse,
    exportResponses,
    getResponseById,
    getResponseStats,
    getResponseSummary,
    getResponses,
    markResponseAsRead,
    markResponseAsUnread,
    starResponse,
    unstarResponse,
    updateResponse,
} from "@/entities/response/api/response.api"

const RESPONSES_QUERY_KEY = (formId: string) => ["forms", formId, "responses"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms/:formId/responses — get all responses for a form. */
export function useResponses(formId: string, params?: ResponsesListParams) {
    return useQuery({
        queryKey: [...RESPONSES_QUERY_KEY(formId), params],
        queryFn: () => getResponses(formId, params),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId/responses/:responseId — get a specific response by ID. */
export function useResponse(formId: string, responseId: string) {
    return useQuery({
        queryKey: [...RESPONSES_QUERY_KEY(formId), responseId],
        queryFn: () => getResponseById(formId, responseId),
        enabled: !!formId && !!responseId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId/responses/stats — get response statistics. */
export function useResponseStats(formId: string) {
    return useQuery({
        queryKey: [...RESPONSES_QUERY_KEY(formId), "stats"],
        queryFn: () => getResponseStats(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId/responses/summary — get response summary. */
export function useResponseSummary(formId: string) {
    return useQuery({
        queryKey: [...RESPONSES_QUERY_KEY(formId), "summary"],
        queryFn: () => getResponseSummary(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

/** GET /forms/:formId/responses/export — export responses. */
export function useExportResponses(formId: string, params?: ExportParams) {
    return useQuery({
        queryKey: [...RESPONSES_QUERY_KEY(formId), "export", params],
        queryFn: () => exportResponses(formId, params),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** DELETE /forms/:formId/responses/:responseId — delete a response. */
export function useDeleteResponse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId }: { formId: string; responseId: string }) =>
            deleteResponse(formId, responseId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: RESPONSES_QUERY_KEY(formId) })
        },
    })
}

/** PATCH /forms/:formId/responses/:responseId — update a response. */
export function useUpdateResponse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId, data }: { formId: string; responseId: string; data: UpdateResponseRequest }) =>
            updateResponse(formId, responseId, data),
        onSuccess: (updated: FormResponse, { formId }) => {
            queryClient.setQueryData([...RESPONSES_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/responses/:responseId/mark-read — mark a response as read. */
export function useMarkResponseAsRead() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId }: { formId: string; responseId: string }) =>
            markResponseAsRead(formId, responseId),
        onSuccess: (updated: FormResponse, { formId }) => {
            queryClient.setQueryData([...RESPONSES_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/responses/:responseId/mark-unread — mark a response as unread. */
export function useMarkResponseAsUnread() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId }: { formId: string; responseId: string }) =>
            markResponseAsUnread(formId, responseId),
        onSuccess: (updated: FormResponse, { formId }) => {
            queryClient.setQueryData([...RESPONSES_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/responses/:responseId/star — star a response. */
export function useStarResponse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId }: { formId: string; responseId: string }) =>
            starResponse(formId, responseId),
        onSuccess: (updated: FormResponse, { formId }) => {
            queryClient.setQueryData([...RESPONSES_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

/** PATCH /forms/:formId/responses/:responseId/unstar — unstar a response. */
export function useUnstarResponse() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, responseId }: { formId: string; responseId: string }) =>
            unstarResponse(formId, responseId),
        onSuccess: (updated: FormResponse, { formId }) => {
            queryClient.setQueryData([...RESPONSES_QUERY_KEY(formId), updated.id], updated)
        },
    })
}

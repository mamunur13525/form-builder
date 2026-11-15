/**
 * Response API — wraps every endpoint documented under "Responses Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid, buildQuery } from "@/shared/api/client"
import type {
    ExportParams,
    ExportResult,
    FormAnalytics,
    FormAnalyticsFilter,
    FormResponse,
    ResponsesListParams,
    ResponseStats,
    ResponseSummary,
    ResponseSummaryPage,
    UpdateResponseRequest,
} from "@/entities/response/model/types"

/** GET /forms/:formId/responses — get all responses for a form. */
export async function getResponses(
    formId: string,
    params?: ResponsesListParams,
): Promise<FormResponse[]> {
    return apiRequest<FormResponse[]>(
        `/forms/${formId}/responses${buildQuery(params as Record<string, unknown> | undefined)}`,
    )
}

/** GET /forms/:formId/responses/:responseId — get a specific response by ID. */
export async function getResponseById(formId: string, responseId: string): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}`)
}

/** DELETE /forms/:formId/responses/:responseId — delete a response. */
export async function deleteResponse(formId: string, responseId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/responses/${responseId}`, { method: "DELETE" })
}

/** PATCH /forms/:formId/responses/:responseId — update a response. */
export async function updateResponse(
    formId: string,
    responseId: string,
    data: UpdateResponseRequest,
): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/responses/export — export responses in a specific format. */
export async function exportResponses(
    formId: string,
    params?: ExportParams,
): Promise<ExportResult> {
    return apiRequest<ExportResult>(
        `/forms/${formId}/responses/export${buildQuery(params as Record<string, unknown> | undefined)}`,
    )
}

/** GET /forms/:formId/responses/stats — get response statistics. */
export async function getResponseStats(formId: string): Promise<ResponseStats> {
    return apiRequest<ResponseStats>(`/forms/${formId}/responses/stats`)
}

/** GET /forms/:formId/responses/summary — get response summary. */
export async function getResponseSummary(formId: string): Promise<ResponseSummary> {
    // The API groups answers by pageKey in an object; the UI wants a list.
    type ApiSummaryPage = { label: string; type: string; values: unknown[]; count: number }
    const data = await apiRequest<{
        totalResponses?: number
        pages?: Record<string, ApiSummaryPage> | ResponseSummaryPage[]
    }>(`/forms/${formId}/responses/summary`)

    const pages: ResponseSummaryPage[] = Array.isArray(data.pages)
        ? data.pages
        : Object.entries(data.pages ?? {}).map(([pageKey, page]) => ({
              pageKey,
              label: page.label,
              type: page.type,
              answerCount: page.count,
              uniqueAnswers: new Set(page.values.map((value) => JSON.stringify(value))).size,
              values: page.values,
          }))

    return { totalResponses: data.totalResponses ?? 0, pages }
}

/** PATCH /forms/:formId/responses/:responseId/mark-read — mark a response as read. */
export async function markResponseAsRead(formId: string, responseId: string): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}/mark-read`, {
        method: "PATCH",
    })
}

/** PATCH /forms/:formId/responses/:responseId/mark-unread — mark a response as unread. */
export async function markResponseAsUnread(formId: string, responseId: string): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}/mark-unread`, {
        method: "PATCH",
    })
}

/** PATCH /forms/:formId/responses/:responseId/star — star a response. */
export async function starResponse(formId: string, responseId: string): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}/star`, {
        method: "PATCH",
    })
}

/** PATCH /forms/:formId/responses/:responseId/unstar — unstar a response. */
export async function unstarResponse(formId: string, responseId: string): Promise<FormResponse> {
    return apiRequest<FormResponse>(`/forms/${formId}/responses/${responseId}/unstar`, {
        method: "PATCH",
    })
}

/** GET /forms/:formId/analytics — get form analytics, trends, and question drop-off rates. */
export async function getFormAnalytics(
    formId: string,
    filters?: FormAnalyticsFilter,
): Promise<FormAnalytics> {
    return apiRequest<FormAnalytics>(
        `/forms/${formId}/analytics${buildQuery(filters as Record<string, unknown> | undefined)}`,
    )
}


/**
 * Analytics API — wraps every endpoint documented under "Analytics Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest } from "@/shared/api/client"
import type {
    AnalyticsConversion,
    AnalyticsDropoff,
    AnalyticsPage,
    AnalyticsOverview,
    AnalyticsSubmissions,
    AnalyticsSummary,
    AnalyticsViews,
} from "@/entities/form/model/analytics"

/** GET /forms/:formId/analytics — get overall analytics for a form. */
export async function getFormAnalytics(formId: string): Promise<AnalyticsOverview> {
    return apiRequest<AnalyticsOverview>(`/forms/${formId}/analytics`)
}

/** GET /forms/:formId/analytics/overview — get analytics overview. */
export async function getAnalyticsOverview(formId: string): Promise<AnalyticsSummary> {
    return apiRequest<AnalyticsSummary>(`/forms/${formId}/analytics/overview`)
}

/** GET /forms/:formId/analytics/views — get form views analytics. */
export async function getAnalyticsViews(formId: string): Promise<AnalyticsViews> {
    return apiRequest<AnalyticsViews>(`/forms/${formId}/analytics/views`)
}

/** GET /forms/:formId/analytics/submissions — get recent submissions analytics. */
export async function getAnalyticsSubmissions(formId: string): Promise<AnalyticsSubmissions> {
    return apiRequest<AnalyticsSubmissions>(`/forms/${formId}/analytics/submissions`)
}

/** GET /forms/:formId/analytics/conversion — get conversion analytics. */
export async function getAnalyticsConversion(formId: string): Promise<AnalyticsConversion> {
    return apiRequest<AnalyticsConversion>(`/forms/${formId}/analytics/conversion`)
}

/** GET /forms/:formId/analytics/dropoff — get page dropoff analytics. */
export async function getAnalyticsDropoff(formId: string): Promise<AnalyticsDropoff> {
    return apiRequest<AnalyticsDropoff>(`/forms/${formId}/analytics/dropoff`)
}

/** GET /forms/:formId/analytics/page/:pageId — get analytics for a specific page. */
export async function getAnalyticsPage(formId: string, pageId: string): Promise<AnalyticsPage> {
    return apiRequest<AnalyticsPage>(`/forms/${formId}/analytics/page/${pageId}`)
}

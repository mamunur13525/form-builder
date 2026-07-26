/** Analytics types that match the backend API documentation. */

export interface AnalyticsOverview {
    formId: string
    formTitle: string
    totalViews: number
    totalSubmissions: number
    conversionRate: string
}

export interface AnalyticsSummary {
    totalResponses: number
    todayResponses: number
    totalFields: number
    averageResponsesPerDay: string
}

export interface AnalyticsViews {
    formId: string
    views: number
    uniqueVisitors: number
}

export interface AnalyticsSubmissionEntry {
    submittedAt: string
}

export interface AnalyticsSubmissions {
    total: number
    submissions: AnalyticsSubmissionEntry[]
}

export interface AnalyticsConversion {
    formId: string
    views: number
    submissions: number
    conversionRate: string
    dropOffRate: string
}

export interface DropoffData {
    fieldId: string
    fieldKey: string
    label: string
    reached: number
    answered: number
    dropoff: number
}

export interface AnalyticsDropoff {
    formId: string
    dropoffData: DropoffData[]
}

export interface AnalyticsField {
    field: unknown
    totalResponses: number
    answers: { fieldKey: string; label: string; type: string; value: unknown }[]
}

/** Response, analytics, and public-form types that match the backend API documentation. */

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export interface ResponseAnswer {
    pageKey: string
    blockKey?: string
    questionKey?: string
    title?: string
    label: string
    type: string
    value: unknown
}

export interface ResponseMetadata {
    ipAddress: string
    userAgent: string
    referrer: string
    country: string
    city: string
}

export interface FormResponse {
    id: string
    formId: string
    respondentId?: string
    sessionId: string
    status?: "completed" | "partial"
    answers: ResponseAnswer[]
    metadata: ResponseMetadata
    submittedAt: string
    createdAt: string
    updatedAt: string
}

export interface UpdateResponseRequest {
    answers?: ResponseAnswer[]
    metadata?: Partial<ResponseMetadata>
}

export interface ResponsesListParams {
    page?: number
    limit?: number
    sort?: string
    status?: "completed" | "partial"
}

// ---------------------------------------------------------------------------
// Response stats / summary
// ---------------------------------------------------------------------------

export interface ResponseStats {
    totalResponses: number
    uniqueRespondents: number
    todayResponses: number
    averageCompletionTime: number
    completionRate: number
    completedCount?: number
    partialCount?: number
}

export interface ResponseSummaryPage {
    pageKey: string
    label: string
    type: string
    answerCount: number
    uniqueAnswers: number
    /** Every raw answer recorded for this question. */
    values: unknown[]
}

export interface ResponseSummary {
    totalResponses: number
    pages: ResponseSummaryPage[]
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export type ExportFormat = "json" | "csv"

export interface ExportParams {
    format?: ExportFormat
    status?: "completed" | "partial"
}

export interface ExportResult {
    format: string
    count: number
    responses: FormResponse[]
}

// ---------------------------------------------------------------------------
// Public form submission
// ---------------------------------------------------------------------------

export interface SubmitFormRequest {
    answers: ResponseAnswer[]
    sessionId?: string
}

export interface SubmissionResult {
    submissionId: string
    formVersionId: string
    message: string
}

export interface DraftResult {
    submissionId: string
    sessionId: string
    message: string
}

export interface SubmitStatus {
    submissionId: string
    submittedAt: string
    status: string
}

// ---------------------------------------------------------------------------
// Public form schema / preview
// ---------------------------------------------------------------------------

export interface PublicFormSchema {
    form: {
        id: string
        title: string
        settings: {
            oneQuestionAtATime: boolean
            showProgressBar: boolean
            allowMultipleSubmissions: boolean
            requireLogin: boolean
            collectIP: boolean
        }
    }
    pages: unknown[]
}

export interface PublicFormPreview {
    form: unknown
    pages: unknown[]
}

export interface PublicFormTheme {
    id: string
    title: string
    theme: {
        primaryColor: string
        backgroundColor: string
        textColor: string
    }
}

// ---------------------------------------------------------------------------
// Form Analytics & Drop-off
// ---------------------------------------------------------------------------

export interface FormAnalyticsFilter {
    timeRange?: "all" | "today" | "7d" | "30d" | "90d"
    device?: "all" | "desktop" | "mobile" | "tablet"
}

export interface AnalyticsTrendPoint {
    date: string
    views: number
    starts: number
    submissions: number
}

export interface AnalyticsDropoffItem {
    id: string
    key: string
    title: string
    type: string
    views: number
    dropoffRate: number
}

export interface FormAnalytics {
    formId: string
    formTitle?: string
    views: number
    starts: number
    submissions: number
    completionRate: number
    completionTime: number
    trends: AnalyticsTrendPoint[]
    dropoff: AnalyticsDropoffItem[]
}

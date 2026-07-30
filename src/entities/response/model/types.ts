/** Response, analytics, and public-form types that match the backend API documentation. */

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

export interface ResponseAnswer {
    fieldKey: string
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
}

export interface ResponseSummaryField {
    fieldKey: string
    label: string
    type: string
    answerCount: number
    uniqueAnswers: number
}

export interface ResponseSummary {
    totalResponses: number
    fields: ResponseSummaryField[]
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export type ExportFormat = "json" | "csv"

export interface ExportParams {
    format?: ExportFormat
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
    sessionId: string
}

export interface SubmissionResult {
    submissionId: string
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
    fields: unknown[]
}

export interface PublicFormPreview {
    form: unknown
    fields: unknown[]
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

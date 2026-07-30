/**
 * Public Form API — wraps every endpoint documented under "Public Form Endpoints" in API_DOCUMENTATION.md.
 * These endpoints are public (no auth required) and are used for form filling and preview.
 */

import { apiRequest } from "@/shared/api/client"
import type { PublishedForm } from "@/entities/form/model/types"
import type {
    DraftResult,
    PublicFormPreview,
    PublicFormSchema,
    PublicFormTheme,
    SubmitFormRequest,
    SubmitStatus,
    SubmissionResult,
} from "@/entities/response/model/types"

/** GET /public/forms/:slug — get a published form by slug (public, no auth). */
export async function getPublicForm(slug: string): Promise<PublishedForm> {
    return apiRequest<PublishedForm>(`/public/forms/${slug}`)
}

/** GET /public/forms/:slug/schema — get form schema with fields (public, no auth). */
export async function getPublicFormSchema(slug: string): Promise<PublicFormSchema> {
    return apiRequest<PublicFormSchema>(`/public/forms/${slug}/schema`)
}

/** GET /public/forms/:slug/theme — get form theme (public, no auth). */
export async function getPublicFormTheme(slug: string): Promise<PublicFormTheme> {
    return apiRequest<PublicFormTheme>(`/public/forms/${slug}/theme`)
}

/** GET /public/forms/:slug/preview — get form preview with all fields (public, no auth). */
export async function getPublicFormPreview(slug: string): Promise<PublicFormPreview> {
    return apiRequest<PublicFormPreview>(`/public/forms/${slug}/preview`)
}

/** POST /public/forms/:slug/submit — submit a form response (public, no auth, rate-limited). */
export async function submitPublicForm(slug: string, data: SubmitFormRequest): Promise<SubmissionResult> {
    return apiRequest<SubmissionResult>(`/public/forms/${slug}/submit`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /public/forms/:slug/save-draft — save a form submission as draft (public, no auth). */
export async function savePublicFormDraft(slug: string, data: SubmitFormRequest): Promise<DraftResult> {
    return apiRequest<DraftResult>(`/public/forms/${slug}/save-draft`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /public/forms/:slug/submit-status/:submissionId — check submission status (public, no auth). */
export async function getSubmissionStatus(slug: string, submissionId: string): Promise<SubmitStatus> {
    return apiRequest<SubmitStatus>(`/public/forms/${slug}/submit-status/${submissionId}`)
}

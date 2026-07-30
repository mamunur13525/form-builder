/**
 * Form API — wraps every endpoint documented under "Forms Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid, buildQuery } from "@/shared/api/client"
import type {
    CreateFormRequest,
    Form,
    FormShare,
    FormSlug,
    UpdateFormRequest,
    UpdateFormShareRequest,
    UpdateFormSettingsRequest,
    UpdateFormThemeRequest,
} from "@/entities/form/model/types"

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/** POST /forms — create a new form. */
export async function createForm(data: CreateFormRequest): Promise<Form> {
    return apiRequest<Form>("/forms", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms — list all forms for the authenticated user. */
export async function getForms(params?: { page?: number; limit?: number; sort?: string }): Promise<Form[]> {
    return apiRequest<Form[]>(`/forms${buildQuery(params)}`)
}

/** GET /forms/:formId — retrieve a single form by ID. */
export async function getFormById(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}`)
}

/** PATCH /forms/:formId — update a form's title */
export async function updateForm(formId: string, data: UpdateFormRequest): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId — delete a form. */
export async function deleteForm(formId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}`, { method: "DELETE" })
}

// ---------------------------------------------------------------------------
// Status actions
// ---------------------------------------------------------------------------

/** PATCH /forms/:formId/duplicate — duplicate a form. */
export async function duplicateForm(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/duplicate`, { method: "PATCH" })
}

/** PATCH /forms/:formId/archive — archive a form. */
export async function archiveForm(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/archive`, { method: "PATCH" })
}

/** PATCH /forms/:formId/restore — restore an archived form. */
export async function restoreForm(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/restore`, { method: "PATCH" })
}

/** PATCH /forms/:formId/publish — publish a form. */
export async function publishForm(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/publish`, { method: "PATCH" })
}

/** PATCH /forms/:formId/unpublish — unpublish a form. */
export async function unpublishForm(formId: string): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/unpublish`, { method: "PATCH" })
}

// ---------------------------------------------------------------------------
// Settings / theme / share
// ---------------------------------------------------------------------------

/** GET /forms/:formId/slug — retrieve the slug and public URL for a form. */
export async function getFormSlug(formId: string): Promise<FormSlug> {
    return apiRequest<FormSlug>(`/forms/${formId}/slug`)
}

/** PATCH /forms/:formId/settings — update form settings. */
export async function updateFormSettings(formId: string, data: UpdateFormSettingsRequest): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/settings`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /forms/:formId/theme — update form theme. */
export async function updateFormTheme(formId: string, data: UpdateFormThemeRequest): Promise<Form> {
    return apiRequest<Form>(`/forms/${formId}/theme`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /forms/:formId/share — update form share settings. */
export async function updateFormShare(formId: string, data: UpdateFormShareRequest): Promise<FormShare> {
    return apiRequest<FormShare>(`/forms/${formId}/share`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/**
 * Form Page API — wraps every endpoint documented under "Form Pages Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreatePageRequest,
    FormPage,
    ReorderPagesRequest,
    UpdatePageLogicRequest,
    UpdatePageRequest,
} from "@/entities/form/model/types"

/** POST /forms/:formId/pages — create a new page in a form. */
export async function createPage(formId: string, data: CreatePageRequest): Promise<FormPage> {
    return apiRequest<FormPage>(`/forms/${formId}/pages`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/pages — get all pages for a form. */
export async function getPages(formId: string): Promise<FormPage[]> {
    return apiRequest<FormPage[]>(`/forms/${formId}/pages`)
}

/** GET /forms/:formId/pages/:pageId — get a specific page by ID. */
export async function getPageById(formId: string, pageId: string): Promise<FormPage> {
    return apiRequest<FormPage>(`/forms/${formId}/pages/${pageId}`)
}

/** The page, plus form-level metadata returned by the update response. */
export interface UpdatePageResponse extends FormPage {
    /** True when the published form is out of date relative to the latest draft. */
    hasUnpublishedChanges?: boolean
}

/** PATCH /forms/:formId/pages/:pageId — update a page. */
export async function updatePage(
    formId: string,
    pageId: string,
    data: UpdatePageRequest,
): Promise<UpdatePageResponse> {
    return apiRequest<UpdatePageResponse>(`/forms/${formId}/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/pages/:pageId — delete a page. */
export async function deletePage(formId: string, pageId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/pages/${pageId}`, { method: "DELETE" })
}

/** PATCH /forms/:formId/pages/reorder — reorder pages in a form. */
export async function reorderPages(formId: string, data: ReorderPagesRequest): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/pages/reorder`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /forms/:formId/pages/:pageId/duplicate — duplicate a page. */
export async function duplicatePage(formId: string, pageId: string): Promise<FormPage> {
    return apiRequest<FormPage>(`/forms/${formId}/pages/${pageId}/duplicate`, { method: "PATCH" })
}

/** PATCH /forms/:formId/pages/:pageId/logic — update page logic (conditional logic). */
export async function updatePageLogic(
    formId: string,
    pageId: string,
    data: UpdatePageLogicRequest,
): Promise<FormPage> {
    return apiRequest<FormPage>(`/forms/${formId}/pages/${pageId}/logic`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/pages/:pageId/logic — delete page logic. */
export async function deletePageLogic(formId: string, pageId: string): Promise<FormPage> {
    return apiRequest<FormPage>(`/forms/${formId}/pages/${pageId}/logic`, { method: "DELETE" })
}

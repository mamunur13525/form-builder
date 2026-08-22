/**
 * End Page API — CRUD for the completion / "Thank You" screens embedded in a
 * form's `endPages` array. Mirrors the sub-resource conventions used by
 * `page.api.ts` (`/forms/:formId/end-pages/:endPageId`).
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateEndPageRequest,
    EndPage,
    ReorderEndPagesRequest,
    UpdateEndPageRequest,
} from "@/entities/form/model/types"

/** POST /forms/:formId/end-pages — create a new end page in a form. */
export async function createEndPage(
    formId: string,
    data: CreateEndPageRequest,
): Promise<EndPage> {
    return apiRequest<EndPage>(`/forms/${formId}/end-pages`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/end-pages — get all end pages for a form. */
export async function getEndPages(formId: string): Promise<EndPage[]> {
    return apiRequest<EndPage[]>(`/forms/${formId}/end-pages`)
}

/** GET /forms/:formId/end-pages/:endPageId — get a specific end page by ID. */
export async function getEndPageById(
    formId: string,
    endPageId: string,
): Promise<EndPage> {
    return apiRequest<EndPage>(`/forms/${formId}/end-pages/${endPageId}`)
}

/** The end page, plus form-level metadata returned by the update response. */
export interface UpdateEndPageResponse extends EndPage {
    /** True when the published form is out of date relative to the latest draft. */
    hasUnpublishedChanges?: boolean
}

/** PATCH /forms/:formId/end-pages/:endPageId — update an end page. */
export async function updateEndPage(
    formId: string,
    endPageId: string,
    data: UpdateEndPageRequest,
): Promise<UpdateEndPageResponse> {
    return apiRequest<UpdateEndPageResponse>(
        `/forms/${formId}/end-pages/${endPageId}`,
        {
            method: "PATCH",
            body: JSON.stringify(data),
        },
    )
}

/** DELETE /forms/:formId/end-pages/:endPageId — delete an end page. */
export async function deleteEndPage(
    formId: string,
    endPageId: string,
): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/end-pages/${endPageId}`, {
        method: "DELETE",
    })
}

/** PATCH /forms/:formId/end-pages/reorder — reorder end pages in a form. */
export async function reorderEndPages(
    formId: string,
    data: ReorderEndPagesRequest,
): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/end-pages/reorder`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /forms/:formId/end-pages/:endPageId/duplicate — duplicate an end page. */
export async function duplicateEndPage(
    formId: string,
    endPageId: string,
): Promise<EndPage> {
    return apiRequest<EndPage>(
        `/forms/${formId}/end-pages/${endPageId}/duplicate`,
        { method: "PATCH" },
    )
}

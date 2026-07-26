/**
 * Form Field API — wraps every endpoint documented under "Form Fields Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateFieldRequest,
    FormField,
    ReorderFieldsRequest,
    UpdateFieldLogicRequest,
    UpdateFieldRequest,
} from "@/entities/form/model/types"

/** POST /forms/:formId/fields — create a new field in a form. */
export async function createField(formId: string, data: CreateFieldRequest): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/fields — get all fields for a form. */
export async function getFields(formId: string): Promise<FormField[]> {
    return apiRequest<FormField[]>(`/forms/${formId}/fields`)
}

/** GET /forms/:formId/fields/:fieldId — get a specific field by ID. */
export async function getFieldById(formId: string, fieldId: string): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields/${fieldId}`)
}

/** PATCH /forms/:formId/fields/:fieldId — update a field. */
export async function updateField(
    formId: string,
    fieldId: string,
    data: UpdateFieldRequest,
): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields/${fieldId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/fields/:fieldId — delete a field. */
export async function deleteField(formId: string, fieldId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/fields/${fieldId}`, { method: "DELETE" })
}

/** PATCH /forms/:formId/fields/reorder — reorder fields in a form. */
export async function reorderFields(formId: string, data: ReorderFieldsRequest): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/fields/reorder`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** PATCH /forms/:formId/fields/:fieldId/duplicate — duplicate a field. */
export async function duplicateField(formId: string, fieldId: string): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields/${fieldId}/duplicate`, { method: "PATCH" })
}

/** PATCH /forms/:formId/fields/:fieldId/logic — update field logic (conditional logic). */
export async function updateFieldLogic(
    formId: string,
    fieldId: string,
    data: UpdateFieldLogicRequest,
): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields/${fieldId}/logic`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/fields/:fieldId/logic — delete field logic. */
export async function deleteFieldLogic(formId: string, fieldId: string): Promise<FormField> {
    return apiRequest<FormField>(`/forms/${formId}/fields/${fieldId}/logic`, { method: "DELETE" })
}

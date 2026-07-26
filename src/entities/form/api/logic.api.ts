/**
 * Form Logic (Conditions) API — wraps every endpoint documented under "Form Logic (Conditions) Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateLogicRequest,
    FormLogic,
    UpdateLogicRequest,
} from "@/entities/form/model/types"

/** POST /forms/:formId/logic — create form-level logic. */
export async function createLogic(formId: string, data: CreateLogicRequest): Promise<FormLogic> {
    return apiRequest<FormLogic>(`/forms/${formId}/logic`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/logic — get all logic for a form. */
export async function getLogicRules(formId: string): Promise<FormLogic[]> {
    return apiRequest<FormLogic[]>(`/forms/${formId}/logic`)
}

/** PATCH /forms/:formId/logic/:logicId — update a logic rule. */
export async function updateLogicRule(
    formId: string,
    logicId: string,
    data: UpdateLogicRequest,
): Promise<FormLogic> {
    return apiRequest<FormLogic>(`/forms/${formId}/logic/${logicId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/logic/:logicId — delete a logic rule. */
export async function deleteLogicRule(formId: string, logicId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/logic/${logicId}`, { method: "DELETE" })
}

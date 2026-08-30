/**
 * Form Logic (Conditions) API — wraps every endpoint documented under "Form Logic (Conditions) Endpoints" in API_DOCUMENTATION.md.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    CreateLogicRequest,
    FormLogic,
    UpdateLogicRequest,
} from "@/entities/form/model/types"

/**
 * Raw rule shape the API returns: Mongo documents expose `_id` (not `id`) and
 * legacy rules may use `pageKey` / `target` instead of `sourceKey` /
 * `targetPageKey`. Normalized once here so every consumer can rely on `id`.
 */
type RawLogic = FormLogic & { _id?: string; conditions?: any[]; actions?: any[] }

function normalizeLogic(raw: RawLogic): FormLogic {
    return {
        ...raw,
        id: raw.id ?? raw._id ?? "",
        combinator: raw.combinator ?? "and",
        enabled: raw.enabled ?? true,
        conditions: (raw.conditions ?? []).map((c) => ({
            sourceType: c.sourceType ?? "page",
            sourceKey: c.sourceKey ?? c.pageKey ?? "",
            operator: c.operator ?? "equals",
            value: c.value,
            combinator: c.combinator,
        })),
        actions: (raw.actions ?? []).map((a) => ({
            action: a.action,
            targetPageKey: a.targetPageKey ?? a.target,
            variableName: a.variableName,
            expression: a.expression,
            value: a.value,
        })),
    } as FormLogic
}

/** POST /forms/:formId/logic — create form-level logic. */
export async function createLogic(formId: string, data: CreateLogicRequest): Promise<FormLogic> {
    const raw = await apiRequest<RawLogic>(`/forms/${formId}/logic`, {
        method: "POST",
        body: JSON.stringify(data),
    })
    return normalizeLogic(raw)
}

/** GET /forms/:formId/logic — get all logic for a form. */
export async function getLogicRules(formId: string): Promise<FormLogic[]> {
    const rawRules = await apiRequest<RawLogic[]>(`/forms/${formId}/logic`)
    return rawRules.map(normalizeLogic)
}

/** PATCH /forms/:formId/logic/:logicId — update a logic rule. */
export async function updateLogicRule(
    formId: string,
    logicId: string,
    data: UpdateLogicRequest,
): Promise<FormLogic> {
    const raw = await apiRequest<RawLogic>(`/forms/${formId}/logic/${logicId}`, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
    return normalizeLogic(raw)
}

/** DELETE /forms/:formId/logic/:logicId — delete a logic rule. */
export async function deleteLogicRule(formId: string, logicId: string): Promise<void> {
    return apiRequestVoid(`/forms/${formId}/logic/${logicId}`, { method: "DELETE" })
}

/** PUT /forms/:formId/logic — replace all logic rules at once. */
export async function replaceLogicRules(
    formId: string,
    rules: CreateLogicRequest[],
): Promise<FormLogic[]> {
    const rawRules = await apiRequest<RawLogic[]>(`/forms/${formId}/logic`, {
        method: "PUT",
        body: JSON.stringify({ rules }),
    })
    return rawRules.map(normalizeLogic)
}

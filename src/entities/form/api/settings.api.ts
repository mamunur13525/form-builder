/**
 * Form Settings API — the grouped settings object edited on the FormSettings
 * page. Reads and writes always target the form's draft version; each PATCH
 * updates one section and the backend keeps the other sections untouched.
 *
 * Endpoints (see docs):
 *   GET   /forms/:formId/settings
 *   PATCH /forms/:formId/settings/general
 *   PATCH /forms/:formId/settings/email
 *   PATCH /forms/:formId/settings/access
 *   PATCH /forms/:formId/settings/hidden-fields
 *   PATCH /forms/:formId/settings/variables
 */

import { apiRequest } from "@/shared/api/client"
import type {
    FormSettingsResponse,
    UpdateAccessSettingsRequest,
    UpdateEmailSettingsRequest,
    UpdateGeneralSettingsRequest,
    UpdateHiddenFieldsRequest,
    UpdateVariablesRequest,
} from "@/entities/form/model/types"

/**
 * The settings API can return raw Mongoose documents whose internal bookkeeping
 * keys (`$__`, `$isNew`, `$__parent`, `_doc`, `_id`, `__v`) leak into the JSON.
 * If those round-trip back into a PATCH body the server rejects the request with
 * 422 (and `$__parent` also drags in every other section's settings, bloating
 * the payload). Strip them recursively on the way in AND on the way out so the
 * rest of the app only ever sees — and sends — the real fields.
 */
const MONGOOSE_INTERNAL_KEYS = new Set(["_doc", "_id", "__v"])

function stripMongooseInternals<T>(value: T): T {
    if (Array.isArray(value)) {
        return value.map((item) => stripMongooseInternals(item)) as unknown as T
    }
    if (value !== null && typeof value === "object") {
        const clean: Record<string, unknown> = {}
        for (const [key, val] of Object.entries(
            value as Record<string, unknown>,
        )) {
            if (key.startsWith("$") || MONGOOSE_INTERNAL_KEYS.has(key)) continue
            clean[key] = stripMongooseInternals(val)
        }
        return clean as T
    }
    return value
}

/** Serialize a PATCH body with any leaked Mongoose internals removed. */
function cleanBody(data: unknown): string {
    return JSON.stringify(stripMongooseInternals(data))
}

/** GET /forms/:formId/settings — the full normalized draft settings. */
export async function getFormSettings(
    formId: string,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings`,
    )
    return stripMongooseInternals(res)
}

/** PATCH /forms/:formId/settings/general — update general settings. */
export async function updateGeneralSettings(
    formId: string,
    data: UpdateGeneralSettingsRequest,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings/general`,
        { method: "PATCH", body: cleanBody(data) },
    )
    return stripMongooseInternals(res)
}

/** PATCH /forms/:formId/settings/email — update email settings. */
export async function updateEmailSettings(
    formId: string,
    data: UpdateEmailSettingsRequest,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings/email`,
        { method: "PATCH", body: cleanBody(data) },
    )
    return stripMongooseInternals(res)
}

/** PATCH /forms/:formId/settings/access — update access & scheduling settings. */
export async function updateAccessSettings(
    formId: string,
    data: UpdateAccessSettingsRequest,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings/access`,
        { method: "PATCH", body: cleanBody(data) },
    )
    return stripMongooseInternals(res)
}

/** PATCH /forms/:formId/settings/hidden-fields — replace hidden fields. */
export async function updateHiddenFields(
    formId: string,
    data: UpdateHiddenFieldsRequest,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings/hidden-fields`,
        { method: "PATCH", body: cleanBody(data) },
    )
    return stripMongooseInternals(res)
}

/** PATCH /forms/:formId/settings/variables — replace variables. */
export async function updateVariables(
    formId: string,
    data: UpdateVariablesRequest,
): Promise<FormSettingsResponse> {
    const res = await apiRequest<FormSettingsResponse>(
        `/forms/${formId}/settings/variables`,
        { method: "PATCH", body: cleanBody(data) },
    )
    return stripMongooseInternals(res)
}

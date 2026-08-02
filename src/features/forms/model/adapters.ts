/**
 * Adapter functions that convert API entity types (which use `id`)
 * to the types expected by the existing UI components (which use `_id`).
 *
 * This bridges the gap between the new API layer and the legacy
 * `shared/types/common.ts` types used throughout the pages.
 */

import type { Form as ApiForm, FormField as ApiField, PublishedForm } from "@/entities/form/model/types"
import type { FormResponse as ApiResponse } from "@/entities/response/model/types"
import type { Form, FormField, FormResponse as CommonFormResponse } from "@/shared/types/common"

/** Convert an API Form into the legacy Form type. Fields are now embedded in the form. */
export function adaptApiForm(apiForm: ApiForm): Form {
    return {
        id: apiForm.id,
        title: apiForm.title,
        slug: apiForm.slug,
        status: apiForm.status,
        theme: apiForm.theme,
        settings: apiForm.settings,
        createdBy: apiForm.createdBy,
        updatedBy: undefined,
        fields: (apiForm.fields ?? []).map((a) => adaptApiField(a, apiForm.id)),
        createdAt: apiForm.createdAt,
        updatedAt: apiForm.updatedAt,
    }
}

/** Convert a PublishedForm (from public API) into the legacy Form type. */
export function adaptPublishedForm(publishedForm: PublishedForm): Form {
    return {
        id: publishedForm.id,
        title: publishedForm.title,
        slug: publishedForm.slug,
        status: publishedForm.status,
        theme: publishedForm.theme,
        settings: publishedForm.settings,
        createdBy: "",
        updatedBy: undefined,
        fields: (publishedForm.fields ?? []).map((a) => adaptApiField(a, publishedForm.id)),
        createdAt: "",
        updatedAt: "",
    }
}

/** Convert an API FormField into the legacy FormField type. */
export function adaptApiField(apiField: ApiField, formId: string): FormField {
    return {
        _id: apiField._id,
        formId: formId,
        fieldKey: apiField.fieldKey,
        label: apiField.label,
        helperText: apiField.helperText,
        placeholder: apiField.placeholder,
        type: apiField.type,
        required: apiField.required,
        order: apiField.order,
        options: apiField.options.map((opt) => ({
            label: opt.label ?? "",
            value: opt.value ?? "",
        })),
        validation: apiField.validation,
        logic: apiField.logic.map((rule) => ({
            whenFieldKey: rule.whenFieldKey ?? "",
            operator: rule.operator ?? "equals",
            value: rule.value,
            action: rule.action ?? "show",
            targetFieldKey: rule.targetFieldKey,
        })) as FormField["logic"],
        appearance: apiField.appearance,
        isActive: apiField.isActive,
        coverImage: apiField.coverImage ?? null,
        settings: apiField.settings,
    }
}

/** Convert an API FormResponse into the legacy FormResponse type. */
export function adaptApiResponse(apiResponse: ApiResponse): CommonFormResponse {
    return {
        _id: apiResponse.id,
        formId: apiResponse.formId,
        respondentId: apiResponse.respondentId,
        sessionId: apiResponse.sessionId,
        answers: apiResponse.answers,
        metadata: apiResponse.metadata,
        submittedAt: apiResponse.submittedAt,
    }
}

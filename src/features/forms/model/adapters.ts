/**
 * Adapter functions that convert API entity types (which use `id`)
 * to the types expected by the existing UI components (which use `_id`).
 *
 * This bridges the gap between the new API layer and the legacy
 * `shared/types/common.ts` types used throughout the pages.
 */

import type { Form as ApiForm, FormPage as ApiPage, PublishedForm } from "@/entities/form/model/types"
import type { FormResponse as ApiResponse } from "@/entities/response/model/types"
import type { Form, FormPage, FormResponse as CommonFormResponse } from "@/shared/types/common"

/** Convert an API Form into the legacy Form type. Pages are now embedded in the form. */
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
        pages: (apiForm.pages ?? []).map((a) => adaptApiPage(a, apiForm.id)),
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
        pages: (publishedForm.pages ?? []).map((a) => adaptApiPage(a, publishedForm.id)),
        createdAt: "",
        updatedAt: "",
    }
}

/** Convert an API FormPage into the legacy FormPage type. */
export function adaptApiPage(apiPage: ApiPage, formId: string): FormPage {
    return {
        _id: apiPage._id,
        formId: formId,
        pageKey: apiPage.pageKey,
        label: apiPage.label,
        helperText: apiPage.helperText,
        placeholder: apiPage.placeholder,
        type: apiPage.type,
        required: apiPage.required,
        order: apiPage.order,
        options: apiPage.options.map((opt) => ({
            label: opt.label ?? "",
            value: opt.value ?? "",
        })),
        validation: apiPage.validation,
        logic: apiPage.logic.map((rule) => ({
            whenPageKey: rule.whenPageKey ?? "",
            operator: rule.operator ?? "equals",
            value: rule.value,
            action: rule.action ?? "show",
            targetPageKey: rule.targetPageKey,
        })) as FormPage["logic"],
        appearance: apiPage.appearance,
        isActive: apiPage.isActive,
        coverImage: apiPage.coverImage ?? null,
        settings: apiPage.settings,
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

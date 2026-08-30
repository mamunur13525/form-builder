/**
 * Adapter functions that convert API entity types (which use `id`)
 * to the types expected by the existing UI components (which use `_id`).
 *
 * This bridges the gap between the new API layer and the legacy
 * `shared/types/common.ts` types used throughout the pages.
 */

import type { Form as ApiForm, FormPage as ApiPage, EndPage as ApiEndPage, FormLogic as ApiFormLogic, PublishedForm } from "@/entities/form/model/types"
import type { FormResponse as ApiResponse } from "@/entities/response/model/types"
import type { Form, FormPage, EndPage, FormLogicRule, FormResponse as CommonFormResponse } from "@/shared/types/common"

/** Convert a form-level logic rule from the API into the shared type. */
export function adaptLogicRule(rule: ApiFormLogic): FormLogicRule {
    return {
        id: rule.id,
        formId: rule.formId,
        category: rule.category ?? "display",
        name: rule.name,
        enabled: rule.enabled ?? true,
        combinator: rule.combinator ?? "and",
        conditions: (rule.conditions ?? []).map((condition) => ({
            sourceType: condition.sourceType ?? "page",
            // Legacy rules stored the page key under `pageKey`.
            sourceKey: condition.sourceKey ?? (condition as any).pageKey ?? "",
            operator: condition.operator ?? "equals",
            value: condition.value,
            combinator: condition.combinator,
        })),
        actions: (rule.actions ?? []).map((action) => ({
            action: action.action,
            targetPageKey: action.targetPageKey ?? (action as any).target,
            variableName: action.variableName,
            expression: action.expression,
            value: action.value,
        })),
        order: rule.order,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
    }
}

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
        endPages: (apiForm.endPages ?? []).map(adaptApiEndPage),
        logic: (apiForm as any).logic
            ? ((apiForm as any).logic as ApiFormLogic[]).map(adaptLogicRule)
            : undefined,
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
        endPages: (publishedForm.endPages ?? []).map(adaptApiEndPage),
        logic: (publishedForm.logic ?? []).map(adaptLogicRule),
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

/**
 * Convert an API EndPage into the legacy EndPage type, filling in defaults so
 * the UI never sees a missing button / redirect / socialShareMedia object.
 */
export function adaptApiEndPage(apiEndPage: ApiEndPage): EndPage {
    return {
        _id: apiEndPage._id,
        key: apiEndPage.key,
        title: apiEndPage.title ?? "",
        helperText: apiEndPage.helperText ?? apiEndPage.paragraph ?? "",
        paragraph: apiEndPage.paragraph,
        coverImage: apiEndPage.coverImage ?? null,
        embed: apiEndPage.embed ?? { url: "" },
        alignment: apiEndPage.alignment ?? "left",
        button: apiEndPage.button ?? { text: "", link: "" },
        redirect: apiEndPage.redirect ?? { isRedirect: false, link: "" },
        showConfetti: apiEndPage.showConfetti ?? false,
        socialShareButtons: apiEndPage.socialShareButtons ?? false,
        socialShareMessage: apiEndPage.socialShareMessage ?? "",
        socialShareMedia: apiEndPage.socialShareMedia ?? {
            facebook: false,
            twitter: false,
            linkedin: false,
            whatsapp: false,
        },
        order: apiEndPage.order ?? 1,
        createdAt: apiEndPage.createdAt as string | undefined,
        updatedAt: apiEndPage.updatedAt as string | undefined,
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

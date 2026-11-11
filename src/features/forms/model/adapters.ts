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
            operation: action.operation,
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
    const sortedPages = [...(apiForm.pages ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    const sortedEndPages = [...(apiForm.endPages ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    return {
        id: apiForm.id,
        title: apiForm.title,
        slug: apiForm.slug,
        status: apiForm.status,
        theme: apiForm.theme,
        settings: apiForm.settings,
        createdBy: apiForm.createdBy,
        updatedBy: undefined,
        pages: sortedPages.map((a) => adaptApiPage(a, apiForm.id)),
        endPages: sortedEndPages.map(adaptApiEndPage),
        logic: (apiForm as any).logic
            ? ((apiForm as any).logic as ApiFormLogic[]).map(adaptLogicRule)
            : undefined,
        createdAt: apiForm.createdAt,
        updatedAt: apiForm.updatedAt,
    }
}

/** Convert a PublishedForm (from public API) into the legacy Form type. */
export function adaptPublishedForm(publishedForm: PublishedForm): Form {
    const sortedPages = [...(publishedForm.pages ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    const sortedEndPages = [...(publishedForm.endPages ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
    )
    return {
        id: publishedForm.id,
        title: publishedForm.title,
        slug: publishedForm.slug,
        status: publishedForm.status,
        theme: publishedForm.theme,
        settings: publishedForm.settings,
        createdBy: "",
        updatedBy: undefined,
        pages: sortedPages.map((a) => adaptApiPage(a, publishedForm.id)),
        endPages: sortedEndPages.map(adaptApiEndPage),
        logic: (publishedForm.logic ?? []).map(adaptLogicRule),
        createdAt: "",
        updatedAt: "",
    }
}

/** Convert an API FormPage into the legacy FormPage type. */
export function adaptApiPage(apiPage: ApiPage, formId: string): FormPage {
    const rawQuestions = (Array.isArray(apiPage.questions) && apiPage.questions.length > 0)
        ? apiPage.questions
        : (Array.isArray(apiPage.blocks) && apiPage.blocks.length > 0 ? apiPage.blocks : [])

    const sortedRawQuestions = [...rawQuestions].sort(
        (a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)
    )

    const hasMultiple = sortedRawQuestions.length > 1

    const title = apiPage.title !== undefined && apiPage.title !== ""
        ? apiPage.title
        : (apiPage.label || (!hasMultiple ? sortedRawQuestions[0]?.title : "") || "")
    const description = apiPage.description !== undefined && apiPage.description !== ""
        ? apiPage.description
        : (apiPage.helperText || (!hasMultiple ? sortedRawQuestions[0]?.description : "") || "")
    const label = apiPage.label !== undefined ? apiPage.label : title
    const helperText = apiPage.helperText !== undefined ? apiPage.helperText : description

    const questions = sortedRawQuestions.length > 0
        ? sortedRawQuestions.map((b: any) => {
            const key = b.questionKey || b.blockKey || `question_${b._id || b.id || Math.random()}`
            return {
                _id: b._id || b.id,
                id: b.id || b._id,
                questionKey: key,
                blockKey: key,
                type: b.type,
                title: hasMultiple ? (b.title !== undefined ? b.title : (b.label || "")) : "",
                description: "",
                label: hasMultiple ? (b.label !== undefined ? b.label : (b.title || "")) : "",
                helperText: "",
                placeholder: b.placeholder || "",
                required: b.required ?? false,
                order: b.order || 1,
                options: (b.options || []).map((opt: any) => ({
                    label: opt.label ?? "",
                    value: opt.value ?? "",
                })),
                validation: b.validation,
                appearance: b.appearance || { width: "full", icon: "" },
                coverImage: b.coverImage ?? null,
                settings: b.settings,
                isActive: b.isActive !== false,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
            }
        })
        : [
            {
                _id: apiPage._id,
                id: apiPage._id,
                questionKey: apiPage.pageKey,
                blockKey: apiPage.pageKey,
                type: apiPage.type,
                title: "",
                description: "",
                label: "",
                helperText: "",
                placeholder: apiPage.placeholder,
                required: apiPage.required,
                order: 1,
                options: (apiPage.options || []).map((opt) => ({
                    label: opt.label ?? "",
                    value: opt.value ?? "",
                })),
                validation: apiPage.validation,
                appearance: apiPage.appearance,
                coverImage: apiPage.coverImage ?? null,
                settings: apiPage.settings,
                isActive: apiPage.isActive ?? true,
                createdAt: apiPage.createdAt,
                updatedAt: apiPage.updatedAt,
            },
        ]

    return {
        _id: apiPage._id,
        formId: formId,
        pageKey: apiPage.pageKey,
        title,
        description,
        label,
        helperText,
        placeholder: apiPage.placeholder,
        type: apiPage.type,
        required: apiPage.required,
        order: apiPage.order,
        options: (apiPage.options || []).map((opt) => ({
            label: opt.label ?? "",
            value: opt.value ?? "",
        })),
        validation: apiPage.validation,
        logic: (apiPage.logic || []).map((rule) => ({
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
        questions,
        blocks: questions,
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
        _id: apiResponse.id || (apiResponse as any)._id,
        formId: apiResponse.formId,
        respondentId: apiResponse.respondentId,
        sessionId: apiResponse.sessionId,
        status: (apiResponse as any).status || "completed",
        answers: (apiResponse.answers || []).map((a: any) => ({
            ...a,
            pageKey: a.pageKey || a.blockKey || "",
            blockKey: a.blockKey || a.questionKey || a.pageKey || "",
            questionKey: a.questionKey || a.blockKey || a.pageKey || "",
            label: a.label || a.title || "",
            title: a.title || a.label || "",
        })),
        metadata: apiResponse.metadata,
        submittedAt: apiResponse.submittedAt,
    }
}

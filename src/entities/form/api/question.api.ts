/**
 * Form Question API — wraps every endpoint for questions in a page.
 */

import { apiRequest, apiRequestVoid } from "@/shared/api/client"
import type {
    FormQuestion,
    PageOption,
    PageValidation,
    PageAppearance,
    PageCoverImage,
    PageSettings,
    PageType,
} from "@/entities/form/model/types"

export interface CreateQuestionRequest {
    pageId?: string
    type?: PageType
    title?: string
    description?: string
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    coverImage?: PageCoverImage | null
    options?: PageOption[]
    validation?: PageValidation
    settings?: PageSettings
    appearance?: PageAppearance
}

export type CreateBlockRequest = CreateQuestionRequest

export interface UpdateQuestionRequest {
    type?: PageType
    title?: string
    description?: string
    label?: string
    helperText?: string
    placeholder?: string
    required?: boolean
    coverImage?: PageCoverImage | null
    options?: PageOption[]
    validation?: PageValidation
    settings?: PageSettings
    appearance?: PageAppearance
}

export type UpdateBlockRequest = UpdateQuestionRequest

export interface ReorderQuestionsRequest {
    pageId?: string
    questionIds?: string[]
    blockIds?: string[]
}

export type ReorderBlocksRequest = ReorderQuestionsRequest

/** POST /forms/:formId/pages/:pageId/questions (or /forms/:formId/questions) — create a new question in a page. */
export async function createQuestion(
    formId: string,
    data: CreateQuestionRequest,
    pageId?: string,
): Promise<FormQuestion> {
    const endpoint = pageId ? `/forms/${formId}/pages/${pageId}/questions` : `/forms/${formId}/questions`
    return apiRequest<FormQuestion>(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /forms/:formId/pages/:pageId/questions (or /forms/:formId/questions) — get all questions for a page or form. */
export async function getQuestions(formId: string, pageId?: string): Promise<FormQuestion[]> {
    const endpoint = pageId ? `/forms/${formId}/pages/${pageId}/questions` : `/forms/${formId}/questions`
    return apiRequest<FormQuestion[]>(endpoint)
}

/** PATCH /forms/:formId/pages/:pageId/questions/:questionId — update a question. */
export async function updateQuestion(
    formId: string,
    questionId: string,
    data: UpdateQuestionRequest,
    pageId?: string,
): Promise<FormQuestion> {
    const endpoint = pageId
        ? `/forms/${formId}/pages/${pageId}/questions/${questionId}`
        : `/forms/${formId}/questions/${questionId}`
    return apiRequest<FormQuestion>(endpoint, {
        method: "PATCH",
        body: JSON.stringify(data),
    })
}

/** DELETE /forms/:formId/pages/:pageId/questions/:questionId — delete a question. */
export async function deleteQuestion(
    formId: string,
    questionId: string,
    pageId?: string,
): Promise<void> {
    const endpoint = pageId
        ? `/forms/${formId}/pages/${pageId}/questions/${questionId}`
        : `/forms/${formId}/questions/${questionId}`
    return apiRequestVoid(endpoint, { method: "DELETE" })
}

/** PATCH /forms/:formId/pages/:pageId/questions/reorder — reorder questions in a page. */
export async function reorderQuestions(
    formId: string,
    data: ReorderQuestionsRequest,
    pageId?: string,
): Promise<void> {
    const endpoint = pageId
        ? `/forms/${formId}/pages/${pageId}/questions/reorder`
        : `/forms/${formId}/questions/reorder`
    return apiRequestVoid(endpoint, {
        method: "PATCH",
        body: JSON.stringify({
            ...data,
            questionIds: data.questionIds || data.blockIds,
            blockIds: data.blockIds || data.questionIds,
        }),
    })
}

// Compatibility block aliases
export const createBlock = createQuestion
export const getBlocks = getQuestions
export const updateBlock = updateQuestion
export const deleteBlock = deleteQuestion
export const reorderBlocks = reorderQuestions
export type { FormQuestion, FormQuestion as FormBlock }

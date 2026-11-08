/**
 * Form Questions feature hooks — TanStack Query wrappers around the question entity API.
 *
 * Query keys:
 *   ["forms", formId, "questions"] — list of questions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type {
    CreateQuestionRequest,
    FormQuestion,
    ReorderQuestionsRequest,
    UpdateQuestionRequest,
} from "@/entities/form/api/question.api"
import {
    createQuestion,
    deleteQuestion,
    getQuestions,
    reorderQuestions,
    updateQuestion,
} from "@/entities/form/api/question.api"

const QUESTIONS_QUERY_KEY = (formId: string) => ["forms", formId, "questions"]

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /forms/:formId/questions — get all questions for a form. */
export function useQuestions(formId: string) {
    return useQuery({
        queryKey: QUESTIONS_QUERY_KEY(formId),
        queryFn: () => getQuestions(formId),
        enabled: !!formId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /forms/:formId/questions — create a new question in a form. */
export function useCreateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data, pageId }: { formId: string; data: CreateQuestionRequest; pageId?: string }) =>
            createQuestion(formId, data, pageId),
        onSuccess: (_updated: FormQuestion, { formId }) => {
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY(formId) })
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

/** PATCH /forms/:formId/questions/:questionId — update a question. */
export function useUpdateQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            formId,
            questionId,
            data,
            pageId,
        }: {
            formId: string
            questionId: string
            data: UpdateQuestionRequest
            pageId?: string
        }) => updateQuestion(formId, questionId, data, pageId),
        onSuccess: (updated: FormQuestion, { formId }) => {
            queryClient.setQueryData([...QUESTIONS_QUERY_KEY(formId), updated.id], updated)
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

/** DELETE /forms/:formId/questions/:questionId — delete a question. */
export function useDeleteQuestion() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, questionId, pageId }: { formId: string; questionId: string; pageId?: string }) =>
            deleteQuestion(formId, questionId, pageId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY(formId) })
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

/** PATCH /forms/:formId/questions/reorder — reorder questions in a page/form. */
export function useReorderQuestions() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ formId, data, pageId }: { formId: string; data: ReorderQuestionsRequest; pageId?: string }) =>
            reorderQuestions(formId, data, pageId),
        onSuccess: (_void: void, { formId }) => {
            queryClient.invalidateQueries({ queryKey: QUESTIONS_QUERY_KEY(formId) })
            queryClient.invalidateQueries({ queryKey: ["forms", formId] })
        },
    })
}

// Backwards compatibility aliases
export const useBlocks = useQuestions
export const useCreateBlock = useCreateQuestion
export const useUpdateBlock = useUpdateQuestion
export const useDeleteBlock = useDeleteQuestion
export const useReorderBlocks = useReorderQuestions

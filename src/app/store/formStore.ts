/**
 * Form Store - Zustand store that wraps the entity API layer.
 * This store is being phased out in favor of TanStack Query hooks.
 * New components should use the hooks in src/features/hooks/ directly.
 */

import { create } from "zustand"
import { getForms, createForm as apiCreateForm, updateForm as apiUpdateForm, deleteForm as apiDeleteForm, publishForm as apiPublishForm } from "@/entities/form/api/form.api"
import { getResponses } from "@/entities/response/api/response.api"
import { submitPublicForm } from "@/entities/response/api/public-form.api"
import type { Form as ApiForm } from "@/entities/form/model/types"
import type { Form, FormResponse } from "@/shared/types/common"
import { adaptApiForm, adaptApiResponse } from "@/features/forms/model/adapters"

interface FormState {
    forms: Form[]
    responses: FormResponse[]
    isLoading: boolean
    error: string | null

    // Form actions
    fetchForms: () => Promise<void>
    getFormById: (id: string) => Form | undefined
    getFormBySlug: (slug: string) => Form | undefined
    createForm: (form: Omit<Form, "_id" | "createdAt" | "updatedAt">) => Promise<Form>
    updateForm: (id: string, updates: Partial<Form>) => Promise<void>
    deleteForm: (id: string) => Promise<void>
    publishForm: (id: string) => Promise<void>

    // Response actions
    fetchResponses: (formId: string) => Promise<void>
    getResponsesByFormId: (formId: string) => FormResponse[]
    submitResponse: (formId: string, answers: Record<string, unknown>) => Promise<FormResponse>
}

export const useFormStore = create<FormState>((set, get) => ({
    forms: [],
    responses: [],
    isLoading: false,
    error: null,

    fetchForms: async () => {
        set({ isLoading: true, error: null })
        try {
            const apiForms: ApiForm[] = await getForms()
            // Fields are now embedded in the form response
            const adaptedForms: Form[] = apiForms.map(adaptApiForm)
            set({ forms: adaptedForms, isLoading: false })
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to fetch forms", isLoading: false })
        }
    },

    getFormById: (id: string) => {
        return get().forms.find((f) => f._id === id)
    },

    getFormBySlug: (slug: string) => {
        return get().forms.find((f) => f.slug === slug)
    },

    createForm: async (formData) => {
        set({ isLoading: true, error: null })
        try {
            const created = await apiCreateForm({
                title: formData.title,
            })

            const newForm: Form = adaptApiForm(created)

            set((state) => ({
                forms: [...state.forms, newForm],
                isLoading: false,
            }))

            return newForm
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to create form", isLoading: false })
            throw err
        }
    },

    updateForm: async (id: string, updates: Partial<Form>) => {
        set({ isLoading: true, error: null })
        try {
            await apiUpdateForm(id, {
                title: updates.title,
            })

            set((state) => ({
                forms: state.forms.map((f) =>
                    f._id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
                ),
                isLoading: false,
            }))
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to update form", isLoading: false })
        }
    },

    deleteForm: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            await apiDeleteForm(id)

            set((state) => ({
                forms: state.forms.filter((f) => f._id !== id),
                isLoading: false,
            }))
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to delete form", isLoading: false })
        }
    },

    publishForm: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
            const updated = await apiPublishForm(id)

            set((state) => ({
                forms: state.forms.map((f) =>
                    f._id === id
                        ? { ...f, status: updated.status, updatedAt: new Date().toISOString() }
                        : f
                ),
                isLoading: false,
            }))
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to publish form", isLoading: false })
        }
    },

    fetchResponses: async (formId: string) => {
        set({ isLoading: true, error: null })
        try {
            const apiResponses = await getResponses(formId)
            const adapted = apiResponses.map(adaptApiResponse)
            set({ responses: adapted, isLoading: false })
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to fetch responses", isLoading: false })
        }
    },

    getResponsesByFormId: (formId: string) => {
        return get().responses.filter((r) => r.formId === formId)
    },

    submitResponse: async (formId: string, answers: Record<string, unknown>) => {
        set({ isLoading: true, error: null })
        try {
            const form = get().forms.find((f) => f._id === formId)
            if (!form) throw new Error("Form not found")

            const answerList = Object.entries(answers).map(([fieldKey, value]) => {
                const field = form?.fields.find((f) => f.fieldKey === fieldKey)
                return {
                    fieldKey,
                    label: field?.label || "",
                    type: field?.type || "text",
                    value,
                }
            })

            const result = await submitPublicForm(form.slug, {
                answers: answerList,
                sessionId: `session_${Date.now()}`,
            })

            const newResponse: FormResponse = {
                _id: result.submissionId,
                formId,
                sessionId: `session_${Date.now()}`,
                answers: answerList,
                metadata: {
                    ipAddress: "",
                    userAgent: navigator.userAgent,
                    referrer: document.referrer,
                    country: "",
                    city: "",
                },
                submittedAt: new Date().toISOString(),
            }

            set((state) => ({
                responses: [...state.responses, newResponse],
                isLoading: false,
            }))

            return newResponse
        } catch (err) {
            set({ error: err instanceof Error ? err.message : "Failed to submit response", isLoading: false })
            throw err
        }
    },
}))

// Initialize forms on app load
export const initializeForms = async () => {
    const store = useFormStore.getState()
    if (store.forms.length === 0) {
        await store.fetchForms()
    }
}

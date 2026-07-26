import { create } from "zustand"
import { mockForms, mockResponses } from "../../shared/utils/mockData"
import type { Form, FormResponse } from "../../shared/types/common"

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
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))
        set({ forms: mockForms, isLoading: false })
    },

    getFormById: (id: string) => {
        return get().forms.find((f) => f._id === id)
    },

    getFormBySlug: (slug: string) => {
        return get().forms.find((f) => f.slug === slug)
    },

    createForm: async (formData) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800))

        const newForm: Form = {
            ...formData,
            _id: `form_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        set((state) => ({
            forms: [...state.forms, newForm],
            isLoading: false,
        }))

        return newForm
    },

    updateForm: async (id: string, updates: Partial<Form>) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600))

        set((state) => ({
            forms: state.forms.map((f) =>
                f._id === id ? { ...f, ...updates, updatedAt: new Date().toISOString() } : f
            ),
            isLoading: false,
        }))
    },

    deleteForm: async (id: string) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500))

        set((state) => ({
            forms: state.forms.filter((f) => f._id !== id),
            isLoading: false,
        }))
    },

    publishForm: async (id: string) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 700))

        set((state) => ({
            forms: state.forms.map((f) =>
                f._id === id ? { ...f, status: "published", updatedAt: new Date().toISOString() } : f
            ),
            isLoading: false,
        }))
    },

    fetchResponses: async (formId: string) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400))

        const formResponses = mockResponses.filter((r) => r.formId === formId)
        set({ responses: formResponses, isLoading: false })
    },

    getResponsesByFormId: (formId: string) => {
        return get().responses.filter((r) => r.formId === formId)
    },

    submitResponse: async (formId: string, answers: Record<string, unknown>) => {
        set({ isLoading: true, error: null })
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500))

        const form = get().forms.find((f) => f._id === formId)

        const newResponse: FormResponse = {
            _id: `response_${Date.now()}`,
            formId,
            respondentId: `user_${Date.now()}`,
            sessionId: `session_${Date.now()}`,
            answers: Object.entries(answers).map(([fieldKey, value]) => {
                const field = form?.fields.find((f) => f.fieldKey === fieldKey)
                return {
                    fieldKey,
                    value,
                    label: field?.label || "",
                    type: field?.type || "text",
                }
            }),
            metadata: {
                ipAddress: "127.0.0.1",
                userAgent: navigator.userAgent,
                referrer: document.referrer,
                country: "Unknown",
                city: "Unknown",
            },
            submittedAt: new Date().toISOString(),
        }

        set((state) => ({
            responses: [...state.responses, newResponse],
            isLoading: false,
        }))

        return newResponse
    },
}))

// Initialize forms on app load
export const initializeForms = async () => {
    const store = useFormStore.getState()
    if (store.forms.length === 0) {
        await store.fetchForms()
    }
}
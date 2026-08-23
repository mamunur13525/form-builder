import { useState, useMemo, useCallback } from "react"
import type { Form, FormPage } from "../types/common"
import { validatePage } from "./useFormValidation"
import { submitPublicForm } from "@/entities/response/api/public-form.api"

interface UseFormNavigationOptions {
    form: Form
    mode: "preview" | "published"
    onSubmit?: (answers: Record<string, unknown>) => void
}

interface UseFormNavigationReturn {
    currentStep: number
    direction: number
    answers: Record<string, unknown>
    isSubmitting: boolean
    submitted: boolean
    error: string | null
    submittedPages: Set<number>
    activePages: FormPage[]
    currentPage: FormPage | undefined
    isLastStep: boolean
    isPreview: boolean
    handleAnswer: (pageKey: string, value: unknown) => void
    handleNext: () => void
    handlePrev: () => void
    handleNavNext: () => void
    setError: (error: string | null) => void
}

export function useFormNavigation({ form, mode, onSubmit }: UseFormNavigationOptions): UseFormNavigationReturn {
    const [currentStep, setCurrentStep] = useState(0)
    const [direction, setDirection] = useState(1)
    const [answers, setAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submittedPages, setSubmittedPages] = useState<Set<number>>(new Set())

    const activePages = useMemo(() => form.pages.filter((f) => f.isActive), [form.pages])
    const currentPage = activePages[currentStep]
    const isLastStep = currentStep === activePages.length - 1
    const isPreview = mode === "preview"

    const handleAnswer = useCallback((pageKey: string, value: unknown) => {
        setAnswers((prev) => ({ ...prev, [pageKey]: value }))
        if (error) setError(null)
    }, [error])

    const handleSubmit = useCallback(async () => {
        if (isPreview) {
            setSubmitted(true)
            return
        }

        setIsSubmitting(true)
        setError(null)
        try {
            const answerList = Object.entries(answers).map(([pageKey, value]) => {
                const page = form.pages.find((f) => f.pageKey === pageKey)
                return {
                    pageKey,
                    label: page?.label || "",
                    type: page?.type || "text",
                    value,
                }
            })
            await submitPublicForm(form.slug, { answers: answerList })
            setSubmitted(true)
            onSubmit?.(answers)
        } catch (error) {
            console.error("Failed to submit form:", error)
            setError("There was an issue submitting your form. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }, [isPreview, answers, form.slug, form.pages, onSubmit])

    const handleNext = useCallback(() => {
        if (!currentPage) return

        const validationError = validatePage(currentPage, answers[currentPage.pageKey])
        if (validationError) {
            setError(validationError)
            return
        }

        setSubmittedPages((prev) => new Set(prev).add(currentStep))
        setDirection(1)

        if (isLastStep) {
            handleSubmit()
        } else {
            setCurrentStep((prev) => prev + 1)
        }
    }, [currentPage, answers, currentStep, isLastStep, handleSubmit])

    const handlePrev = useCallback(() => {
        if (error) setError(null)
        if (currentStep > 0) {
            setDirection(-1)
            setCurrentStep((prev) => prev - 1)
        }
    }, [error, currentStep])

    const handleNavNext = useCallback(() => {
        if (submittedPages.has(currentStep) && !isLastStep) {
            setDirection(1)
            setCurrentStep((prev) => prev + 1)
        }
    }, [submittedPages, currentStep, isLastStep])

    return {
        currentStep,
        direction,
        answers,
        isSubmitting,
        submitted,
        error,
        submittedPages,
        activePages,
        currentPage,
        isLastStep,
        isPreview,
        handleAnswer,
        handleNext,
        handlePrev,
        handleNavNext,
        setError,
    }
}
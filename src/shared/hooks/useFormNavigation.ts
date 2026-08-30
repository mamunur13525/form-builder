import { useState, useMemo, useCallback } from "react"
import type { Form, FormPage } from "../types/common"
import { validatePage } from "./useFormValidation"
import { submitPublicForm } from "@/entities/response/api/public-form.api"
import { resolveFormLogic, JUMP_TO_END } from "../utils/formLogic"

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
    /** Variables computed live from calculation rules, keyed by name. */
    computedVariables: Record<string, number | string>
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
    // Snapshot of answers committed when a page is submitted. Logic rules
    // evaluate against THIS — not the live `answers` — so rules react to
    // submitted answers, never to characters being typed into an input.
    const [committedAnswers, setCommittedAnswers] = useState<Record<string, unknown>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [submittedPages, setSubmittedPages] = useState<Set<number>>(new Set())

    const isPreview = mode === "preview"

    // Logic rules (branching / display / calculations) shipped with the form.
    const logicRules = useMemo(() => form.logic ?? [], [form.logic])
    const allPages = useMemo(() => form.pages.filter((f) => f.isActive), [form.pages])
    const formVariables = useMemo(() => form.settings?.variables ?? [], [form.settings])

    // Recomputed only when a page is submitted (i.e. committedAnswers changes):
    // page visibility and calculation variables. Branching jumps are computed
    // on demand inside handleNext from the freshly committed snapshot, so the
    // current page's just-submitted answer is included in that decision.
    const { hiddenPageKeys, computedVariables } = useMemo(
        () =>
            resolveFormLogic({
                pages: allPages,
                answers: committedAnswers,
                variables: formVariables,
                rules: logicRules,
            }),
        [allPages, committedAnswers, formVariables, logicRules],
    )

    const activePages = useMemo(
        () => allPages.filter((p) => !hiddenPageKeys.has(p.pageKey)),
        [allPages, hiddenPageKeys],
    )
    const currentPage = activePages[currentStep]
    const isLastStep = currentStep === activePages.length - 1

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

        // Commit this page's answer, then evaluate logic against the committed
        // snapshot. This is what makes rules apply *after* submit: page
        // visibility / calculations only move once the answer is committed here,
        // and the current answer is included so branching on it works too.
        const committed = {
            ...committedAnswers,
            [currentPage.pageKey]: answers[currentPage.pageKey],
        }
        setCommittedAnswers(committed)

        const { hiddenPageKeys: nextHidden, jumpTargets: nextJumps } = resolveFormLogic({
            pages: allPages,
            answers: committed,
            variables: formVariables,
            rules: logicRules,
        })
        const nextActive = allPages.filter((p) => !nextHidden.has(p.pageKey))

        // Branching: the first matching rule for this page decides where to go.
        const jump = nextJumps[currentPage.pageKey]
        if (jump === JUMP_TO_END) {
            handleSubmit()
            return
        }
        if (jump) {
            const targetIndex = nextActive.findIndex((p) => p.pageKey === jump)
            if (targetIndex >= 0) {
                setCurrentStep(targetIndex)
                return
            }
            // Target page is currently hidden — fall through to normal flow.
        }

        // Normal flow: advance to the next visible page after this one (by the
        // form's page order, so it's robust even if this answer changed which
        // pages are visible).
        const currentOrder = allPages.findIndex((p) => p.pageKey === currentPage.pageKey)
        const nextIndex = nextActive.findIndex(
            (p) => allPages.findIndex((ap) => ap.pageKey === p.pageKey) > currentOrder,
        )
        if (nextIndex >= 0) {
            setCurrentStep(nextIndex)
        } else {
            handleSubmit()
        }
    }, [
        currentPage,
        answers,
        currentStep,
        committedAnswers,
        allPages,
        formVariables,
        logicRules,
        handleSubmit,
    ])

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
        computedVariables,
        handleAnswer,
        handleNext,
        handlePrev,
        handleNavNext,
        setError,
    }
}
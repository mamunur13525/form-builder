import { useState, useMemo, useCallback, useEffect } from "react"
import type { Form, FormPage } from "../types/common"
import { validatePage } from "./useFormValidation"
import { submitPublicForm, savePublicFormDraft, trackPublicFormView } from "@/entities/response/api/public-form.api"
import { resolveFormLogic, JUMP_TO_END } from "../utils/formLogic"
import { useFormStore } from "@/app/store/formStore"
import { dispatchClientIntegrations } from "@/pages/FormIntegrations/services/integrationService"

function buildAnswersPayload(form: Form, currentAnswers: Record<string, unknown>) {
    const list: Array<{
        pageKey: string
        blockKey: string
        questionKey: string
        title: string
        label: string
        type: string
        value: unknown
    }> = []

    const processedKeys = new Set<string>()

    for (const page of form.pages) {
        const questions = (page.questions && page.questions.length > 0)
            ? page.questions
            : (page.blocks && page.blocks.length > 0)
                ? page.blocks
                : []

        if (questions.length > 0) {
            questions.forEach((q, idx) => {
                const qKey =
                    q.questionKey ||
                    q.blockKey ||
                    (q as any).id ||
                    (q as any)._id ||
                    (questions.length === 1 ? page.pageKey : `${page.pageKey}_q${idx + 1}`)
                const bKey =
                    q.blockKey ||
                    q.questionKey ||
                    (q as any).id ||
                    (q as any)._id ||
                    (questions.length === 1 ? page.pageKey : `${page.pageKey}_q${idx + 1}`)

                const val =
                    qKey && currentAnswers[qKey] !== undefined
                        ? currentAnswers[qKey]
                        : bKey && currentAnswers[bKey] !== undefined
                            ? currentAnswers[bKey]
                            : questions.length === 1 && currentAnswers[page.pageKey] !== undefined
                                ? currentAnswers[page.pageKey]
                                : undefined

                if (val !== undefined) {
                    if (qKey) processedKeys.add(qKey)
                    if (bKey) processedKeys.add(bKey)
                    if (questions.length === 1) processedKeys.add(page.pageKey)

                    const label =
                        q.title ||
                        q.label ||
                        (questions.length === 1 ? (page.title || page.label) : `Question ${idx + 1}`)
                    list.push({
                        pageKey: page.pageKey,
                        blockKey: bKey || page.pageKey,
                        questionKey: qKey || bKey || page.pageKey,
                        title: label || `Question ${idx + 1}`,
                        label: label || `Question ${idx + 1}`,
                        type: q.type || page.type || "shortText",
                        value: val,
                    })
                }
            })
        } else {
            const val = currentAnswers[page.pageKey]
            if (val !== undefined) {
                processedKeys.add(page.pageKey)
                const label = page.title || page.label || page.pageKey
                list.push({
                    pageKey: page.pageKey,
                    blockKey: page.pageKey,
                    questionKey: page.pageKey,
                    title: label,
                    label,
                    type: page.type || "shortText",
                    value: val,
                })
            }
        }
    }

    // Also include any answers whose keys were not in form.pages
    for (const [key, value] of Object.entries(currentAnswers)) {
        if (!processedKeys.has(key) && value !== undefined) {
            list.push({
                pageKey: key,
                blockKey: key,
                questionKey: key,
                title: key,
                label: key,
                type: "shortText",
                value,
            })
        }
    }

    return list
}

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

    const sessionKey = `form_session_${form.slug || form.id || "default"}`
    const sessionId = useMemo(() => {
        if (typeof window === "undefined") return `session_${Date.now()}`
        try {
            let sid = sessionStorage.getItem(sessionKey)
            if (!sid) {
                sid = `session_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
                sessionStorage.setItem(sessionKey, sid)
            }
            return sid
        } catch {
            return `session_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
        }
    }, [form.slug, form.id, sessionKey])

    useEffect(() => {
        if (!isPreview && form.slug && sessionId) {
            const ua = typeof navigator !== "undefined" ? navigator.userAgent : ""
            const device = /tablet|ipad/i.test(ua)
                ? "tablet"
                : /mobile|android|iphone/i.test(ua)
                  ? "mobile"
                  : "desktop"
            trackPublicFormView(form.slug, {
                sessionId,
                device,
                referrer: typeof document !== "undefined" ? document.referrer : "",
            }).catch(() => {})
        }
    }, [isPreview, form.slug, sessionId])

    // Logic rules (branching / display / calculations) shipped with the form.
    // In preview mode the builder's live rules come from the form store — the
    // store is kept in sync after every save, so the preview reflects new rules
    // immediately. Published mode always uses the server snapshot (`form.logic`).
    const storedRules = useFormStore((s) =>
        mode === "preview" && form.id ? s.logicRules[form.id] : undefined,
    )
    const logicRules = useMemo(
        () => storedRules ?? form.logic ?? [],
        [storedRules, form.logic],
    )
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
            const answerList = buildAnswersPayload(form, answers)
            await submitPublicForm(form.slug, { answers: answerList, sessionId })
            try {
                sessionStorage.removeItem(sessionKey)
            } catch {}
            dispatchClientIntegrations(form, answerList, computedVariables).catch(() => {})
            setSubmitted(true)
            onSubmit?.(answers)
        } catch (error) {
            console.error("Failed to submit form:", error)
            setError("There was an issue submitting your form. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }, [isPreview, answers, form, onSubmit, computedVariables, sessionId, sessionKey])

    const handleNext = useCallback(() => {
        if (!currentPage) return

        const validationError = validatePage(currentPage, answers)
        if (validationError) {
            setError(validationError)
            return
        }

        setSubmittedPages((prev) => new Set(prev).add(currentStep))
        setDirection(1)

        // Commit this page's answers, then evaluate logic against the committed
        // snapshot. This is what makes rules apply *after* submit: page
        // visibility / calculations only move once the answer is committed here,
        // and the current answer is included so branching on it works too.
        const items = (currentPage.questions && currentPage.questions.length > 0)
            ? currentPage.questions
            : (currentPage.blocks && currentPage.blocks.length > 0 ? currentPage.blocks : [])
        const pageQuestionKeys: string[] = items.length > 0
            ? items.map((b, idx) => (b.questionKey || b.blockKey || (b as any).id || (b as any)._id || `${currentPage.pageKey}_q${idx + 1}`)).filter(Boolean)
            : [currentPage.pageKey]
        const committed = { ...committedAnswers }
        for (const key of pageQuestionKeys) {
            if (answers[key] !== undefined) {
                committed[key] = answers[key]
            }
        }
        if (answers[currentPage.pageKey] !== undefined) {
            committed[currentPage.pageKey] = answers[currentPage.pageKey]
        }
        setCommittedAnswers(committed)

        // Save partial draft on page submit in published mode
        if (!isPreview && form.slug) {
            const draftPayload = buildAnswersPayload(form, { ...answers, ...committed })
            savePublicFormDraft(form.slug, {
                answers: draftPayload,
                sessionId,
            }).catch((err) => {
                console.warn("Failed to auto-save partial page draft:", err)
            })
        }

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
        isPreview,
        form,
        sessionId,
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
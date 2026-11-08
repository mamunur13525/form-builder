import { useEffect, useRef, useCallback } from "react"
import type { Form } from "../types/common"

declare global {
    interface Window {
        dataLayer?: any[]
        gtag?: (...args: any[]) => void
    }
}

interface UseGoogleAnalyticsOptions {
    form?: Form
    step?: number
    currentPageKey?: string
    currentPageLabel?: string
}

export function useGoogleAnalytics({
    form,
    step,
    currentPageKey,
    currentPageLabel,
}: UseGoogleAnalyticsOptions) {
    const initializedRef = useRef<string | null>(null)

    // Retrieve measurement ID from form settings or public settings or localStorage
    const measurementId =
        (form?.settings as any)?.googleAnalytics?.measurementId ||
        (() => {
            if (!form?.id) return null
            try {
                const stored = localStorage.getItem(`form_integrations_${form.id}`)
                if (stored) {
                    const parsed = JSON.parse(stored)
                    if (parsed["google-analytics"]?.enabled && parsed["google-analytics"]?.measurementId) {
                        return parsed["google-analytics"].measurementId
                    }
                }
            } catch {
                return null
            }
            return null
        })()

    // 1. Inject script & initialize gtag
    useEffect(() => {
        if (!measurementId || initializedRef.current === measurementId) return

        const scriptId = `ga-gtag-${measurementId}`
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script")
            script.id = scriptId
            script.async = true
            script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
            document.head.appendChild(script)

            window.dataLayer = window.dataLayer || []
            window.gtag = function () {
                window.dataLayer?.push(arguments)
            }
            window.gtag("js", new Date())
            window.gtag("config", measurementId, {
                send_page_view: false,
            })
        }

        initializedRef.current = measurementId

        // Fire initial form_view
        if (window.gtag && form) {
            window.gtag("event", "form_view", {
                form_id: form.id || form.slug,
                form_title: form.title,
            })
        }
    }, [measurementId, form])

    // 2. Track question / step progress
    useEffect(() => {
        if (!measurementId || step === undefined || !window.gtag || !form) return

        window.gtag("event", "question_view", {
            form_id: form.id || form.slug,
            form_title: form.title,
            step_number: step + 1,
            page_key: currentPageKey || "",
            question_label: currentPageLabel || "",
        })
    }, [measurementId, step, currentPageKey, currentPageLabel, form])

    // 3. Callback to track form submission
    const trackFormSubmit = useCallback(
        (submissionData?: Record<string, unknown>) => {
            if (!measurementId || !window.gtag || !form) return

            window.gtag("event", "form_submit", {
                form_id: form.id || form.slug,
                form_title: form.title,
                ...submissionData,
            })
        },
        [measurementId, form],
    )

    return { trackFormSubmit, hasGA: Boolean(measurementId) }
}

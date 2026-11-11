import type { FormBlock, FormQuestion, FormPage } from "../types/common"

/** True when a value counts as "answered". */
export function isEmpty(value: unknown): boolean {
    if (value === null || value === undefined) return true
    if (typeof value === "string") return value.trim() === ""
    if (typeof value === "number") return false
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "object") {
        // address / matrix objects: empty when every entry is blank
        return Object.values(value as Record<string, unknown>).every((v) =>
            Array.isArray(v) ? v.length === 0 : v === "" || v === undefined || v === null,
        )
    }
    return false
}

export function validateQuestion(
    block: FormQuestion | FormBlock | FormPage,
    value: unknown,
): string | null {
    // Statement questions/pages are display-only and never required.
    if (block.type === "statement") return null

    if (block.required && isEmpty(value)) {
        return block.validation?.message || "This field is required."
    }

    const settings = block.settings ?? {}

    if (block.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value as string)) {
            return block.validation?.message || "Please enter a valid email address."
        }
        if (value && settings.email?.businessEmailsOnly) {
            const freeDomains = [
                "gmail.com",
                "yahoo.com",
                "hotmail.com",
                "outlook.com",
                "aol.com",
                "icloud.com",
                "proton.me",
                "protonmail.com",
            ]
            const domain = String(value).split("@")[1]?.toLowerCase()
            if (domain && freeDomains.includes(domain)) {
                return (
                    block.validation?.message ||
                    "Please enter a business email address."
                )
            }
        }
    }

    if (block.type === "url" && value) {
        try {
            new URL(String(value))
        } catch {
            return block.validation?.message || "Please enter a valid URL."
        }
    }

    if ((block.type === "shortText" || block.type === "longText") && typeof value === "string") {
        if (block.validation?.minLength && value.length < block.validation.minLength) {
            return block.validation?.message || `Minimum length is ${block.validation.minLength}.`
        }
        if (block.validation?.maxLength && value.length > block.validation.maxLength) {
            return block.validation?.message || `Maximum length is ${block.validation.maxLength}.`
        }
    }

    if (block.type === "number" && typeof value !== "undefined" && value !== "") {
        const numValue = Number(value)
        if (isNaN(numValue)) return block.validation?.message || "Please enter a valid number."
        if (block.validation?.min !== undefined && numValue < block.validation.min) {
            return block.validation?.message || `Minimum value is ${block.validation.min}.`
        }
        if (block.validation?.max !== undefined && numValue > block.validation.max) {
            return block.validation?.message || `Maximum value is ${block.validation.max}.`
        }
    }

    // Selection limits for multi-answer choice pages.
    if (
        (block.type === "multiSelect" || block.type === "checkbox") &&
        Array.isArray(value)
    ) {
        const limit = settings.choice?.selectionLimit
        if (limit && limit.mode === "exact" && limit.exact !== undefined) {
            if (value.length !== limit.exact) {
                return (
                    block.validation?.message ||
                    `Please select exactly ${limit.exact} option(s).`
                )
            }
        }
        if (limit && limit.mode === "range") {
            if (limit.min !== undefined && value.length < limit.min) {
                return (
                    block.validation?.message ||
                    `Please select at least ${limit.min} option(s).`
                )
            }
            if (limit.max !== undefined && value.length > limit.max) {
                return (
                    block.validation?.message ||
                    `Please select no more than ${limit.max} option(s).`
                )
            }
        }
    }

    // Required sub-pages on an address.
    if (block.type === "address" && settings.address) {
        const answers = (value as Record<string, string> | undefined) ?? {}
        const missing = settings.address.pages.find(
            (f) => !f.hidden && f.required && !answers[f.key]?.trim(),
        )
        if (missing) {
            return block.validation?.message || `${missing.label} is required.`
        }
    }

    // Every visible matrix row must be answered when the page is required.
    if (block.type === "matrix" && block.required && settings.matrix) {
        const answers = (value as Record<string, string | string[]> | undefined) ?? {}
        const unanswered = settings.matrix.rows.find((row) => {
            const cell = answers[row.key]
            return Array.isArray(cell) ? cell.length === 0 : !cell
        })
        if (unanswered) {
            return (
                block.validation?.message ||
                `Please answer "${unanswered.label}".`
            )
        }
    }

    // Opinion scale must fall inside the configured range.
    if (block.type === "opinionScale" && typeof value === "number" && settings.opinionScale) {
        const { min, max } = settings.opinionScale
        if (value < min || value > max) {
            return block.validation?.message || `Please choose a value between ${min} and ${max}.`
        }
    }

    return null
}

export const validateBlock = validateQuestion

export function validatePage(page: FormPage, valueOrAnswers: unknown): string | null {
    const questions = (page.questions && page.questions.length > 0)
        ? page.questions
        : (page.blocks && page.blocks.length > 0 ? page.blocks : [])

    if (questions.length > 0) {
        const hasMultiple = questions.length > 1
        for (let idx = 0; idx < questions.length; idx++) {
            const question = questions[idx]
            const key: string =
                question.questionKey ||
                question.blockKey ||
                (question as any).id ||
                (question as any)._id ||
                (hasMultiple ? `${page.pageKey}_q${idx + 1}` : page.pageKey)
            const questionValue = (typeof valueOrAnswers === "object" && valueOrAnswers !== null)
                ? ((valueOrAnswers as Record<string, unknown>)[key] ??
                   (!hasMultiple ? (valueOrAnswers as Record<string, unknown>)[page.pageKey] : undefined))
                : valueOrAnswers
            const error = validateQuestion(question, questionValue)
            if (error) return error
        }
        return null
    }

    return validateQuestion(page, valueOrAnswers)
}

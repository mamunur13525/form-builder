import type { FormPage } from "../types/common"

/** True when a value counts as "answered". */
function isEmpty(value: unknown): boolean {
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

export function validatePage(page: FormPage, value: unknown): string | null {
    // Statement pages are display-only and never required.
    if (page.type === "statement") return null

    if (page.required && isEmpty(value)) {
        return page.validation?.message || "This page is required."
    }

    const settings = page.settings ?? {}

    if (page.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value as string)) {
            return page.validation?.message || "Please enter a valid email address."
        }
        // Flag-only on the backend, but we can still enforce it client-side.
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
                    page.validation?.message ||
                    "Please enter a business email address."
                )
            }
        }
    }

    if (page.type === "url" && value) {
        try {
            new URL(String(value))
        } catch {
            return page.validation?.message || "Please enter a valid URL."
        }
    }

    if ((page.type === "shortText" || page.type === "longText") && typeof value === "string") {
        if (page.validation?.minLength && value.length < page.validation.minLength) {
            return page.validation?.message || `Minimum length is ${page.validation.minLength}.`
        }
        if (page.validation?.maxLength && value.length > page.validation.maxLength) {
            return page.validation?.message || `Maximum length is ${page.validation.maxLength}.`
        }
    }

    if (page.type === "number" && typeof value !== "undefined" && value !== "") {
        const numValue = Number(value)
        if (isNaN(numValue)) return page.validation?.message || "Please enter a valid number."
        if (page.validation?.min !== undefined && numValue < page.validation.min) {
            return page.validation?.message || `Minimum value is ${page.validation.min}.`
        }
        if (page.validation?.max !== undefined && numValue > page.validation.max) {
            return page.validation?.message || `Maximum value is ${page.validation.max}.`
        }
    }

    // Selection limits for multi-answer choice pages.
    if (
        (page.type === "multiSelect" || page.type === "checkbox") &&
        Array.isArray(value)
    ) {
        const limit = settings.choice?.selectionLimit
        if (limit && limit.mode === "exact" && limit.exact !== undefined) {
            if (value.length !== limit.exact) {
                return (
                    page.validation?.message ||
                    `Please select exactly ${limit.exact} option(s).`
                )
            }
        }
        if (limit && limit.mode === "range") {
            if (limit.min !== undefined && value.length < limit.min) {
                return (
                    page.validation?.message ||
                    `Please select at least ${limit.min} option(s).`
                )
            }
            if (limit.max !== undefined && value.length > limit.max) {
                return (
                    page.validation?.message ||
                    `Please select no more than ${limit.max} option(s).`
                )
            }
        }
    }

    // Required sub-pages on an address.
    if (page.type === "address" && settings.address) {
        const answers = (value as Record<string, string> | undefined) ?? {}
        const missing = settings.address.pages.find(
            (f) => !f.hidden && f.required && !answers[f.key]?.trim(),
        )
        if (missing) {
            return page.validation?.message || `${missing.label} is required.`
        }
    }

    // Every visible matrix row must be answered when the page is required.
    if (page.type === "matrix" && page.required && settings.matrix) {
        const answers = (value as Record<string, string | string[]> | undefined) ?? {}
        const unanswered = settings.matrix.rows.find((row) => {
            const cell = answers[row.key]
            return Array.isArray(cell) ? cell.length === 0 : !cell
        })
        if (unanswered) {
            return (
                page.validation?.message ||
                `Please answer "${unanswered.label}".`
            )
        }
    }

    // Opinion scale must fall inside the configured range.
    if (page.type === "opinionScale" && typeof value === "number" && settings.opinionScale) {
        const { min, max } = settings.opinionScale
        if (value < min || value > max) {
            return page.validation?.message || `Please choose a value between ${min} and ${max}.`
        }
    }

    return null
}

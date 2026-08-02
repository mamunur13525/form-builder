import type { FormField } from "../types/common"

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

export function validateField(field: FormField, value: unknown): string | null {
    // Statement fields are display-only and never required.
    if (field.type === "statement") return null

    if (field.required && isEmpty(value)) {
        return field.validation?.message || "This field is required."
    }

    const settings = field.settings ?? {}

    if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value as string)) {
            return field.validation?.message || "Please enter a valid email address."
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
                    field.validation?.message ||
                    "Please enter a business email address."
                )
            }
        }
    }

    if (field.type === "url" && value) {
        try {
            new URL(String(value))
        } catch {
            return field.validation?.message || "Please enter a valid URL."
        }
    }

    if ((field.type === "shortText" || field.type === "longText") && typeof value === "string") {
        if (field.validation?.minLength && value.length < field.validation.minLength) {
            return field.validation?.message || `Minimum length is ${field.validation.minLength}.`
        }
        if (field.validation?.maxLength && value.length > field.validation.maxLength) {
            return field.validation?.message || `Maximum length is ${field.validation.maxLength}.`
        }
    }

    if (field.type === "number" && typeof value !== "undefined" && value !== "") {
        const numValue = Number(value)
        if (isNaN(numValue)) return field.validation?.message || "Please enter a valid number."
        if (field.validation?.min !== undefined && numValue < field.validation.min) {
            return field.validation?.message || `Minimum value is ${field.validation.min}.`
        }
        if (field.validation?.max !== undefined && numValue > field.validation.max) {
            return field.validation?.message || `Maximum value is ${field.validation.max}.`
        }
    }

    // Selection limits for multi-answer choice fields.
    if (
        (field.type === "multiSelect" || field.type === "checkbox") &&
        Array.isArray(value)
    ) {
        const limit = settings.choice?.selectionLimit
        if (limit && limit.mode === "exact" && limit.exact !== undefined) {
            if (value.length !== limit.exact) {
                return (
                    field.validation?.message ||
                    `Please select exactly ${limit.exact} option(s).`
                )
            }
        }
        if (limit && limit.mode === "range") {
            if (limit.min !== undefined && value.length < limit.min) {
                return (
                    field.validation?.message ||
                    `Please select at least ${limit.min} option(s).`
                )
            }
            if (limit.max !== undefined && value.length > limit.max) {
                return (
                    field.validation?.message ||
                    `Please select no more than ${limit.max} option(s).`
                )
            }
        }
    }

    // Required sub-fields on an address.
    if (field.type === "address" && settings.address) {
        const answers = (value as Record<string, string> | undefined) ?? {}
        const missing = settings.address.fields.find(
            (f) => !f.hidden && f.required && !answers[f.key]?.trim(),
        )
        if (missing) {
            return field.validation?.message || `${missing.label} is required.`
        }
    }

    // Every visible matrix row must be answered when the field is required.
    if (field.type === "matrix" && field.required && settings.matrix) {
        const answers = (value as Record<string, string | string[]> | undefined) ?? {}
        const unanswered = settings.matrix.rows.find((row) => {
            const cell = answers[row.key]
            return Array.isArray(cell) ? cell.length === 0 : !cell
        })
        if (unanswered) {
            return (
                field.validation?.message ||
                `Please answer "${unanswered.label}".`
            )
        }
    }

    // Opinion scale must fall inside the configured range.
    if (field.type === "opinionScale" && typeof value === "number" && settings.opinionScale) {
        const { min, max } = settings.opinionScale
        if (value < min || value > max) {
            return field.validation?.message || `Please choose a value between ${min} and ${max}.`
        }
    }

    return null
}

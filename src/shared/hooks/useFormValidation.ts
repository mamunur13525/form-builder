import type { FormField } from "../types/common"

export function validateField(field: FormField, value: unknown): string | null {
    if (field.required && !value && typeof value !== "number") {
        return field.validation?.message || "This field is required."
    }

    if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (value && !emailRegex.test(value as string)) {
            return field.validation?.message || "Please enter a valid email address."
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
        if (field.validation?.min && numValue < field.validation.min) {
            return field.validation?.message || `Minimum value is ${field.validation.min}.`
        }
        if (field.validation?.max && numValue > field.validation.max) {
            return field.validation?.message || `Maximum value is ${field.validation.max}.`
        }
    }

    return null
}
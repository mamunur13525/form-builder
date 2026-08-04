/**
 * Toast utility for showing API error/success notifications.
 *
 * Uses the Base UI toast manager from `@/components/ui/toast`.
 * Provides user-friendly messages for non-technical users.
 */

import { useCallback } from "react"
import { toast, useToastManager } from "@/components/ui/toast"
import { ApiError } from "@/shared/api/types"

// ---------------------------------------------------------------------------
// User-friendly error messages mapped from common API error patterns
// ---------------------------------------------------------------------------

const ERROR_MESSAGES: Record<string, string> = {
    "Network error": "Unable to connect. Please check your internet connection and try again.",
    "Failed to fetch": "Unable to connect. Please check your internet connection and try again.",
    "Unauthorized": "Your session has expired. Please sign in again.",
    "Forbidden": "You don't have permission to perform this action.",
    "Not Found": "The requested information could not be found.",
    "Validation error": "Please check your information and try again.",
    "already exists": "This information is already in use. Please try a different value.",
    "Invalid credentials": "The email or password you entered is incorrect. Please try again.",
    "too many requests": "You've made too many attempts. Please wait a moment and try again.",
    "Internal server error": "Something went wrong on our end. Please try again later.",
}

function getUserFriendlyMessage(error: unknown): string {
    if (error instanceof ApiError) {
        // Check for specific known messages
        for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.message.toLowerCase().includes(key.toLowerCase())) {
                return message
            }
        }
        // Return the original message if it's already user-friendly
        return error.message
    }

    if (error instanceof Error) {
        for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
            if (error.message.toLowerCase().includes(key.toLowerCase())) {
                return message
            }
        }
        return error.message
    }

    return "Something unexpected happened. Please try again."
}

// ---------------------------------------------------------------------------
// Toast helpers
// ---------------------------------------------------------------------------

/**
 * Show a success toast.
 */
export function showSuccess(title: string, description?: string) {
    toast.add({
        title,
        description,
        type: "success",
        timeout: 4000,
    })
}

/**
 * Show an error toast with a user-friendly message.
 * Extracts the message from an ApiError or generic Error.
 * The error is optional — omit it for a title-only toast.
 */
export function showError(title: string, error?: unknown) {
    toast.add({
        title,
        description: error === undefined ? undefined : getUserFriendlyMessage(error),
        type: "error",
        timeout: 6000,
    })
}

/**
 * Show an info toast.
 */
export function showInfo(title: string, description?: string) {
    toast.add({
        title,
        description,
        type: "info",
        timeout: 4000,
    })
}

/**
 * Show a warning toast.
 */
export function showWarning(title: string, description?: string) {
    toast.add({
        title,
        description,
        type: "warning",
        timeout: 5000,
    })
}

// ---------------------------------------------------------------------------
// Hook for use in components
// ---------------------------------------------------------------------------

/**
 * Hook that provides toast methods for use in components.
 * This is a thin wrapper around the toast manager for convenience.
 */
export function useToast() {
    const toastManager = useToastManager()

    const success = useCallback(
        (title: string, description?: string) => {
            toastManager.add({ title, description, type: "success", timeout: 4000 })
        },
        [toastManager],
    )

    const error = useCallback(
        (title: string, err?: unknown) => {
            toastManager.add({
                title,
                description: err === undefined ? undefined : getUserFriendlyMessage(err),
                type: "error",
                timeout: 6000,
            })
        },
        [toastManager],
    )

    const info = useCallback(
        (title: string, description?: string) => {
            toastManager.add({ title, description, type: "info", timeout: 4000 })
        },
        [toastManager],
    )

    const warning = useCallback(
        (title: string, description?: string) => {
            toastManager.add({ title, description, type: "warning", timeout: 5000 })
        },
        [toastManager],
    )

    return { success, error, info, warning }
}
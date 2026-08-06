/**
 * Field-level validation error returned inside a 422 response.
 */
export interface ApiFieldError {
    field: string
    message: string
}

/**
 * API response envelope returned by every backend endpoint.
 */
export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T | null
    errors?: ApiFieldError[]
}

/**
 * Error response shape from the backend.
 */
export interface ApiErrorResponse {
    success: false
    message: string
    errors?: ApiFieldError[]
}

/**
 * Custom error class for all API failures.
 * Carries HTTP status, backend message, and optional field-level errors.
 */
export class ApiError extends Error {
    public status: number
    public errors?: ApiFieldError[]

    constructor(
        message: string,
        status: number,
        errors?: ApiFieldError[],
    ) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.errors = errors
    }

    /**
     * Field errors keyed by field name — ready for `react-hook-form`'s `setError`
     * or for driving inline messages on controlled inputs.
     */
    get byField(): Record<string, string> {
        return Object.fromEntries((this.errors ?? []).map((e) => [e.field, e.message]))
    }

    /** Convenience: is this a 401 Unauthorized error? */
    isUnauthorized(): boolean {
        return this.status === 401
    }

    /** Convenience: did the backend reject this as a validation failure? */
    isValidationError(): boolean {
        return this.status === 422
    }

    /** Convenience: is the caller being rate limited (10 req / 15 min on auth routes)? */
    isRateLimited(): boolean {
        return this.status === 429
    }

    /** Convenience: is this a network error (status 0)? */
    isNetworkError(): boolean {
        return this.status === 0
    }
}

/**
 * Options accepted by the base client.
 */
export interface ApiRequestOptions extends RequestInit {
    /** Override the auth token for this request (e.g. refresh-token endpoint). */
    skipAuth?: boolean
}

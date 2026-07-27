/**
 * API response envelope returned by every backend endpoint.
 */
export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data: T | null
    errors?: string[]
}

/**
 * Error response shape from the backend.
 */
export interface ApiErrorResponse {
    success: false
    message: string
    errors?: string[]
}

/**
 * Custom error class for all API failures.
 * Carries HTTP status, backend message, and optional field-level errors.
 */
export class ApiError extends Error {
    public status: number
    public errors?: string[]

    constructor(
        message: string,
        status: number,
        errors?: string[],
    ) {
        super(message)
        this.name = "ApiError"
        this.status = status
        this.errors = errors
    }

    /** Convenience: is this a 401 Unauthorized error? */
    isUnauthorized(): boolean {
        return this.status === 401
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

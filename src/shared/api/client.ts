import { ApiError, type ApiRequestOptions, type ApiResponse } from "./types"
import { tokenStorage } from "@/shared/utils/storage"

const BASE_URL = "http://localhost:5000/api/v1"

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Build a query string from a plain object, skipping null/undefined values. */
function buildQueryString(params: Record<string, unknown> | undefined): string {
    if (!params) return ""
    const parts: string[] = []
    for (const [key, value] of Object.entries(params)) {
        if (value === null || value === undefined) continue
        if (Array.isArray(value)) {
            for (const item of value) {
                parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`)
            }
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        }
    }
    return parts.length ? `?${parts.join("&")}` : ""
}

/**
 * Single point of HTTP communication.
 *
 * Responsibilities:
 *  - Inject the Bearer token (unless `skipAuth` is set).
 *  - Serialise the body (JSON or FormData).
 *  - Parse the `{ success, message, data }` envelope.
 *  - Throw `ApiError` on any failure (HTTP error, application error, network error).
 *  - Attempt a token refresh on 401 and retry once.
 */
async function request<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const { skipAuth = false, headers, body, ...rest } = options

    // --- Build headers -------------------------------------------------------
    const hdrs: Record<string, string> = {}
    if (!(body instanceof FormData)) {
        hdrs["Content-Type"] = "application/json"
    }
    if (!skipAuth) {
        const token = tokenStorage.getAccessToken()
        if (token) {
            hdrs["Authorization"] = `Bearer ${token}`
        }
    }
    // Merge caller-supplied headers (caller wins on conflicts).
    Object.assign(hdrs, headers)

    // --- Build URL -----------------------------------------------------------
    const url = `${BASE_URL}${endpoint}`

    // --- Attempt the fetch (with one refresh-retry on 401) -------------------
    const response = await fetchWithRetry(url, {
        ...rest,
        headers: hdrs,
        body,
    })

    // Parse JSON from response
    const data: ApiResponse<T> = await response.json()

    // HTTP-level error (non-2xx)
    if (!response.ok) {
        throw new ApiError(
            data.message || response.statusText,
            response.status,
            data.errors,
        )
    }

    // Application-level error (success === false)
    if (!data.success) {
        throw new ApiError(data.message || "Application error", response.status, data.errors)
    }

    return data.data as T
}

/**
 * Wraps `fetch` with automatic token-refresh on 401.
 * If the first attempt returns 401, it tries to refresh the token,
 * then retries the original request once.
 */
async function fetchWithRetry(
    url: string,
    options: RequestInit,
): Promise<Response> {
    const response = await fetchOnce(url, options)

    if (response.status === 401) {
        // Try to refresh the token
        const refreshed = await tryRefreshToken()
        if (refreshed) {
            // Retry with the new token
            const hdrs: Record<string, string> = { ...(options.headers as Record<string, string>) }
            const token = tokenStorage.getAccessToken()
            if (token) {
                hdrs["Authorization"] = `Bearer ${token}`
            }
            return fetchOnce(url, { ...options, headers: hdrs })
        }
    }

    return response
}

/**
 * Single fetch attempt — parses the response envelope and either
 * returns the typed data or throws an `ApiError`.
 */
async function fetchOnce(url: string, options: RequestInit): Promise<Response> {
    let response: Response
    try {
        response = await fetch(url, options)
    } catch {
        throw new ApiError("Network error — please check your connection", 0)
    }

    // Clone the response before reading the body so the original stream
    // is preserved for the caller (e.g. `request()` on line 68).
    let body: ApiResponse<unknown>
    try {
        body = await response.clone().json()
    } catch {
        // Response wasn't JSON — treat as a raw HTTP error
        throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
        )
    }

    // HTTP-level error (non-2xx)
    if (!response.ok) {
        throw new ApiError(
            body.message || response.statusText,
            response.status,
            body.errors,
        )
    }

    // Application-level error (success === false)
    if (!body.success) {
        throw new ApiError(body.message || "Application error", response.status, body.errors)
    }

    return response
}

/**
 * Attempt to refresh the access token using the stored refresh token.
 * Returns `true` on success, `false` on failure.
 */
let isRefreshing = false
let pendingRefresh: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
    if (isRefreshing) {
        return pendingRefresh ?? Promise.resolve(false)
    }

    isRefreshing = true
    pendingRefresh = (async () => {
        const refreshToken = tokenStorage.getRefreshToken()
        if (!refreshToken) {
            tokenStorage.clearTokens()
            return false
        }

        try {
            const response = await fetch(`${BASE_URL}/auth/refresh-token`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken }),
            })

            if (!response.ok) {
                tokenStorage.clearTokens()
                return false
            }

            const body: ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }> =
                await response.json()

            if (!body.success || !body.data) {
                tokenStorage.clearTokens()
                return false
            }

            tokenStorage.setTokens(body.data.tokens.accessToken, body.data.tokens.refreshToken)
            return true
        } catch {
            tokenStorage.clearTokens()
            return false
        }
    })()

    const result = await pendingRefresh
    isRefreshing = false
    pendingRefresh = null
    return result
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Make a request that is expected to return a `data` payload.
 *
 * Throws `ApiError` when:
 *  - The HTTP status is non-2xx.
 *  - The application reports `success: false`.
 *  - The `data` field is `null` or `undefined` (no data returned).
 */
export async function apiRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const data = await request<T | null>(endpoint, options)
    if (data === null || data === undefined) {
        throw new ApiError("Expected data but received null", 0)
    }
    return data
}

/**
 * Make a request where `data` is expected to be `null` (e.g. delete, logout).
 *
 * Throws `ApiError` only when the application reports `success: false`
 * or the HTTP status is non-2xx.
 */
export async function apiRequestVoid(
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<void> {
    await request<null>(endpoint, options)
}

/**
 * Build a query string fragment (e.g. `?page=1&limit=10`).
 * Usage: `apiRequest(\`/forms${buildQuery({ page, limit })}\`)`
 */
export function buildQuery(params: Record<string, unknown> | undefined): string {
    return buildQueryString(params)
}

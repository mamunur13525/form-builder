# API Query Rules

## Overview

This document defines the conventions for API management in the frontend application.
All API communication must go through the centralized API layer — no direct `fetch`
calls outside of `src/shared/api/client.ts`.

## Base Configuration

- **Base URL:** `http://localhost:5000/api/v1`
- **HTTP Client:** Native `fetch` wrapped by `src/shared/api/client.ts`
- **State Management:** TanStack Query (`@tanstack/react-query`) for all server state
- **Auth:** Bearer token stored in `localStorage` under key `accessToken`

## Response Format

Every API response follows this envelope:

```json
{
  "success": true,
  "message": "Description of what happened",
  "data": {}
}
```

On error:

```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

### Response Handling

1. **`apiRequest<T>()`** — use for endpoints that return a `data` payload.
   - Throws `ApiError` if `success === false` (application-level error).
   - Throws `ApiError` if `data` is `null` or `undefined` (no data returned).
2. **`apiRequestVoid()`** — use for endpoints where `data` is expected to be `null`
   (e.g. delete, logout, mark-read).
   - Throws `ApiError` only if `success === false`.

### Error Handling

- All errors are thrown as `ApiError` instances with `message`, `status`, and optional `errors[]`.
- HTTP non-2xx responses are treated as errors.
- Application-level errors (`success: false`) are treated as errors.
- Network errors are caught and re-thrown as `ApiError` with status `0`.
- Token refresh is attempted automatically on `401` responses before rejecting.

## TanStack Query Conventions

### Query Keys

- Use stable, array-based query keys: `["forms", formId]`, `["users", { page, limit }]`.
- Group related queries under a domain prefix.
- Include all parameters that affect the result in the query key.

### Query Hooks

- Every query hook returns the result of `useQuery()`.
- Use `staleTime: 5 * 60 * 1000` (5 minutes) as the default stale time.
- Use `gcTime: 10 * 60 * 1000` (10 minutes) as the default garbage collection time.

### Mutation Hooks

- Every mutation hook returns the result of `useMutation()`.
- On success, invalidate the relevant query keys.
- On error, the `ApiError` is available via `error` in the mutation result.

### Provider

- `QueryClientProvider` must wrap the application in `AppProvider`.
- The `QueryClient` is configured in `src/shared/api/queryClient.ts`.

## File Structure

```
src/shared/api/
  types.ts        — ApiResponse, ApiError, ApiErrorResponse
  client.ts       — Base HTTP client (fetch wrapper, response parsing, auth)
  queryClient.ts  — TanStack Query client configuration

src/entities/<domain>/
  api/            — API functions (one .api.ts per resource)
  model/          — TypeScript types for the domain

src/features/<feature>/
  hooks/          — TanStack Query hooks (useQuery, useMutation wrappers)
```

## No Repeatable Code

- The base client (`client.ts`) is the **single source of truth** for HTTP communication.
- API function files only declare endpoints, parameters, and return types.
- Hook files only wire API functions to `useQuery`/`useMutation`.
- Query keys are defined as constants where reused across hooks.
- Response parsing and error throwing happen **once** in the base client.

## Type Safety

- All API functions must be fully typed with explicit request and response types.
- Entity model types must match the backend API documentation exactly.
- Use `zod` or manual validation is **not** required — trust the backend types.

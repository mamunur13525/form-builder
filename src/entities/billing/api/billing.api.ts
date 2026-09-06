/**
 * Billing API — wraps every endpoint documented in doc/billing-api.md.
 * Payments are powered by Lemon Squeezy (Merchant of Record); the backend only
 * creates hosted checkouts and reacts to signed webhooks.
 */

import { apiRequest } from "@/shared/api/client"
import type {
    CheckoutRequest,
    CheckoutResponse,
    CustomerPortalResponse,
    PlansResponse,
    Subscription,
} from "@/entities/billing/model/types"

// ---------------------------------------------------------------------------
// Public endpoints
// ---------------------------------------------------------------------------

/** GET /billing/plans — public pricing data for the pricing page (no auth). */
export async function getPlans(): Promise<PlansResponse> {
    return apiRequest<PlansResponse>("/billing/plans", { skipAuth: true })
}

// ---------------------------------------------------------------------------
// Authenticated endpoints
// ---------------------------------------------------------------------------

/** GET /billing/subscription — the current account's subscription (free row is created lazily). */
export async function getSubscription(): Promise<Subscription> {
    return apiRequest<Subscription>("/billing/subscription")
}

/** POST /billing/checkout — create a Lemon Squeezy hosted checkout for a plan/interval. */
export async function createCheckout(data: CheckoutRequest): Promise<CheckoutResponse> {
    return apiRequest<CheckoutResponse>("/billing/checkout", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /billing/change-plan — upgrade/downgrade an active subscription (proration by Lemon Squeezy). */
export async function changePlan(data: CheckoutRequest): Promise<Subscription> {
    return apiRequest<Subscription>("/billing/change-plan", {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** POST /billing/cancel — cancel at the end of the current billing period. */
export async function cancelSubscription(): Promise<Subscription> {
    return apiRequest<Subscription>("/billing/cancel", { method: "POST" })
}

/** POST /billing/resume — revert a scheduled cancellation before the period ends. */
export async function resumeSubscription(): Promise<Subscription> {
    return apiRequest<Subscription>("/billing/resume", { method: "POST" })
}

/** GET /billing/portal — Lemon Squeezy customer portal URL (payment method, invoices). */
export async function getCustomerPortalUrl(): Promise<CustomerPortalResponse> {
    return apiRequest<CustomerPortalResponse>("/billing/portal")
}

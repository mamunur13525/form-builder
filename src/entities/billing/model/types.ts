/**
 * Billing types that match the backend API documentation (doc/billing-api.md).
 * Payments are powered by Lemon Squeezy as Merchant of Record.
 */

/** Paid plan tiers — `free` is implicit for every account. */
export type PaidPlan = "pro" | "team"

export type PlanId = "free" | PaidPlan

export type BillingInterval = "monthly" | "yearly"

/**
 * Subscription lifecycle statuses.
 * `active`/`on_trial` always grant the plan, `past_due` keeps grace access,
 * `cancelled` keeps access until `endsAt`, the rest grant nothing.
 */
export type SubscriptionStatus =
    | "free"
    | "active"
    | "on_trial"
    | "past_due"
    | "cancelled"
    | "expired"
    | "paused"

/** Usage limits enforced app-wide per plan (`-1` means unlimited). */
export interface PlanLimits {
    forms: number
    responsesPerMonth: number
    workspaceMembers: number
}

/** Prices are served in whole currency units (e.g. dollars). */
export interface PlanPrices {
    monthly: number
    yearly: number
}

/** One plan as served by GET /billing/plans. */
export interface Plan {
    id: PlanId
    name: string
    description: string
    features: string[]
    limits: PlanLimits
    prices: PlanPrices
}

/** GET /billing/plans response payload. */
export interface PlansResponse {
    currency: string
    plans: Plan[]
}

/**
 * GET /billing/subscription · POST /billing/change-plan ·
 * POST /billing/cancel · POST /billing/resume response payload.
 */
export interface Subscription {
    plan: PlanId
    interval: BillingInterval
    status: SubscriptionStatus
    renewsAt: string | null
    endsAt: string | null
    cancelledAt: string | null
    cancelReason: string | null
    lastPaymentAt: string | null
    testMode: boolean
    createdAt: string
    updatedAt: string
}

/** POST /billing/checkout request body. */
export interface CheckoutRequest {
    plan: PaidPlan
    interval: BillingInterval
}

/** POST /billing/checkout response payload. */
export interface CheckoutResponse {
    checkoutUrl: string
    checkoutId: string
}

/** GET /billing/portal response payload. */
export interface CustomerPortalResponse {
    url: string
}

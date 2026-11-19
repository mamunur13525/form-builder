/**
 * Payment API — Stripe Connect accounts for the builder, hosted checkout for
 * respondents, and the owner's payment history (transactions + refunds).
 */

import { apiRequest } from "@/shared/api/client"

export type StripeAccountStatus = "active" | "incomplete" | "restricted" | "unknown"

export interface StripeAccount {
    accountId: string
    name: string
    connectedAt?: string
    country?: string
    email?: string
    chargesEnabled?: boolean
    payoutsEnabled?: boolean
    detailsSubmitted?: boolean
    requirementsDue?: string[]
    statusSyncedAt?: string
    status?: StripeAccountStatus
    canAcceptPayments?: boolean
}

/** A payment verified by the server against Stripe. */
export interface VerifiedPayment {
    sessionId: string
    status: "paid"
    /** Amount in the currency's minor unit (cents). */
    amount: number
    currency: string
    pageKey?: string
}

export type PaymentStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "canceled"
    | "partially_refunded"
    | "refunded"
    | "disputed"

export interface PaymentRecord {
    id: string
    formId: string
    formTitle: string
    formSlug: string
    submissionId: string
    pageKey: string
    amountMinor: number
    currency: string
    applicationFeeMinor: number
    refundAmountMinor: number
    refundableMinor: number
    status: PaymentStatus
    customerEmail: string
    paidAt: string | null
    createdAt: string
    checkoutSessionId: string
    paymentIntentId: string
    stripeAccountId: string
}

export interface PaymentList {
    items: PaymentRecord[]
    total: number
    page: number
    limit: number
}

export interface PaymentOverview {
    currencies: {
        currency: string
        paidCount: number
        grossAmount: number
        refundedAmount: number
        pendingCount: number
    }[]
}

/** GET /forms/:formId/payments/stripe/accounts — accounts connected by the form's workspace. */
export async function getStripeAccounts(formId: string): Promise<StripeAccount[]> {
    return apiRequest<StripeAccount[]>(`/forms/${formId}/payments/stripe/accounts`)
}

/** POST /forms/:formId/payments/stripe/accounts/refresh — re-read capabilities from Stripe. */
export async function refreshStripeAccounts(formId: string): Promise<StripeAccount[]> {
    return apiRequest<StripeAccount[]>(`/forms/${formId}/payments/stripe/accounts/refresh`, {
        method: "POST",
    })
}

/** DELETE /forms/:formId/payments/stripe/accounts/:accountId — revoke platform access. */
export async function disconnectStripeAccount(
    formId: string,
    accountId: string,
): Promise<{ disconnected: boolean }> {
    return apiRequest<{ disconnected: boolean }>(
        `/forms/${formId}/payments/stripe/accounts/${encodeURIComponent(accountId)}`,
        { method: "DELETE" },
    )
}

/** GET /forms/:formId/payments/stripe/connect-url — Stripe OAuth URL for a new account. */
export async function getStripeConnectUrl(formId: string): Promise<{ url: string }> {
    return apiRequest<{ url: string }>(`/forms/${formId}/payments/stripe/connect-url`)
}

/** POST .../accounts/:accountId/onboarding-link — collects missing Stripe details. */
export async function getAccountOnboardingUrl(
    formId: string,
    accountId: string,
): Promise<{ url: string }> {
    return apiRequest<{ url: string }>(
        `/forms/${formId}/payments/stripe/accounts/${encodeURIComponent(accountId)}/onboarding-link`,
        { method: "POST" },
    )
}

/** POST .../accounts/:accountId/dashboard-link — the owner's Stripe dashboard. */
export async function getAccountDashboardUrl(
    formId: string,
    accountId: string,
): Promise<{ url: string }> {
    return apiRequest<{ url: string }>(
        `/forms/${formId}/payments/stripe/accounts/${encodeURIComponent(accountId)}/dashboard-link`,
        { method: "POST" },
    )
}

/** POST /public/forms/:slug/payment-session — start hosted Stripe Checkout. */
export async function createPaymentSession(
    slug: string,
    data: { pageKey: string; email?: string; respondentSessionId?: string },
): Promise<{ id: string; url: string }> {
    return apiRequest<{ id: string; url: string }>(`/public/forms/${slug}/payment-session`, {
        method: "POST",
        body: JSON.stringify(data),
    })
}

/** GET /public/forms/:slug/payment-session/:sessionId — verify a returned checkout. */
export async function verifyPaymentSession(
    slug: string,
    sessionId: string,
    pageKey: string,
): Promise<VerifiedPayment> {
    return apiRequest<VerifiedPayment>(
        `/public/forms/${slug}/payment-session/${encodeURIComponent(sessionId)}?pageKey=${encodeURIComponent(pageKey)}`,
    )
}

/* -------------------------------------------------------------------------- */
/* Owner payment history                                                      */
/* -------------------------------------------------------------------------- */

export interface PaymentQuery {
    formId?: string
    status?: string
    currency?: string
    from?: string
    to?: string
    page?: number
    limit?: number
}

/** GET /payments — transactions the signed-in user can see. */
export async function listPayments(query: PaymentQuery = {}): Promise<PaymentList> {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== "") {
            params.set(key, String(value))
        }
    }
    const qs = params.toString()
    return apiRequest<PaymentList>(`/payments${qs ? `?${qs}` : ""}`)
}

/** GET /payments/overview — per-currency totals for the summary cards. */
export async function getPaymentsOverview(): Promise<PaymentOverview> {
    return apiRequest<PaymentOverview>("/payments/overview")
}

/** POST /payments/:id/refund — full refund when `amountMinor` is omitted. */
export async function refundPayment(
    paymentId: string,
    amountMinor?: number,
): Promise<PaymentRecord> {
    return apiRequest<PaymentRecord>(`/payments/${paymentId}/refund`, {
        method: "POST",
        body: JSON.stringify(amountMinor ? { amountMinor } : {}),
    })
}

/**
 * Billing feature hooks — TanStack Query wrappers around the billing entity API.
 *
 * Query keys:
 *   ["billing", "plans"]        — public plan catalogue
 *   ["billing", "subscription"] — current account's subscription
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { tokenStorage } from "@/shared/utils/storage"
import { ApiError } from "@/shared/api/types"
import type {
    CheckoutRequest,
    CheckoutResponse,
    Subscription,
} from "@/entities/billing/model/types"
import {
    cancelSubscription,
    changePlan,
    createCheckout,
    getCustomerPortalUrl,
    getPlans,
    getSubscription,
    resumeSubscription,
} from "@/entities/billing/api/billing.api"

export const PLANS_QUERY_KEY = ["billing", "plans"]
export const SUBSCRIPTION_QUERY_KEY = ["billing", "subscription"]

/** Statuses that grant the paid features of the subscribed plan. */
const PAID_STATUSES = new Set(["active", "on_trial", "past_due"])

/**
 * True when the subscription currently grants paid access:
 * `active`/`on_trial` always, `past_due` during the dunning grace window,
 * `cancelled` until `endsAt` (the period already paid for).
 */
export function hasPaidAccess(subscription?: Subscription | null): boolean {
    if (!subscription || subscription.plan === "free") return false
    if (PAID_STATUSES.has(subscription.status)) return true
    if (subscription.status === "cancelled" && subscription.endsAt) {
        return new Date(subscription.endsAt).getTime() > Date.now()
    }
    return false
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** GET /billing/plans — public plan catalogue for the pricing page. */
export function usePlans() {
    return useQuery({
        queryKey: PLANS_QUERY_KEY,
        queryFn: getPlans,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        // Billing may simply be unconfigured (503) — surface that instead of retrying.
        retry: false,
    })
}

/** GET /billing/subscription — the current account's subscription. */
export function useSubscription() {
    const hasToken = !!tokenStorage.getAccessToken()

    return useQuery({
        queryKey: SUBSCRIPTION_QUERY_KEY,
        queryFn: getSubscription,
        enabled: hasToken,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: false,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** POST /billing/checkout — create a hosted checkout; returns the redirect URL. */
export function useCreateCheckout() {
    return useMutation({ mutationFn: createCheckout })
}

/** POST /billing/change-plan — upgrade/downgrade an active subscription. */
export function useChangePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: changePlan,
        onSuccess: (updated: Subscription) => {
            queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, updated)
        },
    })
}

/** POST /billing/cancel — cancel at the end of the current billing period. */
export function useCancelSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: cancelSubscription,
        onSuccess: (updated: Subscription) => {
            queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, updated)
        },
    })
}

/** POST /billing/resume — revert a scheduled cancellation before the period ends. */
export function useResumeSubscription() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: resumeSubscription,
        onSuccess: (updated: Subscription) => {
            queryClient.setQueryData(SUBSCRIPTION_QUERY_KEY, updated)
        },
    })
}

/** GET /billing/portal — resolve the Lemon Squeezy customer portal URL. */
export function useCustomerPortal() {
    return useMutation({ mutationFn: getCustomerPortalUrl })
}

// ---------------------------------------------------------------------------
// Orchestrated plan actions
// ---------------------------------------------------------------------------

/** Result of a plan action: a hosted checkout URL, or an updated subscription. */
export type PlanActionResult = CheckoutResponse | Subscription

function redirectToCheckout(result: PlanActionResult): PlanActionResult {
    if ("checkoutUrl" in result && result.checkoutUrl) {
        window.location.assign(result.checkoutUrl)
    }
    return result
}

/**
 * High-level plan actions for the pricing page.
 *
 * Chooses between checkout (new subscription) and change-plan (existing
 * subscription) and recovers from stale client state using the API's
 * documented conflict semantics:
 *   - checkout → 409 already subscribed → retried as change-plan
 *   - change-plan → 404 no subscription → retried as checkout
 */
export function usePlanActions() {
    const queryClient = useQueryClient()
    const checkout = useCreateCheckout()
    const change = useChangePlan()

    const refreshSubscription = () => {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY })
    }

    /** Start a brand-new subscription (falls back to change-plan on 409). */
    const startNewSubscription = useMutation({
        mutationFn: async (request: CheckoutRequest): Promise<PlanActionResult> => {
            try {
                return await checkout.mutateAsync(request)
            } catch (error) {
                if (error instanceof ApiError && error.status === 409) {
                    return change.mutateAsync(request)
                }
                throw error
            }
        },
        onSettled: refreshSubscription,
    })

    /** Switch an existing subscription to another plan/interval (falls back to checkout on 404). */
    const switchExistingSubscription = useMutation({
        mutationFn: async (request: CheckoutRequest): Promise<PlanActionResult> => {
            try {
                return await change.mutateAsync(request)
            } catch (error) {
                if (error instanceof ApiError && error.status === 404) {
                    return checkout.mutateAsync(request)
                }
                throw error
            }
        },
        onSettled: refreshSubscription,
    })

    /** Subscribe and, when a checkout URL comes back, redirect to the hosted checkout. */
    const startSubscription = async (request: CheckoutRequest): Promise<PlanActionResult> =>
        redirectToCheckout(await startNewSubscription.mutateAsync(request))

    /** Switch plan and, when a checkout URL comes back (404 fallback), redirect to it. */
    const switchPlan = async (request: CheckoutRequest): Promise<PlanActionResult> =>
        redirectToCheckout(await switchExistingSubscription.mutateAsync(request))

    return {
        startSubscription,
        switchPlan,
        isPending: startNewSubscription.isPending || switchExistingSubscription.isPending,
    }
}

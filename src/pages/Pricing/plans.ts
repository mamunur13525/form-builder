/**
 * Pricing page plan model — maps the API catalogue (GET /billing/plans) onto
 * the card layout, with a static fallback so the page still renders when the
 * billing API is unreachable or unconfigured.
 */

import type {
    BillingInterval,
    PaidPlan,
    Plan,
    PlanId,
    Subscription,
} from "@/entities/billing/model/types"
import { hasPaidAccess } from "@/features/billing/hooks/useBilling"
import { formatDate } from "@/shared/utils/formatDate"

export type BillingCycle = BillingInterval

/** Display model for one pricing card. */
export interface PricingPlan {
    id: PlanId
    name: string
    description: string
    monthly: number
    yearly: number
    features: string[]
    featured?: boolean
}

export type CtaAction = "checkout" | "change" | "resume" | "cancel"

export interface PlanCta {
    label: string
    action: CtaAction | null
    disabled: boolean
}

/** The plan highlighted as recommended (the API does not carry this flag). */
export const FEATURED_PLAN_ID: PaidPlan = "pro"

const FREE_PLAN: PricingPlan = {
    id: "free",
    name: "Free",
    description: "For trying things out and the occasional form.",
    monthly: 0,
    yearly: 0,
    features: [
        "3 forms",
        "100 responses per month",
        "Core question types",
        "Basic summary view",
    ],
}

const PRO_PLAN: PricingPlan = {
    id: "pro",
    name: "Pro",
    description: "For makers who need room to grow and a custom look.",
    monthly: 19,
    yearly: 190,
    features: [
        "Unlimited forms",
        "10,000 responses per month",
        "Custom domain",
        "Advanced analytics",
        "Remove branding",
        "File uploads",
    ],
    featured: true,
}

const TEAM_PLAN: PricingPlan = {
    id: "team",
    name: "Team",
    description: "For teams collecting and reviewing responses together.",
    monthly: 49,
    yearly: 490,
    features: [
        "Everything in Pro",
        "Unlimited responses",
        "Shared workspaces",
        "Roles and permissions",
        "Priority support",
    ],
}

const FALLBACK_PLANS: PricingPlan[] = [FREE_PLAN, PRO_PLAN, TEAM_PLAN]

/**
 * Map the API plan catalogue onto pricing cards; the Free tier is always shown
 * first even if the backend omits it. Falls back to the static catalogue when
 * the API returned nothing usable.
 */
export function toPricingPlans(apiPlans?: Plan[]): PricingPlan[] {
    if (!apiPlans?.length) return FALLBACK_PLANS

    const apiFree = apiPlans.find((plan) => plan.id === "free")
    const freeCard: PricingPlan = apiFree
        ? {
              id: "free",
              name: apiFree.name,
              description: apiFree.description,
              monthly: apiFree.prices.monthly,
              yearly: apiFree.prices.yearly,
              features: apiFree.features,
          }
        : FREE_PLAN

    const paidCards: PricingPlan[] = apiPlans
        .filter((plan): plan is Plan & { id: PaidPlan } => plan.id !== "free")
        .map((plan) => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            monthly: plan.prices.monthly,
            yearly: plan.prices.yearly,
            features: plan.features,
            featured: plan.id === FEATURED_PLAN_ID,
        }))

    return [freeCard, ...paidCards]
}

/** Statuses under which a plan still counts as "the plan you're on". */
const CURRENT_STATUSES = ["active", "on_trial", "past_due", "cancelled"]

/** Whether the account is currently on the given plan (drives the card chip). */
export function isCurrentPlan(subscription: Subscription | undefined, planId: PlanId): boolean {
    if (!subscription) return planId === "free"
    if (planId === "free") return subscription.plan === "free"
    return subscription.plan === planId && CURRENT_STATUSES.includes(subscription.status)
}

/** Decide what the card's action button should do for the current state. */
export function getCtaForPlan(
    plan: PricingPlan,
    subscription: Subscription | undefined,
    cycle: BillingCycle,
    subscriptionLoading: boolean,
): PlanCta {
    const defaultLabel = plan.id === "free" ? "Current plan" : `Choose ${plan.name}`

    // Don't flash a wrong CTA while the subscription is still loading.
    if (subscriptionLoading) {
        return { label: defaultLabel, action: null, disabled: true }
    }

    if (plan.id === "free") {
        if (!subscription || subscription.plan === "free") {
            return { label: "Current plan", action: null, disabled: true }
        }
        if (subscription.status === "cancelled" && subscription.endsAt) {
            return { label: `Ends ${formatDate(subscription.endsAt)}`, action: null, disabled: true }
        }
        // Any live paid plan leaves the Free tier via cancel-at-period-end.
        return { label: "Downgrade to Free", action: "cancel", disabled: false }
    }

    const onThisPlan =
        !!subscription &&
        subscription.plan === plan.id &&
        subscription.interval === cycle &&
        CURRENT_STATUSES.includes(subscription.status)

    if (onThisPlan && subscription) {
        if (subscription.status === "cancelled") {
            return { label: "Resume subscription", action: "resume", disabled: false }
        }
        return { label: "Current plan", action: null, disabled: true }
    }

    if (hasPaidAccess(subscription)) {
        return { label: `Switch to ${plan.name}`, action: "change", disabled: false }
    }

    return { label: `Choose ${plan.name}`, action: "checkout", disabled: false }
}

/** Human-readable plan name for toasts and the banner. */
export function planDisplayName(planId: PlanId, plans: PricingPlan[]): string {
    const known = plans.find((plan) => plan.id === planId)
    if (known) return known.name
    return planId.charAt(0).toUpperCase() + planId.slice(1)
}
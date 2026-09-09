import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import type { BillingInterval, PaidPlan } from "@/entities/billing/model/types"
import {
    hasPaidAccess,
    useCancelSubscription,
    useCustomerPortal,
    usePlanActions,
    usePlans,
    useResumeSubscription,
    useSubscription,
} from "@/features/billing/hooks/useBilling"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { formatDate } from "@/shared/utils/formatDate"
import { CancelDialog } from "./components/CancelDialog"
import { PlanCard } from "./components/PlanCard"
import { SubscriptionBanner } from "./components/SubscriptionBanner"
import {
    getCtaForPlan,
    isCurrentPlan,
    planDisplayName,
    toPricingPlans,
    type CtaAction,
    type PricingPlan,
} from "./plans"

type BillingCycle = BillingInterval

const ERROR_TITLES: Record<CtaAction, string> = {
    checkout: "Could not start the checkout",
    change: "Could not update your plan",
    resume: "Could not resume your subscription",
    cancel: "Could not cancel your subscription",
}

function createPriceFormatter(currency: string): Intl.NumberFormat {
    try {
        return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 })
    } catch {
        return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
    }
}

export function PricingPage({ embedded = false }: { embedded?: boolean }) {
    const [cycle, setCycle] = useState<BillingCycle>("monthly")
    const [pendingKey, setPendingKey] = useState<string | null>(null)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

    const plansQuery = usePlans()
    const subscriptionQuery = useSubscription()
    const { startSubscription, switchPlan } = usePlanActions()
    const cancelMutation = useCancelSubscription()
    const resumeMutation = useResumeSubscription()
    const portalMutation = useCustomerPortal()

    const plans = useMemo(() => toPricingPlans(plansQuery.data?.plans), [plansQuery.data])
    const formatPrice = useMemo(() => {
        const formatter = createPriceFormatter(plansQuery.data?.currency ?? "USD")
        return (amount: number) => formatter.format(amount)
    }, [plansQuery.data])

    const subscription = subscriptionQuery.data
    const subscriptionLoading = subscriptionQuery.isLoading
    const paid = hasPaidAccess(subscription)
    const showBanner =
        !!subscription &&
        subscription.plan !== "free" &&
        (paid || subscription.status === "cancelled")

    function handleSelect(plan: PricingPlan, action: CtaAction) {
        // The free tier has no checkout — cancelling runs through a confirm dialog.
        if (action === "cancel") {
            setCancelDialogOpen(true)
            return
        }
        setPendingKey(plan.id)
        const request = { plan: plan.id as PaidPlan, interval: cycle }
        const run =
            action === "checkout"
                ? () => startSubscription(request)
                : action === "change"
                    ? () => switchPlan(request)
                    : () => resumeMutation.mutateAsync()
        run()
            .then((result) => {
                // When checkout fell back to an in-place change (409) or a
                // switch fell back to checkout (404) no redirect happened.
                if (action !== "resume" && !("checkoutUrl" in result)) {
                    showSuccess("Plan updated", `You're now on the ${plan.name} plan (${cycle}).`)
                }
            })
            .catch((error) => showError(ERROR_TITLES[action], error))
            .finally(() => setPendingKey(null))
    }

    async function handleManageBilling() {
        setPendingKey("portal")
        try {
            const { url } = await portalMutation.mutateAsync()
            window.open(url, "_blank", "noopener,noreferrer")
        } catch (error) {
            showError("Could not open the billing portal", error)
        } finally {
            setPendingKey(null)
        }
    }

    async function handleConfirmCancel() {
        try {
            const updated = await cancelMutation.mutateAsync()
            setCancelDialogOpen(false)
            showSuccess(
                "Subscription cancelled",
                updated.endsAt
                    ? `Your plan stays active until ${formatDate(updated.endsAt)} — you keep everything you paid for.`
                    : "Your plan stays active until the end of the current billing period.",
            )
        } catch (error) {
            showError(ERROR_TITLES.cancel, error)
        }
    }

    return (
        <div
            className={cn(
                "editorial mx-auto w-full",
                embedded ? "max-w-none px-1 pb-4" : "max-w-[1600px] px-8 pt-12 pb-16",
            )}
        >
            <div className={cn("mx-auto max-w-2xl text-center", embedded && "text-left sm:text-center")}>
                <h1 className="font-display text-4xl leading-tight sm:text-5xl text-[var(--foreground)]">
                    Simple, honest pricing
                </h1>
                <p className="mt-1 text-sm leading-6 sm:text-base text-[var(--editorial-body)]">
                    Start free and upgrade when your forms outgrow it. Every plan
                    includes the full editor — no feature held hostage.
                </p>
            </div>

            {/* Billing cycle toggle */}
            <div className="mt-12 flex justify-center">
                <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--card)] p-1.5">
                    {(["monthly", "yearly"] as BillingCycle[]).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setCycle(value)}
                            className={cn(
                                "editorial-transition h-11 rounded-full px-6 text-sm capitalize",
                                cycle === value
                                    ? "bg-[var(--primary)] text-white "
                                    : "text-[var(--editorial-body)] hover:text-[var(--foreground)]",
                            )}
                        >
                            {value}
                            {value === "yearly" && (
                                <span className="ml-2 text-xs opacity-80">2 months free</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {showBanner && subscription && (
                <SubscriptionBanner
                    subscription={subscription}
                    planName={planDisplayName(subscription.plan, plans)}
                    portalPending={pendingKey === "portal"}
                    onManageBilling={handleManageBilling}
                />
            )}

            {plansQuery.isError && (
                <p className="mt-8 text-center text-sm text-[var(--editorial-subtle)]">
                    Couldn't load live pricing right now — showing our standard plans.
                </p>
            )}

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        cycle={cycle}
                        formatPrice={formatPrice}
                        cta={getCtaForPlan(plan, subscription, cycle, subscriptionLoading)}
                        pending={pendingKey === plan.id}
                        current={isCurrentPlan(subscription, plan.id)}
                        onSelect={handleSelect}
                    />
                ))}
            </div>

            <p className="mt-12 text-center text-sm text-[var(--editorial-subtle)]">
                Prices in USD. Cancel any time — your forms and responses stay yours.
            </p>

            <CancelDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                planName={subscription ? planDisplayName(subscription.plan, plans) : "paid"}
                isPending={cancelMutation.isPending}
                onConfirm={() => void handleConfirmCancel()}
            />
        </div>
    )
}
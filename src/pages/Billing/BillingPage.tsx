import { useState } from "react"
import { CreditCard, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import type { Subscription, SubscriptionStatus } from "@/entities/billing/model/types"
import {
    hasPaidAccess,
    useCancelSubscription,
    useCustomerPortal,
    usePlans,
    useResumeSubscription,
    useSubscription,
} from "@/features/billing/hooks/useBilling"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { useSettingsModalStore } from "@/shared/stores/settingsModalStore"
import { formatDate } from "@/shared/utils/formatDate"
import { CancelDialog } from "@/pages/Pricing/components/CancelDialog"
import { planDisplayName, toPricingPlans } from "@/pages/Pricing/plans"

const STATUS_BADGES: Record<
    SubscriptionStatus,
    { label: string; variant: "success" | "secondary" | "warning" | "outline" } | null
> = {
    active: { label: "Active", variant: "success" },
    on_trial: { label: "Trial", variant: "secondary" },
    past_due: { label: "Past due", variant: "warning" },
    cancelled: { label: "Cancelling", variant: "warning" },
    free: { label: "Free", variant: "outline" },
    expired: { label: "Expired", variant: "outline" },
    paused: { label: "Paused", variant: "outline" },
}

function periodText(subscription: Subscription): string {
    switch (subscription.status) {
        case "past_due":
            return "A recent payment failed — update your payment method to keep your plan."
        case "cancelled":
            return `Paid access continues until ${formatDate(subscription.endsAt)} — you keep what you paid for.`
        case "on_trial":
            return `Your trial renews on ${formatDate(subscription.renewsAt)}.`
        case "free":
            return "You are on the Free plan. Upgrade any time to unlock more forms, members and analytics."
        default:
            return `Renews on ${formatDate(subscription.renewsAt)}.`
    }
}

export function BillingPage() {
    const [pendingKey, setPendingKey] = useState<string | null>(null)
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
    const setSection = useSettingsModalStore((state) => state.setSection)

    const plansQuery = usePlans()
    const subscriptionQuery = useSubscription()
    const cancelMutation = useCancelSubscription()
    const resumeMutation = useResumeSubscription()
    const portalMutation = useCustomerPortal()

    const plans = toPricingPlans(plansQuery.data?.plans)
    const subscription = subscriptionQuery.data
    const paid = hasPaidAccess(subscription)
    const planName = subscription ? planDisplayName(subscription.plan, plans) : "Free"
    const badge = subscription ? STATUS_BADGES[subscription.status] : null
    const canManagePortal = Boolean(subscription && subscription.plan !== "free")
    const canCancel = Boolean(paid && subscription && subscription.status !== "cancelled")
    const canResume = subscription?.status === "cancelled"

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

    async function handleResume() {
        setPendingKey("resume")
        try {
            await resumeMutation.mutateAsync()
            showSuccess("Subscription resumed", "Your plan will keep renewing as before.")
        } catch (error) {
            showError("Could not resume your subscription", error)
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
            showError("Could not cancel your subscription", error)
        }
    }

    return (
        <div className="editorial mx-auto w-full max-w-none space-y-6 px-1 pb-4">
            {subscriptionQuery.isLoading ? (
                <div className="h-[280px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--secondary)]" />
            ) : (
                <Card className="editorial-shadow-sm rounded-xl border-[var(--border)] bg-[var(--card)]">
                    <CardContent className="p-5 sm:p-8">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[var(--editorial-border-light)] bg-[var(--secondary)] text-[var(--primary)]">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="font-display text-xl leading-tight text-[var(--foreground)] sm:text-2xl">
                                        {planName} plan
                                    </h2>
                                    {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                                    {subscription?.testMode && <Badge variant="outline">Test mode</Badge>}
                                </div>
                                <p className="mt-1 text-sm leading-6 text-[var(--editorial-body)] sm:text-base">
                                    {subscription
                                        ? periodText(subscription)
                                        : "Your subscription details will show up here."}
                                </p>
                            </div>
                        </div>

                        {subscription && (
                            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                                <div>
                                    <dt className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Billing interval
                                    </dt>
                                    <dd className="mt-1 text-sm capitalize text-[var(--foreground)]">
                                        {subscription.plan === "free" ? "—" : subscription.interval}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                        Last payment
                                    </dt>
                                    <dd className="mt-1 text-sm text-[var(--foreground)]">
                                        {formatDate(subscription.lastPaymentAt) || "—"}
                                    </dd>
                                </div>
                            </dl>
                        )}

                        <div className="mt-8 flex flex-wrap gap-3">
                            {canManagePortal && (
                                <Button
                                    type="button"
                                    onClick={() => void handleManageBilling()}
                                    disabled={pendingKey === "portal"}
                                    className="editorial-transition h-11 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                                >
                                    {pendingKey === "portal" ? (
                                        <Spinner className="mr-2 h-4 w-4" />
                                    ) : (
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                    )}
                                    Manage billing
                                </Button>
                            )}
                            {canResume && (
                                <Button
                                    type="button"
                                    onClick={() => void handleResume()}
                                    disabled={pendingKey === "resume"}
                                    className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)]"
                                >
                                    {pendingKey === "resume" && <Spinner className="mr-2 h-4 w-4" />}
                                    Resume subscription
                                </Button>
                            )}
                            {canCancel && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setCancelDialogOpen(true)}
                                    className="h-11 rounded-[16px] px-5 text-sm text-[var(--editorial-body)]"
                                >
                                    Cancel subscription
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={() => setSection("pricing")}
                                className="editorial-transition h-11 rounded-[16px] bg-[var(--primary)] px-5 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)]"
                            >
                                View plans
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <CancelDialog
                open={cancelDialogOpen}
                onOpenChange={setCancelDialogOpen}
                planName={planName}
                isPending={cancelMutation.isPending}
                onConfirm={() => void handleConfirmCancel()}
            />
        </div>
    )
}

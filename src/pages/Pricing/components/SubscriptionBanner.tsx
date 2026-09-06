import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { formatDate } from "@/shared/utils/formatDate"
import type { Subscription, SubscriptionStatus } from "@/entities/billing/model/types"

const STATUS_BADGES: Record<
    SubscriptionStatus,
    { label: string; variant: "success" | "secondary" | "warning" | "outline" } | null
> = {
    active: { label: "Active", variant: "success" },
    on_trial: { label: "Trial", variant: "secondary" },
    past_due: { label: "Past due", variant: "warning" },
    cancelled: { label: "Cancelling", variant: "warning" },
    free: null,
    expired: null,
    paused: null,
}

function periodText(subscription: Subscription): string {
    switch (subscription.status) {
        case "past_due":
            return "A recent payment failed — update your payment method to keep your plan."
        case "cancelled":
            return `Paid access continues until ${formatDate(subscription.endsAt)} — you keep what you paid for.`
        case "on_trial":
            return `Your trial renews on ${formatDate(subscription.renewsAt)}.`
        default:
            return `Renews on ${formatDate(subscription.renewsAt)}.`
    }
}

interface SubscriptionBannerProps {
    subscription: Subscription
    planName: string
    portalPending: boolean
    onManageBilling: () => void
}

/** Current-subscription strip shown above the plan grid. */
export function SubscriptionBanner({
    subscription,
    planName,
    portalPending,
    onManageBilling,
}: SubscriptionBannerProps) {
    const badge = STATUS_BADGES[subscription.status]

    return (
        <div className="editorial-transition mx-auto mt-10 flex max-w-4xl flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--editorial-primary-ring)] bg-[var(--card)] p-5 sm:flex-row sm:items-center">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg text-[var(--foreground)]">
                        {planName} plan
                    </p>
                    {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}
                    {subscription.testMode && <Badge variant="outline">Test mode</Badge>}
                </div>
                <p className="mt-1 text-sm text-[var(--editorial-body)]">
                    {periodText(subscription)}
                </p>
            </div>
            <Button
                type="button"
                onClick={onManageBilling}
                disabled={portalPending}
                className="editorial-transition h-11 shrink-0 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:scale-[.98]"
            >
                {portalPending ? (
                    <Spinner className="mr-2 h-4 w-4" />
                ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Manage billing
            </Button>
        </div>
    )
}

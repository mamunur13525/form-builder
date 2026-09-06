import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, CheckCircle2, Clock3, RefreshCw, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { ConfettiBurst } from "@/shared/components/ConfettiBurst"
import { ROUTES } from "@/shared/constants/routes"
import { formatDate } from "@/shared/utils/formatDate"
import {
    SUBSCRIPTION_QUERY_KEY,
    hasPaidAccess,
    useSubscription,
} from "@/features/billing/hooks/useBilling"

/** Poll for the webhook write at most ~2 minutes, then let the buyer retry manually. */
const MAX_POLLS = 30
const POLL_INTERVAL_MS = 4000

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * Post-checkout landing page — Lemon Squeezy redirects the buyer to
 * {FRONTEND_URL}/billing/success. Activation is written by the verified
 * webhook, not by this redirect, so the page polls the subscription for a
 * short while until the plan shows up.
 */
export function BillingSuccessPage() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const pollCount = useRef(0)

    const { data: subscription, isLoading, isError, refetch, isRefetching } = useSubscription()
    const paid = hasPaidAccess(subscription)
    const [polling, setPolling] = useState(true)

    useEffect(() => {
        // A cached "free" subscription must not mask the fresh webhook write.
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY })
    }, [queryClient])

    useEffect(() => {
        if (paid || isError || !polling) return
        if (pollCount.current >= MAX_POLLS) {
            setPolling(false)
            return
        }
        const timer = setInterval(() => {
            pollCount.current += 1
            void refetch()
        }, POLL_INTERVAL_MS)
        return () => clearInterval(timer)
    }, [paid, isError, polling, refetch])

    const planName = subscription ? capitalize(subscription.plan) : ""

    return (
        <div className="editorial relative flex min-h-dvh items-center justify-center overflow-hidden bg-[var(--editorial-canvas)] px-4 py-16">
            {paid && <ConfettiBurst count={140} originY="18%" />}
            <div className="editorial-shadow relative w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 text-center sm:p-12">
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Spinner className="h-8 w-8 text-[var(--primary)]" />
                        <p className="text-sm text-[var(--editorial-body)]">
                            Checking your subscription…
                        </p>
                    </div>
                ) : isError ? (
                    <>
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--editorial-primary-light)]">
                            <TriangleAlert className="h-7 w-7 text-[var(--primary)]" />
                        </span>
                        <h1 className="mt-6 font-display text-3xl text-[var(--foreground)]">
                            We couldn't verify your payment
                        </h1>
                        <p className="mt-3 text-base leading-6 text-[var(--editorial-body)]">
                            Your payment may still have gone through. Please try again in
                            a moment — if the plan still doesn't appear, contact support.
                        </p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                                onClick={() => void refetch()}
                                disabled={isRefetching}
                                className="editorial-transition h-12 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                            >
                                {isRefetching ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Try again
                            </Button>
                            <Button
                                onClick={() => navigate(ROUTES.PRICING)}
                                className="editorial-transition h-12 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-6 text-sm font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                            >
                                Back to pricing
                            </Button>
                        </div>
                    </>
                ) : paid && subscription ? (
                    <>
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--editorial-success)]/15">
                            <CheckCircle2 className="h-7 w-7 text-[var(--editorial-success)]" />
                        </span>
                        <p className="editorial-eyebrow mt-6 text-[var(--primary)]">
                            Payment received
                        </p>
                        <h1 className="mt-2 font-display text-3xl leading-tight text-[var(--foreground)] sm:text-4xl">
                            Welcome to {planName}!
                        </h1>
                        <p className="mt-3 text-base leading-6 text-[var(--editorial-body)]">
                            Your {subscription.interval} subscription is active
                            {subscription.renewsAt
                                ? ` and renews on ${formatDate(subscription.renewsAt)}`
                                : ""}
                            . Every {planName} feature is unlocked across your account.
                        </p>
                        {subscription.testMode && (
                            <div className="mt-4 flex justify-center">
                                <Badge variant="warning">
                                    Test mode — no real charge was made
                                </Badge>
                            </div>
                        )}
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                                onClick={() => navigate(ROUTES.DASHBOARD)}
                                className="editorial-transition h-12 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                            >
                                Go to dashboard
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button
                                onClick={() => navigate(ROUTES.PRICING)}
                                className="editorial-transition h-12 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-6 text-sm font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                            >
                                View plans
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--editorial-primary-light)]">
                            <Clock3 className="h-7 w-7 text-[var(--primary)]" />
                        </span>
                        <h1 className="mt-6 font-display text-3xl text-[var(--foreground)]">
                            Activating your subscription…
                        </h1>
                        <p className="mt-3 text-base leading-6 text-[var(--editorial-body)]">
                            Thanks for your purchase! Your plan is being activated — this
                            usually takes a few seconds, and this page updates
                            automatically.
                        </p>
                        {subscription && subscription.status !== "free" && (
                            <p className="mt-2 text-sm text-[var(--editorial-subtle)]">
                                Current status: {capitalize(subscription.status)}
                            </p>
                        )}
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button
                                onClick={() => void refetch()}
                                disabled={isRefetching}
                                className="editorial-transition h-12 rounded-[16px] bg-[var(--primary)] px-6 text-sm font-medium text-white hover:bg-[var(--editorial-primary-hover)] active:scale-[.98]"
                            >
                                {isRefetching ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )}
                                Refresh status
                            </Button>
                            <Button
                                onClick={() => navigate(ROUTES.PRICING)}
                                className="editorial-transition h-12 rounded-[16px] border border-[var(--border)] bg-[var(--secondary)] px-6 text-sm font-medium text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]"
                            >
                                Back to pricing
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
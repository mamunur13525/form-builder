import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { BillingInterval } from "@/entities/billing/model/types"
import type { CtaAction, PlanCta, PricingPlan } from "../plans"

interface PlanCardProps {
    plan: PricingPlan
    cycle: BillingInterval
    formatPrice: (amount: number) => string
    cta: PlanCta
    /** A request started from this card is in flight. */
    pending: boolean
    /** The account is currently on this plan. */
    current: boolean
    onSelect: (plan: PricingPlan, action: CtaAction) => void
}

export function PlanCard({
    plan,
    cycle,
    formatPrice,
    cta,
    pending,
    current,
    onSelect,
}: PlanCardProps) {
    const price = cycle === "monthly" ? plan.monthly : plan.yearly

    return (
        <Card
            className={cn(
                "editorial-transition flex flex-col rounded-xl p-8",
                plan.featured
                    ? "editorial-shadow border-[var(--editorial-primary-ring)] bg-[var(--card)]"
                    : "editorial-shadow-sm border-[var(--border)] bg-[var(--card)]",
            )}
        >
            <CardContent className="flex flex-1 flex-col p-0">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl text-[var(--foreground)]">
                        {plan.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        {current && (
                            <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--secondary)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--editorial-body)]">
                                Current
                            </span>
                        )}
                        {plan.featured && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">
                                <Sparkles className="h-3.5 w-3.5" />
                                Popular
                            </span>
                        )}
                    </div>
                </div>

                <p className="mt-2 text-base leading-6 text-[var(--editorial-body)]">
                    {plan.description}
                </p>

                <div className="mt-8 flex items-baseline gap-2">
                    <span className="font-display text-[48px] leading-none text-[var(--foreground)]">
                        {formatPrice(price)}
                    </span>
                    <span className="text-sm text-[var(--editorial-subtle)]">
                        {price === 0
                            ? "forever"
                            : cycle === "monthly"
                                ? "per month"
                                : "per year"}
                    </span>
                </div>

                <ul className="mt-8 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3">
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-[var(--editorial-success)]" />
                            <span className="text-base leading-6 text-[var(--editorial-body)]">
                                {feature}
                            </span>
                        </li>
                    ))}
                </ul>

                <Button
                    disabled={cta.disabled || pending}
                    onClick={() => {
                        if (cta.action) onSelect(plan, cta.action)
                    }}
                    className={cn(
                        "editorial-transition mt-8 h-[52px] w-full rounded-[16px] text-sm font-medium active:scale-[.98]",
                        plan.featured
                            ? "bg-[var(--primary)] text-white   hover:bg-[var(--editorial-primary-hover)] active:bg-[var(--editorial-primary-pressed)]"
                            : "border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)]  hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]",
                    )}
                >
                    {pending && <Spinner className="mr-2 h-4 w-4" />}
                    {cta.label}
                </Button>
            </CardContent>
        </Card>
    )
}

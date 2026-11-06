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
                "editorial-transition flex flex-col rounded-2xl p-8 transition-all",
                plan.featured
                    ? "border-[#FF5722] ring-2 ring-[#FF5722]/20 bg-white dark:bg-[#181820] shadow-md dark:shadow-[0_8px_30px_rgba(255,87,34,0.12)]"
                    : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] hover:border-slate-300 dark:hover:border-zinc-700",
            )}
        >
            <CardContent className="flex flex-1 flex-col p-0">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-2xl text-[var(--foreground)]">
                        {plan.name}
                    </h2>
                    <div className="flex items-center gap-2">
                        {current && (
                            <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-700 dark:text-zinc-300">
                                Current
                            </span>
                        )}
                        {plan.featured && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FF5722]/40 bg-[#FF5722]/15 px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#FF5722]">
                                <Sparkles className="h-3.5 w-3.5" />
                                Popular
                            </span>
                        )}
                    </div>
                </div>

                <p className="mt-2 text-base leading-6 text-slate-600 dark:text-zinc-400">
                    {plan.description}
                </p>

                <div className="mt-8 flex items-baseline gap-2">
                    <span className="font-display text-[48px] leading-none text-slate-900 dark:text-white">
                        {formatPrice(price)}
                    </span>
                    <span className="text-sm text-slate-500 dark:text-zinc-400">
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
                            <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#FF5722]" />
                            <span className="text-base leading-6 text-slate-700 dark:text-zinc-300">
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
                            ? "bg-[#FF5722] hover:bg-[#F4511E] text-white shadow-md shadow-[#FF5722]/20"
                            : "border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 hover:border-[#FF5722]/40 hover:bg-slate-200 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white",
                    )}
                >
                    {pending && <Spinner className="mr-2 h-4 w-4" />}
                    {cta.label}
                </Button>
            </CardContent>
        </Card>
    )
}

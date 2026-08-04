import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type BillingCycle = "monthly" | "yearly"

interface Plan {
    id: string
    name: string
    description: string
    monthly: number
    yearly: number
    features: string[]
    /** Highlights the plan as the recommended choice. */
    featured?: boolean
}

const PLANS: Plan[] = [
    {
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
    },
    {
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
    },
    {
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
    },
]

export function PricingPage() {
    const [cycle, setCycle] = useState<BillingCycle>("monthly")

    return (
        <div className="editorial mx-auto w-full max-w-[1600px] px-8 pt-12 pb-16">
            <div className="mx-auto max-w-2xl text-center">

        </div>
        <div className="min-w-0 mx-auto text-center flex-1">
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
                                    ? "bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(238,125,105,.25)]"
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

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
                {PLANS.map((plan) => {
                    const price = cycle === "monthly" ? plan.monthly : plan.yearly
                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "editorial-transition flex flex-col rounded-[24px] p-8",
                                plan.featured
                                    ? "editorial-shadow border-[var(--editorial-primary-ring)] bg-[var(--card)]"
                                    : "editorial-shadow-sm border-[var(--border)] bg-[var(--card)] hover:-translate-y-0.5",
                            )}
                        >
                            <CardContent className="flex flex-1 flex-col p-0">
                                <div className="flex items-center justify-between gap-3">
                                    <h2 className="font-display text-2xl text-[var(--foreground)]">
                                        {plan.name}
                                    </h2>
                                    {plan.featured && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--editorial-primary-ring)] bg-[var(--editorial-primary-light)] px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">
                                            <Sparkles className="h-3.5 w-3.5" />
                                            Popular
                                        </span>
                                    )}
                                </div>

                                <p className="mt-2 text-base leading-6 text-[var(--editorial-body)]">
                                    {plan.description}
                                </p>

                                <div className="mt-8 flex items-baseline gap-2">
                                    <span className="font-display text-[48px] leading-none text-[var(--foreground)]">
                                        ${price}
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
                                    className={cn(
                                        "editorial-transition mt-8 h-[52px] w-full rounded-[16px] text-sm font-medium active:scale-[.98]",
                                        plan.featured
                                            ? "bg-[var(--primary)] text-white shadow-[0_8px_24px_rgba(238,125,105,.25)] hover:-translate-y-0.5 hover:bg-[var(--editorial-primary-hover)] active:bg-[var(--editorial-primary-pressed)]"
                                            : "border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)]",
                                    )}
                                >
                                    {plan.monthly === 0 ? "Current plan" : `Choose ${plan.name}`}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <p className="mt-12 text-center text-sm text-[var(--editorial-subtle)]">
                Prices in USD. Cancel any time — your forms and responses stay yours.
            </p>
        </div>
    )
}

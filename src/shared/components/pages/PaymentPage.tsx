import { Check, CreditCard, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PaymentSettings } from "@/shared/types/common"
import { formatPaymentAmount } from "@/shared/constants/payment"
import { isPaymentAnswer, type PaymentAnswer } from "@/shared/utils/payment"

interface PaymentPageProps {
    settings: PaymentSettings
    value?: unknown
    onPay?: () => void
    disabled?: boolean
    color?: string
}

/**
 * Fixed-price payment page. Hosted Stripe Checkout does the card entry, so the
 * form only shows the price and a pay button that hands off to Stripe.
 */
export function PaymentPage({ settings, value, onPay, disabled, color }: PaymentPageProps) {
    const paid = isPaymentAnswer(value)
    const configured = Boolean(settings.stripeAccountId) && settings.amount > 0
    const amountLabel =
        settings.amount > 0
            ? formatPaymentAmount(settings.amount, settings.currency || "usd")
            : "No amount set"

    return (
        <div
            className={cn(
                "w-full rounded-lg border p-4 space-y-4",
                paid
                    ? "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
                    : "border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40",
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                        paid
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300",
                    )}
                    style={!paid && color ? { color } : undefined}
                >
                    {paid ? <Check className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                    <p
                        className={cn(
                            "text-base font-semibold",
                            paid ? "text-emerald-700 dark:text-emerald-300" : undefined,
                        )}
                    >
                        {paid ? "Payment complete" : amountLabel}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-zinc-400">
                        {paid
                            ? "Thank you — your payment went through."
                            : configured
                                ? "Secure payment powered by Stripe."
                                : "This payment hasn't been set up yet."}
                    </p>
                </div>
            </div>

            {!paid && (
                <button
                    type="button"
                    onClick={onPay}
                    disabled={disabled || !configured}
                    className={cn(
                        "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-colors",
                        "bg-[#635bff] hover:bg-[#544dd6] disabled:cursor-not-allowed disabled:opacity-50",
                    )}
                >
                    <Lock className="h-4 w-4" />
                    {configured ? `Pay ${amountLabel}` : "Payment unavailable"}
                </button>
            )}

            {paid && (
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    {formatPaymentAmount(
                        (value as PaymentAnswer).amount,
                        (value as PaymentAnswer).currency,
                    )}{" "}
                    paid
                </p>
            )}
        </div>
    )
}

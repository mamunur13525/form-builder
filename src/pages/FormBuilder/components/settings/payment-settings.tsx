import { useCallback, useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { AlertTriangle, Check, ChevronRight, ExternalLink, Lock, Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { showError } from "@/shared/hooks/useToast"
import type { PaymentSettings } from "@/shared/types/common"
import {
    PAYMENT_CURRENCIES,
    formatPaymentAmount,
} from "@/shared/constants/payment"
import {
    getAccountDashboardUrl,
    getAccountOnboardingUrl,
    getStripeAccounts,
    getStripeConnectUrl,
    refreshStripeAccounts,
    type StripeAccount,
} from "@/entities/payment/api/payment.api"
import { CONTROL_CLASS, OVERLAY_CLASS, ToggleRow } from "./primitives"
import type { MeetingSourceField } from "./meeting-settings"
import { cn } from "@/lib/utils"

const LABEL_CLASS = "text-xs font-medium text-slate-700 dark:text-slate-300"
const HINT_CLASS = "text-xs leading-4 text-slate-500 dark:text-zinc-400"

interface PaymentSettingsWidgetProps {
    settings: PaymentSettings
    onChange: (next: PaymentSettings) => void
    /** Questions before this page — email ones can receive the receipt. */
    earlierFields: MeetingSourceField[]
}

/**
 * Fixed-price Stripe payment settings. Stripe accounts are connected per
 * workspace, so this widget lists the accounts already authorised by the team
 * and sends the owner to Stripe to add another.
 */
export function PaymentSettingsWidget({
    settings,
    onChange,
    earlierFields,
}: PaymentSettingsWidgetProps) {
    const { formId } = useParams<{ formId: string }>()

    const [accounts, setAccounts] = useState<StripeAccount[] | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isOpeningStripe, setIsOpeningStripe] = useState(false)
    const [connectOpen, setConnectOpen] = useState(false)
    const [amountInput, setAmountInput] = useState(() =>
        settings.amount > 0 ? (settings.amount / 100).toFixed(2) : "",
    )

    // `null` means "still loading" — the first fetch resolves it.
    const isLoading = accounts === null

    const loadAccounts = useCallback(async () => {
        if (!formId) return
        try {
            const list = await getStripeAccounts(formId)
            setAccounts(list)
        } catch (err) {
            console.error("Failed to load Stripe accounts:", err)
            setAccounts([])
        }
    }, [formId])

    /** Pull fresh capability flags from Stripe after onboarding changes. */
    const refreshAccounts = useCallback(async () => {
        if (!formId) return
        setIsRefreshing(true)
        try {
            const list = await refreshStripeAccounts(formId)
            setAccounts(list)
        } catch (err) {
            console.error("Failed to refresh Stripe accounts:", err)
            showError("Couldn't refresh the Stripe account status.")
        } finally {
            setIsRefreshing(false)
        }
    }, [formId])

    useEffect(() => {
        // Deferred a tick so the initial fetch doesn't set state while the
        // effect body is running (React Compiler's cascade guard).
        const timer = setTimeout(() => void loadAccounts(), 0)
        return () => clearTimeout(timer)
    }, [loadAccounts])

    // The callback lands on /form-builder/:formId?stripe=connected.
    useEffect(() => {
        if (typeof window === "undefined") return
        const params = new URLSearchParams(window.location.search)
        const stripeParam = params.get("stripe")
        if (stripeParam !== "connected" && stripeParam !== "refresh") return
        params.delete("stripe")
        const qs = params.toString()
        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`,
        )
        // Deferred a tick so the refresh's setState never runs while the
        // effect body is executing (cascading-render guard).
        const timer = setTimeout(() => void refreshAccounts(), 0)
        return () => clearTimeout(timer)
    }, [refreshAccounts])

    const startConnect = async () => {
        if (!formId) return
        setIsConnecting(true)
        try {
            const { url } = await getStripeConnectUrl(formId)
            // Same tab: the Stripe callback brings the owner back to the builder.
            window.location.assign(url)
        } catch (err) {
            console.error("Failed to start Stripe connect:", err)
            showError("Couldn't connect to Stripe. Please try again.")
            setIsConnecting(false)
        }
    }

    const openStripeAccount = async (
        kind: "onboarding" | "dashboard",
        accountId: string,
    ) => {
        if (!formId) return
        setIsOpeningStripe(true)
        try {
            const { url } =
                kind === "onboarding"
                    ? await getAccountOnboardingUrl(formId, accountId)
                    : await getAccountDashboardUrl(formId, accountId)
            if (kind === "onboarding") {
                window.location.assign(url)
            } else {
                window.open(url, "_blank", "noopener,noreferrer")
                setIsOpeningStripe(false)
            }
        } catch (err) {
            console.error("Failed to open Stripe account:", err)
            showError(
                kind === "onboarding"
                    ? "Couldn't open Stripe verification. Please try again."
                    : "Couldn't open the Stripe dashboard. Please try again.",
            )
            setIsOpeningStripe(false)
        }
    }

    const emailFields = earlierFields.filter((field) => field.type === "email")
    const hasAccounts = (accounts?.length ?? 0) > 0

    // Keep a previously saved account selectable even if the list is still
    // loading or the account was since disconnected.
    const accountItems = (accounts ?? []).map((account) => ({
        value: account.accountId,
        label: account.name,
    }))
    if (
        settings.stripeAccountId &&
        !accountItems.some((item) => item.value === settings.stripeAccountId)
    ) {
        accountItems.unshift({
            value: settings.stripeAccountId,
            label: `Stripe account ••••${settings.stripeAccountId.slice(-4)}`,
        })
    }
    const currencyLabel =
        PAYMENT_CURRENCIES.find((c) => c.code === settings.currency)?.label ??
        settings.currency.toUpperCase()

    const selectedAccount = (accounts ?? []).find(
        (account) => account.accountId === settings.stripeAccountId,
    )
    const needsOnboarding =
        selectedAccount?.status === "incomplete" ||
        selectedAccount?.status === "restricted"

    const commitAmount = (raw: string) => {
        setAmountInput(raw)
        const parsed = Number.parseFloat(raw)
        const amount =
            Number.isFinite(parsed) && parsed > 0
                ? Math.min(Math.round(parsed * 100), 99_999_999)
                : 0
        onChange({ ...settings, amount })
    }

    return (
        <div className="space-y-3">
            {/* No accounts yet */}
            {!isLoading && accounts !== null && !hasAccounts && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <div className="min-w-0 space-y-2">
                        <p>
                            No payment accounts added. Please connect your Stripe
                            account.
                        </p>
                        <Button
                            type="button"
                            size="sm"
                            onClick={() => setConnectOpen(true)}
                            className="h-8 rounded-lg bg-[#635bff] px-3 text-xs font-medium text-white hover:bg-[#544dd6]"
                        >
                            Connect Stripe
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Stripe account */}
            <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Stripe Account</Label>
                <div className="flex items-center gap-2">
                    <Select
                        items={accountItems}
                        value={settings.stripeAccountId || null}
                        onValueChange={(value) =>
                            onChange({ ...settings, stripeAccountId: value ?? "" })
                        }
                    >
                        <SelectTrigger className={cn(CONTROL_CLASS, "min-w-0 flex-1 px-3")}>
                            <SelectValue
                                placeholder={
                                    isLoading
                                        ? "Loading accounts..."
                                        : hasAccounts
                                          ? "Select an account"
                                          : "No accounts connected"
                                }
                            />
                        </SelectTrigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {(accounts ?? []).map((account) => (
                                <SelectItem
                                    key={account.accountId}
                                    value={account.accountId}
                                >
                                    <span className="flex items-center gap-2">
                                        <Check className="h-3.5 w-3.5 text-[#635bff]" />
                                        {account.name}
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Connect another Stripe account"
                        onClick={() => setConnectOpen(true)}
                        className="h-10 w-10 shrink-0 rounded-lg border-slate-200 dark:border-zinc-800"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {isLoading && (
                    <p className={cn(HINT_CLASS, "flex items-center gap-1.5")}>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        Loading your Stripe accounts...
                    </p>
                )}
                {selectedAccount && (
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                            <p
                                className={cn(
                                    HINT_CLASS,
                                    selectedAccount.chargesEnabled
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : needsOnboarding
                                          ? "text-amber-600 dark:text-amber-400"
                                          : undefined,
                                )}
                            >
                                {selectedAccount.chargesEnabled
                                    ? "Ready to accept payments."
                                    : needsOnboarding
                                      ? "Stripe still needs more details before this account can charge."
                                      : "Account status not checked yet."}
                            </p>
                            <button
                                type="button"
                                onClick={() => void refreshAccounts()}
                                disabled={isRefreshing}
                                className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#635bff] hover:underline disabled:opacity-60"
                            >
                                <RefreshCw
                                    className={cn("h-3 w-3", isRefreshing && "animate-spin")}
                                />
                                {isRefreshing ? "Checking..." : "Refresh status"}
                            </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {needsOnboarding && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        void openStripeAccount(
                                            "onboarding",
                                            selectedAccount.accountId,
                                        )
                                    }
                                    disabled={isOpeningStripe}
                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#635bff] hover:underline disabled:opacity-60"
                                >
                                    Continue verification
                                    <ChevronRight className="h-3 w-3" />
                                </button>
                            )}
                            {selectedAccount.chargesEnabled && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        void openStripeAccount(
                                            "dashboard",
                                            selectedAccount.accountId,
                                        )
                                    }
                                    disabled={isOpeningStripe}
                                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--editorial-body)] hover:underline disabled:opacity-60"
                                >
                                    Open Stripe dashboard
                                    <ExternalLink className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Currency */}
            <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Currency</Label>
                <Select
                    items={PAYMENT_CURRENCIES.map((currency) => ({
                        value: currency.code,
                        label: currency.label,
                    }))}
                    value={settings.currency}
                    onValueChange={(value) =>
                        onChange({
                            ...settings,
                            currency: value ?? settings.currency,
                        })
                    }
                >
                    <SelectTrigger className={cn(CONTROL_CLASS, "w-full px-3")}>
                        <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {PAYMENT_CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                                {currency.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className={LABEL_CLASS}>
                    Amount
                </Label>
                <Input
                    id="payment-amount"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amountInput}
                    onChange={(event) => commitAmount(event.target.value)}
                    onBlur={() =>
                        setAmountInput(
                            settings.amount > 0
                                ? (settings.amount / 100).toFixed(2)
                                : "",
                        )
                    }
                    className={CONTROL_CLASS}
                />
                <p className={HINT_CLASS}>
                    {settings.amount > 0
                        ? `Respondents will pay ${formatPaymentAmount(
                              settings.amount,
                              settings.currency,
                          )}.`
                        : "Enter a fixed price in " + currencyLabel.split(" — ")[0] + "."}
                </p>
            </div>

            {/* Installments */}
            <ToggleRow
                id="allow-installments"
                label="Allow installment payments"
                description="Respondents can pay later with Klarna or Afterpay where available."
                checked={settings.allowInstallments}
                onCheckedChange={(allowInstallments) =>
                    onChange({ ...settings, allowInstallments })
                }
            />

            {/* Receipt */}
            <div className="space-y-1.5">
                <Label className={LABEL_CLASS}>Send receipt email?</Label>
                <Select
                    items={[
                        { value: "none", label: "Don't send a receipt" },
                        ...emailFields.map((field) => ({
                            value: field.key,
                            label: field.label,
                        })),
                    ]}
                    value={settings.receiptEmailKey || "none"}
                    onValueChange={(value) =>
                        onChange({
                            ...settings,
                            receiptEmailKey: value === "none" ? "" : (value ?? ""),
                        })
                    }
                >
                    <SelectTrigger className={cn(CONTROL_CLASS, "w-full px-3")}>
                        <SelectValue placeholder="Don't send a receipt" />
                    </SelectTrigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        <SelectItem value="none">Don't send a receipt</SelectItem>
                        {emailFields.map((field) => (
                            <SelectItem key={field.key} value={field.key}>
                                {field.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className={HINT_CLASS}>
                    {emailFields.length === 0
                        ? "Add an email question before this page to email receipts."
                        : "The receipt goes to the answer of the selected email question."}
                </p>
            </div>

            {/* Connect modal */}
            <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
                <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl dark:border-zinc-800 dark:bg-[#141418] dark:text-zinc-100">
                    <div className="space-y-4 p-6">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
                                Let&apos;s connect your Stripe account
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-5 text-slate-500 dark:text-zinc-400">
                                You&apos;ll be sent to Stripe to authorise payments
                                for this workspace, then brought right back here.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
                            <span className="flex items-start gap-2">
                                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#635bff]" />
                                Payments go straight to your Stripe account. This
                                app never sees card details.
                            </span>
                        </div>

                        <div className="flex items-center justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setConnectOpen(false)}
                                className="h-10 rounded-lg px-3 text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => void startConnect()}
                                disabled={isConnecting}
                                className="h-10 rounded-lg bg-[#635bff] px-4 text-sm font-medium text-white hover:bg-[#544dd6]"
                            >
                                {isConnecting ? "Opening Stripe..." : "Connect Stripe"}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

import { useMemo, useState, type ReactNode } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, ExternalLink, Eye, RefreshCw, RotateCcw } from "lucide-react"
import { PageLayout } from "@/shared/components/PageLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPaymentAmount } from "@/shared/constants/payment"
import { showError, showSuccess } from "@/shared/hooks/useToast"
import { useForms } from "@/features/forms/hooks/useForms"
import { cn } from "@/lib/utils"
import {
    getPaymentsOverview,
    listPayments,
    refundPayment,
    type PaymentRecord,
    type PaymentStatus,
} from "@/entities/payment/api/payment.api"

const PAGE_SIZE = 20

const STATUS_FILTERS: { value: PaymentStatus | "all"; label: string }[] = [
    { value: "all", label: "All payments" },
    { value: "paid", label: "Paid" },
    { value: "partially_refunded", label: "Partially refunded" },
    { value: "refunded", label: "Refunded" },
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "failed", label: "Failed" },
    { value: "canceled", label: "Canceled" },
    { value: "disputed", label: "Disputed" },
]

const STATUS_STYLE: Record<PaymentStatus, string> = {
    paid: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    partially_refunded: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    refunded: "border-transparent bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    pending: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    processing: "border-transparent bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
    failed: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
    canceled: "border-transparent bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300",
    disputed: "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
}

const statusLabel = (status: PaymentStatus) =>
    STATUS_FILTERS.find((item) => item.value === status)?.label ?? status

const formatDate = (value: string | null) => {
    if (!value) return "—"
    try {
        return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(new Date(value))
    } catch {
        return value
    }
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-1.5">
            <dt className="text-xs text-[var(--editorial-subtle)]">{label}</dt>
            <dd className="max-w-[60%] truncate text-right text-sm text-[var(--foreground)]">
                {children}
            </dd>
        </div>
    )
}

/** Owner-facing ledger: every Checkout attempt, with refunds and totals. */
export function PaymentsPage() {
    const queryClient = useQueryClient()
    const [status, setStatus] = useState<PaymentStatus | "all">("all")
    const [currency, setCurrency] = useState<string>("all")
    const [formFilter, setFormFilter] = useState<string>("all")
    const [fromDate, setFromDate] = useState("")
    const [toDate, setToDate] = useState("")
    const [page, setPage] = useState(1)
    const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null)
    const [refundInput, setRefundInput] = useState("")
    const [detailsTarget, setDetailsTarget] = useState<PaymentRecord | null>(null)

    const { data: forms = [] } = useForms()

    const overviewQuery = useQuery({
        queryKey: ["payments", "overview"],
        queryFn: getPaymentsOverview,
    })

    const listQuery = useQuery({
        queryKey: [
            "payments",
            "list",
            status,
            currency,
            formFilter,
            fromDate,
            toDate,
            page,
        ],
        queryFn: () =>
            listPayments({
                status: status === "all" ? undefined : status,
                currency: currency === "all" ? undefined : currency,
                formId: formFilter === "all" ? undefined : formFilter,
                from: fromDate || undefined,
                to: toDate || undefined,
                page,
                limit: PAGE_SIZE,
            }),
    })

    const currencies = useMemo(
        () => (overviewQuery.data?.currencies ?? []).map((entry) => entry.currency),
        [overviewQuery.data],
    )

    const refundMutation = useMutation({
        mutationFn: ({ id, amount }: { id: string; amount?: number }) =>
            refundPayment(id, amount),
        onSuccess: (payment) => {
            showSuccess(
                "Refund sent to Stripe",
                payment.status === "refunded"
                    ? "The payment has been fully refunded."
                    : "The partial refund was accepted by Stripe.",
            )
            setRefundTarget(null)
            setRefundInput("")
            void queryClient.invalidateQueries({ queryKey: ["payments"] })
        },
        onError: (error) =>
            showError("Couldn't refund this payment", error as Error),
    })

    const openRefund = (payment: PaymentRecord) => {
        setRefundTarget(payment)
        setRefundInput((payment.refundableMinor / 100).toFixed(2))
    }

    const submitRefund = () => {
        if (!refundTarget) return
        const parsed = Number.parseFloat(refundInput)
        const amountMinor = Number.isFinite(parsed)
            ? Math.round(parsed * 100)
            : undefined
        refundMutation.mutate({ id: refundTarget.id, amount: amountMinor })
    }

    const items = listQuery.data?.items ?? []
    const total = listQuery.data?.total ?? 0
    const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE))

    return (
        <PageLayout
            title="Payments"
            description="Money collected by your published forms, straight to your Stripe account."
            actions={
                <Button
                    variant="outline"
                    onClick={() => {
                        void queryClient.invalidateQueries({ queryKey: ["payments"] })
                    }}
                    disabled={listQuery.isFetching || overviewQuery.isFetching}
                >
                    <RefreshCw
                        className={cn(
                            "h-4 w-4",
                            (listQuery.isFetching || overviewQuery.isFetching) &&
                                "animate-spin",
                        )}
                    />
                    Refresh
                </Button>
            }
        >
            {/* Per-currency totals */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {overviewQuery.isLoading &&
                    [0, 1, 2].map((index) => (
                        <Card key={index} className="border-[var(--border)] bg-[var(--card)]">
                            <CardContent className="space-y-3 p-5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-9 w-32" />
                                <Skeleton className="h-4 w-40" />
                            </CardContent>
                        </Card>
                    ))}

                {!overviewQuery.isLoading &&
                    (overviewQuery.data?.currencies.length ?? 0) === 0 && (
                        <Card className="border-[var(--border)] bg-[var(--card)] sm:col-span-2 xl:col-span-3">
                            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--secondary)]">
                                    <CreditCard className="h-6 w-6 text-[var(--editorial-subtle)]" />
                                </span>
                                <div>
                                    <p className="font-display text-xl text-[var(--foreground)]">
                                        No payments yet
                                    </p>
                                    <p className="mt-1 text-sm text-[var(--editorial-body)]">
                                        Add a payment page to a form and publish it to start
                                        collecting money.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                {(overviewQuery.data?.currencies ?? []).map((entry) => {
                    const net = entry.grossAmount - entry.refundedAmount
                    return (
                        <Card
                            key={entry.currency}
                            className="editorial-shadow-sm border-[var(--border)] bg-[var(--card)]"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5">
                                <CardTitle className="editorial-eyebrow text-[var(--editorial-subtle)]">
                                    Collected · {entry.currency.toUpperCase()}
                                </CardTitle>
                                <CreditCard className="h-4 w-4 text-[var(--editorial-subtle)]" />
                            </CardHeader>
                            <CardContent className="p-5 pt-0">
                                <div className="font-display text-[32px] leading-none text-[var(--foreground)]">
                                    {formatPaymentAmount(net, entry.currency)}
                                </div>
                                <p className="mt-2 text-[13px] text-[var(--editorial-body)]">
                                    {entry.paidCount} paid
                                    {entry.refundedAmount > 0 &&
                                        ` · ${formatPaymentAmount(entry.refundedAmount, entry.currency)} refunded`}
                                    {entry.pendingCount > 0 &&
                                        ` · ${entry.pendingCount} pending`}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Filters + ledger */}
            <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h2 className="font-display text-2xl text-[var(--foreground)]">
                        Transactions
                    </h2>
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
                        <Select
                            items={STATUS_FILTERS}
                            value={status}
                            onValueChange={(value) => {
                                setStatus((value ?? "all") as PaymentStatus | "all")
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-lg border-[var(--border)] bg-[var(--card)] px-3 text-sm sm:w-48">
                                <SelectValue placeholder="All payments" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_FILTERS.map((item) => (
                                    <SelectItem key={item.value} value={item.value}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            items={[
                                { value: "all", label: "All currencies" },
                                ...currencies.map((code) => ({
                                    value: code,
                                    label: code.toUpperCase(),
                                })),
                            ]}
                            value={currency}
                            onValueChange={(value) => {
                                setCurrency(value ?? "all")
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-lg border-[var(--border)] bg-[var(--card)] px-3 text-sm sm:w-40">
                                <SelectValue placeholder="All currencies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All currencies</SelectItem>
                                {currencies.map((code) => (
                                    <SelectItem key={code} value={code}>
                                        {code.toUpperCase()}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            items={[
                                { value: "all", label: "All forms" },
                                ...forms.map((form) => ({
                                    value: form.id,
                                    label: form.title,
                                })),
                            ]}
                            value={formFilter}
                            onValueChange={(value) => {
                                setFormFilter(value ?? "all")
                                setPage(1)
                            }}
                        >
                            <SelectTrigger className="h-10 w-full rounded-lg border-[var(--border)] bg-[var(--card)] px-3 text-sm sm:w-48">
                                <SelectValue placeholder="All forms" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All forms</SelectItem>
                                {forms.map((form) => (
                                    <SelectItem key={form.id} value={form.id}>
                                        {form.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input
                            type="date"
                            aria-label="Payments from"
                            value={fromDate}
                            onChange={(event) => {
                                setFromDate(event.target.value)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-lg border-[var(--border)] bg-[var(--card)] px-3 text-sm sm:w-40"
                        />
                        <Input
                            type="date"
                            aria-label="Payments to"
                            value={toDate}
                            onChange={(event) => {
                                setToDate(event.target.value)
                                setPage(1)
                            }}
                            className="h-10 w-full rounded-lg border-[var(--border)] bg-[var(--card)] px-3 text-sm sm:w-40"
                        />
                    </div>
                </div>

                <Card className="overflow-hidden border-[var(--border)] bg-[var(--card)]">
                    {listQuery.isLoading ? (
                        <div className="space-y-3 p-5">
                            {[0, 1, 2, 3].map((index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    ) : listQuery.isError ? (
                        <div className="p-8 text-center text-sm text-[var(--editorial-body)]">
                            Couldn't load payments.{" "}
                            <button
                                type="button"
                                className="text-[var(--primary)] underline"
                                onClick={() => void listQuery.refetch()}
                            >
                                Try again
                            </button>
                        </div>
                    ) : items.length === 0 ? (
                        <div className="p-10 text-center text-sm text-[var(--editorial-body)]">
                            No transactions match these filters.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="border-[var(--border)]">
                                    <TableHead>Date</TableHead>
                                    <TableHead>Form</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((payment) => (
                                    <TableRow
                                        key={payment.id}
                                        className="border-[var(--border)]"
                                    >
                                        <TableCell className="whitespace-nowrap text-[var(--editorial-body)]">
                                            {formatDate(payment.paidAt ?? payment.createdAt)}
                                        </TableCell>
                                        <TableCell className="max-w-[16rem]">
                                            <a
                                                href={`/form-response/${payment.formId}/submissions`}
                                                className="inline-flex items-center gap-1 truncate font-medium text-[var(--foreground)] hover:underline"
                                            >
                                                {payment.formTitle || "Untitled form"}
                                                <ExternalLink className="h-3 w-3 shrink-0" />
                                            </a>
                                        </TableCell>
                                        <TableCell className="max-w-[14rem] truncate text-[var(--editorial-body)]">
                                            {payment.customerEmail || "—"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={STATUS_STYLE[payment.status]}>
                                                {statusLabel(payment.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-[var(--foreground)]">
                                            {formatPaymentAmount(
                                                payment.amountMinor,
                                                payment.currency,
                                            )}
                                            {payment.refundAmountMinor > 0 && (
                                                <span className="block text-xs font-normal text-[var(--editorial-subtle)]">
                                                    {formatPaymentAmount(
                                                        payment.refundAmountMinor,
                                                        payment.currency,
                                                    )}{" "}
                                                    refunded
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDetailsTarget(payment)}
                                                    aria-label="Payment details"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    <span className="hidden sm:inline">
                                                        Details
                                                    </span>
                                                </Button>
                                                {payment.refundableMinor > 0 &&
                                                (payment.status === "paid" ||
                                                    payment.status ===
                                                        "partially_refunded") ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openRefund(payment)}
                                                    >
                                                        <RotateCcw className="h-3.5 w-3.5" />
                                                        Refund
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>

                {lastPage > 1 && (
                    <div className="flex items-center justify-between text-sm text-[var(--editorial-body)]">
                        <span>
                            Page {page} of {lastPage} · {total} payments
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                            >
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= lastPage}
                                onClick={() => setPage((current) => current + 1)}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Refund dialog */}
            <Dialog
                open={Boolean(refundTarget)}
                onOpenChange={(open) => {
                    if (!open) {
                        setRefundTarget(null)
                        setRefundInput("")
                    }
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl border border-[var(--border)] bg-[var(--card)] p-0">
                    <div className="space-y-4 p-6">
                        <DialogHeader>
                            <DialogTitle className="font-display text-xl text-[var(--foreground)]">
                                Refund payment
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[var(--editorial-body)]">
                                The refund is returned to the respondent through Stripe and
                                reduces the amount collected on this form.
                            </DialogDescription>
                        </DialogHeader>

                        {refundTarget && (
                            <div className="rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2.5 text-sm">
                                <p className="font-medium text-[var(--foreground)]">
                                    {refundTarget.formTitle || "Untitled form"}
                                </p>
                                <p className="text-[var(--editorial-body)]">
                                    {formatPaymentAmount(
                                        refundTarget.amountMinor,
                                        refundTarget.currency,
                                    )}{" "}
                                    paid · up to{" "}
                                    {formatPaymentAmount(
                                        refundTarget.refundableMinor,
                                        refundTarget.currency,
                                    )}{" "}
                                    refundable
                                </p>
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label htmlFor="refund-amount">Refund amount</Label>
                            <Input
                                id="refund-amount"
                                inputMode="decimal"
                                value={refundInput}
                                onChange={(event) => setRefundInput(event.target.value)}
                            />
                            <p className="text-xs text-[var(--editorial-subtle)]">
                                Leave the full amount for a complete refund.
                            </p>
                        </div>

                        <DialogFooter className="flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                onClick={() => setRefundTarget(null)}
                                disabled={refundMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={submitRefund}
                                disabled={refundMutation.isPending}
                            >
                                {refundMutation.isPending ? "Refunding..." : "Refund payment"}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment details */}
            <Dialog
                open={Boolean(detailsTarget)}
                onOpenChange={(open) => {
                    if (!open) setDetailsTarget(null)
                }}
            >
                <DialogContent className="w-[calc(100%-2rem)] max-w-lg rounded-xl border border-[var(--border)] bg-[var(--card)] p-0">
                    <div className="space-y-4 p-6">
                        <DialogHeader>
                            <DialogTitle className="font-display text-xl text-[var(--foreground)]">
                                Payment details
                            </DialogTitle>
                            <DialogDescription className="text-sm text-[var(--editorial-body)]">
                                The local record is the reporting source of truth; every
                                amount is mirrored from Stripe.
                            </DialogDescription>
                        </DialogHeader>

                        {detailsTarget && (
                            <dl className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] px-3 py-1">
                                <DetailRow label="Payment ID">
                                    <span className="font-mono text-xs">
                                        {detailsTarget.id}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Form">
                                    {detailsTarget.formTitle || "Untitled form"}
                                </DetailRow>
                                <DetailRow label="Submission">
                                    {detailsTarget.submissionId ? (
                                        <a
                                            className="text-[var(--primary)] hover:underline"
                                            href={`/form-response/${detailsTarget.formId}/submissions`}
                                        >
                                            View response
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </DetailRow>
                                <DetailRow label="Customer">
                                    {detailsTarget.customerEmail || "—"}
                                </DetailRow>
                                <DetailRow label="Amount">
                                    {formatPaymentAmount(
                                        detailsTarget.amountMinor,
                                        detailsTarget.currency,
                                    )}
                                </DetailRow>
                                <DetailRow label="Platform fee">
                                    {formatPaymentAmount(
                                        detailsTarget.applicationFeeMinor,
                                        detailsTarget.currency,
                                    )}
                                </DetailRow>
                                <DetailRow label="Refunded">
                                    {formatPaymentAmount(
                                        detailsTarget.refundAmountMinor,
                                        detailsTarget.currency,
                                    )}
                                </DetailRow>
                                <DetailRow label="Status">
                                    <Badge className={STATUS_STYLE[detailsTarget.status]}>
                                        {statusLabel(detailsTarget.status)}
                                    </Badge>
                                </DetailRow>
                                <DetailRow label="Stripe account">
                                    <span className="font-mono text-xs">
                                        {detailsTarget.stripeAccountId}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Checkout session">
                                    <span className="font-mono text-xs">
                                        {detailsTarget.checkoutSessionId}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Payment intent">
                                    <span className="font-mono text-xs">
                                        {detailsTarget.paymentIntentId || "—"}
                                    </span>
                                </DetailRow>
                                <DetailRow label="Paid">
                                    {formatDate(detailsTarget.paidAt)}
                                </DetailRow>
                                <DetailRow label="Created">
                                    {formatDate(detailsTarget.createdAt)}
                                </DetailRow>
                            </dl>
                        )}

                        <DialogFooter className="flex items-center justify-end">
                            <Button
                                variant="ghost"
                                onClick={() => setDetailsTarget(null)}
                            >
                                Close
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </PageLayout>
    )
}

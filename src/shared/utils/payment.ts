/** A payment answer is the server-verified session stored under the page key. */
export interface PaymentAnswer {
    sessionId: string
    status: "paid"
    amount: number
    currency: string
}

/** True when an answer holds a Stripe-verified payment. */
export function isPaymentAnswer(value: unknown): value is PaymentAnswer {
    return (
        typeof value === "object" &&
        value !== null &&
        (value as { status?: unknown }).status === "paid" &&
        Boolean((value as { sessionId?: unknown }).sessionId)
    )
}

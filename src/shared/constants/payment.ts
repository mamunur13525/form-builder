/** Currencies a payment page can charge in. Codes are lowercase ISO 4217. */
export const PAYMENT_CURRENCIES = [
    { code: "usd", label: "USD — US Dollar" },
    { code: "eur", label: "EUR — Euro" },
    { code: "gbp", label: "GBP — British Pound" },
    { code: "cad", label: "CAD — Canadian Dollar" },
    { code: "aud", label: "AUD — Australian Dollar" },
    { code: "chf", label: "CHF — Swiss Franc" },
    { code: "nok", label: "NOK — Norwegian Krone" },
    { code: "sek", label: "SEK — Swedish Krona" },
    { code: "dkk", label: "DKK — Danish Krone" },
    { code: "mxn", label: "MXN — Mexican Peso" },
    { code: "brl", label: "BRL — Brazilian Real" },
    { code: "aed", label: "AED — UAE Dirham" },
    { code: "nzd", label: "NZD — New Zealand Dollar" },
    { code: "pln", label: "PLN — Polish Zloty" },
] as const

export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[number]["code"]

export const DEFAULT_PAYMENT_CURRENCY: PaymentCurrency = "usd"

/** Prices are stored in the currency's minor unit (cents). */
export function formatPaymentAmount(amountInCents: number, currency: string): string {
    const amount = Number.isFinite(amountInCents) ? amountInCents / 100 : 0
    try {
        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount)
    } catch {
        return `${currency.toUpperCase()} ${amount.toFixed(2)}`
    }
}

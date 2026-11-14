import type { SliderSeparator } from "@/shared/types/common"

/** Group the integer part of a slider value with the configured separator. */
export function formatSliderNumber(
    value: number,
    separator: SliderSeparator = "comma",
): string {
    if (!Number.isFinite(value)) return "0"

    const separatorChar =
        separator === "comma"
            ? ","
            : separator === "period"
              ? "."
              : separator === "space"
                ? " "
                : ""
    const [integer, decimals] = String(value).split(".")
    const negative = integer.startsWith("-")
    const digits = negative ? integer.slice(1) : integer
    const grouped = separatorChar
        ? digits.replace(/\B(?=(\d{3})+(?!\d))/g, separatorChar)
        : digits

    return `${negative ? "-" : ""}${grouped}${decimals ? `.${decimals}` : ""}`
}

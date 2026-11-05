import { format } from "date-fns"

/**
 * Format an ISO date string (or Date) as e.g. "Oct 3, 2026".
 * Returns "—" for null/undefined/invalid input.
 */
export function formatDate(
    value: string | Date | null | undefined,
    pattern = "MMM d, yyyy",
): string {
    if (!value) return "—"
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return format(date, pattern)
}

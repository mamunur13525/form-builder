import { format } from "date-fns"

/** Compact date helpers used across the feedback surface. */
export const formatShort = (iso: string) => format(new Date(iso), "MMM d")
export const formatMedium = (iso: string) => format(new Date(iso), "MMM d, yyyy")
export const formatLong = (iso: string) => format(new Date(iso), "MMMM d, yyyy")

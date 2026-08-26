import type { FeedbackStatus } from "../types"

/** Status → display label + accent color. Shared by dots, badges, filters. */
export const STATUS_META: Record<FeedbackStatus, { label: string; color: string }> = {
    pending: { label: "Pending", color: "#eab308" },
    reviewing: { label: "Reviewing", color: "#f97316" },
    planned: { label: "Planned", color: "#3b82f6" },
    in_progress: { label: "In Progress", color: "#a855f7" },
    completed: { label: "Completed", color: "#22c55e" },
    closed: { label: "Closed", color: "#9ca3af" },
}

export const STATUS_ORDER: FeedbackStatus[] = [
    "pending",
    "reviewing",
    "planned",
    "in_progress",
    "completed",
    "closed",
]

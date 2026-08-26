import { ChevronUp, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Author, FeedbackStatus } from "../types"
import { STATUS_META } from "./status"

// ---------------------------------------------------------------------------
// Status glyph + badge
// ---------------------------------------------------------------------------

/**
 * Small status glyph. Pending/Reviewing read as hollow rings, Planned is a
 * solid dot, In Progress a half-filled pie, Completed a check, Closed an x —
 * matching the reference board's iconography.
 */
export function StatusDot({ status, size = 14 }: { status: FeedbackStatus; size?: number }) {
    const c = STATUS_META[status].color
    const common = { width: size, height: size, viewBox: "0 0 16 16", "aria-hidden": true } as const
    switch (status) {
        case "pending":
        case "reviewing":
            return (
                <svg {...common}>
                    <circle cx="8" cy="8" r="6" fill="none" stroke={c} strokeWidth="2" />
                </svg>
            )
        case "planned":
            return (
                <svg {...common}>
                    <circle cx="8" cy="8" r="7" fill={c} />
                </svg>
            )
        case "in_progress":
            return (
                <svg {...common}>
                    <circle cx="8" cy="8" r="6" fill="none" stroke={c} strokeWidth="2" />
                    <path d="M8 8 V2 A6 6 0 0 1 8 14 Z" fill={c} />
                </svg>
            )
        case "completed":
            return (
                <svg {...common}>
                    <circle cx="8" cy="8" r="7" fill={c} />
                    <path
                        d="M4.8 8.2 L7 10.4 L11.2 5.6"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )
        case "closed":
            return (
                <svg {...common}>
                    <circle cx="8" cy="8" r="7" fill={c} />
                    <path
                        d="M5.5 5.5 L10.5 10.5 M10.5 5.5 L5.5 10.5"
                        stroke="#fff"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                    />
                </svg>
            )
    }
}

/** Pill badge — status dot plus label, used on cards and the detail header. */
export function StatusBadge({ status, className }: { status: FeedbackStatus; className?: string }) {
    const { label } = STATUS_META[status]
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600",
                className,
            )}
        >
            <StatusDot status={status} />
            {label}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Avatars
// ---------------------------------------------------------------------------

const AVATAR_SIZES = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
} as const

export function Avatar({
    author,
    size = "md",
    className,
}: {
    author: Author
    size?: keyof typeof AVATAR_SIZES
    className?: string
}) {
    return (
        <span className={cn("relative inline-flex shrink-0", className)}>
            <span
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-semibold text-gray-700 uppercase",
                    AVATAR_SIZES[size],
                )}
                style={{ backgroundColor: author.color }}
            >
                {author.initials}
            </span>
            {author.isAdmin && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#f2542d] ring-2 ring-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
            )}
        </span>
    )
}

/** Overlapping avatar stack (commenters on the detail header). */
export function AvatarStack({ authors }: { authors: Author[] }) {
    return (
        <span className="flex items-center -space-x-2">
            {authors.map((a) => (
                <span
                    key={a.id}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold text-gray-700 uppercase ring-2 ring-white"
                    style={{ backgroundColor: a.color }}
                    title={a.name}
                >
                    {a.initials}
                </span>
            ))}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Upvote pill + comment count
// ---------------------------------------------------------------------------

export function UpvotePill({
    count,
    active,
    onClick,
    size = "md",
}: {
    count: number
    active?: boolean
    onClick?: () => void
    size?: "sm" | "md"
}) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onClick?.()
            }}
            className={cn(
                "inline-flex items-center gap-1 rounded-lg border font-semibold transition-colors",
                size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
                active
                    ? "border-[#f2542d] bg-[#fff1ec] text-[#f2542d]"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
            )}
            aria-pressed={active}
        >
            <ChevronUp className={size === "md" ? "h-4 w-4" : "h-3.5 w-3.5"} strokeWidth={2.5} />
            {count}
        </button>
    )
}

export function CommentCount({ count }: { count: number }) {
    return (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
            <MessageCircle className="h-4 w-4" />
            {count}
        </span>
    )
}

// ---------------------------------------------------------------------------
// Brand mark
// ---------------------------------------------------------------------------

export function TypeFormLogo() {
    return (
        <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#f2542d] shadow-sm"
            aria-hidden
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="16" rx="3" fill="white" />
                <rect x="7" y="7" width="10" height="1.8" rx="0.9" fill="#f2542d" />
                <rect x="7" y="10.5" width="10" height="1.8" rx="0.9" fill="#f2542d" />
                <rect x="7" y="14" width="6" height="1.8" rx="0.9" fill="#f2542d" />
                <path d="M15 17 l5 4 -1.5 -5 z" fill="white" stroke="#f2542d" strokeWidth="0.8" strokeLinejoin="round" />
            </svg>
        </span>
    )
}

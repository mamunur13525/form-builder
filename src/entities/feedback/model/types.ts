/**
 * Feedback board domain types.
 *
 * These match the DTOs returned by the backend feedback module
 * (`/api/v1/feedback/*`) so the API wrappers in `../api/feedback.api.ts` and the
 * query hooks in `features/feedback` can stay thin.
 */

export type FeedbackStatus =
    | "pending"
    | "reviewing"
    | "planned"
    | "in_progress"
    | "completed"
    | "closed"

export type SortOrder = "trending" | "top" | "newest"

export interface Board {
    id: string
    name: string
    /** Dot colour shown next to the board name in the sidebar. */
    color: string
}

export interface Author {
    id: string
    name: string
    /** Two-letter fallback shown when there's no avatar image. */
    initials: string
    /** Deterministic avatar background (used with initials). */
    color: string
    /** Team members get the small orange badge on their avatar. */
    isAdmin?: boolean
}

export interface FeedbackPost {
    id: string
    slug: string
    title: string
    description?: string
    /** Optional attached image (ImageKit CDN URL). */
    imageUrl?: string
    status: FeedbackStatus
    boardId: string
    author: Author
    upvotes: number
    commentCount: number
    /** ISO date string. */
    createdAt: string
    /** Whether the current viewer has upvoted this post. */
    hasUpvoted?: boolean
    /** A few commenter avatars surfaced on the detail header. */
    commenters?: Author[]
}

export interface Comment {
    id: string
    postId: string
    author: Author
    body: string
    /** Optional trailing link rendered inside the comment body. */
    link?: { url: string; label: string }
    createdAt: string
    /** Plain reaction counters — each click increments (no per-user state). */
    likeCount: number
    dislikeCount: number
    /** Pinned comments show the purple pin marker. */
    pinned?: boolean
}

/** Query accepted by the feedback list endpoint. */
export interface FeedbackQuery {
    cursor: number
    order: SortOrder
    limit: number
    statuses?: FeedbackStatus[]
    boardId?: string
    search?: string
}

/** Cursor-paginated envelope returned by the feedback list endpoint. */
export interface FeedbackPage {
    items: FeedbackPost[]
    /** Next cursor to request, or null when the list is exhausted. */
    nextCursor: number | null
    total: number
}

/** Body accepted by POST /feedback. */
export interface CreateFeedbackRequest {
    title: string
    description?: string
    /** URL returned by uploadImage(); attached to the new post. */
    imageUrl?: string
    boardId: string
}

/** Data returned by POST /uploads/image. */
export interface UploadedImage {
    url: string
    thumbnailUrl: string
    fileId: string
    width?: number
    height?: number
}

/**
 * Feedback feature hooks — TanStack Query wrappers around the feedback entity
 * API, plus the URL-synced filter state and small auth helpers the board UI
 * relies on.
 *
 * Query keys:
 *   ["feedback", "boards"]
 *   ["feedback", "list", filters]
 *   ["feedback", "post", slug]
 *   ["feedback", "comments", postId]
 */

import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
    type InfiniteData,
} from "@tanstack/react-query"
import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"

import { useAuthStore } from "@/shared/stores/authStore"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import {
    addComment,
    addPost,
    dislikeComment,
    fetchComments,
    fetchFeedback,
    fetchPost,
    getBoards,
    likeComment,
    toggleUpvote,
    uploadImage,
} from "@/entities/feedback/api/feedback.api"
import type {
    Author,
    Comment,
    CreateFeedbackRequest,
    FeedbackPage,
    FeedbackPost,
    FeedbackStatus,
    SortOrder,
    UploadedImage,
} from "@/entities/feedback/model/types"

export const PAGE_SIZE = 10

const ALL_STATUSES: FeedbackStatus[] = [
    "pending",
    "reviewing",
    "planned",
    "in_progress",
    "completed",
    "closed",
]
const ORDERS: SortOrder[] = ["trending", "top", "newest"]

// ---------------------------------------------------------------------------
// Auth — comments and submissions are gated behind the app's login state
// ---------------------------------------------------------------------------

export function useIsAuthenticated(): boolean {
    return useAuthStore((s) => !!s.accessToken)
}

// Deterministic avatar palette — mirrors the backend `serializeAuthor` so the
// current viewer's own avatar matches server-rendered author avatars.
const AVATAR_COLORS = [
    "#fcd9c8",
    "#dbeafe",
    "#dcfce7",
    "#fef3c7",
    "#ede9fe",
    "#fce7f3",
    "#ccfbf1",
    "#fee2e2",
]

function hashString(value: string): number {
    let hash = 0
    for (let i = 0; i < value.length; i++) {
        hash = (hash << 5) - hash + value.charCodeAt(i)
        hash |= 0
    }
    return Math.abs(hash)
}

function initialsOf(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean)
    if (words.length === 0) return "?"
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

/**
 * The signed-in viewer projected into the board's `Author` shape (for their own
 * avatar next to compose boxes). Returns `undefined` until the profile loads.
 */
export function useCurrentAuthor(): Author | undefined {
    const { data: user } = useCurrentUser()
    return useMemo(() => {
        if (!user) return undefined
        const author: Author = {
            id: user.id,
            name: user.name,
            initials: initialsOf(user.name),
            color: AVATAR_COLORS[hashString(user.id) % AVATAR_COLORS.length],
        }
        if (user.role === "admin") author.isAdmin = true
        return author
    }, [user])
}

// ---------------------------------------------------------------------------
// Boards
// ---------------------------------------------------------------------------

export function useBoards() {
    return useQuery({
        queryKey: ["feedback", "boards"],
        queryFn: getBoards,
        staleTime: 5 * 60 * 1000,
    })
}

// ---------------------------------------------------------------------------
// Filters, synced to the URL query string (?order=trending&status=…&board=…)
// ---------------------------------------------------------------------------

export interface FeedbackFilters {
    order: SortOrder
    statuses: FeedbackStatus[]
    boardId?: string
    search: string
}

export function useFeedbackFilters() {
    const [params, setParams] = useSearchParams()

    const order = (params.get("order") as SortOrder) ?? "trending"
    const validOrder: SortOrder = ORDERS.includes(order) ? order : "trending"

    const statuses = (params.get("status") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is FeedbackStatus => ALL_STATUSES.includes(s as FeedbackStatus))

    const boardId = params.get("board") ?? undefined
    const search = params.get("q") ?? ""

    // Join to a primitive so the memo dep list stays simple identifiers.
    const statusKey = statuses.join(",")
    const filters: FeedbackFilters = useMemo(
        () => ({ order: validOrder, statuses, boardId, search }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [validOrder, statusKey, boardId, search],
    )

    const patch = useCallback(
        (next: Partial<Record<"order" | "status" | "board" | "q", string | undefined>>) => {
            setParams(
                (prev) => {
                    const p = new URLSearchParams(prev)
                    for (const [key, value] of Object.entries(next)) {
                        if (value === undefined || value === "") p.delete(key)
                        else p.set(key, value)
                    }
                    return p
                },
                { replace: true },
            )
        },
        [setParams],
    )

    const setOrder = useCallback((o: SortOrder) => patch({ order: o }), [patch])
    const setBoard = useCallback(
        (id: string | undefined) => patch({ board: id }),
        [patch],
    )
    const setSearch = useCallback((q: string) => patch({ q: q || undefined }), [patch])
    const toggleStatus = useCallback(
        (s: FeedbackStatus) => {
            const set = new Set(filters.statuses)
            if (set.has(s)) set.delete(s)
            else set.add(s)
            patch({ status: set.size ? Array.from(set).join(",") : undefined })
        },
        [filters.statuses, patch],
    )
    const clearStatuses = useCallback(() => patch({ status: undefined }), [patch])

    return { filters, setOrder, setBoard, setSearch, toggleStatus, clearStatuses }
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export function useFeedbackList(filters: FeedbackFilters) {
    return useInfiniteQuery({
        queryKey: ["feedback", "list", filters],
        queryFn: ({ pageParam }) =>
            fetchFeedback({
                cursor: pageParam,
                order: filters.order,
                limit: PAGE_SIZE,
                statuses: filters.statuses,
                boardId: filters.boardId,
                search: filters.search,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: FeedbackPage) => lastPage.nextCursor ?? undefined,
    })
}

export function usePost(slug: string | undefined) {
    return useQuery({
        queryKey: ["feedback", "post", slug],
        queryFn: () => fetchPost(slug as string),
        enabled: !!slug,
    })
}

export function useComments(postId: string | undefined) {
    return useQuery({
        queryKey: ["feedback", "comments", postId],
        queryFn: () => fetchComments(postId as string),
        enabled: !!postId,
    })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useToggleUpvote() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (postId: string) => toggleUpvote(postId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feedback", "list"] })
            qc.invalidateQueries({ queryKey: ["feedback", "post"] })
        },
    })
}

export function useAddComment(postId: string) {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (body: string) => addComment(postId, body),
        onSuccess: (comment: Comment) => {
            qc.setQueryData<Comment[]>(["feedback", "comments", postId], (prev) =>
                prev ? [...prev, comment] : [comment],
            )
            // Reflect the higher comment count in any cached post detail.
            qc.invalidateQueries({ queryKey: ["feedback", "post"] })
        },
    })
}

/**
 * Comment reactions — plain increment-only counters. Both hooks take the parent
 * `postId` (so they can patch the right comments cache) and fire on a
 * `commentId`. The update is optimistic: the count bumps immediately, rolls back
 * on error, and reconciles with the server's authoritative comment on success.
 */
function useCommentReaction(
    postId: string,
    field: "likeCount" | "dislikeCount",
    mutationFn: (commentId: string) => Promise<Comment>,
) {
    const qc = useQueryClient()
    const key = ["feedback", "comments", postId] as const
    return useMutation({
        mutationFn,
        onMutate: async (commentId: string) => {
            await qc.cancelQueries({ queryKey: key })
            const previous = qc.getQueryData<Comment[]>(key)
            qc.setQueryData<Comment[]>(key, (prev) =>
                prev?.map((c) =>
                    c.id === commentId ? { ...c, [field]: c[field] + 1 } : c,
                ),
            )
            return { previous }
        },
        onError: (_err, _commentId, context) => {
            if (context?.previous) qc.setQueryData(key, context.previous)
        },
        onSuccess: (updated: Comment) => {
            qc.setQueryData<Comment[]>(key, (prev) =>
                prev?.map((c) => (c.id === updated.id ? updated : c)),
            )
        },
    })
}

export function useLikeComment(postId: string) {
    return useCommentReaction(postId, "likeCount", likeComment)
}

export function useDislikeComment(postId: string) {
    return useCommentReaction(postId, "dislikeCount", dislikeComment)
}

export function useAddPost() {
    const qc = useQueryClient()
    return useMutation({
        mutationFn: (input: CreateFeedbackRequest) => addPost(input),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["feedback", "list"] })
        },
    })
}

/**
 * Upload an image for a new post. Kept separate from `useAddPost` so the modal
 * can upload on file-select (or on submit) and then pass the returned URL into
 * the create call as `imageUrl`.
 */
export function useUploadImage() {
    return useMutation<UploadedImage, Error, File>({
        mutationFn: (file: File) => uploadImage(file),
    })
}

/** Convenience: is the current query key an empty first page? */
export function isEmptyResult(data: InfiniteData<FeedbackPage> | undefined): boolean {
    return !!data && data.pages.length > 0 && data.pages[0].items.length === 0
}

export type { FeedbackPost }

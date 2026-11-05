/**
 * Feedback board API — wrappers over the backend feedback module.
 *
 * Endpoints (see API_DOCUMENTATION.md):
 *   GET    /feedback?cursor=&order=&limit=&status=&board=&q=
 *   GET    /feedback/boards
 *   GET    /feedback/:slug
 *   POST   /feedback
 *   PATCH  /feedback/:id/upvote
 *   GET    /feedback/:id/comments
 *   POST   /feedback/:id/comments
 *   PATCH  /feedback/comments/:commentId/like
 *   PATCH  /feedback/comments/:commentId/dislike
 *   POST   /uploads/image
 */

import { apiRequest, buildQuery } from "@/shared/api/client"
import type {
    Board,
    Comment,
    CreateFeedbackRequest,
    FeedbackPage,
    FeedbackPost,
    FeedbackQuery,
    UploadedImage,
} from "@/entities/feedback/model/types"

/** GET /feedback/boards — the list of boards shown in the sidebar. */
export async function getBoards(): Promise<Board[]> {
    return apiRequest<Board[]>("/feedback/boards")
}

/** GET /feedback — cursor-paginated, filtered and sorted list of posts. */
export async function fetchFeedback(query: FeedbackQuery): Promise<FeedbackPage> {
    const qs = buildQuery({
        cursor: query.cursor,
        order: query.order,
        limit: query.limit,
        // The API accepts a comma-joined status list and a `board` / `q` alias.
        status: query.statuses && query.statuses.length ? query.statuses.join(",") : undefined,
        board: query.boardId,
        q: query.search && query.search.trim() ? query.search.trim() : undefined,
    })
    return apiRequest<FeedbackPage>(`/feedback${qs}`)
}

/** GET /feedback/:slug — a single post by slug. */
export async function fetchPost(slug: string): Promise<FeedbackPost> {
    return apiRequest<FeedbackPost>(`/feedback/${slug}`)
}

/** POST /feedback — create a new post (requires auth). */
export async function addPost(input: CreateFeedbackRequest): Promise<FeedbackPost> {
    return apiRequest<FeedbackPost>("/feedback", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

/** PATCH /feedback/:id/upvote — toggle the current viewer's upvote. */
export async function toggleUpvote(postId: string): Promise<FeedbackPost> {
    return apiRequest<FeedbackPost>(`/feedback/${postId}/upvote`, {
        method: "PATCH",
    })
}

/** GET /feedback/:id/comments — comments for a post (pinned first). */
export async function fetchComments(postId: string): Promise<Comment[]> {
    return apiRequest<Comment[]>(`/feedback/${postId}/comments`)
}

/** POST /feedback/:id/comments — add a comment (requires auth). */
export async function addComment(postId: string, body: string): Promise<Comment> {
    return apiRequest<Comment>(`/feedback/${postId}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
    })
}

/** PATCH /feedback/comments/:commentId/like — bump the like counter (requires auth). */
export async function likeComment(commentId: string): Promise<Comment> {
    return apiRequest<Comment>(`/feedback/comments/${commentId}/like`, {
        method: "PATCH",
    })
}

/** PATCH /feedback/comments/:commentId/dislike — bump the dislike counter (requires auth). */
export async function dislikeComment(commentId: string): Promise<Comment> {
    return apiRequest<Comment>(`/feedback/comments/${commentId}/dislike`, {
        method: "PATCH",
    })
}

/**
 * POST /uploads/image — upload an image to ImageKit and get back a hosted URL.
 * Sends multipart/form-data; the client omits the JSON Content-Type for FormData
 * bodies so the browser sets the multipart boundary. Requires auth.
 */
export async function uploadImage(file: File): Promise<UploadedImage> {
    const form = new FormData()
    form.append("file", file)
    return apiRequest<UploadedImage>("/uploads/image", {
        method: "POST",
        body: form,
    })
}

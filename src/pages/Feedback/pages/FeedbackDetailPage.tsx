import { Link, useParams } from "react-router-dom"
import { ChevronUp, ArrowLeft, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/shared/constants/routes"
import { showInfo } from "@/shared/hooks/useToast"
import {
    useBoards,
    useComments,
    useIsAuthenticated,
    usePost,
    useToggleUpvote,
} from "../hooks"
import {
    CommentComposer,
    CommentItem,
    StatusBadge,
    formatLong,
} from "../components"

export function FeedbackDetailPage() {
    const { slug } = useParams<{ slug: string }>()
    const { data: post, isLoading } = usePost(slug)
    const { data: comments = [], isLoading: commentsLoading } = useComments(post?.id)
    const { data: boards = [] } = useBoards()
    const isAuthed = useIsAuthenticated()
    const toggle = useToggleUpvote()

    if (isLoading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
                <div className="h-6 w-40 animate-pulse rounded bg-zinc-800" />
                <div className="mt-6 h-40 animate-pulse rounded-2xl bg-zinc-800" />
            </div>
        )
    }

    if (!post) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
                <p className="text-lg font-semibold text-white">Post not found</p>
                <p className="mt-1 text-sm text-zinc-400">
                    This feedback post may have been removed.
                </p>
                <Link to={ROUTES.FEEDBACK} className="mt-4 inline-block text-sm font-medium text-[#FF5722] hover:underline">
                    ← Back to Feedback
                </Link>
            </div>
        )
    }

    const onUpvote = () => {
        if (!isAuthed) {
            showInfo("Log in to vote", "You need an account to upvote posts.")
            return
        }
        toggle.mutate(post.id)
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
            <Link
                to={ROUTES.FEEDBACK}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200"
            >
                <ArrowLeft className="h-4 w-4" />
                Feedback
            </Link>

            <div className="mt-4 flex flex-col gap-8 lg:flex-row">
                <main className="min-w-0 flex-1">
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onUpvote}
                            aria-pressed={post.hasUpvoted}
                            className={cn(
                                "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border font-semibold transition-colors",
                                post.hasUpvoted
                                    ? "border-[#FF5722] bg-[#FF5722]/15 text-[#FF5722]"
                                    : "border-zinc-800 bg-[#16161a] text-zinc-300 hover:border-zinc-700 hover:text-white",
                            )}
                        >
                            <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
                            <span className="text-base">{post.upvotes}</span>
                        </button>
                        <div className="min-w-0 flex-1">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                {post.title}
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                                <StatusBadge status={post.status} />
                                <span>·</span>
                                <span>{post.author.name}</span>
                                <span>·</span>
                                <span>{formatLong(post.createdAt)}</span>
                            </div>
                        </div>
                    </div>

                    {post.description && (
                        <p className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-zinc-300">
                            {post.description}
                        </p>
                    )}

                    <div className="my-8 h-px bg-zinc-800" />

                    <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
                        <MessageCircle className="h-4 w-4 text-zinc-400" />
                        {post.commentCount} {post.commentCount === 1 ? "Comment" : "Comments"}
                    </h2>

                    <div className="mt-4">
                        <CommentComposer postId={post.id} />
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                        {commentsLoading ? (
                            <div className="h-16 animate-pulse rounded-2xl bg-zinc-800" />
                        ) : comments.length === 0 ? (
                            <p className="py-6 text-center text-sm text-zinc-500">
                                No comments yet — be the first to share your thoughts.
                            </p>
                        ) : (
                            comments.map((c) => <CommentItem key={c.id} comment={c} />)
                        )}
                    </div>
                </main>

                <aside className="w-full shrink-0 lg:w-64">
                    <div className="rounded-2xl border border-zinc-800 bg-[#141418] p-4">
                        <dl className="flex flex-col gap-4 text-sm">
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Status
                                </dt>
                                <dd className="mt-1.5">
                                    <StatusBadge status={post.status} />
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Board
                                </dt>
                                <dd className="mt-1.5 text-zinc-300">
                                    {boards.find((b) => b.id === post.boardId)?.name ?? "Feedback"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                    Upvotes
                                </dt>
                                <dd className="mt-1.5 text-zinc-300">{post.upvotes}</dd>
                            </div>
                        </dl>
                    </div>
                </aside>
            </div>
        </div>
    )
}

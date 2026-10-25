import { Link } from "react-router-dom"
import { ChevronUp, MessageCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { ROUTES } from "@/shared/constants/routes"
import { showInfo } from "@/shared/hooks/useToast"
import type { FeedbackPost } from "../types"
import { useIsAuthenticated, useToggleUpvote } from "../hooks"
import { Avatar, AvatarStack, StatusBadge } from "./primitives"
import { formatShort } from "./format"

export function FeedbackCard({ post }: { post: FeedbackPost }) {
    const isAuthed = useIsAuthenticated()
    const toggle = useToggleUpvote()

    const onUpvote = () => {
        if (!isAuthed) {
            showInfo("Log in to vote", "You need an account to upvote posts.")
            return
        }
        toggle.mutate(post.id)
    }

    return (
        <Link
            to={`${ROUTES.FEEDBACK}/${post.slug}`}
            className="group flex items-start gap-4 rounded-2xl border border-zinc-800 bg-[#141418] p-5 transition-all hover:border-[#FF5722]/50 hover:shadow-[0_4px_20px_rgba(255,87,34,0.08)]"
        >
            {/* Left: who created this */}
            <Avatar author={post.author} size="md" className="mt-0.5" />

            {/* Body */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-medium text-zinc-300">{post.author.name}</span>
                    <span>·</span>
                    <span>{formatShort(post.createdAt)}</span>
                </div>

                <h3 className="mt-1 text-[15px] font-semibold leading-snug text-zinc-100 group-hover:text-[#FF5722] transition-colors">
                    {post.title}
                </h3>

                {post.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">{post.description}</p>
                )}

                <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    <StatusBadge status={post.status} />
                    <span className="inline-flex items-center gap-1.5 text-sm text-zinc-400">
                        <MessageCircle className="h-4 w-4" />
                        {post.commentCount}
                    </span>
                    {post.commenters && post.commenters.length > 0 && (
                        <AvatarStack authors={post.commenters} />
                    )}
                </div>
            </div>

            {/* Right: upvote */}
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onUpvote()
                }}
                aria-pressed={post.hasUpvoted}
                className={cn(
                    "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border font-semibold transition-colors",
                    post.hasUpvoted
                        ? "border-[#FF5722] bg-[#FF5722]/15 text-[#FF5722]"
                        : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white",
                )}
            >
                <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-base">{post.upvotes}</span>
            </button>
        </Link>
    )
}

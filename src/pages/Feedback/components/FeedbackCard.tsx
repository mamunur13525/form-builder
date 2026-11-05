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
            className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm"
        >
            {/* Left: who created this */}
            <Avatar author={post.author} size="md" className="mt-0.5" />

            {/* Body */}
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">{post.author.name}</span>
                    <span>·</span>
                    <span>{formatShort(post.createdAt)}</span>
                </div>

                <h3 className="mt-1 text-[15px] font-semibold leading-snug text-gray-900 group-hover:text-[#f2542d]">
                    {post.title}
                </h3>

                {post.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-gray-500">{post.description}</p>
                )}

                <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    <StatusBadge status={post.status} />
                    <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
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
                        ? "border-[#f2542d] bg-[#fff1ec] text-[#f2542d]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                )}
            >
                <ChevronUp className="h-5 w-5" strokeWidth={2.5} />
                <span className="text-base">{post.upvotes}</span>
            </button>
        </Link>
    )
}

import { useState } from "react"
import { Link } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { Pin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ROUTES } from "@/shared/constants/routes"
import type { Comment } from "../types"
import { useAddComment, useCurrentAuthor, useIsAuthenticated } from "../hooks"
import { Avatar } from "./primitives"

function relative(iso: string) {
    return formatDistanceToNow(new Date(iso), { addSuffix: true })
}

export function CommentItem({ comment }: { comment: Comment }) {
    return (
        <div
            className={
                comment.pinned
                    ? "rounded-2xl border border-[#f9d9cc] bg-[#fff8f5] p-4"
                    : "px-1 py-2"
            }
        >
            {comment.pinned && (
                <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-[#f2542d]">
                    <Pin className="h-3.5 w-3.5" />
                    Pinned
                </div>
            )}
            <div className="flex gap-3">
                <Avatar author={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{comment.author.name}</span>
                        {comment.author.isAdmin && (
                            <span className="rounded-full bg-[#fff1ec] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#f2542d]">
                                Admin
                            </span>
                        )}
                        <span className="text-xs text-gray-400">{relative(comment.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-700">
                        {comment.body}
                        {comment.link && (
                            <a
                                href={comment.link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-[#f2542d] hover:underline"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {comment.link.label}
                            </a>
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

export function CommentComposer({ postId }: { postId: string }) {
    const isAuthed = useIsAuthenticated()
    const author = useCurrentAuthor()
    const add = useAddComment(postId)
    const [body, setBody] = useState("")

    if (!isAuthed) {
        return (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center">
                <p className="text-sm font-medium text-gray-700">Log in to join the conversation</p>
                <p className="text-xs text-gray-500">You need an account to comment on this post.</p>
                <Link to={ROUTES.LOGIN}>
                    <Button size="sm" className="h-9 px-5 text-sm">
                        Log in to comment
                    </Button>
                </Link>
            </div>
        )
    }

    const submit = () => {
        const text = body.trim()
        if (!text) return
        add.mutate(text, { onSuccess: () => setBody("") })
    }

    return (
        <div className="flex gap-3">
            {author && <Avatar author={author} size="sm" />}
            <div className="flex-1">
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write a comment…"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#f2542d] focus:outline-none focus:ring-2 focus:ring-[#f2542d]/20"
                />
                <div className="mt-2 flex justify-end">
                    <Button
                        onClick={submit}
                        disabled={!body.trim() || add.isPending}
                        size="sm"
                        className="h-9 px-5 text-sm"
                    >
                        {add.isPending ? "Posting…" : "Comment"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

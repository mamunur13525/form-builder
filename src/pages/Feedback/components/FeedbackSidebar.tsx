import { MessageSquarePlus, Link2, Share2, Check } from "lucide-react"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { showSuccess } from "@/shared/hooks/useToast"
import { useFeedbackUI } from "./feedback-ui"
import { useBoards, type FeedbackFilters } from "../hooks"

function BoardRow({
    label,
    count,
    color,
    active,
    onClick,
}: {
    label: string
    count?: number
    color?: string
    active: boolean
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                active ? "bg-[#FF5722]/15 font-semibold text-[#FF5722] border border-[#FF5722]/30" : "border border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200",
            )}
        >
            {color ? (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            ) : (
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-zinc-600" />
            )}
            <span className="flex-1 text-left">{label}</span>
            {count != null && (
                <span className={cn("text-xs", active ? "text-[#FF5722]" : "text-zinc-500")}>{count}</span>
            )}
        </button>
    )
}

export function FeedbackSidebar({
    filters,
    setBoard,
    total,
}: {
    filters: FeedbackFilters
    setBoard: (id: string | undefined) => void
    total: number
}) {
    const { openSubmit } = useFeedbackUI()
    const { data: boards = [] } = useBoards()
    const [copied, setCopied] = useState(false)

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            showSuccess("Link copied", "Board link copied to your clipboard.")
            setTimeout(() => setCopied(false), 1500)
        } catch {
            showSuccess("Link", window.location.href)
        }
    }

    const share = async () => {
        const nav = navigator as Navigator & {
            share?: (data: { title: string; url: string }) => Promise<void>
        }
        if (nav.share) {
            try {
                await nav.share({ title: "TypeForm Feedback", url: window.location.href })
            } catch {
                /* user dismissed */
            }
        } else {
            copyLink()
        }
    }

    return (
        <aside className="flex w-full flex-col gap-4 lg:w-64">
            <Button onClick={openSubmit} className="h-11 w-full justify-center gap-2 text-sm">
                <MessageSquarePlus className="h-4 w-4" />
                Give feedback
            </Button>

            <div className="rounded-2xl border border-zinc-800 bg-[#141418] p-2">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                    Boards
                </p>
                <BoardRow
                    label="All Feedback"
                    count={total}
                    active={!filters.boardId}
                    onClick={() => setBoard(undefined)}
                />
                {boards.map((b) => (
                    <BoardRow
                        key={b.id}
                        label={b.name}
                        color={b.color}
                        active={filters.boardId === b.id}
                        onClick={() => setBoard(b.id)}
                    />
                ))}
            </div>

            <div className="flex items-center gap-2 px-1">
                <button
                    type="button"
                    onClick={copyLink}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                    {copied ? "Copied" : "Copy link"}
                </button>
                <span className="text-zinc-700">·</span>
                <button
                    type="button"
                    onClick={share}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    Share
                </button>
            </div>
        </aside>
    )
}

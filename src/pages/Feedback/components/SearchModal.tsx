import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Search, CornerDownLeft } from "lucide-react"

import { Dialog } from "@/components/ui/dialog"
import { ROUTES } from "@/shared/constants/routes"
import { fetchFeedback } from "@/entities/feedback/api/feedback.api"
import { StatusDot } from "./primitives"

export function SearchModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const navigate = useNavigate()
    const [q, setQ] = useState("")

    // Pull a broad slice once; filter client-side as the user types.
    const { data } = useQuery({
        queryKey: ["feedback", "search-index"],
        queryFn: () => fetchFeedback({ cursor: 1, order: "top", limit: 100 }),
        enabled: open,
        staleTime: 60_000,
    })

    const results = useMemo(() => {
        const term = q.trim().toLowerCase()
        if (!term) return []
        return (data?.items ?? [])
            .filter((p) => p.title.toLowerCase().includes(term))
            .slice(0, 8)
    }, [q, data])

    const close = () => {
        onOpenChange(false)
        setQ("")
    }

    const go = (slug: string) => {
        navigate(`${ROUTES.FEEDBACK}/${slug}`)
        close()
    }

    const submitSearch = () => {
        const term = q.trim()
        if (!term) return
        navigate(`${ROUTES.FEEDBACK}?q=${encodeURIComponent(term)}`)
        close()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange} className="max-w-xl overflow-hidden rounded-2xl border-gray-200 bg-white p-0 text-left">
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <Search className="h-5 w-5 shrink-0 text-gray-400" />
                <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") submitSearch()
                        if (e.key === "Escape") close()
                    }}
                    placeholder="Search posts…"
                    className="w-full border-0 bg-transparent p-0 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0"
                />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
                {q.trim() === "" ? (
                    <p className="px-3 py-6 text-center text-sm text-gray-400">
                        Start typing to search the board.
                    </p>
                ) : results.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-gray-400">
                        No posts match “{q.trim()}”.
                    </p>
                ) : (
                    <ul className="flex flex-col">
                        {results.map((p) => (
                            <li key={p.id}>
                                <button
                                    type="button"
                                    onClick={() => go(p.slug)}
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-gray-50"
                                >
                                    <StatusDot status={p.status} />
                                    <span className="line-clamp-1 flex-1 text-sm text-gray-800">
                                        {p.title}
                                    </span>
                                    <span className="text-xs text-gray-400">{p.upvotes} votes</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs text-gray-400">
                <span>Search feedback</span>
                <span className="inline-flex items-center gap-1">
                    <CornerDownLeft className="h-3.5 w-3.5" /> to see all results
                </span>
            </div>
        </Dialog>
    )
}

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useFeedbackFilters, useFeedbackList } from "../hooks"
import {
    FeedbackCard,
    FeedbackSidebar,
    StatusFilterBar,
} from "../components"

function CardSkeleton() {
    return (
        <div className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
            <div className="h-14 w-12 shrink-0 animate-pulse rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2 py-1">
                <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-24 animate-pulse rounded-full bg-gray-100" />
            </div>
        </div>
    )
}

export function FeedbackListPage() {
    const { filters, setOrder, setBoard, setSearch, toggleStatus } = useFeedbackFilters()
    const {
        data,
        isLoading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useFeedbackList(filters)

    const posts = data?.pages.flatMap((p) => p.items) ?? []
    const total = data?.pages[0]?.total ?? 0

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:py-8">
            <FeedbackSidebar filters={filters} setBoard={setBoard} total={total} />

            <main className="min-w-0 flex-1">
                <StatusFilterBar
                    activeStatuses={filters.statuses}
                    toggleStatus={toggleStatus}
                    order={filters.order}
                    setOrder={setOrder}
                />

                {filters.search && (
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#fff1ec] px-3 py-1.5 text-sm text-[#f2542d]">
                        <span>
                            Search: <span className="font-semibold">{filters.search}</span>
                        </span>
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="rounded-full p-0.5 hover:bg-[#f2542d]/10"
                            aria-label="Clear search"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}

                <div className="mt-4 flex flex-col gap-3">
                    {isLoading ? (
                        <>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </>
                    ) : isError ? (
                        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                            Something went wrong loading feedback. Please try again.
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                            <p className="text-sm font-medium text-gray-900">No posts found</p>
                            <p className="mt-1 text-sm text-gray-500">
                                Try clearing filters or searching for something else.
                            </p>
                        </div>
                    ) : (
                        posts.map((post) => <FeedbackCard key={post.id} post={post} />)
                    )}
                </div>

                {hasNextPage && (
                    <div className="mt-6 flex justify-center">
                        <Button
                            variant="outline"
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="h-10 px-6 text-sm"
                        >
                            {isFetchingNextPage ? "Loading…" : "Load more"}
                        </Button>
                    </div>
                )}
            </main>
        </div>
    )
}

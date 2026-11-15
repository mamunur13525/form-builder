import type { CSSProperties } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/** Dashboard-style reveal: each block fades in 80ms after the previous one. */
function stagger(index: number): CSSProperties {
    return {
        animationDelay: `${index * 80}ms`,
        animationFillMode: "backwards",
    }
}

const reveal = "animate-in fade-in duration-300"

const card =
    "rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] dark:border-zinc-800 dark:bg-[#18181c]"

/** Summary tab: report cards on the left, sharing card on the right. */
export function SummarySkeleton() {
    return (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-6">
                {[0, 1, 2].map((index) => (
                    <div key={index} className={cn(card, reveal, "p-5 sm:p-7")} style={stagger(index)}>
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="mt-6 space-y-5">
                            {[0, 1, 2, 3].map((row) => (
                                <div key={row} className="space-y-2">
                                    <div className="flex items-center justify-between gap-4">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-24" />
                                    </div>
                                    <Skeleton className="h-2 w-full rounded-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className={cn(card, reveal, "p-5")} style={stagger(3)}>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-4 h-12 w-full rounded-lg" />
                <div className="mt-3 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-5/6" />
                </div>
                <Skeleton className="mt-4 h-10 w-full rounded-lg" />
            </div>
        </div>
    )
}

/** Submissions tab: toolbar, table header, and rows. */
export function SubmissionsSkeleton() {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
                <Skeleton className="h-9 w-44 rounded-lg" />
                <Skeleton className="h-9 w-32 rounded-lg" />
                <div className="ml-auto flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-lg" />
                    <Skeleton className="h-9 w-24 rounded-lg" />
                </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden">
                <div className="flex items-center gap-6 border-b border-slate-200 px-4 py-3 dark:border-zinc-800 sm:px-6">
                    <Skeleton className="h-4 w-5 rounded" />
                    {[0, 1, 2].map((index) => (
                        <Skeleton key={index} className="h-4 w-28" />
                    ))}
                    <Skeleton className="ml-auto h-4 w-20" />
                </div>

                {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
                    <div
                        key={index}
                        className={cn(
                            reveal,
                            "flex items-center gap-6 border-b border-slate-100 px-4 py-4 dark:border-zinc-800/60 sm:px-6",
                        )}
                        style={stagger(index)}
                    >
                        <Skeleton className="h-4 w-5 shrink-0 rounded" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="hidden h-4 w-32 sm:block" />
                        <Skeleton className="hidden h-4 w-24 md:block" />
                        <Skeleton className="ml-auto h-4 w-20" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Analytics tab: filters, metric cards, banner, trend chart, drop-off table. */
export function AnalyticsSkeleton() {
    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            <div className={cn(reveal, "flex flex-wrap items-center gap-3")} style={stagger(0)}>
                <Skeleton className="h-9 w-40 rounded-lg" />
                <Skeleton className="h-9 w-40 rounded-lg" />
            </div>

            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
                {[0, 1, 2, 3, 4].map((index) => (
                    <div
                        key={index}
                        className={cn(
                            card,
                            reveal,
                            "p-4 sm:p-5",
                            index === 4 && "col-span-2 sm:col-span-1",
                        )}
                        style={stagger(index + 1)}
                    >
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="mt-4 h-8 w-16" />
                    </div>
                ))}
            </div>

            <Skeleton className={cn(reveal, "h-14 w-full rounded-xl")} style={stagger(6)} />

            <div className={cn(card, reveal, "p-5 sm:p-6")} style={stagger(7)}>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-32 rounded-lg" />
                </div>
                <Skeleton className="mt-4 h-64 w-full rounded-lg" />
            </div>

            <div className={cn(card, reveal, "p-5 sm:p-6")} style={stagger(8)}>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-2/3" />
                <div className="mt-6 space-y-4">
                    {[0, 1, 2, 3, 4].map((row) => (
                        <div key={row} className="flex items-center gap-4">
                            <Skeleton className="h-6 w-6 shrink-0 rounded-md" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="ml-auto h-4 w-12" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

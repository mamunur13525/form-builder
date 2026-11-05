import { ChevronDown, TrendingUp, ArrowUp, Clock } from "lucide-react"

import { cn } from "@/lib/utils"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FeedbackStatus, SortOrder } from "../types"
import { StatusDot } from "./primitives"
import { STATUS_META, STATUS_ORDER } from "./status"

const ORDER_META: Record<SortOrder, { label: string; icon: typeof TrendingUp }> = {
    trending: { label: "Trending", icon: TrendingUp },
    top: { label: "Top", icon: ArrowUp },
    newest: { label: "Newest", icon: Clock },
}

function SortDropdown({ order, setOrder }: { order: SortOrder; setOrder: (o: SortOrder) => void }) {
    const Active = ORDER_META[order].icon
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 outline-none hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#f2542d]/40">
                <Active className="h-4 w-4 text-gray-500" />
                {ORDER_META[order].label}
                <ChevronDown className="h-4 w-4 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-white text-gray-700">
                <DropdownMenuRadioGroup value={order} onValueChange={(v) => setOrder(v as SortOrder)}>
                    {(Object.keys(ORDER_META) as SortOrder[]).map((o) => {
                        const Icon = ORDER_META[o].icon
                        return (
                            <DropdownMenuRadioItem key={o} value={o}>
                                <Icon className="h-4 w-4 text-gray-500" />
                                {ORDER_META[o].label}
                            </DropdownMenuRadioItem>
                        )
                    })}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export function StatusFilterBar({
    activeStatuses,
    toggleStatus,
    order,
    setOrder,
}: {
    activeStatuses: FeedbackStatus[]
    toggleStatus: (s: FeedbackStatus) => void
    order: SortOrder
    setOrder: (o: SortOrder) => void
}) {
    const isActive = (s: FeedbackStatus) => activeStatuses.includes(s)

    return (
        <div className="flex items-center gap-3">
            <div className="-mx-1 flex flex-1 items-center gap-1.5 overflow-x-auto px-1 pb-1">
                {STATUS_ORDER.map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => toggleStatus(s)}
                        aria-pressed={isActive(s)}
                        className={cn(
                            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                            isActive(s)
                                ? "border-[#f2542d] bg-[#fff1ec] text-[#f2542d]"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50",
                        )}
                    >
                        <StatusDot status={s} size={12} />
                        {STATUS_META[s].label}
                    </button>
                ))}
            </div>
            <div className="shrink-0">
                <SortDropdown order={order} setOrder={setOrder} />
            </div>
        </div>
    )
}

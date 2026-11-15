import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SUBMISSION_LAYERS, type SubmissionLayer } from "../lib/columns"

interface SubmissionsToolbarProps {
    status: "completed" | "partial"
    onStatusChange: (status: "completed" | "partial") => void
    completedCount: number
    partialCount: number
    layer: SubmissionLayer
    onLayerChange: (layer: SubmissionLayer) => void
    /** Column count per layer, shown next to each tab label. */
    columnCounts: Record<SubmissionLayer, number>
    selectedCount: number
    totalCount: number
    onClearSelection: () => void
    onExport: (format: "csv" | "json") => void
}

/**
 * Row above the submissions table: the status tabs (Completed / Partial) and
 * data-layer tabs (Visible / All) on the left, selection state and export on the right.
 */
export function SubmissionsToolbar({
    status,
    onStatusChange,
    completedCount,
    partialCount,
    layer,
    onLayerChange,
    columnCounts,
    selectedCount,
    totalCount,
    onClearSelection,
    onExport,
}: SubmissionsToolbarProps) {
    const hasSelection = selectedCount > 0

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
            <div className="flex flex-wrap items-center gap-3">
                {/* Status tabs: 1. Completed | 2. Partial */}
                <div className="flex items-center rounded-lg border border-[var(--editorial-border-light)] p-1 bg-muted/40">
                    <button
                        type="button"
                        onClick={() => onStatusChange("completed")}
                        className={cn(
                            "editorial-transition flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium",
                            status === "completed"
                                ? "bg-background text-foreground shadow-sm font-semibold"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <span>1. Completed</span>
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                                status === "completed"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground",
                            )}
                        >
                            {completedCount}
                        </span>
                    </button>

                    <button
                        type="button"
                        onClick={() => onStatusChange("partial")}
                        className={cn(
                            "editorial-transition flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium",
                            status === "partial"
                                ? "bg-background text-foreground shadow-sm font-semibold"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        <span>2. Partial</span>
                        <span
                            className={cn(
                                "rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                                status === "partial"
                                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                    : "bg-muted text-muted-foreground",
                            )}
                        >
                            {partialCount}
                        </span>
                    </button>
                </div>

                {/* Layer tabs: Visible data | All data */}
                <TooltipProvider delay={200}>
                    <Tabs
                        value={layer}
                        onValueChange={(value) => onLayerChange(value as SubmissionLayer)}
                        className="min-w-0 max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        <TabsList className="h-auto w-max gap-1 bg-transparent p-0">
                            {SUBMISSION_LAYERS.map(({ value, label, hint }) => (
                                <Tooltip key={value}>
                                    <TooltipTrigger
                                        render={
                                            <TabsTrigger
                                                value={value}
                                                className="editorial-transition h-9 gap-1.5 rounded-lg px-2.5 text-xs whitespace-nowrap text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 data-[selected]:border data-[selected]:border-[#FF5722]/40 data-[selected]:bg-[#FF5722]/15 data-[selected]:text-[#FF5722] data-[selected]:font-semibold sm:gap-2 sm:px-4 sm:text-sm"
                                            >
                                                {label}
                                                <span className="text-xs tabular-nums text-slate-400 dark:text-zinc-500">
                                                    {columnCounts[value]}
                                                </span>
                                            </TabsTrigger>
                                        }
                                    />
                                    <TooltipContent
                                        className="editorial max-w-none rounded-lg border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"
                                        side="bottom"
                                    >
                                        {hint}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </TabsList>
                    </Tabs>
                </TooltipProvider>
            </div>

            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
                {hasSelection ? (
                    <>
                        <span className="text-xs tabular-nums text-[var(--editorial-body)] sm:text-sm">
                            {selectedCount} of {totalCount} selected
                        </span>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="text-sm"
                            onClick={onClearSelection}
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    </>
                ) : (
                    <span className="text-xs tabular-nums text-[var(--editorial-body)] sm:text-sm">
                        {totalCount} {totalCount === 1 ? "response" : "responses"}
                    </span>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-sm"
                                disabled={totalCount === 0}
                            >
                                <Download className="h-4 w-4" />
                                {hasSelection ? `Download (${selectedCount})` : "Download"}
                            </Button>
                        }
                    />
                    <DropdownMenuContent
                        align="end"
                        className="editorial min-w-44 rounded-lg border-[var(--border)] bg-[var(--popover)] p-2"
                    >
                        <DropdownMenuItem
                            className="rounded-lg px-3 py-2"
                            onClick={() => onExport("csv")}
                        >
                            Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="rounded-lg px-3 py-2"
                            onClick={() => onExport("json")}
                        >
                            Download as JSON
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

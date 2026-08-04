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
import { SUBMISSION_LAYERS, type SubmissionLayer } from "../lib/columns"

interface SubmissionsToolbarProps {
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
 * Row above the submissions table: the data-layer tabs (with hover hints
 * describing each layer) on the left, selection state and export on the right.
 */
export function SubmissionsToolbar({
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
        <div className="flex flex-wrap items-center justify-between gap-3 px-8 py-4">
            <TooltipProvider delay={200}>
                <Tabs
                    value={layer}
                    onValueChange={(value) => onLayerChange(value as SubmissionLayer)}
                >
                    <TabsList className="h-auto gap-1 bg-transparent p-0">
                        {SUBMISSION_LAYERS.map(({ value, label, hint }) => (
                            <Tooltip key={value}>
                                <TooltipTrigger
                                    render={
                                        <TabsTrigger
                                            value={value}
                                            className="editorial-transition h-9 gap-2 rounded-[16px] px-4 text-sm text-[var(--editorial-body)] data-[selected]:border data-[selected]:border-[var(--editorial-primary-ring)] data-[selected]:bg-[var(--editorial-primary-selected)] data-[selected]:text-[var(--primary)]"
                                        >
                                            {label}
                                            <span className="text-xs tabular-nums text-[var(--editorial-subtle)]">
                                                {columnCounts[value]}
                                            </span>
                                        </TabsTrigger>
                                    }
                                />
                                <TooltipContent
                                    className="editorial max-w-none rounded-[12px] border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"
                                    side="bottom"
                                >
                                    {hint}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TabsList>
                </Tabs>
            </TooltipProvider>

            <div className="flex items-center gap-3">
                {hasSelection ? (
                    <>
                        <span className="text-sm tabular-nums text-[var(--editorial-body)]">
                            {selectedCount} of {totalCount} selected
                        </span>
                        <Button
                            variant="ghost"
                            className="editorial-transition h-10 gap-1.5 rounded-[16px] px-4 text-sm text-[var(--editorial-body)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)] active:scale-[.98]"
                            onClick={onClearSelection}
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    </>
                ) : (
                    <span className="text-sm tabular-nums text-[var(--editorial-body)]">
                        {totalCount} {totalCount === 1 ? "response" : "responses"}
                    </span>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                className="editorial-transition h-10 gap-2 rounded-[16px] border-[var(--border)] bg-[var(--secondary)] px-4 text-sm text-[var(--foreground)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:bg-[var(--editorial-primary-light)] active:translate-y-0 active:scale-[.98]"
                                disabled={totalCount === 0}
                            >
                                <Download className="h-4 w-4" />
                                {hasSelection ? `Download (${selectedCount})` : "Download"}
                            </Button>
                        }
                    />
                    <DropdownMenuContent
                        align="end"
                        className="editorial min-w-44 rounded-[18px] border-[var(--border)] bg-[var(--popover)] p-2"
                    >
                        <DropdownMenuItem
                            className="rounded-[12px] px-3 py-2"
                            onClick={() => onExport("csv")}
                        >
                            Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="rounded-[12px] px-3 py-2"
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

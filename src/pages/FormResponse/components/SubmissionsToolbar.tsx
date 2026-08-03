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
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <TooltipProvider delay={200}>
                <Tabs
                    value={layer}
                    onValueChange={(value) => onLayerChange(value as SubmissionLayer)}
                >
                    <TabsList className="h-8">
                        {SUBMISSION_LAYERS.map(({ value, label, hint }) => (
                            <Tooltip key={value}>
                                <TooltipTrigger
                                    render={
                                        <TabsTrigger value={value} className="h-6 gap-1.5 text-sm">
                                            {label}
                                            <span className="text-xs text-muted-foreground tabular-nums">
                                                {columnCounts[value]}
                                            </span>
                                        </TabsTrigger>
                                    }
                                />
                                <TooltipContent className="max-w-none" side="bottom">
                                    {hint}
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TabsList>
                </Tabs>
            </TooltipProvider>

            <div className="flex items-center gap-2">
                {hasSelection ? (
                    <>
                        <span className="text-sm text-muted-foreground tabular-nums">
                            {selectedCount} of {totalCount} selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-sm"
                            onClick={onClearSelection}
                        >
                            <X className="h-4 w-4" />
                            Clear
                        </Button>
                    </>
                ) : (
                    <span className="text-sm text-muted-foreground tabular-nums">
                        {totalCount} {totalCount === 1 ? "response" : "responses"}
                    </span>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-sm"
                                disabled={totalCount === 0}
                            >
                                <Download className="h-4 w-4" />
                                {hasSelection ? `Download (${selectedCount})` : "Download"}
                            </Button>
                        }
                    />
                    <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem onClick={() => onExport("csv")}>
                            Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onExport("json")}>
                            Download as JSON
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

import { useState } from "react"
import { Plus, Trash2, Flag, CheckCircle2, ArrowUpToLine } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../../components/ui/popover"
import { Button } from "../../../../components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "../../../../components/ui/tooltip"
import type { EndPage } from "../../../../shared/types/common"

interface EndPageListProps {
    endPages: EndPage[]
    /** Index of the selected end page; ignored unless `isActiveSelection`. */
    selectedIndex: number
    /** True when the current builder selection is an end page (not a page). */
    isActiveSelection: boolean
    onSelect: (index: number) => void
    onAdd: () => void
    onDelete: (index: number) => void
    /** Moves an end page to the top so it becomes the one shown on submit. */
    onReorderToFirst: (index: number) => void
}

/**
 * The bottom section of the builder sidebar: every end page in the form. The
 * first one carries a "Shown on submit" badge, since respondents only ever see
 * `endPages[0]` after submitting.
 */
export function EndPageList({
    endPages,
    selectedIndex,
    isActiveSelection,
    onSelect,
    onAdd,
    onDelete,
    onReorderToFirst,
}: EndPageListProps) {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-[var(--card)]">
            {/* Header — "End pages" with a count and an add button. */}
            <div className="flex items-center justify-between gap-2 px-4 py-4">
                <div className="flex items-center gap-2 text-[var(--foreground)]">
                    <Flag className="h-4 w-4 text-[var(--editorial-subtle)]" />
                    <span className="text-[15px] font-semibold">End pages</span>
                </div>

                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                onClick={onAdd}
                                aria-label="Add end page"
                                className="editorial-transition flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-body)] hover:-translate-y-0.5 hover:border-[var(--editorial-primary-ring)] hover:text-[var(--foreground)] active:translate-y-0 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        }
                    />
                    <TooltipContent>Add end page</TooltipContent>
                </Tooltip>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden px-3 pb-4">
                {endPages.length === 0 ? (
                    <div className="px-2 py-6 text-center text-sm text-[var(--editorial-subtle)]">
                        No end pages yet.
                    </div>
                ) : (
                    endPages.map((endPage, index) => (
                        <EndPageItem
                            key={endPage._id ?? endPage.key ?? index}
                            endPage={endPage}
                            index={index}
                            isFirst={index === 0}
                            isSelected={isActiveSelection && index === selectedIndex}
                            canDelete={endPages.length > 1}
                            onSelect={onSelect}
                            onDelete={onDelete}
                            onReorderToFirst={onReorderToFirst}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

interface EndPageItemProps {
    endPage: EndPage
    index: number
    isFirst: boolean
    isSelected: boolean
    canDelete: boolean
    onSelect: (index: number) => void
    onDelete: (index: number) => void
    onReorderToFirst: (index: number) => void
}

function EndPageItem({
    endPage,
    index,
    isFirst,
    isSelected,
    canDelete,
    onSelect,
    onDelete,
    onReorderToFirst,
}: EndPageItemProps) {
    const [confirmOpen, setConfirmOpen] = useState(false)

    return (
        <div
            onClick={() => onSelect(index)}
            aria-current={isSelected ? "true" : undefined}
            className={`editorial group relative flex flex-col gap-2 rounded-xl border px-4 py-3.5 cursor-pointer select-none editorial-transition ${
                isSelected
                    ? "border-green-900/50 bg-green-700/5! shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
                    : "border-[var(--border)] bg-[var(--secondary)] hover:border-[var(--editorial-primary-ring)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            }`}
        >
            <p className="line-clamp-2 text-sm leading-snug text-[var(--foreground)]">
                <span className="text-[var(--editorial-body)]">{index + 1}.</span>{" "}
                {endPage.title || (
                    <span className="italic text-[var(--editorial-disabled)]">
                        Untitled end page
                    </span>
                )}
            </p>

            <div className="flex items-center justify-between gap-2">
                {isFirst ? (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-green-900/30 bg-green-700/10 px-1.5 py-0.5 text-[11px] font-medium text-green-800">
                        <CheckCircle2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">Shown on submit</span>
                    </span>
                ) : (
                    <span className="inline-flex min-w-0 items-center gap-1 rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 text-[11px] font-medium text-[var(--editorial-body)]">
                        <Flag className="h-3 w-3 shrink-0" />
                        <span className="truncate">End page</span>
                    </span>
                )}

                <div className="flex items-center gap-1">
                    {!isFirst && (
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        aria-label="Show this end page on submit"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            onReorderToFirst(index)
                                        }}
                                        className="editorial-transition flex h-7 w-7 items-center justify-center rounded-md text-[var(--editorial-subtle)] hover:bg-[var(--editorial-primary-light)] hover:text-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                                    >
                                        <ArrowUpToLine className="h-4 w-4" />
                                    </button>
                                }
                            />
                            <TooltipContent>Show on submit</TooltipContent>
                        </Tooltip>
                    )}
                    {canDelete && (
                    <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <PopoverTrigger
                                        type="button"
                                        aria-label="Delete end page"
                                        onClick={(e) => e.stopPropagation()}
                                        className="editorial-transition flex h-7 w-7 items-center justify-center rounded-md text-[var(--editorial-subtle)] hover:bg-[var(--destructive)]/10 hover:text-[var(--destructive)] data-[popup-open]:bg-[var(--destructive)]/10 data-[popup-open]:text-[var(--destructive)]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </PopoverTrigger>
                                }
                            />
                            <TooltipContent>Delete</TooltipContent>
                        </Tooltip>
                        <PopoverContent
                            side="top"
                            align="end"
                            sideOffset={8}
                            onClick={(e) => e.stopPropagation()}
                            className="editorial w-64 gap-3 rounded-2xl p-4"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-[var(--foreground)]">
                                    Delete this end page?
                                </p>
                                <p className="text-[13px] leading-snug text-[var(--muted-foreground)]">
                                    This can't be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => {
                                        setConfirmOpen(false)
                                        onDelete(index)
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
                </div>
            </div>
        </div>
    )
}

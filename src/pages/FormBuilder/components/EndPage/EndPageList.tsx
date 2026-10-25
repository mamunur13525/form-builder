import { useState } from "react"
import { Plus, Trash2, Flag, ArrowUpToLine, Loader2, MoreVertical, Eye } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../../../../components/ui/popover"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
    /** True while a new end page is being created on the backend. */
    isAdding?: boolean
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
    isAdding = false,
}: EndPageListProps) {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-white dark:bg-[#141418] text-slate-800 dark:text-zinc-100">
            {/* Header — "End page" with an add button */}
            <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#141418]">
                <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                    <span className="text-base font-semibold text-slate-900 dark:text-white tracking-tight">End page</span>
                </div>

                <Tooltip>
                    <TooltipTrigger
                        render={
                            <button
                                type="button"
                                onClick={onAdd}
                                disabled={isAdding}
                                aria-label="Add end page"
                                aria-busy={isAdding}
                                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-zinc-700/80 bg-slate-100 dark:bg-zinc-800/90 text-slate-600 dark:text-zinc-300 hover:text-white hover:border-[#FF5722] hover:bg-[#FF5722] transition-all shadow-xs cursor-pointer active:scale-95 disabled:pointer-events-none disabled:opacity-60"
                            >
                                {isAdding ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#FF5722]" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </button>
                        }
                    />
                    <TooltipContent>Add end page</TooltipContent>
                </Tooltip>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto overflow-x-hidden p-3">
                {endPages.length === 0 && !isAdding ? (
                    <div className="px-2 py-6 text-center text-sm text-slate-400 dark:text-zinc-500">
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

                {isAdding && (
                    <div
                        aria-busy="true"
                        className="flex flex-col gap-2 rounded-2xl border border-dashed border-[#FF5722]/40 bg-[#FF5722]/5 p-3.5"
                    >
                        <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                            <Loader2 className="h-4 w-4 animate-spin text-[#FF5722]" />
                            <span>Creating end page…</span>
                        </div>
                    </div>
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
            className={`group relative flex flex-col gap-3 rounded-2xl border p-3.5 cursor-pointer select-none transition-all ${
                isSelected
                    ? "border-2 border-[#FF5722] bg-white dark:bg-[#1e1e24] ring-4 ring-[#FF5722]/15 shadow-md dark:shadow-lg dark:shadow-[#FF5722]/5"
                    : "border-slate-200/90 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-[#17171c] hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white dark:hover:bg-[#1a1a20]"
            }`}
        >
            <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-zinc-100">
                    <span className="text-slate-400 dark:text-zinc-400 font-normal">{index + 1}.</span>{" "}
                    {endPage.title || (
                        <span className="font-normal italic text-slate-400 dark:text-zinc-500">
                            Thank you!
                        </span>
                    )}
                </p>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-700 dark:hover:text-zinc-200 transition-colors"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </button>
                        }
                    />
                    <DropdownMenuContent align="end" className="w-48 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-1.5 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-200">
                        {!isFirst && (
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg text-xs font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onReorderToFirst(index)
                                }}
                            >
                                <ArrowUpToLine className="h-3.5 w-3.5 mr-2 text-slate-400 dark:text-zinc-400" />
                                Show on submit
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <DropdownMenuItem
                                className="cursor-pointer rounded-lg text-xs font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setConfirmOpen(true)
                                }}
                            >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
                {isFirst ? (
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-700/60 bg-slate-100 dark:bg-zinc-800/90 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-zinc-200">
                        <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-zinc-400 shrink-0" />
                        <span className="truncate">Shown on submit</span>
                    </span>
                ) : (
                    <span className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-100/70 dark:bg-zinc-800/60 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-zinc-400">
                        <Flag className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span className="truncate">End page</span>
                    </span>
                )}

                {canDelete && (
                    <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
                        <PopoverTrigger
                            type="button"
                            aria-label="Delete end page"
                            onClick={(e) => e.stopPropagation()}
                            className="hidden"
                        />
                        <PopoverContent
                            side="top"
                            align="end"
                            sideOffset={8}
                            onClick={(e) => e.stopPropagation()}
                            className="w-64 gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#18181c] p-4 shadow-xl dark:shadow-2xl text-slate-800 dark:text-zinc-100"
                        >
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                    Delete this end page?
                                </p>
                                <p className="text-xs leading-snug text-slate-500 dark:text-zinc-400">
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setConfirmOpen(false)}
                                    className="border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                        setConfirmOpen(false)
                                        onDelete(index)
                                    }}
                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                >
                                    Delete
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                )}
            </div>
        </div>
    )
}

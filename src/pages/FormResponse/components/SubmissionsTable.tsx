import { Checkbox } from "@/components/ui/checkbox"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { FormResponse } from "@/shared/types/common"
import type { SubmissionColumn } from "../lib/columns"
import { formatShortId, formatSubmittedAt } from "../lib/export"

interface SubmissionsTableProps {
    columns: SubmissionColumn[]
    responses: FormResponse[]
    /** Ids of the currently selected responses. */
    selectedIds: Set<string>
    onToggleRow: (id: string) => void
    onToggleAll: () => void
}

/**
 * Pinned cells can't inherit the row background (they'd be transparent and the
 * scrolling columns would show through), so they repaint the row state themselves.
 */
const PINNED_BODY_CELL =
    "bg-[var(--card)] group-hover:bg-[var(--secondary)] group-data-[state=selected]:bg-[var(--editorial-primary-selected)]"
const PINNED_HEAD_CELL =
    "bg-[var(--card)] editorial-eyebrow text-[var(--editorial-subtle)]"

export function SubmissionsTable({
    columns,
    responses,
    selectedIds,
    onToggleRow,
    onToggleAll,
}: SubmissionsTableProps) {
    const allSelected = responses.length > 0 && selectedIds.size === responses.length
    const someSelected = selectedIds.size > 0 && !allSelected

    return (
        <Table
            containerClassName="h-full overflow-auto"
            className="border-separate border-spacing-0 [&_td]:border-[var(--editorial-border-light)] [&_th]:border-[var(--editorial-border-light)]"
        >
            <TableHeader>
                <TableRow className="hover:bg-transparent">
                    <TableHead
                        className={cn(
                            PINNED_HEAD_CELL,
                            "sticky top-0 left-0 z-30 w-[132px] border-b border-r px-3 sm:w-[180px] sm:px-6",
                        )}
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Checkbox
                                checked={allSelected}
                                indeterminate={someSelected}
                                onCheckedChange={onToggleAll}
                                aria-label={allSelected ? "Deselect all rows" : "Select all rows"}
                            />
                            <span>Response</span>
                        </div>
                    </TableHead>
                    {columns.map((column) => (
                        <TableHead
                            key={column.id}
                            className={cn(PINNED_HEAD_CELL, "sticky top-0 z-20 border-b px-3 sm:px-6")}
                        >
                            <span
                                className="block max-w-[160px] truncate sm:max-w-[240px]"
                                title={column.label}
                            >
                                {column.label}
                            </span>
                        </TableHead>
                    ))}
                    <TableHead
                        className={cn(
                            PINNED_HEAD_CELL,
                            // Pinning both edges would leave nothing scrollable between
                            // them on a phone, so this column only pins from `sm` up.
                            "sticky top-0 z-30 border-b border-l px-3 text-right sm:right-0 sm:px-6",
                        )}
                    >
                        Submitted At
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {responses.map((response) => {
                    const id = response._id ?? ""
                    const isSelected = selectedIds.has(id)
                    return (
                        <TableRow
                            key={id}
                            data-state={isSelected ? "selected" : undefined}
                            onClick={(event) => {
                                // Base UI's checkbox cancels the original click and re-dispatches a
                                // *bubbling* one on its hidden input, so `stopPropagation` on the
                                // checkbox can't stop this handler — the row would toggle twice and
                                // cancel itself out. Skip clicks originating from the control.
                                if ((event.target as HTMLElement).closest("[data-select-control]")) {
                                    return
                                }
                                onToggleRow(id)
                            }}
                            className="group cursor-pointer"
                        >
                            <TableCell
                                className={cn(
                                    PINNED_BODY_CELL,
                                    "sticky left-0 z-10 border-b border-r font-medium sm:px-6",
                                )}
                            >
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <span data-select-control className="flex items-center">
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => onToggleRow(id)}
                                            aria-label={`Select response ${formatShortId(id)}`}
                                        />
                                    </span>
                                    <span className="tabular-nums">{formatShortId(id)}</span>
                                </div>
                            </TableCell>
                            {columns.map((column) => {
                                const text = column.getValue(response)
                                return (
                                    <TableCell key={column.id} className="border-b sm:px-6">
                                        {text ? (
                                            <span
                                                className="block max-w-[160px] truncate sm:max-w-[240px]"
                                                title={text}
                                            >
                                                {text}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">–</span>
                                        )}
                                    </TableCell>
                                )
                            })}
                            <TableCell
                                className={cn(
                                    PINNED_BODY_CELL,
                                    "sticky z-10 border-b border-l text-right text-muted-foreground sm:right-0 sm:px-6",
                                )}
                            >
                                {formatSubmittedAt(response.submittedAt)}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}

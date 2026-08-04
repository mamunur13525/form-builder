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
                            "sticky top-0 left-0 z-30 w-[180px] border-b border-r px-6",
                        )}
                    >
                        <div className="flex items-center gap-3">
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
                            className={cn(PINNED_HEAD_CELL, "sticky top-0 z-20 border-b px-6")}
                        >
                            <span className="block max-w-[240px] truncate" title={column.label}>
                                {column.label}
                            </span>
                        </TableHead>
                    ))}
                    <TableHead
                        className={cn(
                            PINNED_HEAD_CELL,
                            "sticky top-0 right-0 z-30 border-b border-l px-6 text-right",
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
                                    "sticky left-0 z-10 border-b border-r font-medium",
                                )}
                            >
                                <div className="flex items-center gap-3">
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
                                    <TableCell key={column.id} className="border-b">
                                        {text ? (
                                            <span
                                                className="block max-w-[240px] truncate"
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
                                    "sticky right-0 z-10 border-b border-l text-right text-muted-foreground",
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

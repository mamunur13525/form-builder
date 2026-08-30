/**
 * Read-only summary card for a saved logic rule, with edit/delete actions.
 * Actions are always visible on touch devices and hover-revealed on desktop.
 */

import { Pencil, Trash2 } from "lucide-react";
import type { FormLogicRule } from "../../../shared/types/common";
import { ruleSummary } from "./ruleUtils";
import { RuleSummary } from "./RuleSummary";

interface RuleCardProps {
    rule: FormLogicRule
    onEdit: () => void
    onDelete: () => void
}

export function RuleCard({ rule, onEdit, onDelete }: RuleCardProps) {
    return (
        <li className="group flex flex-col gap-1 rounded-lg border border-[var(--border)] bg-[var(--secondary)] px-3 py-2.5 text-[13px]">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1" title={ruleSummary(rule)}>
                    <RuleSummary rule={rule} />
                </div>
                {/* Always visible on touch/mobile; hover-revealed on desktop. */}
                <div className="flex shrink-0 items-center gap-1 md:opacity-0 md:transition-opacity md:group-hover:opacity-100 md:focus-within:opacity-100">
                    <button
                        type="button"
                        aria-label="Edit rule"
                        onClick={onEdit}
                        className="rounded bg-[var(--card)] p-1 text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)] md:bg-transparent"
                    >
                        <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        aria-label="Delete rule"
                        onClick={onDelete}
                        className="rounded bg-[var(--card)] p-1 text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--destructive)] md:bg-transparent"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
            {rule.enabled === false && (
                <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--editorial-subtle)]">
                    Disabled
                </span>
            )}
        </li>
    )
}

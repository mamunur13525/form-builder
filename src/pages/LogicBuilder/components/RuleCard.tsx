/**
 * Read-only summary card for a saved logic rule.
 *
 * Card layout mirrors the reference design: a slate-bordered white card with a
 * header (title "Rule N: …" + enabled toggle) and a slate-tinted body that
 * reads `IF <chips>` `THEN <chips>` — every meaningful token (page answer,
 * operator, comparison value, jump target / calculation result) shows as a
 * quiet pill so the structure of the rule is visible at a glance. Clicking
 * anywhere opens the editor for that rule; the trash icon deletes it.
 */

import { Pencil, Trash2 } from "lucide-react";
import type { FormLogicRule, FormPage } from "../../../shared/types/common";
import { CALC_OPERATION_SYMBOLS, OPERATOR_LABELS } from "./logicEditorConfig";
import { pageLabel } from "./ruleUtils";
import { Button } from "@/components/ui/button";

interface RuleCardProps {
    rule: FormLogicRule
    /** 1-based index — shown as "Rule N: …" in the header. */
    index: number
    /** All form pages — page references resolve to "page 03 · Title" labels. */
    pages: FormPage[]
    onEdit: () => void
    onDelete: () => void
}

/** Quiet neutral pill, used for every meaningful token on the summary line. */
function Pill({ children, title }: { children: React.ReactNode; title?: string }) {
    return (
        <span
            title={title}
            className="inline-flex max-w-[19rem] items-center truncate rounded-md bg-[var(--secondary)] px-2.5 py-1.5 text-[13px] font-medium text-[var(--foreground)]"
        >
            {children}
        </span>
    )
}

/** The resolved value of a condition (option label when one matches). */
function valueLabel(rule: FormLogicRule, pages: FormPage[]): string {
    const condition = (rule.conditions ?? [])[0]
    if (!condition) return "(value)"
    const operator = condition.operator
    if (operator === "isEmpty" || operator === "isNotEmpty") return ""
    const raw = condition.value == null ? "" : String(condition.value)
    if (raw === "") return "(value)"
    if (condition.sourceType === "page") {
        const page = pages.find((p) => p.pageKey === condition.sourceKey)
        const option = page?.options?.find((o) => o.value === raw)
        if (option) return option.label ?? option.value ?? raw
    }
    return raw
}

/** The source page label for a rule, falling back to "@key" for unknowns. */
function sourceLabel(rule: FormLogicRule, pages: FormPage[]): string {
    const condition = (rule.conditions ?? [])[0]
    if (!condition?.sourceKey) return "(choose a source)"
    if (condition.sourceType === "variable") return `@${condition.sourceKey}`
    return pageLabel(pages, condition.sourceKey)
}

/** The chip text for the rule's outcome (the THEN side). */
function outcomeLabel(rule: FormLogicRule, pages: FormPage[]): string {
    const action = (rule.actions ?? [])[0]
    if (rule.category === "branching") {
        if (action?.action === "goToEnd") return "finish the form"
        if (action?.targetPageKey) return `jump to ${pageLabel(pages, action.targetPageKey)}`
        return "jump to (no target)"
    }
    if (rule.category === "calculation") {
        const target = `@${action?.variableName ?? "(variable)"}`
        const raw = action?.value == null ? "" : String(action.value).trim()
        const operand = raw === "" || raw === "@" ? "(value)" : raw
        if (action?.operation === "set" || !action?.operation) {
            return `${target} = ${operand}`
        }
        const sym = CALC_OPERATION_SYMBOLS[action.operation]
        return `${target} ${sym} ${operand}`
    }
    if (rule.category === "display") {
        const target = action?.targetPageKey
            ? pageLabel(pages, action.targetPageKey)
            : "(no target)"
        return `show ${target}`
    }
    const target = action?.targetPageKey
        ? pageLabel(pages, action.targetPageKey)
        : "(no target)"
    return `hide ${target}`
}

export function RuleCard({ rule, index, pages = [], onEdit, onDelete }: RuleCardProps) {
    const title = rule.name?.trim() || "Untitled rule"
    const source = sourceLabel(rule, pages)
    const operator = OPERATOR_LABELS[(rule.conditions ?? [])[0]?.operator ?? "equals"]
    const value = valueLabel(rule, pages)
    const outcome = outcomeLabel(rule, pages)

    return (
        <li
            id={`logic-rule-${rule.id}`}
            className="editorial overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm"
        >
            <header className="flex items-center justify-between gap-3 border-b border-[var(--editorial-border-light)] px-4 py-3 bg-[var(--secondary)]">
                <h2 className="truncate text-[14px] font-medium text-[var(--foreground)]">
                    Rule {index}: {title}
                </h2>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        type="button"
                        aria-label="Edit rule"
                        onClick={onEdit}
                        variant={'outline'}
                    >
                        <Pencil className="h-3! w-3!" />
                    </Button>
                    <Button
                        type="button"
                        variant={'destructive'}
                        aria-label="Delete rule"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-3! w-3!" />
                    </Button>
                </div>
            </header>

            <div className="flex flex-wrap items-center gap-2  px-4 py-6">
                <span className="text-[13px] font-bold text-[var(--foreground)]">IF</span>
                <Pill title={source}>{source}</Pill>
                <Pill>{operator}</Pill>
                {value !== "" && <Pill title={value}>{value}</Pill>}
                <span className="text-[13px] font-bold text-[var(--foreground)]">THEN</span>
                <Pill title={outcome}>{outcome}</Pill>
            </div>
        </li>
    )
}
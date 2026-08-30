/**
 * Rich, chip-based rendering of a saved logic rule — used by RuleCard.
 *
 * Mirrors the plain-text `ruleSummary()` (which RuleCard keeps as the hover
 * title / accessible label) but styles the meaningful tokens so a rule reads
 * at a glance: @page-answer / @variable sources and jump targets become bold
 * tinted pills, literal comparison values become bordered neutral pills, and
 * operators / connectives stay muted. Monochrome editorial tokens only — the
 * hierarchy comes from weight + background, not hue.
 */

import type { ReactNode } from "react";
import type { FormLogicRule, LogicCondition } from "../../../shared/types/common";
import { CALC_OPERATION_SYMBOLS, OPERATOR_LABELS } from "./logicEditorConfig";

/** The "subject" of a rule: an @page answer, an @variable, or a jump target. */
function TokenPill({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-md bg-[var(--primary)]/90 px-1.5 py-0.5 font-semibold text-[var(--card)]">
            {children}
        </span>
    )
}

/** A literal value the source is compared against. */
function ValuePill({ children }: { children: ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-medium text-[var(--foreground)]">
            {children}
        </span>
    )
}

/** A calculation expression, shown monospaced. */
function CodePill({ children }: { children: ReactNode }) {
    return (
        <code className="inline-flex items-center rounded-md border border-[var(--border)] bg-[var(--card)] px-1.5 py-0.5 font-mono text-[12px] text-[var(--foreground)]">
            {children}
        </code>
    )
}

/** Muted connective text: When / operators / jump to / = … */
function Kw({ children }: { children: ReactNode }) {
    return <span className="text-[var(--editorial-subtle)]">{children}</span>
}

/** AND / OR separator between two conditions. */
function Combinator({ op }: { op: "and" | "or" }) {
    return (
        <span className="inline-flex items-center rounded border border-[var(--border)] bg-[var(--card)] px-1 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--editorial-subtle)]">
            {op}
        </span>
    )
}

export function RuleSummary({ rule }: { rule: FormLogicRule }) {
    const conditions = rule.conditions ?? []
    const ruleFallback: "and" | "or" = rule.combinator === "or" ? "or" : "and"
    const action = (rule.actions ?? [])[0]

    const nodes: ReactNode[] = []
    let key = 0

    const kw = (text: string) => nodes.push(<Kw key={key++}>{text}</Kw>)
    const token = (text: string) => nodes.push(<TokenPill key={key++}>{text}</TokenPill>)
    const value = (text: string) => nodes.push(<ValuePill key={key++}>{text}</ValuePill>)
    const code = (text: string) => nodes.push(<CodePill key={key++}>{text}</CodePill>)
    const combinator = (op: "and" | "or") => nodes.push(<Combinator key={key++} op={op} />)
    const arrow = () =>
        nodes.push(
            <span key={key++} className="px-0.5 text-[var(--editorial-subtle)]">
                →
            </span>,
        )

    const pushConditions = () => {
        if (conditions.length === 0) return
        kw("When")
        conditions.forEach((c: LogicCondition, index) => {
            if (index > 0) {
                combinator((c.combinator ?? ruleFallback) === "or" ? "or" : "and")
            }
            if (!c.sourceKey) {
                kw("(choose a source)")
                return
            }
            token(`@${c.sourceKey}`)
            kw(OPERATOR_LABELS[c.operator] ?? c.operator)
            if (c.operator !== "isEmpty" && c.operator !== "isNotEmpty") {
                const v = String(c.value ?? "")
                if (v === "") kw("(no value)")
                else value(v)
            }
        })
    }

    switch (rule.category) {
        case "display":
        case "hidePage":
            pushConditions()
            break
        case "branching":
            pushConditions()
            arrow()
            if (action?.action === "goToEnd") {
                kw("finish the form")
            } else {
                kw("jump to")
                if (action?.targetPageKey) token(`@${action.targetPageKey}`)
                else kw("(no target)")
            }
            break
        case "calculation": {
            if (conditions.length > 0) {
                pushConditions()
                kw(":")
            }
            const target = `@${action?.variableName ?? "(variable)"}`
            token(target)
            kw("=")
            if (action?.operation) {
                const raw = String(action.value ?? "").trim()
                const pushOperand = () => {
                    if (raw === "" || raw === "@") kw("(value)")
                    else if (raw.startsWith("@")) token(raw)
                    else value(raw)
                }
                if (action.operation === "set") {
                    pushOperand()
                } else {
                    token(target)
                    kw(CALC_OPERATION_SYMBOLS[action.operation])
                    pushOperand()
                }
            } else if (typeof action?.expression === "string" && action.expression.trim()) {
                // Legacy expression rule.
                code(action.expression)
            } else {
                // Legacy static-value rule.
                kw("a static value")
            }
            break
        }
        default:
            pushConditions()
    }

    return (
        <span className="flex flex-wrap items-center gap-x-1 gap-y-1.5 leading-relaxed text-[var(--foreground)]">
            {nodes}
        </span>
    )
}

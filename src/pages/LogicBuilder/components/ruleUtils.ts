/**
 * Helpers for building, normalizing and summarizing logic rules in the
 * Logic editor dialog — kept separate from the React components.
 */

import type {
    FormLogicRule,
    FormPage,
    LogicActionItem,
    LogicCategory,
    LogicCondition,
    PageType,
} from "../../../shared/types/common";
import { CALC_OPERATION_SYMBOLS, OPERATOR_LABELS } from "./logicEditorConfig";

export interface QuestionMeta {
    pageIndex: number
    pageKey: string
    pageTitle: string
    questionIndex: number
    questionKey: string
    title: string
    type: PageType
    options?: { label?: string; value?: unknown }[]
}

/** Flatten all questions across pages with their page indices and titles. */
export function extractAllQuestions(pages: FormPage[]): QuestionMeta[] {
    const list: QuestionMeta[] = []
    pages.forEach((p, pIdx) => {
        const pageTitle = p.title || p.label || `Page ${pIdx + 1}`
        const qs = (p.questions && p.questions.length > 0)
            ? p.questions
            : (p.blocks && p.blocks.length > 0 ? p.blocks : [])
        if (qs.length === 0) {
            list.push({
                pageIndex: pIdx,
                pageKey: p.pageKey,
                pageTitle,
                questionIndex: 0,
                questionKey: p.pageKey,
                title: p.label || p.title || "Untitled question",
                type: p.type,
                options: p.options,
            })
        } else {
            qs.forEach((q, qIdx) => {
                list.push({
                    pageIndex: pIdx,
                    pageKey: p.pageKey,
                    pageTitle,
                    questionIndex: qIdx,
                    questionKey: q.questionKey || q.blockKey || q._id || q.id || `${p.pageKey}_q${qIdx}`,
                    title: q.title || q.label || `Question ${qIdx + 1}`,
                    type: q.type,
                    options: q.options || p.options,
                })
            })
        }
    })
    return list
}

export const emptyCondition = (sourceKey = ""): LogicCondition => ({
    sourceType: "page",
    sourceKey,
    operator: "equals",
    value: "",
})

export const emptyActionFor = (category: LogicCategory, targetPageKey: string) => {
    switch (category) {
        case "display":
            return { action: "showPage" as const, targetPageKey }
        case "hidePage":
            return { action: "hidePage" as const, targetPageKey }
        case "branching":
            return { action: "jumpToPage" as const, targetPageKey: "" }
        case "calculation":
            return { action: "setVariable" as const, variableName: "", operation: "set" as const, value: "" }
    }
}

export const emptyRule = (category: LogicCategory, defaultSourceKey: string, targetPageKey = defaultSourceKey): FormLogicRule => ({
    id: `draft-${Math.random().toString(36).slice(2)}`,
    category,
    enabled: true,
    combinator: "and",
    // Conditions read from default source key (page or question).
    conditions: [emptyCondition(defaultSourceKey)],
    actions: [emptyActionFor(category, targetPageKey)],
})

/** Loose legacy condition shape tolerated before normalization. */
interface LegacyCondition {
    sourceType?: string
    sourceKey?: string
    pageKey?: string
    operator?: string
    value?: unknown
    combinator?: string
}

/** Loose legacy action shape tolerated before normalization. */
interface LegacyAction {
    action?: string
    target?: string
    targetPageKey?: string
    variableName?: string
    operation?: string
    expression?: string
    value?: unknown
}

function inferCategory(rule: { actions?: LegacyAction[] }): FormLogicRule["category"] {
    const action = (rule.actions ?? [])[0]?.action
    if (action === "hidePage" || action === "hide") return "hidePage"
    if (action === "jumpToPage" || action === "goToEnd" || action === "goToPage" || action === "skipTo") {
        return "branching"
    }
    if (action === "setVariable") return "calculation"
    return "display"
}

/**
 * Fill defaults for rules coming straight from the API: legacy rules may lack
 * `category` (inferable from the first action), and legacy conditions/actions
 * used `pageKey` / `target` instead of `sourceKey` / `targetPageKey`.
 */
export function normalizeApiRule(
    rule: FormLogicRule & { conditions?: LegacyCondition[]; actions?: LegacyAction[]; _id?: string },
): FormLogicRule {
    const category = rule.category ?? inferCategory(rule)
    return {
        ...rule,
        // Mongo documents expose `_id`; drafts use a `draft-*` id.
        id: rule.id ?? rule._id ?? "",
        category,
        combinator: rule.combinator ?? "and",
        enabled: rule.enabled ?? true,
        conditions: ((rule.conditions ?? []) as (LogicCondition & LegacyCondition)[]).map(
            (c) => ({
                sourceType: c.sourceType ?? "page",
                sourceKey: c.sourceKey ?? c.pageKey ?? "",
                operator: c.operator ?? "equals",
                value: c.value,
                combinator: c.combinator,
            }),
        ),
        actions: ((rule.actions ?? []) as (LogicActionItem & LegacyAction)[]).map((a) => ({
            action: a.action,
            targetPageKey: a.targetPageKey ?? a.target,
            variableName: a.variableName,
            operation: a.operation,
            expression: a.expression,
            value: a.value,
        })),
    }
}

/** Human summary of a rule for the read-only card's hover title. */
export function ruleSummary(rule: FormLogicRule, pages: FormPage[] = []): string {
    const conditions = rule.conditions ?? []
    const ruleFallback: LogicCondition["combinator"] = rule.combinator === "or" ? "or" : "and"
    const describe = (c: LogicCondition): string => {
        if (!c.sourceKey) return "(choose a source)"
        const source =
            c.sourceType === "variable" ? `@${c.sourceKey}` : sourceQuestionLabel(pages, c.sourceKey)
        const operator = OPERATOR_LABELS[c.operator] ?? c.operator
        if (c.operator === "isEmpty" || c.operator === "isNotEmpty") {
            return `${source} ${operator}`
        }
        return `${source} ${operator} "${String(c.value ?? "")}"`
    }
    const conditionText = conditions
        .map((c, i) => {
            const text = describe(c)
            if (i === 0) return text
            const op = (c.combinator ?? ruleFallback) === "or" ? "OR" : "AND"
            return `${op} ${text}`
        })
        .join(" ")

    const action = (rule.actions ?? [])[0]
    switch (rule.category) {
        case "display":
            return `When ${conditionText}`
        case "hidePage":
            return `When ${conditionText}`
        case "branching":
            if (action?.action === "goToEnd") return `When ${conditionText} → finish the form`
            return `When ${conditionText} → jump to ${
                action?.targetPageKey ? pageLabel(pages, action.targetPageKey) : "(no target)"
            }`
        case "calculation": {
            const prefix = (rule.conditions ?? []).length > 0 ? `When ${conditionText}: ` : ""
            const target = `@${action?.variableName ?? "(variable)"}`
            if (action?.operation) {
                const raw = String(action.value ?? "").trim()
                const operandText = raw === "" || raw === "@" ? "(value)" : raw
                if (action.operation === "set") return `${prefix}${target} = ${operandText}`
                const sym = CALC_OPERATION_SYMBOLS[action.operation]
                return `${prefix}${target} = ${target} ${sym} ${operandText}`
            }
            // Legacy expression / static-value rules.
            if (typeof action?.expression === "string" && action.expression.trim()) {
                return `${prefix}${target} = ${action.expression}`
            }
            return `Set ${target} to a static value`
        }
    }
}

// ---------------------------------------------------------------------------
// Page label helper (used by the rule summary chips)
// ---------------------------------------------------------------------------

/** "Page 03 · Contact info" for a known key, "@key" otherwise. */
export function pageLabel(pages: FormPage[], pageKey: string): string {
    const index = pages.findIndex((p) => p.pageKey === pageKey)
    if (index === -1) return `@${pageKey}`
    return `Page ${index + 1} · ${
        pages[index].title || pages[index].label || "Untitled page"
    }`
}

/** "P1 · Q2: Question title" for a question, or "Page 1 · Page Title" for a page. */
export function sourceQuestionLabel(pages: FormPage[], sourceKey: string): string {
    const questions = extractAllQuestions(pages)
    const q = questions.find((item) => item.questionKey === sourceKey)
    if (q) {
        return `P${q.pageIndex + 1} · Q${q.questionIndex + 1}: ${q.title}`
    }
    return pageLabel(pages, sourceKey)
}

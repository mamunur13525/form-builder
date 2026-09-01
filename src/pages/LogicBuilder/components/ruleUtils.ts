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
} from "../../../shared/types/common";
import { CALC_OPERATION_SYMBOLS, OPERATOR_LABELS } from "./logicEditorConfig";

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

export const emptyRule = (category: LogicCategory, selectedPageKey: string): FormLogicRule => ({
    id: `draft-${Math.random().toString(36).slice(2)}`,
    category,
    enabled: true,
    combinator: "and",
    // Conditions read from the currently selected page.
    conditions: [emptyCondition(selectedPageKey)],
    actions: [emptyActionFor(category, selectedPageKey)],
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
            c.sourceType === "variable" ? `@${c.sourceKey}` : pageLabel(pages, c.sourceKey)
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
// Readable preview (expandable rule card)
// ---------------------------------------------------------------------------

/** One piece of a readable sentence: plain text, or a highlighted token. */
export interface ReadableSegment {
    /**
     * "text" renders plain; "page"/"variable" render as highlighted pills;
     * "value" renders as a quiet pill.
     */
    kind: "text" | "page" | "variable" | "value"
    text: string
}

/** One condition in the readable preview, as sentence segments + join word. */
export interface ReadableCondition {
    /** How this condition joins the previous one (absent on the first). */
    connective?: "and" | "or"
    segments: ReadableSegment[]
}

/** Plain-language breakdown of a rule for the expandable rule-card preview. */
export interface ReadableRule {
    /** Opening sentence, e.g. "Show this page when:". */
    intro: ReadableSegment[]
    /** Each condition as readable segments. */
    conditions: ReadableCondition[]
    /** The action the rule takes — null when the intro already covers it. */
    outcome: ReadableSegment[] | null
}

const plain = (text: string): ReadableSegment => ({ kind: "text", text })

/** "page 03 · Contact info" for a known key, "@key" otherwise. */
export function pageLabel(pages: FormPage[], pageKey: string): string {
    const index = pages.findIndex((p) => p.pageKey === pageKey)
    if (index === -1) return `@${pageKey}`
    return `page ${String(index + 1).padStart(2, "0")} · ${
        pages[index].label || "Untitled page"
    }`
}

/** The same label as a highlighted segment for the readable preview. */
function describePage(pages: FormPage[], pageKey: string): ReadableSegment {
    const label = pageLabel(pages, pageKey)
    return label.startsWith("@")
        ? { kind: "variable", text: label }
        : { kind: "page", text: label }
}

/** The comparison value, resolved to its option label when one matches. */
function describeValue(condition: LogicCondition, pages: FormPage[]): ReadableSegment {
    const raw = condition.value == null ? "" : String(condition.value)
    if (raw === "") return { kind: "value", text: "(no value yet)" }
    if (condition.sourceType === "page") {
        const page = pages.find((p) => p.pageKey === condition.sourceKey)
        const option = page?.options?.find((o) => o.value === raw)
        if (option) return { kind: "value", text: `“${option.label}”` }
    }
    return { kind: "value", text: `“${raw}”` }
}

/** The subject of a condition: the page answer or the variable being read. */
function describeSource(condition: LogicCondition, pages: FormPage[]): ReadableSegment[] {
    if (condition.sourceType === "variable") {
        return [{ kind: "variable", text: `@${condition.sourceKey}` }]
    }
    return [plain("the answer on "), describePage(pages, condition.sourceKey)]
}

function describeCondition(condition: LogicCondition, pages: FormPage[]): ReadableSegment[] {
    if (!condition.sourceKey) return [plain("a source (not chosen yet)")]
    const operatorText = OPERATOR_LABELS[condition.operator] ?? condition.operator
    if (condition.operator === "isEmpty" || condition.operator === "isNotEmpty") {
        return [...describeSource(condition, pages), plain(` ${operatorText}`)]
    }
    return [
        ...describeSource(condition, pages),
        plain(` ${operatorText} `),
        describeValue(condition, pages),
    ]
}

/**
 * Turn a rule into plain language for the rule card's expandable preview: an
 * intro sentence, one readable sentence per condition (with AND/OR joins) and
 * the outcome — so a user can understand what the rule does at a glance. Page
 * names / variables come back as highlighted segments, values as quiet pills.
 */
export function readableRuleParts(rule: FormLogicRule, pages: FormPage[]): ReadableRule {
    const conditions = rule.conditions ?? []
    const action = (rule.actions ?? [])[0]
    const hasConditions = conditions.length > 0

    const readableConditions: ReadableCondition[] = conditions.map((condition, index) => ({
        connective:
            index === 0
                ? undefined
                : (condition.combinator ?? rule.combinator) === "or"
                  ? "or"
                  : "and",
        segments: describeCondition(condition, pages),
    }))

    switch (rule.category) {
        case "display":
            return {
                intro: [
                    plain(hasConditions ? "Show this page when:" : "Always show this page."),
                ],
                conditions: readableConditions,
                outcome: null,
            }
        case "hidePage":
            return {
                intro: [
                    plain(hasConditions ? "Hide this page when:" : "Always hide this page."),
                ],
                conditions: readableConditions,
                outcome: null,
            }
        case "branching": {
            const outcome: ReadableSegment[] =
                action?.action === "goToEnd"
                    ? [plain("Skip the remaining pages and finish the form.")]
                    : action?.targetPageKey
                      ? [
                            plain("Skip ahead to "),
                            describePage(pages, action.targetPageKey),
                            plain("."),
                        ]
                      : [plain("Skip ahead to a page (no target chosen yet).")]
            return {
                intro: [plain(hasConditions ? "When:" : "Always:")],
                conditions: readableConditions,
                outcome,
            }
        }
        case "calculation": {
            const target: ReadableSegment = action?.variableName
                ? { kind: "variable", text: `@${action.variableName}` }
                : plain("a variable (none chosen yet)")
            const raw = action?.value == null ? "" : String(action.value).trim()
            const operand: ReadableSegment =
                raw === "" || raw === "@"
                    ? { kind: "value", text: "(a value)" }
                    : raw.startsWith("@")
                      ? { kind: "variable", text: raw }
                      : { kind: "value", text: raw }
            let outcome: ReadableSegment[]
            switch (action?.operation) {
                case "set":
                    outcome = [plain("Set "), target, plain(" to "), operand, plain(".")]
                    break
                case "add":
                    outcome = [plain("Add "), operand, plain(" to "), target, plain(".")]
                    break
                case "subtract":
                    outcome = [plain("Subtract "), operand, plain(" from "), target, plain(".")]
                    break
                case "multiply":
                    outcome = [plain("Multiply "), target, plain(" by "), operand, plain(".")]
                    break
                case "divide":
                    outcome = [plain("Divide "), target, plain(" by "), operand, plain(".")]
                    break
                default:
                    outcome = [
                        plain("Update "),
                        target,
                        plain(` (expression: ${action?.expression ?? "not set"}).`),
                    ]
            }
            return {
                intro: [plain(hasConditions ? "When:" : "On every run:")],
                conditions: readableConditions,
                outcome,
            }
        }
    }
}

/**
 * Helpers for building, normalizing and summarizing logic rules in the
 * Logic editor dialog — kept separate from the React components.
 */

import type {
    FormLogicRule,
    LogicCategory,
    LogicCondition,
} from "../../../shared/types/common";
import { OPERATOR_LABELS } from "./logicEditorConfig";

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
            return { action: "setVariable" as const, variableName: "", expression: "" }
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

function inferCategory(rule: { actions?: any[] }): FormLogicRule["category"] {
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
export function normalizeApiRule(rule: FormLogicRule & { conditions?: any[]; actions?: any[]; _id?: string }): FormLogicRule {
    const category = rule.category ?? inferCategory(rule)
    return {
        ...rule,
        // Mongo documents expose `_id`; drafts use a `draft-*` id.
        id: rule.id ?? rule._id ?? "",
        category,
        combinator: rule.combinator ?? "and",
        enabled: rule.enabled ?? true,
        conditions: (rule.conditions ?? []).map((c: any) => ({
            sourceType: c.sourceType ?? "page",
            sourceKey: c.sourceKey ?? c.pageKey ?? "",
            operator: c.operator ?? "equals",
            value: c.value,
            combinator: c.combinator,
        })),
        actions: (rule.actions ?? []).map((a: any) => ({
            action: a.action,
            targetPageKey: a.targetPageKey ?? a.target,
            variableName: a.variableName,
            expression: a.expression,
            value: a.value,
        })),
    }
}

/** Human summary of a rule for the read-only card. */
export function ruleSummary(rule: FormLogicRule): string {
    const conditions = rule.conditions ?? []
    const ruleFallback: LogicCondition["combinator"] = rule.combinator === "or" ? "or" : "and"
    const describe = (c: LogicCondition): string => {
        if (!c.sourceKey) return "(choose a source)"
        const operator = OPERATOR_LABELS[c.operator] ?? c.operator
        if (c.operator === "isEmpty" || c.operator === "isNotEmpty") {
            return `@${c.sourceKey} ${operator}`
        }
        return `@${c.sourceKey} ${operator} "${String(c.value ?? "")}"`
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
                action?.targetPageKey ? `@${action.targetPageKey}` : "(no target)"
            }`
        case "calculation":
            if (typeof action?.expression === "string" && action.expression.trim()) {
                const prefix =
                    (rule.conditions ?? []).length > 0 ? `When ${conditionText}: ` : ""
                return `${prefix}@${action.variableName ?? "(variable)"} = ${action.expression}`
            }
            return `Set @${action?.variableName ?? "(variable)"} to a static value`
    }
}

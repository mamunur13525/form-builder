/**
 * Helpers for form "variables" — named values defined on the FormSettings page
 * that authors can drop into page labels and helper text with an `@` mention.
 *
 * Two responsibilities live here:
 *  - `buildVariableItems` turns the raw settings variables (plus the built-in
 *    `form_name`) into a flat, display-ready list used by the `@` menu.
 *  - `renderVariableText` swaps `@variable_name` tokens for their value when the
 *    form is rendered (preview + published views).
 */

import type { FormVariable } from "@/shared/types/common"

/** A normalized, display-ready variable used by the menu and the resolver. */
export interface VariableItem {
    /** Token name — referenced in text as `@name`. */
    name: string
    /** Value shown when the form is rendered. */
    value: string
}

/** Built-in variable that always resolves to the form's title. */
export const FORM_NAME_VARIABLE = "form_name"

/**
 * Build the list shown in the `@` menu: the built-in `form_name` first, then
 * each user-defined variable. Unnamed variables are skipped and a user variable
 * named `form_name` never shadows the built-in.
 */
export function buildVariableItems(
    variables: FormVariable[] | undefined | null,
    formName?: string,
): VariableItem[] {
    const items: VariableItem[] = [
        { name: FORM_NAME_VARIABLE, value: formName ?? "" },
    ]

    for (const variable of variables ?? []) {
        const name = String(variable?.name ?? "").trim()
        if (!name || name === FORM_NAME_VARIABLE) continue
        items.push({ name, value: variableValueToString(variable?.value) })
    }

    return items
}

/** Coerce a variable's stored value (string | number | boolean) to a string. */
export function variableValueToString(value: FormVariable["value"] | undefined): string {
    if (value === undefined || value === null) return ""
    return String(value)
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Build the `@name` matcher for a set of variables, or `null` when there is
 * nothing to match. Names are ordered longest-first so `@score_total` wins over
 * `@score`, and a trailing word-character lookahead stops `@score` from
 * matching inside `@scoreboard`.
 */
export function createVariablePattern(items: VariableItem[]): RegExp | null {
    const names = items
        .map((item) => item.name)
        .filter(Boolean)
        .sort((a, b) => b.length - a.length)
    if (!names.length) return null

    return new RegExp(`@(${names.map(escapeRegExp).join("|")})(?![\\w])`, "g")
}

/**
 * Replace every known `@variable_name` token in `text` with its value.
 * Unknown tokens are left untouched.
 */
export function renderVariableText(text: string, items: VariableItem[]): string {
    if (!text) return text ?? ""
    if (!items.length) return text

    const pattern = createVariablePattern(items)
    if (!pattern) return text

    const valueByName = new Map(items.map((item) => [item.name, item.value]))

    return text.replace(pattern, (_match, name: string) => {
        const value = valueByName.get(name)
        // Fall back to the raw token if the value is missing entirely.
        return value === undefined ? `@${name}` : value
    })
}

/**
 * Pull the variables off a form regardless of where the API put them.
 *
 * The public (published) form payload is not guaranteed to nest variables under
 * `settings`, so also accept them at the top level. Returns `undefined` when the
 * form carries none, in which case only the built-in `form_name` resolves.
 */
export function extractFormVariables(
    form: unknown,
): FormVariable[] | undefined {
    if (!form || typeof form !== "object") return undefined

    const source = form as {
        variables?: unknown
        settings?: { variables?: unknown } | null
    }
    const candidates = [source.settings?.variables, source.variables]

    for (const candidate of candidates) {
        if (Array.isArray(candidate)) return candidate as FormVariable[]
    }
    return undefined
}

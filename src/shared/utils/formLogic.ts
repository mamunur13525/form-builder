/**
 * Form logic evaluation engine (frontend mirror of
 * backend-form-builder/src/utils/form-logic/).
 *
 * Pure functions that take the pages of a form, the answers collected so far,
 * the variables of the form and its logic rules, and produce:
 *  - which pages are hidden (display / hidePage rules),
 *  - computed variable values (calculation rules),
 *  - the first matching jump per page (branching rules).
 *
 * `resolveFormLogic` is safe to run on every render/answer change: it performs
 * no I/O and never throws (unresolvable calculation references are skipped).
 */

/** Sentinel jump target meaning "finish the form now". */
export const JUMP_TO_END = "END"

import type {
    FormLogicRule,
    FormPage,
    FormVariable,
    LogicActionItem,
    LogicCondition,
} from "@/shared/types/common"

export interface ResolveFormLogicInput {
    pages: FormPage[]
    /** Answered values keyed by pageKey. */
    answers: Record<string, unknown>
    variables?: FormVariable[]
    rules: FormLogicRule[]
}

export interface ResolveFormLogicResult {
    /** pageKeys currently hidden by display / hidePage rules. */
    hiddenPageKeys: Set<string>
    /** Computed variable values keyed by variable name. */
    computedVariables: Record<string, number | string>
    /** First matching jump per page: pageKey → target pageKey or JUMP_TO_END. */
    jumpTargets: Record<string, string>
}

/* -------------------------------------------------------------------------- */
/* Safe arithmetic expression evaluation (calculation variables)               */
/* -------------------------------------------------------------------------- */

type Token =
    | { kind: "number"; value: number }
    | { kind: "name"; value: string }
    | { kind: "op"; value: "+" | "-" | "*" | "/" | "%" | "^" }
    | { kind: "paren"; value: "(" | ")" }

const OPERATORS = new Set(["+", "-", "*", "/", "%", "^"])
const NAME_START = /[A-Za-z_]/
const NAME_CHAR = /[A-Za-z0-9_]/

const tokenizeExpression = (input: string): Token[] => {
    const tokens: Token[] = []
    let i = 0
    while (i < input.length) {
        const ch = input[i]
        if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
            i += 1
            continue
        }
        if (ch === "@" || NAME_START.test(ch)) {
            let j = ch === "@" ? i + 1 : i
            if (ch === "@" && !NAME_START.test(input[j] ?? "")) {
                throw new Error(`Invalid variable reference at position ${i}`)
            }
            let name = ""
            while (j < input.length && NAME_CHAR.test(input[j])) {
                name += input[j]
                j += 1
            }
            if (!name) {
                throw new Error(`Invalid variable reference at position ${i}`)
            }
            tokens.push({ kind: "name", value: name })
            i = j
            continue
        }
        if (/[0-9.]/.test(ch)) {
            let j = i
            let num = ""
            while (j < input.length && /[0-9.]/.test(input[j])) {
                num += input[j]
                j += 1
            }
            const value = Number(num)
            if (!Number.isFinite(value)) {
                throw new Error(`Invalid number "${num}"`)
            }
            tokens.push({ kind: "number", value })
            i = j
            continue
        }
        if (OPERATORS.has(ch)) {
            tokens.push({
                kind: "op",
                value: ch as "+" | "-" | "*" | "/" | "%" | "^",
            })
            i += 1
            continue
        }
        if (ch === "(" || ch === ")") {
            tokens.push({ kind: "paren", value: ch })
            i += 1
            continue
        }
        throw new Error(`Unexpected character "${ch}" at position ${i}`)
    }
    return tokens
}

type ExpressionResolver = (name: string) => number | undefined

const parseTokens = (tokens: Token[], resolve: ExpressionResolver): number => {
    let pos = 0
    const peek = (): Token | undefined => tokens[pos]

    const parsePrimary = (): number => {
        const token = peek()
        if (!token) throw new Error("Unexpected end of expression")
        if (token.kind === "number") {
            pos += 1
            return token.value
        }
        if (token.kind === "name") {
            pos += 1
            const value = resolve(token.value)
            if (value === undefined || !Number.isFinite(value)) {
                throw new Error(`Unknown or non-numeric value for @${token.value}`)
            }
            return value
        }
        if (token.kind === "paren" && token.value === "(") {
            pos += 1
            const value = parseAdditive()
            const close = peek()
            if (!close || close.kind !== "paren" || close.value !== ")") {
                throw new Error("Missing closing parenthesis")
            }
            pos += 1
            return value
        }
        throw new Error("Unexpected token in expression")
    }

    const parseUnary = (): number => {
        const token = peek()
        if (token && token.kind === "op" && (token.value === "-" || token.value === "+")) {
            pos += 1
            const value = parseUnary()
            return token.value === "-" ? -value : value
        }
        return parsePrimary()
    }

    const parsePower = (): number => {
        const base = parseUnary()
        const token = peek()
        if (token && token.kind === "op" && token.value === "^") {
            pos += 1
            return Math.pow(base, parsePower())
        }
        return base
    }

    const parseMultiplicative = (): number => {
        let left = parsePower()
        for (;;) {
            const token = peek()
            if (token && token.kind === "op" && (token.value === "*" || token.value === "/" || token.value === "%")) {
                pos += 1
                const right = parsePower()
                left = token.value === "*" ? left * right : token.value === "/" ? left / right : left % right
                continue
            }
            return left
        }
    }

    const parseAdditive = (): number => {
        let left = parseMultiplicative()
        for (;;) {
            const token = peek()
            if (token && token.kind === "op" && (token.value === "+" || token.value === "-")) {
                pos += 1
                const right = parseMultiplicative()
                left = token.value === "+" ? left + right : left - right
                continue
            }
            return left
        }
    }

    const result = parseAdditive()
    if (pos !== tokens.length) {
        throw new Error("Unexpected trailing tokens in expression")
    }
    return result
}

/** Evaluate an arithmetic expression, resolving @name tokens via `resolve`. */
export const evaluateExpression = (
    expression: string,
    resolve: ExpressionResolver,
): number => {
    const tokens = tokenizeExpression(expression)
    if (tokens.length === 0) throw new Error("Expression is empty")
    const result = parseTokens(tokens, resolve)
    if (!Number.isFinite(result)) {
        throw new Error("Expression result is not a finite number")
    }
    return result
}

/* -------------------------------------------------------------------------- */
/* Condition / rule evaluation                                                 */
/* -------------------------------------------------------------------------- */

type EngineContext = {
    answers: Record<string, unknown>
    variablesByName: Map<string, FormVariable>
    /** Computed (calculation) variables, checked before static variables. */
    computedVariables: Record<string, number | string>
}

/** Canonical scalar key: trims strings, lowercases for text comparisons. */
const scalarKey = (value: unknown): string | number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === "number") return Number.isFinite(value) ? value : null
    if (typeof value === "boolean") return value ? "true" : "false"
    if (value instanceof Date) return value.toISOString()
    if (typeof value === "string") {
        const trimmed = value.trim()
        return trimmed === "" ? null : trimmed.toLowerCase()
    }
    const asString = String(value).trim()
    return asString === "" ? null : asString.toLowerCase()
}

const isPlainNumeric = (key: string | number | null): key is number | string => {
    if (key === null) return false
    if (typeof key === "number") return true
    return key !== "" && Number.isFinite(Number(key))
}

/**
 * Equality that is array-aware (checkbox / multiSelect answers) and tolerant
 * of number-vs-numeric-string comparisons. Text comparison is case-insensitive.
 */
const valuesEqual = (answer: unknown, expected: unknown): boolean => {
    if (Array.isArray(answer) || Array.isArray(expected)) {
        const toSet = (value: unknown): Set<string> => {
            const items = Array.isArray(value) ? value : [value]
            const keys = items
                .map((item) => scalarKey(item))
                .filter((key): key is string | number => key !== null)
                .map((key) => String(key))
            return new Set(keys)
        }
        const setA = toSet(answer)
        const setB = toSet(expected)
        if (setA.size !== setB.size) return false
        for (const item of setA) {
            if (!setB.has(item)) return false
        }
        return true
    }

    const keyA = scalarKey(answer)
    const keyB = scalarKey(expected)
    if (keyA === null || keyB === null) return keyA === keyB

    if (isPlainNumeric(keyA) && isPlainNumeric(keyB)) {
        const numA = typeof keyA === "number" ? keyA : Number(keyA)
        const numB = typeof keyB === "number" ? keyB : Number(keyB)
        if (String(numA) === String(keyA) && String(numB) === String(keyB)) {
            return numA === numB
        }
    }
    return String(keyA) === String(keyB)
}

/** `contains`: membership for arrays, substring for text answers. */
const answerContains = (answer: unknown, needle: unknown): boolean => {
    if (Array.isArray(answer)) {
        return answer.some((item) => valuesEqual(item, needle))
    }
    const haystack = String(answer ?? "").toLowerCase()
    const fragment = String(needle ?? "").toLowerCase()
    return haystack.includes(fragment)
}

const isEmptyValue = (value: unknown): boolean => {
    if (value === null || value === undefined) return true
    if (Array.isArray(value)) return value.length === 0
    if (typeof value === "string") return value.trim() === ""
    return false
}

/** Numeric view of an answer/variable; arrays sum their numeric members. */
const numericValue = (value: unknown): number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === "number") return Number.isFinite(value) ? value : null
    if (typeof value === "boolean") return value ? 1 : 0
    if (Array.isArray(value)) {
        let sum = 0
        let found = false
        for (const item of value) {
            const n = numericValue(item)
            if (n !== null) {
                sum += n
                found = true
            }
        }
        return found ? sum : null
    }
    const trimmed = String(value).trim()
    if (trimmed === "") return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : null
}

/* -------------------------------------------------------------------------- */
/* Calculation operations                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Resolve a calculation operand to a number: a literal number, or a
 * `@number-variable` reference (freshly computed values win over static
 * variable defaults). Page answers are NOT valid operands — calculations act
 * on numbers and number variables only. Returns null when unresolvable.
 */
const resolveCalcOperand = (raw: unknown, ctx: EngineContext): number | null => {
    if (typeof raw === "string" && raw.trim().startsWith("@")) {
        const name = raw.trim().slice(1)
        if (name in ctx.computedVariables) {
            const n = Number(ctx.computedVariables[name])
            return Number.isFinite(n) ? n : null
        }
        const variable = ctx.variablesByName.get(name)
        if (variable && variable.type === "number") {
            return numericValue(variable.value)
        }
        return null
    }
    return numericValue(raw)
}

/**
 * Apply an arithmetic operation. `set` overwrites (base ignored); the rest fold
 * `operand` onto the current `base`. Division by zero yields null (skip).
 */
const applyCalcOperation = (
    operation: NonNullable<LogicActionItem["operation"]>,
    base: number,
    operand: number,
): number | null => {
    switch (operation) {
        case "set":
            return operand
        case "add":
            return base + operand
        case "subtract":
            return base - operand
        case "multiply":
            return base * operand
        case "divide":
            return operand === 0 ? null : base / operand
        default:
            return null
    }
}

/** Current numeric value of a calc variable: computed this pass, else static, else 0. */
const currentCalcValue = (name: string, ctx: EngineContext): number => {
    if (name in ctx.computedVariables) {
        const n = Number(ctx.computedVariables[name])
        return Number.isFinite(n) ? n : 0
    }
    return numericValue(ctx.variablesByName.get(name)?.value) ?? 0
}

const readSourceValue = (condition: LogicCondition, ctx: EngineContext): unknown => {
    if (!condition.sourceKey) return undefined
    if (condition.sourceType === "variable") {
        // Freshly computed values take precedence over the static defaults.
        if (condition.sourceKey in ctx.computedVariables) {
            return ctx.computedVariables[condition.sourceKey]
        }
        return ctx.variablesByName.get(condition.sourceKey)?.value
    }
    return ctx.answers[condition.sourceKey]
}

export const evaluateCondition = (
    condition: LogicCondition,
    ctx: EngineContext,
): boolean => {
    if (!condition.sourceKey) return false
    const raw = readSourceValue(condition, ctx)

    switch (condition.operator) {
        case "isEmpty":
            return isEmptyValue(raw)
        case "isNotEmpty":
            return !isEmptyValue(raw)
        case "notEquals":
            return !valuesEqual(raw, condition.value)
        case "contains":
            return !isEmptyValue(raw) && answerContains(raw, condition.value)
        case "notContains":
            return isEmptyValue(raw) || !answerContains(raw, condition.value)
        case "greaterThan":
        case "greaterThanOrEquals":
        case "lessThan":
        case "lessThanOrEquals": {
            const a = numericValue(raw)
            const b = numericValue(condition.value)
            if (a === null || b === null) return false
            switch (condition.operator) {
                case "greaterThan":
                    return a > b
                case "greaterThanOrEquals":
                    return a >= b
                case "lessThan":
                    return a < b
                default:
                    return a <= b
            }
        }
        case "equals":
        default:
            return valuesEqual(raw, condition.value)
    }
}

export const evaluateRule = (
    rule: Pick<FormLogicRule, "enabled" | "combinator" | "conditions">,
    ctx: EngineContext,
): boolean => {
    if (rule.enabled === false) return false
    const conditions = (rule.conditions ?? []).filter((c) => c && c.sourceKey)
    if (conditions.length === 0) return false
    // Left-to-right fold: each condition joins to the running result with its
    // own combinator, falling back to the rule-level one (legacy rules) or AND.
    const ruleFallback = rule.combinator ?? "and"
    let result = evaluateCondition(conditions[0], ctx)
    for (let i = 1; i < conditions.length; i++) {
        const op = conditions[i].combinator ?? ruleFallback
        result =
            op === "or"
                ? result || evaluateCondition(conditions[i], ctx)
                : result && evaluateCondition(conditions[i], ctx)
    }
    return result
}

/* -------------------------------------------------------------------------- */
/* Full resolution                                                             */
/* -------------------------------------------------------------------------- */

export const resolveFormLogic = ({
    pages,
    answers,
    variables = [],
    rules,
}: ResolveFormLogicInput): ResolveFormLogicResult => {
    const pageKeys = new Set(pages.map((p) => p.pageKey))
    const variablesByName = new Map(
        variables
            .filter((v) => v && typeof v.name === "string")
            .map((v) => [v.name, v]),
    )

    const hiddenPageKeys = new Set<string>()
    const computedVariables: Record<string, number | string> = {}
    const jumpTargets: Record<string, string> = {}
    const ctx: EngineContext = { answers, variablesByName, computedVariables }

    // --- 1. Calculation variables ---------------------------------------------
    // Run first so display rules can reference freshly computed values.
    for (const rule of rules) {
        if (rule.category !== "calculation") continue
        if (rule.enabled === false) continue
        // Rules without conditions always run; otherwise they must match.
        const hasConditions = (rule.conditions ?? []).some((c) => c && c.sourceKey)
        if (hasConditions && !evaluateRule(rule, ctx)) continue

        for (const action of rule.actions ?? []) {
            if (!action || !action.variableName) continue
            const name = action.variableName

            // Operation path (current model): `set` overwrites, the rest fold the
            // operand onto the running value. Operand = literal number or @number-var.
            if (action.operation) {
                const operand = resolveCalcOperand(action.value, ctx)
                if (operand === null) continue // unresolved operand → keep previous
                const result = applyCalcOperation(
                    action.operation,
                    currentCalcValue(name, ctx),
                    operand,
                )
                if (result !== null && Number.isFinite(result)) {
                    computedVariables[name] = result
                }
                continue
            }

            // Legacy expression path.
            if (typeof action.expression === "string" && action.expression.trim() !== "") {
                try {
                    computedVariables[name] = evaluateExpression(
                        action.expression,
                        (ref): number | undefined => {
                            // Computed variables win, then static variables, then answers.
                            if (ref in computedVariables) {
                                const n = Number(computedVariables[ref])
                                return Number.isFinite(n) ? n : undefined
                            }
                            if (variablesByName.has(ref)) {
                                return numericValue(variablesByName.get(ref)!.value) ?? undefined
                            }
                            if (ctx.answers[ref] !== undefined) {
                                return numericValue(ctx.answers[ref]) ?? undefined
                            }
                            return undefined
                        },
                    )
                } catch {
                    // Unresolvable reference or empty answer: keep the previous value.
                }
            } else if (action.value !== undefined && action.value !== null) {
                // Legacy static-value path.
                computedVariables[name] = action.value as number | string
            }
        }
    }

    // --- 2. Page visibility (display / hidePage rules) ------------------------
    for (const page of pages) {
        const showRules = rules.filter(
            (r) =>
                r.category === "display" &&
                (r.actions ?? []).some((a) => a && a.targetPageKey === page.pageKey),
        )
        const hideRules = rules.filter(
            (r) =>
                r.category === "hidePage" &&
                (r.actions ?? []).some((a) => a && a.targetPageKey === page.pageKey),
        )

        const shownByRule = showRules.some((r) => evaluateRule(r, ctx))
        const hiddenByRule = hideRules.some((r) => evaluateRule(r, ctx))

        // A page with display rules is opt-in: visible only while at least one
        // rule matches. hidePage rules always win.
        if (hiddenByRule || (showRules.length > 0 && !shownByRule)) {
            hiddenPageKeys.add(page.pageKey)
        }
    }

    // --- 3. Branching (jump) targets ------------------------------------------
    for (const rule of rules) {
        if (rule.category !== "branching") continue
        if (!evaluateRule(rule, ctx)) continue

        // A branching rule belongs to the page its first page-condition reads.
        const ownerCondition = (rule.conditions ?? []).find(
            (c) => c && (!c.sourceType || c.sourceType === "page") && c.sourceKey,
        )
        const ownerKey = ownerCondition?.sourceKey
        if (!ownerKey || !pageKeys.has(ownerKey)) continue
        if (jumpTargets[ownerKey]) continue // first matching rule wins

        const action = (rule.actions ?? []).find(
            (a) => a && (a.action === "jumpToPage" || a.action === "goToEnd"),
        )
        if (!action) continue

        if (action.action === "goToEnd") {
            jumpTargets[ownerKey] = JUMP_TO_END
            continue
        }
        const target = action.targetPageKey
        if (!target || !pageKeys.has(target) || target === ownerKey) continue
        jumpTargets[ownerKey] = target
    }

    return { hiddenPageKeys, computedVariables, jumpTargets }
}

/**
 * Count the logic rules attached to a page, for the Logic Builder canvas:
 * display/hidePage rules targeting the page, branching rules reading from it,
 * and calculation rules referencing it anywhere.
 */
export const countRulesForPage = (rules: FormLogicRule[], pageKey: string): number =>
    rules.filter((rule) => {
        const targeted = (rule.actions ?? []).some((a) => a?.targetPageKey === pageKey)
        const referenced = (rule.conditions ?? []).some(
            (c) => (!c.sourceType || c.sourceType === "page") && c.sourceKey === pageKey,
        )
        const inExpression = (rule.actions ?? []).some((a) =>
            typeof a?.expression === "string" ? a.expression.includes(`@${pageKey}`) : false,
        )
        return targeted || referenced || inExpression
    }).length





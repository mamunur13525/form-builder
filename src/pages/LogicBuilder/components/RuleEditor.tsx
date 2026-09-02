/**
 * Editor for a single logic rule.
 *
 * Layout follows the reference design: a slate-bordered white card with a
 * header (title "Rule N: …" + Enabled toggle) and a body of stacked rows —
 * an IF row per condition with AND/OR joins, a "+ Add condition" button, an
 * `hr` divider, then a THEN row whose selects depend on the rule category.
 * The footer carries the cancel/save buttons and any save error.
 *
 * Selects and buttons follow the project's editorial tokens
 * (`CONTROL_CLASS` / `OVERLAY_CLASS`) so they sit visually with the rest of
 * the form builder.
 */

import { useEffect, useMemo } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import type {
    FormLogicRule,
    FormVariable,
    FormPage,
    LogicCalcOperation,
    LogicCondition,
    LogicCombinator,
    LogicOperator,
} from "../../../shared/types/common";
import {
    OPERATORS_WITH_VALUE,
    OPERATOR_OPTIONS,
    NUMERIC_ONLY_OPERATORS,
    CALC_OPERATIONS,
    type SectionConfig,
} from "./logicEditorConfig";
import { emptyCondition } from "./ruleUtils";

interface RuleEditorProps {
    rule: FormLogicRule
    section: SectionConfig
    pages: FormPage[]
    /** The page currently selected in the dialog — page-answer conditions read from it. */
    selectedPageKey: string
    variables: FormVariable[]
    /** 1-based index — shown as "Rule N: …" in the header. */
    index: number
    /** Live edits while the user types — updates the draft, no API call. */
    onUpdate: (rule: FormLogicRule) => void
    /** Save button — persists the rule through the logic API. */
    onSave: (rule: FormLogicRule) => void
    /** API error from the last save attempt, shown next to the Save button. */
    error?: string | null
    onCancel: () => void
}

/** Editorial control height — matches the form-builder's CONTROL_CLASS but a hair taller. */
export const TRIGGER_CLASS =
    "h-11 w-fit rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-[15px] text-[var(--foreground)] hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] data-[placeholder]:text-[var(--editorial-subtle)]"

/**
 * Tiered widths by tag kind — every select only takes the space its content
 * needs. Short labels (AND/OR, operators) get the smallest width; long page
 * labels and question names can grow as needed.
 *
 *  - short : single-token (AND/OR, operators, calc op, operand-type)
 *  - medium: question / value / variable / branching action / target-var
 *  - long  : page picker / operand variable
 */
const WIDTH_SHORT = "min-w-[7rem]"
const WIDTH_MEDIUM = "min-w-[15rem] max-w-[19rem]"
const WIDTH_LONG = "min-w-[18rem] max-w-[22rem]"

/** Centered aligner for the IF / THEN label, matches the trigger height. */
const LABEL_CLASS =
    "inline-flex h-11 w-12 shrink-0 items-center justify-center text-[15px] font-bold text-[var(--foreground)]"

/** Portalled select popup — inherits the `.editorial` subtree styling. */
const OVERLAY_CLASS =
    "editorial rounded-xl border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"

/** A select trigger with the project's editorial look. */
function Trigger({
    className,
    ...props
}: React.ComponentProps<typeof SelectTrigger>) {
    return <SelectTrigger {...props} className={cn(TRIGGER_CLASS, className)} />
}

/** Editorial input field that matches the select trigger height/width. */
const INPUT_CLASS =
    "h-9 rounded-xl border-[var(--input)] bg-[var(--secondary)] px-4 text-[15px] text-[var(--foreground)] placeholder:text-[var(--editorial-subtle)] hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] focus-visible:outline-none"

export function RuleEditor({
    rule,
    section,
    pages,
    selectedPageKey,
    variables,
    index,
    onUpdate,
    onSave,
    error,
    onCancel,
}: RuleEditorProps) {
    const action = (rule.actions ?? [])[0]
    const title = rule.name?.trim() || "Untitled rule"

    // Page-answer conditions always read from the currently selected page, so
    // keep their sourceKey pinned to it. Covers new rules, added conditions, a
    // source-type switch back to "page", and rules loaded from the API that
    // referenced a different page.
    useEffect(() => {
        const conditions = rule.conditions ?? []
        const needsBinding = conditions.some(
            (c) => c.sourceType === "page" && c.sourceKey !== selectedPageKey,
        )
        if (!needsBinding) return
        onUpdate({
            ...rule,
            conditions: conditions.map((c) =>
                c.sourceType === "page" ? { ...c, sourceKey: selectedPageKey } : c,
            ),
        })
    }, [rule, selectedPageKey, onUpdate])

    const numericSources = useMemo(() => {
        const set = new Set<string>()
        for (const p of pages) {
            if (["number", "rating", "opinionScale", "date", "time"].includes(p.type)) {
                set.add(p.pageKey)
            }
        }
        for (const v of variables) {
            if (v.type === "number") set.add(v.name)
        }
        return set
    }, [pages, variables])

    const setCondition = (conditionIndex: number, patch: Partial<LogicCondition>) => {
        const conditions = [...(rule.conditions ?? [])]
        conditions[conditionIndex] = { ...conditions[conditionIndex], ...patch }
        onUpdate({ ...rule, conditions })
    }

    const addCondition = () => {
        onUpdate({
            ...rule,
            conditions: [
                ...(rule.conditions ?? []),
                { ...emptyCondition(selectedPageKey), combinator: "and" as LogicCombinator },
            ],
        })
    }

    const removeCondition = (conditionIndex: number) => {
        const conditions = (rule.conditions ?? []).filter((_, i) => i !== conditionIndex)
        onUpdate({ ...rule, conditions })
    }

    const setAction = (patch: Partial<NonNullable<FormLogicRule["actions"]>[number]>) => {
        onUpdate({ ...rule, actions: [{ ...action, ...patch }] })
    }

    // Which operator options apply to the current source.
    const operatorOptions = useMemo(() => {
        const source = (rule.conditions ?? [])[0]
        if (!source?.sourceKey) return OPERATOR_OPTIONS
        const isNumeric = numericSources.has(source.sourceKey)
        if (isNumeric) return OPERATOR_OPTIONS
        return OPERATOR_OPTIONS.filter((o) => !NUMERIC_ONLY_OPERATORS.includes(o.value))
    }, [rule.conditions, numericSources])

    // Value choices when the source is a choice page.
    const valueOptions = useMemo(() => {
        const source = (rule.conditions ?? [])[0]
        if (!source?.sourceKey || source.sourceType !== "page") return []
        const page = pages.find((p) => p.pageKey === source.sourceKey)
        if (!page) return []
        return source.operator === "contains" || source.operator === "notContains"
            ? []
            : (page.options ?? []).filter((o) => o.value != null || o.label != null)
    }, [rule.conditions, pages])

    const isCalculation = section.category === "calculation"
    const numberVariables = useMemo(
        () => variables.filter((v) => v.type === "number"),
        [variables],
    )
    const operandRaw =
        typeof action?.value === "string"
            ? action.value
            : action?.value != null
              ? String(action.value)
              : ""
    const operandIsVariable = operandRaw.startsWith("@")
    const operandVarName = operandIsVariable ? operandRaw.slice(1) : ""
    const operandNumber = operandIsVariable ? "" : operandRaw

    const ruleEnabled = rule.enabled !== false

    return (
        <div className="editorial overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Header — title + enabled toggle */}
            <header className="flex items-center justify-between gap-3 border-b border-[var(--editorial-border-light)] px-6 py-4 sm:px-8 sm:py-5">
                <h2 className="truncate text-base font-semibold text-[var(--foreground)] sm:text-lg">
                    Rule {index}: {title}
                </h2>
                <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[15px] font-medium text-[var(--editorial-body)]">
                        Enabled
                    </span>
                    <Switch
                        size="sm"
                        checked={ruleEnabled}
                        onCheckedChange={(checked) => onUpdate({ ...rule, enabled: checked })}
                        aria-label="Toggle rule enabled"
                    />
                </div>
            </header>

            {/* Body — IF/THEN rows */}
            <div className="px-6 py-5 sm:px-8 sm:py-6">
                {(rule.conditions ?? []).map((condition, conditionIndex) => {
                    const hasValue = OPERATORS_WITH_VALUE.has(condition.operator)
                    const showValueSelect = valueOptions.length > 0 && hasValue
                    const isFirst = conditionIndex === 0
                    return (
                        <div key={conditionIndex} className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                {isFirst ? (
                                    <span className={LABEL_CLASS}>IF</span>
                                ) : (
                                    <Select
                                        value={condition.combinator ?? "and"}
                                        onValueChange={(v) => {
                                            if (v === "and" || v === "or") {
                                                setCondition(conditionIndex, { combinator: v })
                                            }
                                        }}
                                    >
                                        <Trigger
                                            aria-label="Combine with previous condition"
                                            className="w-16 font-bold"
                                        >
                                            <SelectValue />
                                        </Trigger>
                                        <SelectContent className={OVERLAY_CLASS}>
                                            <SelectItem value="and">AND</SelectItem>
                                            <SelectItem value="or">OR</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select
                                    value={condition.sourceType === "variable" ? "variable" : "page"}
                                    onValueChange={(v) => {
                                        if (v !== "page" && v !== "variable") return
                                        setCondition(conditionIndex, {
                                            sourceType: v,
                                            sourceKey: v === "page" ? selectedPageKey : "",
                                            operator: "equals",
                                            value: "",
                                        })
                                    }}
                                >
                                    <Trigger
                                        aria-label="Condition source type"
                                        className={WIDTH_MEDIUM}
                                    >
                                        <SelectValue placeholder="Select Question…" />
                                    </Trigger>
                                    <SelectContent className={OVERLAY_CLASS}>
                                        <SelectItem value="page">a page answer</SelectItem>
                                        <SelectItem value="variable">a variable</SelectItem>
                                    </SelectContent>
                                </Select>

                                {condition.sourceType === "variable" && (
                                    <Select
                                        value={condition.sourceKey || null}
                                        onValueChange={(v) => {
                                            if (!v) return
                                            setCondition(conditionIndex, {
                                                sourceKey: v,
                                                value: "",
                                            })
                                        }}
                                    >
                                        <Trigger
                                            aria-label="Variable"
                                            className={WIDTH_MEDIUM}
                                        >
                                            <SelectValue placeholder="Select variable…" />
                                        </Trigger>
                                        <SelectContent className={OVERLAY_CLASS}>
                                            {variables.map((v) => (
                                                <SelectItem key={v.name} value={v.name}>
                                                    @{v.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                <Select
                                    value={condition.operator}
                                    onValueChange={(v) => {
                                        if (v) setCondition(conditionIndex, { operator: v as LogicOperator })
                                    }}
                                >
                                    <Trigger aria-label="Operator" className={WIDTH_SHORT}>
                                        <SelectValue />
                                    </Trigger>
                                    <SelectContent className={OVERLAY_CLASS}>
                                        {operatorOptions.map((o) => (
                                            <SelectItem key={o.value} value={o.value}>
                                                {o.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {hasValue &&
                                    (showValueSelect ? (
                                        <Select
                                            value={
                                                condition.value == null || condition.value === ""
                                                    ? null
                                                    : String(condition.value)
                                            }
                                            onValueChange={(v) => {
                                                if (v != null)
                                                    setCondition(conditionIndex, { value: v })
                                            }}
                                        >
<Trigger
                                            aria-label="Value"
                                            className={WIDTH_MEDIUM}
                                        >
                                            <SelectValue placeholder="Select Value…" />
                                        </Trigger>
                                            <SelectContent className={OVERLAY_CLASS}>
                                                {valueOptions.map((o) => (
                                                    <SelectItem
                                                        key={o.value ?? o.label}
                                                        value={o.value ?? o.label ?? ""}
                                                    >
                                                        {o.label ?? o.value}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <Input
                                            type={
                                                condition.sourceType === "page" && isCalculation
                                                    ? "number"
                                                    : "text"
                                            }
                                            value={String(condition.value ?? "")}
                                            onChange={(e) =>
                                                setCondition(conditionIndex, {
                                                    value: e.target.value,
                                                })
                                            }
                                            className={cn(INPUT_CLASS, WIDTH_MEDIUM)}
                                            placeholder="Value"
                                        />
                                    ))}

                                {(rule.conditions ?? []).length > 1 && (
                                    <button
                                        type="button"
                                        aria-label="Remove condition"
                                        onClick={() => removeCondition(conditionIndex)}
                                        className="ml-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--destructive)]"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )
                })}

                <button
                    type="button"
                    onClick={addCondition}
                    className="mt-3 ml-20 inline-flex h-11 items-center gap-1.5 rounded-xl px-3 text-[15px] font-medium text-[var(--primary)] transition-colors hover:bg-[var(--editorial-primary-selected)]"
                >
                    <Plus className="h-4 w-4" /> Add condition
                </button>

                <hr className="my-5 border-[var(--editorial-border-light)]" />

                {/* THEN row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className={LABEL_CLASS}>THEN</span>

                    {section.category === "branching" ? (
                        <>
                            <Select
                                value={action?.action ?? "jumpToPage"}
                                onValueChange={(v) => {
                                    if (v !== "jumpToPage" && v !== "goToEnd") return
                                    setAction({
                                        action: v,
                                        targetPageKey:
                                            v === "goToEnd" ? undefined : action?.targetPageKey,
                                    })
                                }}
                            >
                                <Trigger
                                    aria-label="Branching action"
                                    className={WIDTH_MEDIUM}
                                >
                                    <SelectValue />
                                </Trigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    {section.actionOptions.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {action?.action !== "goToEnd" && (
                                <Select
                                    value={action.targetPageKey || null}
                                    onValueChange={(v) => {
                                        if (!v) return
                                        setAction({ targetPageKey: v })
                                    }}
                                >
<Trigger
                                    aria-label="Jump target page"
                                    className={WIDTH_LONG}
                                >
                                    <SelectValue placeholder="Select a page…" />
                                </Trigger>
                                    <SelectContent className={OVERLAY_CLASS}>
                                        {pages
                                            .filter(
                                                (p) =>
                                                    p.pageKey !== rule.conditions?.[0]?.sourceKey,
                                            )
                                            .map((p) => (
                                                <SelectItem key={p.pageKey} value={p.pageKey}>
                                                    {p.label || p.pageKey}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </>
                    ) : isCalculation ? (
                        <>
                            <Select
                                value={action?.variableName || null}
                                onValueChange={(v) => {
                                    if (!v) return
                                    setAction({ variableName: v })
                                }}
                            >
                                <Trigger
                                    aria-label="Target variable"
                                    className={WIDTH_MEDIUM}
                                >
                                    <SelectValue placeholder="Select a variable…" />
                                </Trigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    {numberVariables.map((v) => (
                                        <SelectItem key={v.name} value={v.name}>
                                            @{v.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={action?.operation ?? "set"}
                                onValueChange={(v) => {
                                    if (v) setAction({ operation: v as LogicCalcOperation })
                                }}
                            >
                                <Trigger aria-label="Calculation operation" className={WIDTH_SHORT}>
                                    <SelectValue />
                                </Trigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    {CALC_OPERATIONS.map((o) => (
                                        <SelectItem key={o.value} value={o.value}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={operandIsVariable ? "variable" : "number"}
                                onValueChange={(v) => {
                                    if (v === "variable" || v === "number") {
                                        setAction({ value: v === "variable" ? "@" : "" })
                                    }
                                }}
                            >
                                <Trigger aria-label="Operand type" className={WIDTH_SHORT}>
                                    <SelectValue />
                                </Trigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    <SelectItem value="number">a number</SelectItem>
                                    <SelectItem value="variable">a variable</SelectItem>
                                </SelectContent>
                            </Select>
                            {operandIsVariable ? (
                                <Select
                                    value={operandVarName || null}
                                    onValueChange={(v) => {
                                        if (!v) return
                                        setAction({ value: `@${v}` })
                                    }}
                                >
<Trigger
                                    aria-label="Operand variable"
                                    className={WIDTH_LONG}
                                >
                                    <SelectValue placeholder="Select a variable…" />
                                </Trigger>
                                    <SelectContent className={OVERLAY_CLASS}>
                                        {numberVariables.map((v) => (
                                            <SelectItem key={v.name} value={v.name}>
                                                @{v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Input
                                    type="number"
                                    value={operandNumber}
                                    onChange={(e) => setAction({ value: e.target.value })}
                                    className={cn(INPUT_CLASS, WIDTH_MEDIUM)}
                                    placeholder="e.g. 5"
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <span
                                className={cn(
                                    INPUT_CLASS,
                                    WIDTH_MEDIUM,
                                    "shrink-0 font-medium text-[var(--editorial-body)]",
                                )}
                            >
                                {section.title}
                            </span>
                            <Select
                                value={action?.targetPageKey || null}
                                onValueChange={(v) => {
                                    if (!v) return
                                    setAction({ targetPageKey: v })
                                }}
                            >
                                <Trigger
                                    aria-label="Target page"
                                    className={WIDTH_LONG}
                                >
                                    <SelectValue placeholder="Select a page…" />
                                </Trigger>
                                <SelectContent className={OVERLAY_CLASS}>
                                    {pages.map((p) => (
                                        <SelectItem key={p.pageKey} value={p.pageKey}>
                                            {p.label || p.pageKey}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="flex items-center justify-end gap-3 border-t border-[var(--editorial-border-light)] px-6 py-4 sm:px-8 sm:py-5">
                {error && (
                    <span className="mr-auto text-sm font-medium text-[var(--destructive)]">
                        {error}
                    </span>
                )}
                <Button
                    variant="outline"
                    size="lg"
                    onClick={onCancel}
                    className="h-11 rounded-xl px-6 text-[15px]"
                >
                    Cancel
                </Button>
                <Button
                    size="lg"
                    onClick={() => onSave(rule)}
                    className="h-11 rounded-xl px-6 text-[15px]"
                >
                    Save rule
                </Button>
            </footer>
        </div>
    )
}
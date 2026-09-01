/**
 * Editor for a single logic rule — condition rows (AND/OR combinable) plus the
 * category-specific action row (target page / variable expression), with the
 * save/cancel footer. Controls are shadcn/ui Select, Input and Switch.
 */

import { useEffect, useMemo } from "react";
import { Plus, Trash2, Save } from "lucide-react";
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

/** Compact editorial styling shared by every select trigger in the editor. */
const selectTriggerClass =
    "rounded-md border-[var(--border)] bg-[var(--secondary)] px-2 text-[13px] hover:bg-[var(--editorial-primary-selected)]"

/** Compact editorial styling shared by every input in the editor. */
const inputClass =
    "h-8 rounded-md border-[var(--border)] bg-[var(--secondary)] px-2 text-[13px]"

interface RuleEditorProps {
    rule: FormLogicRule
    section: SectionConfig
    pages: FormPage[]
    /** The page currently selected in the dialog — page-answer conditions read from it. */
    selectedPageKey: string
    variables: FormVariable[]
    /** Live edits while the user types — updates the draft, no API call. */
    onUpdate: (rule: FormLogicRule) => void
    /** Save button — persists the rule through the logic API. */
    onSave: (rule: FormLogicRule) => void
    /** API error from the last save attempt, shown next to the Save button. */
    error?: string | null
    onCancel: () => void
}

export function RuleEditor({ rule, section, pages, selectedPageKey, variables, onUpdate, onSave, error, onCancel }: RuleEditorProps) {
    const action = (rule.actions ?? [])[0]

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

    const setCondition = (index: number, patch: Partial<LogicCondition>) => {
        const conditions = [...(rule.conditions ?? [])]
        conditions[index] = { ...conditions[index], ...patch }
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

    const removeCondition = (index: number) => {
        const conditions = (rule.conditions ?? []).filter((_, i) => i !== index)
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
        // Choice/text sources filter the numeric-only operators out.
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

    // Calculation target/operand only ever reference number-typed variables.
    const numberVariables = useMemo(
        () => variables.filter((v) => v.type === "number"),
        [variables],
    )
    // The operand is stored in `action.value`: a `@name` string for a variable
    // operand, or a plain (numeric) string for a literal. Derive the UI state.
    const operandRaw =
        typeof action?.value === "string"
            ? action.value
            : action?.value != null
              ? String(action.value)
              : ""
    const operandIsVariable = operandRaw.startsWith("@")
    const operandVarName = operandIsVariable ? operandRaw.slice(1) : ""
    const operandNumber = operandIsVariable ? "" : operandRaw

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--editorial-primary-ring)] bg-[var(--secondary)] p-4">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--foreground)]">
                <Switch
                    size="sm"
                    checked={rule.enabled !== false}
                    onCheckedChange={(checked) => onUpdate({ ...rule, enabled: checked })}
                    aria-label="Rule enabled"
                />
                Rule enabled
            </label>

            {/* Conditions */}
            <div className="flex flex-col gap-2">
                {(rule.conditions ?? []).map((condition, index) => {
                    const hasValue = OPERATORS_WITH_VALUE.has(condition.operator)
                    const showValueSelect = valueOptions.length > 0 && hasValue
                    const sourceIsPage = condition.sourceType === "page"
                    return (
                        <div key={index} className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--card)] p-2.5 text-[13px]">
                            {index === 0 ? (
                                <span className="font-semibold text-[var(--editorial-subtle)]">
                                    When
                                </span>
                            ) : (
                                <Select
                                    value={condition.combinator ?? "and"}
                                    onValueChange={(v) => {
                                        if (v === "and" || v === "or") {
                                            setCondition(index, { combinator: v })
                                        }
                                    }}
                                >
                                    <SelectTrigger
                                        size="sm"
                                        aria-label="Combine with previous condition"
                                        className={`${selectTriggerClass} w-20 font-semibold uppercase text-[var(--primary)]`}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="editorial">
                                        <SelectItem value="and">AND</SelectItem>
                                        <SelectItem value="or">OR</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}

                            <Select
                                value={condition.sourceType}
                                onValueChange={(v) => {
                                    if (v !== "page" && v !== "variable") return
                                    setCondition(index, {
                                        sourceType: v,
                                        sourceKey: v === "page" ? selectedPageKey : "",
                                        operator: "equals",
                                        value: "",
                                    })
                                }}
                            >
                                <SelectTrigger
                                    size="sm"
                                    aria-label="Condition source type"
                                    className={`${selectTriggerClass} w-36`}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="editorial">
                                    <SelectItem value="page">a page answer</SelectItem>
                                    <SelectItem value="variable">a variable</SelectItem>
                                </SelectContent>
                            </Select>

                            {condition.sourceType === "variable" && (
                                <Select
                                    value={condition.sourceKey || null}
                                    onValueChange={(v) => {
                                        if (!v) return
                                        setCondition(index, { sourceKey: v, value: "" })
                                    }}
                                >
                                    <SelectTrigger
                                        size="sm"
                                        aria-label="Variable"
                                        className={`${selectTriggerClass} w-44`}
                                    >
                                        <SelectValue placeholder="Select…" />
                                    </SelectTrigger>
                                    <SelectContent className="editorial">
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
                                    if (v) setCondition(index, { operator: v as LogicOperator })
                                }}
                            >
                                <SelectTrigger size="sm" aria-label="Operator" className={`${selectTriggerClass} w-52`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="editorial">
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
                                            if (v != null) setCondition(index, { value: v })
                                        }}
                                    >
                                        <SelectTrigger size="sm" aria-label="Value" className={`${selectTriggerClass} w-44`}>
                                            <SelectValue placeholder="Select…" />
                                        </SelectTrigger>
                                        <SelectContent className="editorial">
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
                                ) : sourceIsPage && isCalculation ? (
                                    <Input
                                        type="number"
                                        value={String(condition.value ?? "")}
                                        onChange={(e) =>
                                            setCondition(index, { value: e.target.value })
                                        }
                                        className={`${inputClass} w-24`}
                                        placeholder="Value"
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        value={String(condition.value ?? "")}
                                        onChange={(e) =>
                                            setCondition(index, { value: e.target.value })
                                        }
                                        className={`${inputClass} w-24`}
                                        placeholder="Value"
                                    />
                                ))}

                            <button
                                type="button"
                                aria-label="Remove condition"
                                onClick={() => removeCondition(index)}
                                disabled={(rule.conditions ?? []).length <= 1}
                                className="ml-auto text-[var(--editorial-subtle)] hover:text-[var(--destructive)] disabled:opacity-40"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )
                })}
                <button
                    type="button"
                    onClick={addCondition}
                    className="flex w-fit items-center gap-1 text-[13px] font-medium text-[var(--primary)] hover:underline"
                >
                    <Plus className="h-3.5 w-3.5" /> Add condition
                </button>
            </div>

            {/* Action */}
            <div className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--card)] p-2.5 text-[13px]">
                {section.category === "branching" ? (
                    <>
                        <span className="font-semibold text-[var(--editorial-subtle)]">Then</span>
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
                            <SelectTrigger
                                size="sm"
                                aria-label="Branching action"
                                className={`${selectTriggerClass} w-40`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="editorial">
                                {section.actionOptions.map((o) => (
                                    <SelectItem key={o.value} value={o.value}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {action?.action === "jumpToPage" && (
                            <Select
                                value={action.targetPageKey || null}
                                onValueChange={(v) => {
                                    if (!v) return
                                    setAction({ targetPageKey: v })
                                }}
                            >
                                <SelectTrigger
                                    size="sm"
                                    aria-label="Jump target page"
                                    className={`${selectTriggerClass} w-56`}
                                >
                                    <SelectValue placeholder="Select a page…" />
                                </SelectTrigger>
                                <SelectContent className="editorial">
                                    {pages
                                        .filter(
                                            (p) => p.pageKey !== rule.conditions?.[0]?.sourceKey,
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
                            <SelectTrigger
                                size="sm"
                                aria-label="Target variable"
                                className={`${selectTriggerClass} w-44 font-medium`}
                            >
                                <SelectValue placeholder="Select a variable…" />
                            </SelectTrigger>
                            <SelectContent className="editorial">
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
                            <SelectTrigger
                                size="sm"
                                aria-label="Calculation operation"
                                className={`${selectTriggerClass} w-36`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="editorial">
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
                            <SelectTrigger
                                size="sm"
                                aria-label="Operand type"
                                className={`${selectTriggerClass} w-32`}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="editorial">
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
                                <SelectTrigger
                                    size="sm"
                                    aria-label="Operand variable"
                                    className={`${selectTriggerClass} w-44 font-medium`}
                                >
                                    <SelectValue placeholder="Select a variable…" />
                                </SelectTrigger>
                                <SelectContent className="editorial">
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
                                className={`${inputClass} w-28`}
                                placeholder="e.g. 5"
                            />
                        )}
                    </>
                ) : (
                    <span className="font-semibold text-[var(--editorial-subtle)]">
                        {section.title} → target page
                    </span>
                )}
            </div>

            {isCalculation && (
                <p className="text-xs leading-relaxed text-[var(--editorial-subtle)]">
                    Calculations run on <span className="font-medium text-[var(--foreground)]">number</span>{" "}
                    variables only. <span className="font-medium text-[var(--foreground)]">Set to</span> replaces the
                    value; the other operations apply to the variable's running value. The operand can be a number or
                    another number variable.
                </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-1">
                {error && (
                    <span className="mr-auto text-xs font-medium text-[var(--destructive)]">
                        {error}
                    </span>
                )}
                <Button variant="outline" size="sm" onClick={onCancel}>
                    Cancel
                </Button>
                <Button size="sm" onClick={() => onSave(rule)}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save rule
                </Button>
            </div>
        </div>
    )
}

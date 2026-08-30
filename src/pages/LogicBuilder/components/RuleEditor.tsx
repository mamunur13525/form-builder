/**
 * Editor for a single logic rule — condition rows (AND/OR combinable) plus the
 * category-specific action row (target page / variable expression), with the
 * save/cancel footer.
 */

import { useEffect, useMemo } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type {
    FormLogicRule,
    FormVariable,
    FormPage,
    LogicCondition,
    LogicCombinator,
    LogicOperator,
    LogicSourceType,
} from "../../../shared/types/common";
import {
    OPERATORS_WITH_VALUE,
    OPERATOR_OPTIONS,
    NUMERIC_ONLY_OPERATORS,
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

    return (
        <div className="flex flex-col gap-3 rounded-xl border border-[var(--editorial-primary-ring)] bg-[var(--secondary)] p-4">
            <label className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--foreground)]">
                <input
                    type="checkbox"
                    checked={rule.enabled !== false}
                    onChange={(e) => onUpdate({ ...rule, enabled: e.target.checked })}
                    className="h-3.5 w-3.5 accent-[var(--primary)]"
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
                                <select
                                    value={condition.combinator ?? "and"}
                                    onChange={(e) =>
                                        setCondition(index, {
                                            combinator: e.target.value as LogicCombinator,
                                        })
                                    }
                                    className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px] font-semibold uppercase text-[var(--primary)]"
                                    aria-label="Combine with previous condition"
                                >
                                    <option value="and">AND</option>
                                    <option value="or">OR</option>
                                </select>
                            )}
                            <select
                                value={condition.sourceType}
                                onChange={(e) => {
                                    const nextType = e.target.value as LogicSourceType
                                    setCondition(index, {
                                        sourceType: nextType,
                                        sourceKey: nextType === "page" ? selectedPageKey : "",
                                        operator: "equals",
                                        value: "",
                                    })
                                }}
                                className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                            >
                                <option value="page">a page answer</option>
                                <option value="variable">a variable</option>
                            </select>

                            {condition.sourceType === "variable" && (
                                <select
                                    value={condition.sourceKey}
                                    onChange={(e) =>
                                        setCondition(index, { sourceKey: e.target.value, value: "" })
                                    }
                                    className="min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                                >
                                    <option value="">Select…</option>
                                    {variables.map((v) => (
                                        <option key={v.name} value={v.name}>
                                            @{v.name}
                                        </option>
                                    ))}
                                </select>
                            )}

                            <select
                                value={condition.operator}
                                onChange={(e) =>
                                    setCondition(index, { operator: e.target.value as LogicOperator })
                                }
                                className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                            >
                                {operatorOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                            {hasValue &&
                                (showValueSelect ? (
                                    <select
                                        value={String(condition.value ?? "")}
                                        onChange={(e) =>
                                            setCondition(index, { value: e.target.value })
                                        }
                                        className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                                    >
                                        <option value="">Select…</option>
                                        {valueOptions.map((o) => (
                                            <option
                                                key={o.value ?? o.label}
                                                value={o.value ?? o.label ?? ""}
                                            >
                                                {o.label ?? o.value}
                                            </option>
                                        ))}
                                    </select>
                                ) : sourceIsPage && isCalculation ? (
                                    <input
                                        type="number"
                                        value={String(condition.value ?? "")}
                                        onChange={(e) =>
                                            setCondition(index, { value: e.target.value })
                                        }
                                        className="w-24 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                                        placeholder="Value"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        value={String(condition.value ?? "")}
                                        onChange={(e) =>
                                            setCondition(index, { value: e.target.value })
                                        }
                                        className="w-24 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
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
                        <select
                            value={action?.action ?? "jumpToPage"}
                            onChange={(e) =>
                                setAction({
                                    action: e.target.value as "jumpToPage" | "goToEnd",
                                    targetPageKey:
                                        e.target.value === "goToEnd"
                                            ? undefined
                                            : action?.targetPageKey,
                                })
                            }
                            className="rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                        >
                            {section.actionOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                        {action?.action === "jumpToPage" && (
                            <select
                                value={action.targetPageKey ?? ""}
                                onChange={(e) => setAction({ targetPageKey: e.target.value })}
                                className="min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                            >
                                <option value="">Select a page…</option>
                                {pages
                                    .filter((p) => p.pageKey !== rule.conditions?.[0]?.sourceKey)
                                    .map((p) => (
                                        <option key={p.pageKey} value={p.pageKey}>
                                            {p.label || p.pageKey}
                                        </option>
                                    ))}
                            </select>
                        )}
                    </>
                ) : isCalculation ? (
                    <>
                        <span className="font-semibold text-[var(--editorial-subtle)]">Set</span>
                        <select
                            value={action?.variableName ?? ""}
                            onChange={(e) => setAction({ variableName: e.target.value })}
                            className="min-w-[140px] rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 text-[13px]"
                        >
                            <option value="">Select a variable…</option>
                            {variables
                                .filter((v) => v.type === "number")
                                .map((v) => (
                                    <option key={v.name} value={v.name}>
                                        @{v.name}
                                    </option>
                                ))}
                        </select>
                        <span className="text-[var(--editorial-subtle)]">=</span>
                        <input
                            type="text"
                            value={action?.expression ?? ""}
                            onChange={(e) => setAction({ expression: e.target.value })}
                            className="min-w-[180px] flex-1 rounded-md border border-[var(--border)] bg-[var(--secondary)] px-2 py-1 font-mono text-[13px]"
                            placeholder="e.g. @page_key + @score"
                        />
                    </>
                ) : (
                    <span className="font-semibold text-[var(--editorial-subtle)]">
                        {section.title} → target page
                    </span>
                )}
            </div>

            {isCalculation && (
                <p className="text-xs leading-relaxed text-[var(--editorial-subtle)]">
                    Use <code className="font-mono">@page_key</code> (a number answer) or{" "}
                    <code className="font-mono">@variable</code> (a number variable). Operations:{" "}
                    <code className="font-mono">+ - * / % ^ ( )</code>
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

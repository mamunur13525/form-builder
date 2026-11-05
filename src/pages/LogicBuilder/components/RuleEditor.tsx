/**
 * Editor for a single logic rule.
 *
 * Layout follows the reference design: an overflow-hidden rounded card with a
 * header (numbered badge + "Rule #N", delete + collapse buttons), a body of
 * condition rows ("If the answer <op> <value>" pills joined by OR/AND divider
 * buttons), an "+ Condition" link, and a footer with the THEN row plus
 * cancel/save buttons.
 *
 * Selects and buttons follow the project's editorial tokens
 * (`TRIGGER_CLASS` / `OVERLAY_CLASS`) so they sit visually with the rest of
 * the form builder.
 */

import { useEffect, useMemo } from "react";
import {
    ChevronDown,
    Circle,
    CircleSlash,
    Equal,
    Hash,
    List,
    Maximize2,
    Minimize2,
    Plus,
    Slash,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
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
import type { LucideIcon } from "lucide-react";
import {
    PAGE_TYPE_COLORS,
    PAGE_TYPE_ICONS,
} from "../../../shared/constants/form-types";

interface RuleEditorProps {
    rule: FormLogicRule
    section: SectionConfig
    pages: FormPage[]
    /** The page currently selected in the dialog — page-answer conditions read from it. */
    selectedPageKey: string
    variables: FormVariable[]
    /** 1-based index — shown as "Rule #N" in the header badge. */
    index: number
    /** Live edits while the user types — updates the draft, no API call. */
    onUpdate: (rule: FormLogicRule) => void
    /** Save button — persists the rule through the logic API. */
    onSave: (rule: FormLogicRule) => void
    /** API error from the last save attempt, shown next to the Save button. */
    error?: string | null
    onCancel: () => void
}

/** Editorial select trigger — styled like the reference design's pill buttons. */
export const TRIGGER_CLASS =
    "h-9 rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] text-[var(--foreground)] shadow-sm hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] data-[placeholder]:text-[var(--editorial-subtle)]"

/** Portalled select popup — inherits the `.editorial` subtree styling. */
const OVERLAY_CLASS =
    "editorial rounded-xl border border-[var(--border)] bg-[var(--popover)] text-[var(--foreground)]"

/** Editorial input field that matches the select trigger height/width. */
const INPUT_CLASS =
    "h-9 rounded-lg border-[var(--input)] bg-[var(--card)] px-3.5 text-[15px] text-[var(--foreground)] placeholder:text-[var(--editorial-subtle)] shadow-sm hover:border-[var(--editorial-primary-ring)] focus-visible:border-[var(--ring)] focus-visible:outline-none"

/** Pill-style select trigger wrapper. */
function Trigger({
    className,
    ...props
}: React.ComponentProps<typeof SelectTrigger>) {
    return <SelectTrigger {...props} className={cn(TRIGGER_CLASS, className)} />
}

/** Fixed-width combinator select (AND / OR divider button between rows). */
const COMBINATOR_CLASS =
    "h-9 rounded-lg border-none bg-[var(--secondary)] px-3.5 text-[15px] font-medium text-[var(--foreground)] shadow-none hover:bg-[var(--accent)]"

/** Icon per comparison operator — shown in the operator trigger and items. */
export const OPERATOR_ICONS: Record<LogicOperator, LucideIcon> = {
    equals: Equal,
    notEquals: Slash,
    contains: Maximize2,
    notContains: Minimize2,
    greaterThan: Hash,
    greaterThanOrEquals: Hash,
    lessThan: Hash,
    lessThanOrEquals: Hash,
    isEmpty: CircleSlash,
    isNotEmpty: Circle,
}

/** "If the answer" row label. */
const IF_LABEL_CLASS =
    "w-[90px] shrink-0 text-[15px] text-[var(--foreground)] whitespace-nowrap"

/** Amber-ish chip shown inside page selectors — icon + page number. */
const PAGE_CHIP_CLASS =
    "flex shrink-0 items-center gap-1.5 rounded-md bg-[var(--editorial-primary-selected)] px-2 py-0.5 text-xs font-semibold text-[var(--editorial-primary)]"

/** Page-type chip — tinted, shows the page-type icon + page number. */
export function PageTypeChip({
    page,
    pageNumber,
}: {
    page: FormPage
    pageNumber: number
}) {
    const Icon = PAGE_TYPE_ICONS[page.type]
    return (
        <span
            className={`flex shrink-0 items-center gap-1.5 rounded-md bg-gradient-to-br px-2 py-0.5 text-xs font-semibold ${PAGE_TYPE_COLORS[page.type]}`}
        >
            {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
            Q{pageNumber}
        </span>
    )
}

/** Trigger / item content for a page select: page-type chip, then title. */
function PageSelectContent({
    page,
    pageNumber,
    placeholder,
}: {
    page?: FormPage
    pageNumber: number | null
    placeholder?: string
}) {
    return (
        <span className="flex min-w-0 items-center gap-2 truncate">
            {pageNumber != null &&
                (page ? (
                    <PageTypeChip page={page} pageNumber={pageNumber} />
                ) : (
                    <span className={PAGE_CHIP_CLASS}>
                        <List className="h-3.5 w-3.5" aria-hidden />
                        Q{pageNumber}
                    </span>
                ))}
            <span className="min-w-0 truncate">
                {page?.label ?? placeholder}
            </span>
        </span>
    )
}

/** Chevron used in every pill trigger. */
function Chevron() {
    return (
        <ChevronDown
            className="h-4 w-4 shrink-0 text-[var(--editorial-subtle)]"
            aria-hidden
        />
    )
}

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
    const conditions = rule.conditions ?? []

    /** One condition row: "If the answer <operator> <value> [x]". */
    const renderCondition = (condition: LogicCondition, conditionIndex: number) => {
        const hasValue = OPERATORS_WITH_VALUE.has(condition.operator)
        const showValueSelect = valueOptions.length > 0 && hasValue
        return (
            <div key={conditionIndex}>
                {/* Combinator divider between rows */}
                {conditionIndex > 0 && (
                    <div className="mb-5">
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
                                className={cn(COMBINATOR_CLASS, "w-fit gap-2")}
                            >
                                <span className="uppercase">{condition.combinator ?? "and"}</span>
                                <Chevron />
                            </Trigger>
                            <SelectContent className={OVERLAY_CLASS}>
                                <SelectItem value="and">AND</SelectItem>
                                <SelectItem value="or">OR</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    <span className={IF_LABEL_CLASS}>
                        If <span className="text-[var(--editorial-subtle)]">the answer</span>
                    </span>

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
                        <Trigger aria-label="Condition source type" className="w-[185px] shrink-0">
                            <span className="min-w-0 truncate">
                                {condition.sourceType === "variable" ? "a variable" : "is"}
                            </span>
                            <Chevron />
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            <SelectItem value="page">is</SelectItem>
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
                            <Trigger aria-label="Variable" className="w-[185px] shrink-0">
                                <span className="min-w-0 truncate">
                                    @{condition.sourceKey || "Select variable…"}
                                </span>
                                <Chevron />
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
                        <Trigger aria-label="Operator" className="w-[185px] shrink-0">
                            <span className="flex min-w-0 items-center gap-2 truncate">
                                {(() => {
                                    const OpIcon =
                                        OPERATOR_ICONS[condition.operator] ?? Equal
                                    return (
                                        <OpIcon
                                            className="h-4 w-4 shrink-0 text-[var(--foreground)]"
                                            aria-hidden
                                        />
                                    )
                                })()}
                                <span className="min-w-0 truncate">
                                    {
                                        operatorOptions.find(
                                            (o) => o.value === condition.operator,
                                        )?.label
                                    }
                                </span>
                            </span>
                            <Chevron />
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {operatorOptions.map((o) => {
                                const OpIcon = OPERATOR_ICONS[o.value] ?? Equal
                                return (
                                    <SelectItem key={o.value} value={o.value}>
                                        <span className="flex items-center gap-2">
                                            <OpIcon
                                                className="h-4 w-4 shrink-0 text-[var(--foreground)]"
                                                aria-hidden
                                            />
                                            {o.label}
                                        </span>
                                    </SelectItem>
                                )
                            })}
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
                                <Trigger aria-label="Value" className="flex-1">
                                    <span className="flex min-w-0 items-center gap-2 truncate">
                                        <Circle
                                            className="h-4 w-4 shrink-0 text-[var(--foreground)]"
                                            aria-hidden
                                        />
                                        <span className="min-w-0 truncate">
                                            {String(condition.value ?? "Select Value…")}
                                        </span>
                                    </span>
                                    <Chevron />
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
                                className={cn(INPUT_CLASS, "min-w-[12rem] flex-1")}
                                placeholder="Value"
                            />
                        ))}

                    {conditions.length > 1 && (
                        <button
                            type="button"
                            aria-label="Remove condition"
                            onClick={() => removeCondition(conditionIndex)}
                            className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    /** Footer action selects, per rule category. */
    const renderThenControls = () => {
        if (section.category === "branching") {
            return (
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
                            className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                        >
                            <span className="min-w-0 truncate">
                                {section.actionOptions.find(
                                    (o) => o.value === (action?.action ?? "jumpToPage"),
                                )?.label ?? "Skip to"}
                            </span>
                            <Chevron />
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
                            <Trigger aria-label="Jump target page" className="flex-1">
                                <PageSelectContent
                                    page={pages.find(
                                        (p) => p.pageKey === action.targetPageKey,
                                    )}
                                    pageNumber={
                                        action.targetPageKey
                                            ? pages.findIndex(
                                                  (p) => p.pageKey === action.targetPageKey,
                                              ) + 1 || null
                                            : null
                                    }
                                    placeholder="Select a page…"
                                />
                                <Chevron />
                            </Trigger>
                            <SelectContent className={OVERLAY_CLASS}>
                                {pages
                                    .filter(
                                        (p) =>
                                            p.pageKey !== rule.conditions?.[0]?.sourceKey,
                                    )
                                    .map((p) => (
                                        <SelectItem key={p.pageKey} value={p.pageKey}>
                                            <PageSelectContent
                                                page={p}
                                                pageNumber={
                                                    pages.findIndex(
                                                        (pi) => pi.pageKey === p.pageKey,
                                                    ) + 1
                                                }
                                            />
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    )}
                </>
            )
        }

        if (isCalculation) {
            return (
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
                            className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                        >
                            <span className="min-w-0 truncate">
                                {action?.variableName
                                    ? `@${action.variableName}`
                                    : "Set variable"}
                            </span>
                            <Chevron />
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
                        <Trigger
                            aria-label="Calculation operation"
                            className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                        >
                            <span className="min-w-0 truncate">
                                {CALC_OPERATIONS.find(
                                    (o) => o.value === (action?.operation ?? "set"),
                                )?.label}
                            </span>
                            <Chevron />
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
                        <Trigger
                            aria-label="Operand type"
                            className="w-[150px] shrink-0 border-[var(--input)] bg-[var(--secondary)] shadow-none"
                        >
                            <span className="min-w-0 truncate">
                                {operandIsVariable ? "a variable" : "a number"}
                            </span>
                            <Chevron />
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
                            <Trigger aria-label="Operand variable" className="flex-1">
                                <span className="min-w-0 truncate">
                                    @{operandVarName || "Select a variable…"}
                                </span>
                                <Chevron />
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
                            className={cn(INPUT_CLASS, "min-w-[12rem] flex-1")}
                            placeholder="e.g. 5"
                        />
                    )}
                </>
            )
        }

        return (
            <>
                <span className="w-[150px] shrink-0 truncate text-[15px] font-medium text-[var(--editorial-body)]">
                    {section.title}
                </span>
                <Select
                    value={action?.targetPageKey || null}
                    onValueChange={(v) => {
                        if (!v) return
                        setAction({ targetPageKey: v })
                    }}
                >
                    <Trigger aria-label="Target page" className="flex-1">
                        <PageSelectContent
                            page={pages.find((p) => p.pageKey === action?.targetPageKey)}
                            pageNumber={
                                action?.targetPageKey
                                    ? pages.findIndex(
                                          (p) => p.pageKey === action.targetPageKey,
                                      ) + 1 || null
                                    : null
                            }
                            placeholder="Select a page…"
                        />
                        <Chevron />
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {pages.map((p) => (
                            <SelectItem key={p.pageKey} value={p.pageKey}>
                                <PageSelectContent
                                    page={p}
                                    pageNumber={
                                        pages.findIndex((pi) => pi.pageKey === p.pageKey) + 1
                                    }
                                />
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </>
        )
    }

    return (
        <div className="editorial overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Header — numbered badge, title, delete + collapse */}
            <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--editorial-primary-selected)] text-sm font-semibold text-[var(--editorial-primary)]">
                    {index}
                </span>
                <h2 className="flex min-w-0 flex-1 items-center gap-2 truncate text-[15px] font-semibold text-[var(--foreground)]">
                    Rule #{index}
                    <span className="inline-flex shrink-0 items-center rounded-md bg-[var(--editorial-primary-selected)] px-2 py-0.5 text-xs font-semibold text-[var(--editorial-primary)]">
                        {section.title}
                    </span>
                </h2>
                <div className="flex shrink-0 items-center gap-2">
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

            {/* Body — condition rows */}
            <div className="space-y-5 px-5 py-5">
                {conditions.map(renderCondition)}

                <button
                    type="button"
                    onClick={addCondition}
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-[var(--primary)] transition-opacity hover:opacity-80"
                >
                    <Plus className="h-4 w-4" /> Condition
                </button>
            </div>

            {/* Footer — THEN row + save/cancel */}
            <footer className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] bg-[var(--muted)]/40 px-5 py-4">
                <span className="w-[52px] shrink-0 text-[15px] text-[var(--foreground)]">
                    Then
                </span>
                {renderThenControls()}
                <div className="w-full ml-auto flex items-center justify-end gap-3">
                    {error && (
                        <span className="text-sm font-medium text-[var(--destructive)]">
                            {error}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        className="h-9 rounded-xl px-6 text-[15px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => onSave(rule)}
                        className="h-9 rounded-xl px-6 text-[15px]"
                    >
                        Save rule
                    </Button>
                </div>
            </footer>
        </div>
    )
}

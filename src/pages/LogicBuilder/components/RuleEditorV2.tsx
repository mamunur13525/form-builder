import { useEffect, useMemo } from "react";
import { Plus, Save, X } from "lucide-react";
import type {
    FormLogicRule,
    FormVariable,
    FormPage,
    LogicCondition,
    LogicCombinator,
} from "../../../shared/types/common";
import {
    OPERATOR_OPTIONS,
    NUMERIC_ONLY_OPERATORS,
    type SectionConfig,
} from "./logicEditorConfig";
import { emptyCondition } from "./ruleUtils";
import { ConditionRow } from "./ConditionRow";
import { ActionRow } from "./ActionRow";

interface RuleEditorV2Props {
    rule: FormLogicRule
    section: SectionConfig
    pages: FormPage[]
    selectedPageKey: string
    variables: FormVariable[]
    onUpdate: (rule: FormLogicRule) => void
    onSave: (rule: FormLogicRule) => void
    error?: string | null
    onCancel: () => void
}

export function RuleEditorV2({
    rule,
    section,
    pages,
    selectedPageKey,
    variables,
    onUpdate,
    onSave,
    error,
    onCancel,
}: RuleEditorV2Props) {
    const action = (rule.actions ?? [])[0]

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

    const operatorOptions = useMemo(() => {
        const source = (rule.conditions ?? [])[0]
        if (!source?.sourceKey) return OPERATOR_OPTIONS
        const isNumeric = numericSources.has(source.sourceKey)
        if (isNumeric) return OPERATOR_OPTIONS
        return OPERATOR_OPTIONS.filter((o) => !NUMERIC_ONLY_OPERATORS.includes(o.value))
    }, [rule.conditions, numericSources])

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

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2.5">
                {(rule.conditions ?? []).map((condition, index) => (
                    <ConditionRow
                        key={index}
                        condition={condition}
                        index={index}
                        isFirst={index === 0}
                        operatorOptions={operatorOptions}
                        valueOptions={valueOptions}
                        numericSources={numericSources}
                        onUpdate={setCondition}
                        onRemove={removeCondition}
                        canRemove={(rule.conditions ?? []).length > 1}
                        sourceType={condition.sourceType}
                        pages={pages}
                        variables={variables}
                    />
                ))}

                <button
                    type="button"
                    onClick={addCondition}
                    className="flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#06b6d4] transition-colors hover:bg-[#06b6d4]/5"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add condition
                </button>
            </div>

            <ActionRow
                rule={rule}
                sectionCategory={section.category}
                actionOptions={section.actionOptions}
                pages={pages}
                numberVariables={numberVariables}
                onUpdateAction={setAction}
            />

            {isCalculation && (
                <p className="text-xs leading-relaxed text-[#6b7280] px-1">
                    Calculations run on <span className="font-medium text-[#111827]">number</span>{" "}
                    variables only. <span className="font-medium text-[#111827]">Set to</span> replaces the
                    value; the other operations apply to the variable's running value.
                </p>
            )}

            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                    {error && (
                        <span className="text-xs font-medium text-[#ef4444]">
                            {error}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        className="text-[#6b7280] hover:text-[#111827]"
                    >
                        <X className="h-3.5 w-3.5 mr-1.5" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => onSave(rule)}
                        className="bg-[#06b6d4] text-white hover:bg-[#0891b2]"
                    >
                        <Save className="mr-1.5 h-3.5 w-3.5" />
                        Save rule
                    </Button>
                </div>
            </div>
        </div>
    )
}
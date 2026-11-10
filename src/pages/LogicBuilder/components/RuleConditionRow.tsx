import { Equal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Select,
    SelectContent,
    SelectItem,
} from "../../../components/ui/select";
import type {
    FormPage,
    FormVariable,
    LogicCondition,
    LogicOperator,
} from "../../../shared/types/common";
import {
    OPERATORS_WITH_VALUE,
    OPERATOR_OPTIONS,
    NUMERIC_ONLY_OPERATORS,
} from "./logicEditorConfig";
import { sourceQuestionLabel, type QuestionMeta } from "./ruleUtils";
import {
    COMBINATOR_CLASS,
    IF_LABEL_CLASS,
    OPERATOR_ICONS,
    OVERLAY_CLASS,
    Trigger,
} from "./ruleEditorUi";
import { ConditionValueControl } from "./ConditionValueControl";

interface RuleConditionRowProps {
    condition: LogicCondition
    index: number
    allQuestions: QuestionMeta[]
    pages: FormPage[]
    variables: FormVariable[]
    numericSources: Set<string>
    defaultQuestionKey: string
    isCalculation: boolean
    canRemove: boolean
    onChange: (index: number, patch: Partial<LogicCondition>) => void
    onRemove: (index: number) => void
}

/** One condition row: "If the answer <operator> <value> [x]". */
export function RuleConditionRow({
    condition,
    index,
    allQuestions,
    pages,
    variables,
    numericSources,
    defaultQuestionKey,
    isCalculation,
    canRemove,
    onChange,
    onRemove,
}: RuleConditionRowProps) {
    const isVariable = condition.sourceType === "variable"
    const effectiveSourceKey = condition.sourceKey || (isVariable ? (variables[0]?.name || "") : defaultQuestionKey)
    const currentQ = !isVariable
        ? allQuestions.find((q) => q.questionKey === effectiveSourceKey)
        : undefined
    const currentPage = !isVariable && !currentQ
        ? pages.find((p) => p.pageKey === effectiveSourceKey)
        : undefined
    const currentVar = isVariable
        ? variables.find((v) => v.name === effectiveSourceKey)
        : undefined

    const isNumeric = isVariable
        ? currentVar?.type === "number"
        : ["number", "rating", "opinionScale", "date", "time"].includes(
              currentQ?.type || currentPage?.type || "",
          ) || numericSources.has(effectiveSourceKey)

    const condOperatorOptions = isNumeric
        ? OPERATOR_OPTIONS
        : OPERATOR_OPTIONS.filter((o) => !NUMERIC_ONLY_OPERATORS.includes(o.value))

    const questionOptions = currentQ?.options || currentPage?.options || []
    const condValueOptions =
        condition.operator === "contains" || condition.operator === "notContains"
            ? []
            : questionOptions.filter((o) => o.value != null || o.label != null)

    const hasValue = OPERATORS_WITH_VALUE.has(condition.operator)
    const showValueSelect = condValueOptions.length > 0 && hasValue

    return (
        <div>
            {/* Combinator divider between rows */}
            {index > 0 && (
                <div className="mb-5">
                    <Select
                        value={condition.combinator ?? "and"}
                        onValueChange={(v) => {
                            if (v === "and" || v === "or") {
                                onChange(index, { combinator: v })
                            }
                        }}
                    >
                        <Trigger
                            aria-label="Combine with previous condition"
                            className={cn(COMBINATOR_CLASS, "w-fit gap-2")}
                        >
                            <span className="uppercase">{condition.combinator ?? "and"}</span>
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
                        onChange(index, {
                            sourceType: v,
                            sourceKey: v === "page" ? defaultQuestionKey : (variables[0]?.name || ""),
                            operator: "equals",
                            value: "",
                        })
                    }}
                >
                    <Trigger aria-label="Condition source type" className="w-[140px] shrink-0">
                        <span className="min-w-0 truncate">
                            {condition.sourceType === "variable" ? "a variable" : "a question"}
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        <SelectItem value="page">a question</SelectItem>
                        <SelectItem value="variable">a variable</SelectItem>
                    </SelectContent>
                </Select>

                {condition.sourceType === "variable" ? (
                    <Select
                        value={condition.sourceKey || null}
                        onValueChange={(v) => {
                            if (!v) return
                            onChange(index, {
                                sourceKey: v,
                                value: "",
                            })
                        }}
                    >
                        <Trigger aria-label="Variable" className="w-[185px] shrink-0">
                            <span className="min-w-0 truncate">
                                @{condition.sourceKey || "Select variable…"}
                            </span>
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {variables.map((v) => (
                                <SelectItem key={v.name} value={v.name}>
                                    @{v.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Select
                        value={effectiveSourceKey}
                        onValueChange={(v) => {
                            if (!v) return
                            onChange(index, {
                                sourceKey: v,
                                value: "",
                            })
                        }}
                    >
                        <Trigger aria-label="Select question" className="w-[240px] shrink-0">
                            {currentQ ? (
                                <span className="flex min-w-0 items-center gap-2 truncate">
                                    <span className="shrink-0 font-semibold text-[var(--editorial-primary)]">
                                        P{currentQ.pageIndex + 1}·Q{currentQ.questionIndex + 1}
                                    </span>
                                    <span className="truncate">
                                        {currentQ.title}
                                    </span>
                                </span>
                            ) : (
                                <span className="min-w-0 truncate">
                                    {sourceQuestionLabel(pages, effectiveSourceKey) || "Select question…"}
                                </span>
                            )}
                        </Trigger>
                        <SelectContent className={OVERLAY_CLASS}>
                            {allQuestions.map((q) => (
                                <SelectItem key={q.questionKey} value={q.questionKey}>
                                    <span className="flex items-center gap-2 truncate">
                                        <span className="shrink-0 font-semibold text-[var(--editorial-primary)]">
                                            P{q.pageIndex + 1}·Q{q.questionIndex + 1}
                                        </span>
                                        <span className="truncate">
                                            {q.title}
                                        </span>
                                    </span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Select
                    value={condition.operator}
                    onValueChange={(v) => {
                        if (v) onChange(index, { operator: v as LogicOperator })
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
                                    condOperatorOptions.find(
                                        (o) => o.value === condition.operator,
                                    )?.label
                                }
                            </span>
                        </span>
                    </Trigger>
                    <SelectContent className={OVERLAY_CLASS}>
                        {condOperatorOptions.map((o) => {
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

                <ConditionValueControl
                    hasValue={hasValue}
                    showValueSelect={showValueSelect}
                    value={condition.value}
                    condValueOptions={condValueOptions}
                    isCalculation={isCalculation}
                    sourceType={condition.sourceType}
                    onChange={(v) => onChange(index, { value: v })}
                />

                {canRemove && (
                    <button
                        type="button"
                        aria-label="Remove condition"
                        onClick={() => onRemove(index)}
                        className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--editorial-subtle)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
        </div>
    )
}

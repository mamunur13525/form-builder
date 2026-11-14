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
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Switch } from "../../../components/ui/switch";
import type {
    FormLogicRule,
    FormVariable,
    FormPage,
    LogicCondition,
    LogicCombinator,
} from "../../../shared/types/common";
import { type SectionConfig } from "./logicEditorConfig";
import { emptyCondition, extractAllQuestions } from "./ruleUtils";
import { RuleConditionRow } from "./RuleConditionRow";
import { RuleThenControls } from "./RuleThenControls";

export { PageTypeChip } from "./ruleEditorUi";

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
    /** Delete button — deletes the rule through the logic API. */
    onDelete?: () => void
    /** API error from the last save attempt, shown next to the Save button. */
    error?: string | null
    onCancel: () => void
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
    onDelete,
    error,
    onCancel,
}: RuleEditorProps) {
    const action = (rule.actions ?? [])[0]

    const allQuestions = useMemo(() => extractAllQuestions(pages), [pages])
    const questionsOnCurrentPage = useMemo(
        () => allQuestions.filter((q) => q.pageKey === selectedPageKey),
        [allQuestions, selectedPageKey],
    )
    const defaultQuestionKey = questionsOnCurrentPage[0]?.questionKey || selectedPageKey

    // Ensure conditions have a valid sourceKey if missing. Existing bindings are
    // left untouched so rules can keep referencing answers from earlier pages.
    useEffect(() => {
        const conditions = rule.conditions ?? []
        const needsBinding = conditions.some(
            (c) => (!c.sourceType || c.sourceType === "page") && !c.sourceKey,
        )
        if (!needsBinding) return
        onUpdate({
            ...rule,
            conditions: conditions.map((c) =>
                (!c.sourceType || c.sourceType === "page") && !c.sourceKey
                    ? { ...c, sourceType: "page", sourceKey: defaultQuestionKey }
                    : c,
            ),
        })
    }, [rule, defaultQuestionKey, onUpdate])

    const numericSources = useMemo(() => {
        const set = new Set<string>()
        for (const q of allQuestions) {
            if (["number", "rating", "opinionScale", "slider", "date", "time"].includes(q.type)) {
                set.add(q.questionKey)
            }
        }
        for (const p of pages) {
            if (["number", "rating", "opinionScale", "slider", "date", "time"].includes(p.type)) {
                set.add(p.pageKey)
            }
        }
        for (const v of variables) {
            if (v.type === "number") set.add(v.name)
        }
        return set
    }, [allQuestions, pages, variables])

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
                { ...emptyCondition(defaultQuestionKey), combinator: "and" as LogicCombinator },
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

    const isCalculation = section.category === "calculation"
    const numberVariables = useMemo(
        () => variables.filter((v) => v.type === "number"),
        [variables],
    )

    const ruleEnabled = rule.enabled !== false
    const conditions = rule.conditions ?? []

    return (
        <div className="editorial overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-sm">
            {/* Header — numbered badge, title, delete + collapse */}
            <header className="flex items-center gap-3 border-b border-[var(--border)] px-5 py-4">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-[var(--editorial-primary-selected)] text-sm font-semibold text-[var(--editorial-primary)]">
                    {index}
                </span>
                <h2 className="flex min-w-0 flex-1 items-center gap-2 truncate text-[15px] font-semibold text-[var(--foreground)]">
                    Rule #{index}
                    <span className="inline-flex shrink-0 items-center rounded-lg bg-[var(--editorial-primary-selected)] px-2 py-0.5 text-xs font-semibold text-[var(--editorial-primary)]">
                        {section.title}
                    </span>
                </h2>
                <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center gap-2">
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
                    {onDelete && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon-sm"
                            aria-label="Delete rule"
                            title="Delete rule"
                            onClick={onDelete}
                            className="size-8 rounded-lg cursor-pointer transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </header>

            {/* Body — condition rows */}
            <div className="space-y-5 px-5 py-5">
                {conditions.map((condition, conditionIndex) => (
                    <RuleConditionRow
                        key={conditionIndex}
                        condition={condition}
                        index={conditionIndex}
                        allQuestions={allQuestions}
                        pages={pages}
                        variables={variables}
                        numericSources={numericSources}
                        defaultQuestionKey={defaultQuestionKey}
                        isCalculation={isCalculation}
                        canRemove={conditions.length > 1}
                        onChange={setCondition}
                        onRemove={removeCondition}
                    />
                ))}

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
                <RuleThenControls
                    section={section}
                    action={action}
                    pages={pages}
                    selectedPageKey={selectedPageKey}
                    numberVariables={numberVariables}
                    isCalculation={isCalculation}
                    setAction={setAction}
                />
                <div className="w-full ml-auto flex items-center justify-end gap-3">
                    {onDelete && (
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={onDelete}
                            className="mr-auto h-9 rounded-lg px-4 text-[15px] text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        >
                            <Trash2 className="mr-1.5 h-4 w-4" />
                            Delete rule
                        </Button>
                    )}
                    {error && (
                        <span className="text-sm font-medium text-[var(--destructive)]">
                            {error}
                        </span>
                    )}
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        className="h-9 rounded-lg px-6 text-[15px]"
                    >
                        Cancel
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => onSave(rule)}
                        className="h-9 rounded-lg px-6 text-[15px]"
                    >
                        Save rule
                    </Button>
                </div>
            </footer>
        </div>
    )
}
